// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
pragma abicoder v2;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SmartChefInitializable
 * @notice A staking contract that allows users to stake tokens and earn rewards over time
 * @dev Implements role-based access control for enhanced security and delegation of admin functions
 */
contract SmartChefInitializable is Ownable, ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20Metadata;

    // Role definitions
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    // Immutable factory address
    address public immutable SMART_CHEF_FACTORY;

    // Staker tracking
    address[] public stakerAddresses;

    // Contract state flags
    bool public userLimit;
    bool public isInitialized;
    bool public useInitialLockPeriod;

    // Reward calculation variables
    uint256 public accTokenPerShare;
    uint256 public bonusEndBlock;
    uint256 public startBlock;
    uint256 public lastRewardBlock;
    uint256 public poolLimitPerUser;
    uint256 public numberBlocksForUserLimit;
    uint256 public rewardPerBlock;
    uint256 public PRECISION_FACTOR;
    uint256 public minStakingPeriod;

    // Token contracts
    IERC20Metadata public rewardToken;
    IERC20Metadata public stakedToken;

    // Total amount of staked tokens
    uint256 public stakedTokenAmount;

    /**
     * @notice Structure to track user staking information
     */
    struct UserInfo {
        uint256 amount;            // Amount of staked tokens
        uint256 rewardDebt;        // Reward debt for reward calculation
        address staker;            // Address of the staker
        uint256 depositTimestamp;  // Timestamp of the latest deposit
    }

    // Mapping of user address to their staking information
    mapping(address => UserInfo) public userInfo;

    // Events
    event Deposit(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    event NewStartAndEndBlocks(uint256 startBlock, uint256 endBlock);
    event BonusEndBlockExtended(uint256 endBlock);
    event NewRewardPerBlock(uint256 rewardPerBlock);
    event NewPoolLimit(uint256 poolLimitPerUser);
    event RewardsStop(uint256 blockNumber);
    event TokenRecovery(address indexed token, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event MinStakingPeriodUpdated(uint256 newMinStakingPeriod);
    event LockPeriodBehaviorUpdated(bool useInitialLockPeriod);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event ManagerUpdated(address indexed newManager);

    /**
     * @notice Constructor sets the factory address and initial admin role
     */
    constructor() {
        SMART_CHEF_FACTORY = msg.sender;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Modifier to restrict functions to manager role
     */
    modifier onlyManager() {
        require(hasRole(MANAGER_ROLE, msg.sender), "Caller is not a manager");
        _;
    }

    /**
     * @notice Initializes the staking contract with initial parameters
     * @param _stakedToken Token that users will stake
     * @param _rewardToken Token that users will earn as rewards
     * @param _rewardPerBlock Reward tokens distributed per block
     * @param _startBlock Block number when rewards start
     * @param _bonusEndBlock Block number when rewards end
     * @param _poolLimitPerUser Maximum amount a user can stake (0 if no limit)
     * @param _numberBlocksForUserLimit Duration of user limit in blocks
     * @param _minStakingPeriod Minimum staking period in days
     * @param _useInitialLockPeriod Whether to use initial deposit timestamp for lock
     * @param _admin Address that will have admin role
     * @param _manager Address that will have manager role
     */
    function initialize(
        IERC20Metadata _stakedToken,
        IERC20Metadata _rewardToken,
        uint256 _rewardPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock,
        uint256 _poolLimitPerUser,
        uint256 _numberBlocksForUserLimit,
        uint256 _minStakingPeriod,
        bool _useInitialLockPeriod,
        address _admin,
        address _manager
    ) external {
        require(!isInitialized, "Already initialized");
        require(msg.sender == SMART_CHEF_FACTORY, "Not factory");
        require(_startBlock < _bonusEndBlock, "Invalid block range");
        require(_admin != address(0), "Invalid admin address");
        require(_manager != address(0), "Invalid manager address");

        // Initialize basic parameters
        isInitialized = true;
        stakedToken = _stakedToken;
        rewardToken = _rewardToken;
        rewardPerBlock = _rewardPerBlock;
        startBlock = _startBlock;
        bonusEndBlock = _bonusEndBlock;
        minStakingPeriod = _minStakingPeriod;
        useInitialLockPeriod = _useInitialLockPeriod;

        // Set up pool limits if specified
        if (_poolLimitPerUser > 0) {
            userLimit = true;
            poolLimitPerUser = _poolLimitPerUser;
            numberBlocksForUserLimit = _numberBlocksForUserLimit;
        }

        // Calculate precision factor based on reward token decimals
        uint256 decimalsRewardToken = uint256(rewardToken.decimals());
        require(decimalsRewardToken < 30, "Must be inferior to 30");
        PRECISION_FACTOR = uint256(10 ** (uint256(30) - decimalsRewardToken));

        // Set initial reward block
        lastRewardBlock = startBlock;

        // Set up roles and ownership
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(MANAGER_ROLE, _manager);
        transferOwnership(_admin);
    }
    /*
     * @notice Update minimum staking period
     * @dev Only callable by manager
     * @param _minStakingPeriod: new minimum staking period in days (0 to disable)
     */
    function updateMinStakingPeriod(uint256 _minStakingPeriod) external onlyManager {
        minStakingPeriod = _minStakingPeriod;
        emit MinStakingPeriodUpdated(_minStakingPeriod);
    }

    function updateLockPeriodBehavior(bool _useInitialLockPeriod) external onlyManager {
        useInitialLockPeriod = _useInitialLockPeriod;
        emit LockPeriodBehaviorUpdated(_useInitialLockPeriod);
    }
    /*
    * @notice Check if user can withdraw based on minimum staking period and pool end
    * @param _user: user address
    */
    function canWithdraw(address _user) public view returns (bool) {
        if (minStakingPeriod == 0) return true;
        
        UserInfo storage user = userInfo[_user];
        if (user.amount == 0) return true;
        
        // Allow withdrawal if pool has ended, regardless of staking period     
        if (block.number >= bonusEndBlock) return true;
        
        return (block.timestamp >= user.depositTimestamp + (minStakingPeriod * 1 days));
    }

    // Function to get all stakers and their amounts
    function getStakers() external view returns (UserInfo[] memory) {
        UserInfo[] memory stakersInfo = new UserInfo[](stakerAddresses.length);
        
        for (uint256 i = 0; i < stakerAddresses.length; i++) {
            address stakerAddress = stakerAddresses[i];
            stakersInfo[i] = userInfo[stakerAddress];
        }
        
        return stakersInfo;
    }
    /*
     * @notice Deposit staked tokens and collect reward tokens (if any)
     * @param _amount: amount to withdraw (in rewardToken)
     */
    function deposit(uint256 _amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        bool isNewStaker = user.amount == 0 && _amount > 0;

        userLimit = hasUserLimit();
        require(!userLimit || ((_amount + user.amount) <= poolLimitPerUser), "Deposit: Amount above limit");

        _updatePool();

        if (user.amount > 0) {
            uint256 pending = (user.amount * accTokenPerShare) / PRECISION_FACTOR - user.rewardDebt;
            if (pending > 0) {
                _withdrawRewardToken(pending);
            }
        }

        if (_amount > 0) {
            user.amount = user.amount + _depositStakedToken(_amount);
            user.staker = msg.sender;
            
            // Update deposit timestamp based on owner-configured behavior
            if (isNewStaker || !useInitialLockPeriod) {
                user.depositTimestamp = block.timestamp;
            }
            
            if (isNewStaker) {
                stakerAddresses.push(msg.sender);
            }
        }

        user.rewardDebt = (user.amount * accTokenPerShare) / PRECISION_FACTOR;

        emit Deposit(msg.sender, _amount);
    }
    /*
     * @notice Withdraw staked tokens and collect reward tokens
     * @param _amount: amount to withdraw (in rewardToken)
     */
    function withdraw(uint256 _amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "Amount to withdraw too high");
        require(canWithdraw(msg.sender), "Minimum staking period not met");

        _updatePool();

        uint256 pending = (user.amount * accTokenPerShare) / PRECISION_FACTOR - user.rewardDebt;

        if (_amount > 0) {
            user.amount = user.amount - _amount;
            _withdrawStakedToken(_amount);
            // Remove staker from array if fully withdrawn      
            if (user.amount == 0) {
                for (uint256 i = 0; i < stakerAddresses.length; i++) {
                    if (stakerAddresses[i] == msg.sender) {
                        stakerAddresses[i] = stakerAddresses[stakerAddresses.length - 1];
                        stakerAddresses.pop();
                        break;
                    }
                }
            }
        }

        if (pending > 0) {
            _withdrawRewardToken(pending);
        }

        user.rewardDebt = (user.amount * accTokenPerShare) / PRECISION_FACTOR;

        emit Withdraw(msg.sender, _amount);
    }
    /*
     * @notice Withdraw staked tokens without caring about rewards rewards
     * @dev Needs to be for emergency.
     */
    function emergencyWithdraw() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        uint256 amountToTransfer = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;

        if (amountToTransfer > 0) {
            _withdrawStakedToken(amountToTransfer);
        }

        emit EmergencyWithdraw(msg.sender, user.amount);
    }
    /*
     * @notice Stop rewards
     * @dev Only callable by owner. Needs to be for emergency.
     */
    function emergencyRewardWithdraw(uint256 _amount) external onlyOwner {
        _withdrawRewardToken(_amount);
    }
    /**
     * @notice Allows the owner to recover tokens sent to the contract by mistake
     * @param _token: token address
     * @dev Callable by owner
     */
    function recoverToken(address _token) external onlyOwner {
        require(_token != address(rewardToken), "Operations: Cannot recover reward token");

        uint256 balance = IERC20Metadata(_token).balanceOf(address(this));
        if (_token == address(stakedToken)) {
            balance = balance - stakedTokenAmount;
        }
        require(balance != 0, "Operations: Cannot recover zero balance");

        IERC20Metadata(_token).safeTransfer(address(msg.sender), balance);

        emit TokenRecovery(_token, balance);
    }
    /*
     * @notice Stop rewards
     * @dev Only callable by owner
     */
    function stopReward() external onlyOwner {
        bonusEndBlock = block.number;
    }
    /*
     * @notice Update pool limit per user
     * @dev Only callable by owner.
     * @param _userLimit: whether the limit remains forced
     * @param _poolLimitPerUser: new pool limit per user
     */
    function updatePoolLimitPerUser(bool _userLimit, uint256 _poolLimitPerUser) external onlyManager {
        require(userLimit, "Must be set");
        if (_userLimit) {
            require(_poolLimitPerUser > poolLimitPerUser, "New limit must be higher");
            poolLimitPerUser = _poolLimitPerUser;
        } else {
            userLimit = _userLimit;
            poolLimitPerUser = 0;
        }
        emit NewPoolLimit(poolLimitPerUser);
    }
    /*
     * @notice Update reward per block
     * @dev Only callable by owner.
     * @param _rewardPerBlock: the reward per block
     */
    function updateRewardPerBlock(uint256 _rewardPerBlock) external onlyManager {
        _updatePool(); // Update with old rate first
        uint256 oldRate = rewardPerBlock;
        rewardPerBlock = _rewardPerBlock;
        emit RewardRateUpdated(oldRate, _rewardPerBlock);
    }
    /**
     * @notice It allows the manager to update start and end blocks
     * @dev This function is only callable by owner.
     * @param _startBlock: the new start block
     * @param _bonusEndBlock: the new end block
     */
    function updateStartAndEndBlocks(uint256 _startBlock, uint256 _bonusEndBlock) external onlyManager {
        require(block.number < startBlock, "Pool has started");
        require(_startBlock < _bonusEndBlock, "New startBlock must be lower than new endBlock");
        require(block.number < _startBlock, "New startBlock must be higher than current block");

        startBlock = _startBlock;
        bonusEndBlock = _bonusEndBlock;

        // Set the lastRewardBlock as the startBlock
        lastRewardBlock = startBlock;

        emit NewStartAndEndBlocks(_startBlock, _bonusEndBlock);
    }
    /**
     * @notice It allows the manager to update the end blocks
     * @dev This function is only callable by manager.
     * @param _newBonusEndBlock: the new end block
     */
    function extendBonusEndBlock(uint256 _newBonusEndBlock) external onlyManager {
        require(_newBonusEndBlock > bonusEndBlock, "New end block must be later than current end block");
        require(_newBonusEndBlock > block.number, "New end block must be in the future");
        
        _updatePool();
        bonusEndBlock = _newBonusEndBlock;
        
        emit BonusEndBlockExtended(_newBonusEndBlock);
    }
    /*
     * @notice View function to see pending reward on frontend.
     * @param _user: user address
     * @return Pending reward for a given user
     */
    function pendingReward(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        if (block.number > lastRewardBlock && stakedTokenAmount != 0) {
            uint256 multiplier = _getMultiplier(lastRewardBlock, block.number);
            uint256 tokenReward = multiplier * rewardPerBlock;
            uint256 adjustedTokenPerShare = accTokenPerShare + (tokenReward * PRECISION_FACTOR) / stakedTokenAmount;
            return (user.amount * adjustedTokenPerShare) / PRECISION_FACTOR - user.rewardDebt;
        } else {
            return (user.amount * accTokenPerShare) / PRECISION_FACTOR - user.rewardDebt;
        }
    }

    function _depositStakedToken(uint256 _amount) internal returns (uint256 _received) {
        uint256 balanceBefore = stakedToken.balanceOf(address(this));
        stakedToken.safeTransferFrom(address(msg.sender), address(this), _amount);
        _received = stakedToken.balanceOf(address(this)) - balanceBefore;
        stakedTokenAmount = stakedTokenAmount + _received;
    }

    function _withdrawStakedToken(uint256 _amount) internal {
        stakedTokenAmount = stakedTokenAmount - _amount;
        stakedToken.safeTransfer(address(msg.sender), _amount);
    }

    function _withdrawRewardToken(uint256 _amount) internal {
        rewardToken.safeTransfer(address(msg.sender), _amount);
        if (rewardToken == stakedToken) {
            require(stakedToken.balanceOf(address(this)) >= stakedTokenAmount, "rewards empty");
        }
    }
    /*
     * @notice Update reward variables of the given pool to be up-to-date.
     */
    function _updatePool() internal {
        if (block.number <= lastRewardBlock) {
            return;
        }

        if (stakedTokenAmount == 0) {
            lastRewardBlock = block.number;
            return;
        }

        uint256 multiplier = _getMultiplier(lastRewardBlock, block.number);
        uint256 tokenReward = multiplier * rewardPerBlock;
        accTokenPerShare = accTokenPerShare + (tokenReward * PRECISION_FACTOR) / stakedTokenAmount;
        lastRewardBlock = block.number;
    }
    /*
     * @notice Return reward multiplier over the given _from to _to block.
     * @param _from: block to start
     * @param _to: block to finish
     */
    function _getMultiplier(uint256 _from, uint256 _to) internal view returns (uint256) {
        if (_to <= bonusEndBlock) {
            return _to - _from;
        } else if (_from >= bonusEndBlock) {
            return 0;
        } else {
            return bonusEndBlock - _from;
        }
    }
    /*
     * @notice Return user limit is set or zero.
     */
    function hasUserLimit() public view returns (bool) {
        if (!userLimit || (block.number >= (startBlock + numberBlocksForUserLimit))) {
            return false;
        }
        return true;
    }
    /*
     * @notice Allows admin to assing a new manager
     */
    function changeManager(address _oldManager, address _newManager) external onlyOwner {
        require(_newManager != address(0), "New manager cannot be zero address");
        
        revokeRole(MANAGER_ROLE, _oldManager);
        grantRole(MANAGER_ROLE, _newManager);

        emit ManagerUpdated(_newManager);
    }
}