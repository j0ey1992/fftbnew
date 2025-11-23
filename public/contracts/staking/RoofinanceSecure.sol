// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/* -------------------------------- Context -------------------------------- */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

/* -------------------------------- Ownable -------------------------------- */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is zero");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/* -------------------------------- Pausable -------------------------------- */
abstract contract Pausable is Context {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    constructor() {
        _paused = false;
    }

    modifier whenNotPaused() {
        require(!paused(), "Pausable: paused");
        _;
    }
    modifier whenPaused() {
        require(paused(), "Pausable: not paused");
        _;
    }
    function paused() public view virtual returns (bool) {
        return _paused;
    }
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

/* ------------------------------ ReentrancyGuard ----------------------------- */
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED     = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/* --------------------------- ERC721 & Receiver ----------------------------- */
interface IERC721 {
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

/* -------------------------------- IERC20 ---------------------------------- */
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender,address recipient,uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

/* ------------------------------ SafeERC20 ---------------------------------- */
library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        require(token.transfer(to, value), "SafeERC20: transfer failed");
    }
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        require(token.transferFrom(from, to, value), "SafeERC20: transferFrom failed");
    }
}

/* ------------------------------- RooFinanceSecure ------------------------------ */
contract RooFinanceSecure is ReentrancyGuard, Pausable, Ownable, IERC721Receiver {
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 immutable public rewardsToken;
    
    // The only address that can recover tokens (not the owner/deployer)
    address public constant RECOVERY_WALLET = 0xD3eBF04f76B67e47093bDDd8B14f9090f1c80976;

    address[] public collectionAddresses;                // track the allowed NFT collections
    mapping(address => bool)    public isAllowedCollection;   
    mapping(address => uint256) public collectionRatio;  // per-collection reward weighting

    // How many total NFTs are staked for each collection
    mapping(address => uint256) public totalStaked;      

    // user => user staked count for a given collection
    mapping(address => mapping(address => uint256)) public collectionToUserToBalances;

    // For partial unstaking, track which token IDs a user staked:
    // usersNftStaked[collection][user] = array of tokenIds
    mapping(address => mapping(address => uint256[])) public usersNftStaked;
    // For O(1) array removal, we also track each token's index
    mapping(address => mapping(address => mapping(uint256 => uint256))) private stakedTokenIndex;

    // Reward distribution
    mapping(address => uint256) public rewardPerTokenStored;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => mapping(address => uint256)) public collectionToUserToRewardPerTokenPaid;

    // Accumulated user rewards across all their staked collections
    mapping(address => uint256) public rewards;

    // Reward schedule
    uint256 public periodFinish    = 0;
    uint256 public rewardsDuration = 7 days;
    uint256 public rewardRate      = 0;
    
    // Total sum of all collection ratios
    uint256 public totalRatios = 0;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _rewardsToken,
        address[] memory _collections,
        uint256[] memory _ratios
    ) {
        require(_rewardsToken != address(0), "Invalid reward token");
        require(_collections.length == _ratios.length, "Array length mismatch");
        require(_collections.length > 0, "No collections provided");
        
        rewardsToken = IERC20(_rewardsToken);

        // Initialize collections
        for (uint256 i = 0; i < _collections.length; i++) {
            address coll = _collections[i];
            require(coll != address(0), "Invalid collection address");
            require(_ratios[i] > 0, "Ratio must be greater than 0");
            
            collectionAddresses.push(coll);
            collectionRatio[coll] = _ratios[i];
            isAllowedCollection[coll] = true;
            totalRatios += _ratios[i];
            
            // Initialize lastUpdateTime for each collection
            lastUpdateTime[coll] = block.timestamp;
        }
    }

    /* ========== VIEWS ========== */

    /**
     * @dev Returns the token IDs that the caller has staked in a specific collection.
     */
    function getUserStakedNftIds(address _collection) external view returns (uint256[] memory) {
        return usersNftStaked[_collection][msg.sender];
    }

    /**
     * @dev Returns how many tokens a user staked in a specific collection.
     */
    function balanceOf(address collection, address account) external view returns (uint256) {
        return collectionToUserToBalances[collection][account];
    }

    /**
     * @dev The last time at which rewards should be calculated (blocks at periodFinish).
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        uint256 current = block.timestamp;
        return current < periodFinish ? current : periodFinish;
    }

    /**
     * @dev Return the "reward per token staked" for a given collection.
     * Uses high precision calculations to avoid rounding errors.
     */
    function rewardPerToken(address collection) public view returns (uint256) {
        if (totalStaked[collection] == 0) {
            return rewardPerTokenStored[collection];
        }
        
        if (!isAllowedCollection[collection]) {
            return 0;
        }
        
        uint256 timeDiff = lastTimeRewardApplicable() - lastUpdateTime[collection];
        if (timeDiff == 0) {
            return rewardPerTokenStored[collection];
        }
        
        // Calculate reward increment with improved precision
        // Formula: rewardRate * timeDiff * (collectionRatio / totalRatios) / totalStaked * 1e18
        
        // First multiply by large factors to maintain precision
        uint256 precision = 1e18;
        uint256 rewardPerTime = rewardRate * precision / totalRatios;
        uint256 rewardForCollection = rewardPerTime * collectionRatio[collection];
        uint256 timeReward = rewardForCollection * timeDiff;
        
        // Then divide by totalStaked to get per-token amount
        uint256 rewardIncrement = timeReward / totalStaked[collection];
        
        return rewardPerTokenStored[collection] + rewardIncrement;
    }

    /**
     * @dev Returns the total unclaimed reward for `account` on a specific collection.
     */
    function earned(address collection, address account) public view returns (uint256) {
        if (!isAllowedCollection[collection]) {
            return 0;
        }
        
        uint256 userAmount = collectionToUserToBalances[collection][account];
        if (userAmount == 0) {
            return 0;
        }
        
        uint256 rpt = rewardPerToken(collection);
        uint256 paid = collectionToUserToRewardPerTokenPaid[collection][account];
        
        // Earned since last claim:
        uint256 newlyAccrued = (userAmount * (rpt - paid)) / 1e18;
        return newlyAccrued;
    }
    
    /**
     * @dev Returns the total unclaimed rewards across all collections for an account.
     */
    function totalEarned(address account) public view returns (uint256) {
        uint256 total = rewards[account]; // Already accumulated rewards
        
        // Add pending rewards from all collections
        for (uint256 i = 0; i < collectionAddresses.length; i++) {
            address collection = collectionAddresses[i];
            total += earned(collection, account);
        }
        
        return total;
    }

    /**
     * @dev Return how many tokens would be distributed across `rewardsDuration` at the current rate.
     */
    function getRewardForDuration() external view returns (uint256) {
        return rewardRate * rewardsDuration;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @dev Stake multiple NFTs from a specific collection.
     */
    function stake(
        address collection,
        uint256[] memory ids
    )
        external
        nonReentrant
        whenNotPaused
        updateReward(collection, msg.sender)
    {
        require(collection != address(0), "Invalid collection address");
        require(isAllowedCollection[collection], "Collection not allowed");
        require(ids.length > 0 && ids.length <= 50, "Stake 1-50 NFTs");
        
        // Verify ownership of all tokens before making any state changes
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = ids[i];
            require(
                IERC721(collection).ownerOf(tokenId) == msg.sender,
                "Not token owner"
            );
            
            // No need to check for double staking since the NFT is transferred to the contract
            // and the user no longer owns it. The ownerOf check above will fail if they try to stake
            // an NFT they don't own.
        }

        // Update state variables
        totalStaked[collection] += ids.length;
        collectionToUserToBalances[collection][msg.sender] += ids.length;

        // Transfer and track NFTs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = ids[i];
            
            // Transfer NFT to contract
            IERC721(collection).safeTransferFrom(msg.sender, address(this), tokenId);

            // Add to user stake array
            usersNftStaked[collection][msg.sender].push(tokenId);
            
            // Map token ID to array index for O(1) removal
            stakedTokenIndex[collection][msg.sender][tokenId] =
                usersNftStaked[collection][msg.sender].length - 1;
        }

        emit Staked(msg.sender, collection, ids.length);
    }

    /**
     * @dev Unstake multiple NFTs from a collection. Allows partial unstake.
     */
    function unStake(
        address collection,
        uint256[] memory ids
    )
        external
        nonReentrant
        updateReward(collection, msg.sender)
    {
        require(collection != address(0), "Invalid collection address");
        require(ids.length > 0, "Cannot unstake 0 NFT");
        require(
            collectionToUserToBalances[collection][msg.sender] >= ids.length,
            "Insufficient staked balance"
        );
        
        // Verify ownership of all tokens
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = ids[i];
            require(
                stakedTokenIndex[collection][msg.sender][tokenId] < 
                usersNftStaked[collection][msg.sender].length,
                "Invalid token ID"
            );
            require(
                usersNftStaked[collection][msg.sender][stakedTokenIndex[collection][msg.sender][tokenId]] == tokenId,
                "Token not staked by user"
            );
        }

        // Update state variables
        totalStaked[collection] -= ids.length;
        collectionToUserToBalances[collection][msg.sender] -= ids.length;

        // Process each token
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = ids[i];
            
            // Remove from staked array using swap & pop for O(1) removal
            uint256 idx = stakedTokenIndex[collection][msg.sender][tokenId];
            uint256 lastIndex = usersNftStaked[collection][msg.sender].length - 1;
            
            if (idx != lastIndex) {
                // Only swap if not already the last element
                uint256 lastToken = usersNftStaked[collection][msg.sender][lastIndex];
                usersNftStaked[collection][msg.sender][idx] = lastToken;
                stakedTokenIndex[collection][msg.sender][lastToken] = idx;
            }

            // Pop array and clean up mapping
            usersNftStaked[collection][msg.sender].pop();
            delete stakedTokenIndex[collection][msg.sender][tokenId];

            // Transfer NFT back to user
            IERC721(collection).safeTransferFrom(address(this), msg.sender, tokenId);
        }

        emit Unstaked(msg.sender, collection, ids.length);
    }

    /**
     * @dev Claim all accumulated rewards from all collections for the caller.
     * Uses a more secure approach to prevent potential reentrancy and ensure
     * accurate reward calculations.
     */
    function getReward() external nonReentrant {
        address user = msg.sender;
        uint256 len = collectionAddresses.length;
        
        // First, update all reward states
        for (uint256 i = 0; i < len; i++) {
            address collection = collectionAddresses[i];
            if (isAllowedCollection[collection]) {
                _updateReward(collection, user);
            }
        }
        
        // Get the total reward amount
        uint256 totalReward = rewards[user];
        
        // Reset rewards before transfer to prevent reentrancy
        if (totalReward > 0) {
            rewards[user] = 0;
            
            // Check contract balance to ensure we have enough tokens
            uint256 contractBalance = rewardsToken.balanceOf(address(this));
            require(contractBalance >= totalReward, "Insufficient reward token balance");
            
            // Transfer rewards
            rewardsToken.safeTransfer(user, totalReward);
            emit RewardPaid(user, totalReward);
        }
    }
    
    /**
     * @dev Emergency withdraw NFTs without claiming rewards.
     * This function is intended for use in emergency situations where users need to
     * retrieve their NFTs quickly, bypassing reward calculations.
     * 
     * This improved version handles potential transfer failures more gracefully.
     */
    function emergencyWithdraw(address collection) external nonReentrant {
        require(collection != address(0), "Invalid collection address");
        
        // Allow emergency withdrawals even if collection is no longer allowed
        uint256[] memory userTokens = usersNftStaked[collection][msg.sender];
        uint256 tokenCount = userTokens.length;
        
        require(tokenCount > 0, "No staked NFTs");
        
        // Create a copy of the tokens to unstake
        uint256[] memory tokensToUnstake = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokensToUnstake[i] = userTokens[i];
        }
        
        // Update state variables before transfers to prevent reentrancy
        uint256 userBalance = collectionToUserToBalances[collection][msg.sender];
        totalStaked[collection] -= userBalance;
        collectionToUserToBalances[collection][msg.sender] = 0;
        
        // Clear user's staked NFTs
        delete usersNftStaked[collection][msg.sender];
        
        // Track successful transfers
        uint256 successfulTransfers = 0;
        
        // Transfer all NFTs back to user
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokensToUnstake[i];
            delete stakedTokenIndex[collection][msg.sender][tokenId];
            
            try IERC721(collection).safeTransferFrom(address(this), msg.sender, tokenId) {
                successfulTransfers++;
            } catch {
                // If transfer fails, log it but continue with other transfers
                emit EmergencyWithdrawFailed(msg.sender, collection, tokenId);
            }
        }
        
        emit EmergencyWithdraw(msg.sender, collection, successfulTransfers);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /**
     * @dev Set the reward amount for the next reward period.
     * This function updates the reward rate and extends the reward period.
     * 
     * Improved to handle precision issues and ensure secure token transfers.
     */
    function setRewardAmount(uint256 reward) external onlyOwner {
        require(reward > 0, "Reward must be greater than 0");
        require(totalRatios > 0, "No collections with ratios");
        
        // First transfer tokens to ensure we have them before updating state
        uint256 oldBalance = rewardsToken.balanceOf(address(this));
        rewardsToken.safeTransferFrom(msg.sender, address(this), reward);
        
        // Verify transfer was successful
        uint256 newBalance = rewardsToken.balanceOf(address(this));
        require(newBalance >= oldBalance + reward, "Token transfer failed");
        
        // Update rewards for all collections
        for (uint256 i = 0; i < collectionAddresses.length; i++) {
            _updateReward(collectionAddresses[i], address(0));
        }

        // Calculate new reward rate with improved precision
        uint256 newRewardRate;
        if (block.timestamp >= periodFinish) {
            newRewardRate = reward / rewardsDuration;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            newRewardRate = (reward + leftover) / rewardsDuration;
        }

        // Ensure the reward rate is not zero
        require(newRewardRate > 0, "Reward rate must be greater than 0");
        
        // Ensure the reward rate is reasonable
        require(
            newRewardRate * rewardsDuration <= newBalance,
            "Reward rate too high for contract balance"
        );

        // Update state variables
        rewardRate = newRewardRate;
        
        // Update lastUpdateTime for all collections
        uint256 updateTime = block.timestamp;
        for (uint256 i = 0; i < collectionAddresses.length; i++) {
            lastUpdateTime[collectionAddresses[i]] = updateTime;
        }

        // Set new period finish time
        periodFinish = block.timestamp + rewardsDuration;
        
        emit RewardAdded(reward);
    }

    /**
     * @dev Add a new NFT collection to the staking contract.
     * This allows for adding new collections after deployment.
     */
    function addCollection(address collection, uint256 ratio) external onlyOwner {
        require(collection != address(0), "Invalid collection address");
        require(ratio > 0, "Ratio must be greater than 0");
        require(!isAllowedCollection[collection], "Collection already added");
        
        // Update all existing collections first
        for (uint256 i = 0; i < collectionAddresses.length; i++) {
            _updateReward(collectionAddresses[i], address(0));
        }
        
        // Add new collection
        collectionAddresses.push(collection);
        collectionRatio[collection] = ratio;
        isAllowedCollection[collection] = true;
        lastUpdateTime[collection] = block.timestamp;
        
        // Update total ratios
        totalRatios += ratio;
        
        emit CollectionAdded(collection, ratio);
    }
    
    /**
     * @dev Update the ratio for an existing collection.
     * This allows for adjusting reward distribution between collections.
     */
    function updateCollectionRatio(address collection, uint256 newRatio) external onlyOwner {
        require(collection != address(0), "Invalid collection address");
        require(newRatio > 0, "Ratio must be greater than 0");
        require(isAllowedCollection[collection], "Collection not allowed");
        
        // Update all collections first
        for (uint256 i = 0; i < collectionAddresses.length; i++) {
            _updateReward(collectionAddresses[i], address(0));
        }
        
        // Update total ratios
        totalRatios = totalRatios - collectionRatio[collection] + newRatio;
        
        // Update collection ratio
        collectionRatio[collection] = newRatio;
        
        emit CollectionRatioUpdated(collection, newRatio);
    }
    
    /**
     * @dev Remove a collection from the allowed list.
     * This prevents new stakes but allows unstaking and reward claiming.
     */
    function removeCollection(address collection) external onlyOwner {
        require(collection != address(0), "Invalid collection address");
        require(isAllowedCollection[collection], "Collection not allowed");
        
        // Update all collections first
        for (uint256 i = 0; i < collectionAddresses.length; i++) {
            _updateReward(collectionAddresses[i], address(0));
        }
        
        // Update total ratios
        totalRatios -= collectionRatio[collection];
        
        // Remove from allowed collections
        isAllowedCollection[collection] = false;
        
        // Remove from collectionAddresses array
        for (uint256 i = 0; i < collectionAddresses.length; i++) {
            if (collectionAddresses[i] == collection) {
                // Swap with last element and pop
                collectionAddresses[i] = collectionAddresses[collectionAddresses.length - 1];
                collectionAddresses.pop();
                break;
            }
        }
        
        emit CollectionRemoved(collection);
    }

    /**
     * @dev Recover ERC20 tokens sent to the contract by mistake.
     * This function can ONLY be called by the designated recovery wallet,
     * not by the owner/deployer. This protects users from potential rug pulls.
     * 
     * The function ensures that reward tokens can only be recovered if they exceed
     * the amount needed for current reward distribution.
     */
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external {
        require(msg.sender == RECOVERY_WALLET, "Only recovery wallet can recover tokens");
        require(tokenAddress != address(0), "Invalid token address");
        
        // If recovering reward token, ensure we don't recover tokens needed for rewards
        if (tokenAddress == address(rewardsToken)) {
            uint256 rewardBalance = rewardsToken.balanceOf(address(this));

            // If this is the reward token, ensure we don't recover tokens needed for rewards
            if (block.timestamp < periodFinish) {
                uint256 remaining = periodFinish - block.timestamp;
                uint256 leftover = remaining * rewardRate;
                require(rewardBalance >= leftover + tokenAmount, "Cannot recover reward tokens needed for distribution");
            }
        }
        
        IERC20(tokenAddress).safeTransfer(RECOVERY_WALLET, tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    /**
     * @dev Set the duration for reward distribution.
     * This can only be called after the current reward period has finished.
     */
    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(_rewardsDuration > 0, "Reward duration must be greater than 0");
        require(block.timestamp > periodFinish, "Reward period not finished");
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(_rewardsDuration);
    }

    /**
     * @dev Pause the contract, preventing new stakes.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract, allowing stakes again.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /* ========== INTERNAL & MODIFIERS ========== */

    modifier updateReward(address collection, address account) {
        _updateReward(collection, account);
        _;
    }

    function _updateReward(address collection, address account) internal {
        rewardPerTokenStored[collection] = rewardPerToken(collection);
        lastUpdateTime[collection] = lastTimeRewardApplicable();

        if (account != address(0)) {
            // Store earned rewards in the rewards mapping
            uint256 earnedRewards = earned(collection, account);
            if (earnedRewards > 0) {
                rewards[account] += earnedRewards;
            }
            
            // Update the user's reward per token paid
            collectionToUserToRewardPerTokenPaid[collection][account] = 
                rewardPerTokenStored[collection];
        }
    }

    /**
     * @dev Required implementation for ERC721 receiver interface.
     * This allows the contract to receive ERC721 tokens.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, address indexed collection, uint256 amount);
    event Unstaked(address indexed user, address indexed collection, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);
    event CollectionAdded(address collection, uint256 ratio);
    event CollectionRatioUpdated(address collection, uint256 newRatio);
    event CollectionRemoved(address collection);
    event EmergencyWithdraw(address indexed user, address indexed collection, uint256 amount);
    event EmergencyWithdrawFailed(address indexed user, address indexed collection, uint256 tokenId);
}