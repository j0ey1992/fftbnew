// SPDX-License-Identifier: MIT
pragma solidity =0.8.24;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

/// @title TokenVault Contract
/// @notice This contract manages staking, rewards distribution, and pool management for Boost Tokens.
/// @dev Inherits from ERC20 for token functionality, ReentrancyGuard for reentrancy protection,
/// Pausable for pausing functionality, and Ownable for access control.
contract TokenVault is ERC20, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    using SafeERC20 for IERC20Metadata;

    // Struct to store information about each stake
    struct Stake {
        uint256 poolId; // ID of the pool where the stake is made
        uint256 amount; // Amount of tokens staked
        uint256 weightedAmount; // Weighted amount of the stake, used for rewards calculation
        uint256 stakeTimestamp; // Timestamp when the stake was made
        uint256 unlockTimestamp; // Timestamp when the stake can be unlocked
        bool active; // Status of the stake, whether it is active or not
    }

    // Struct to store information about each pool
    struct PoolInfo {
        uint256 multiplier; // Multiplier for the pool, used for rewards calculation
        uint256 lockPeriod; // Lock period for the pool, during which stakes cannot be withdrawn
        uint256 totalAmount; // Total amount of tokens staked in the pool
    }

    // Struct to store information about each user
    struct UserInfo {
        uint256 totalAmount; // Total amount of tokens staked by the user
        uint256 totalWeightedAmount; // Total weighted amount of the user's stakes, used for rewards calculation
        uint256 rewardDebt; // Reward debt of the user, used for rewards calculation
        uint256 totalClaimed; // Total amount of rewards claimed by the user
        Stake[] stakes; // Array of stakes made by the user
    }

    uint256 public immutable PRECISION;

    /// The reward token
    IERC20Metadata public immutable rewardToken;

    /// The staked token
    IERC20 public immutable stakeToken;

    /// Emission per second
    uint256 public rewardPerSecond;

    /// @notice Accumulated tokens per share, scaled by the precision factor.
    /// @dev This variable tracks the amount of reward tokens accumulated per share of the total weighted amount.
    /// It is used to calculate the pending rewards for each user based on their weighted stake.
    uint256 public accTokenPerShare;

    /// Emission starting timestamp
    uint256 public rewardStartTimestamp;

    /// Emission ending timestamp
    uint256 public rewardEndTimestamp;

    /// The timestamp of the last pool update
    uint256 public lastRewardTimeStamp;

    // Mapping to store user information
    mapping(address => UserInfo) public userInfo;

    // Mapping to store active pool information
    mapping(uint256 => mapping(uint256 => uint256)) public activePoolMap;

    PoolInfo[] public poolInfo;

    // Events for logging important actions
    event Deposit(
        address indexed user,
        uint256 indexed pid,
        uint256 indexed stakeId,
        uint256 amount,
        uint256 weightedAmount,
        uint256 unlockTimestamp
    );
    event Withdraw(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 weightedAmount);
    event Upgrade(
        address indexed user,
        uint256 indexed stakeId,
        uint256 indexed newPid,
        uint256 newWeightedAmount,
        uint256 newUnlockTimestamp
    );
    event AddPool(uint256 indexed poolId, uint256 multiplier, uint256 lockPeriod);
    event SetPool(uint256 indexed poolId, uint256 multiplier, uint256 lockPeriod);
    event SetRewardPerSecond(uint256 rewardPerSecond);
    event SetRewardStartTimestamp(uint256 rewardStartTimestamp);
    event SetRewardEndTimestamp(uint256 rewardEndTimestamp);

    // Custom errors for more efficient error handling
    error InvalidRewardTokenDecimal();
    error InvalidPid();
    error ZeroAddress();
    error InvalidTimestamp();
    error LengthMismatch();
    error TooEarly();
    error InvalidStake();
    error LongerPeriod();
    error HigherMultiplier();
    error VaultHasStarted();
    error DuplicatePool();
    error InvalidMultiplier();
    error NonTransferable();

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        IERC20 _stakeToken,
        IERC20Metadata _rewardToken,
        uint256 _rewardPerSecond,
        uint256 _rewardStartTimestamp,
        uint256 _rewardEndTimestamp
    ) ERC20(_tokenName, _tokenSymbol) {
        if (address(_stakeToken) == address(0) || address(_rewardToken) == address(0)) revert ZeroAddress();
        if (_rewardStartTimestamp >= _rewardEndTimestamp) revert InvalidTimestamp();

        stakeToken = _stakeToken;
        rewardToken = _rewardToken;
        rewardPerSecond = _rewardPerSecond;
        rewardStartTimestamp = _rewardStartTimestamp;
        rewardEndTimestamp = _rewardEndTimestamp;

        uint256 rewardTokenDecimals = uint256(rewardToken.decimals());
        if (rewardTokenDecimals >= 36) revert InvalidRewardTokenDecimal();
        PRECISION = 10 ** (36 - rewardTokenDecimals);

        lastRewardTimeStamp = block.timestamp > rewardStartTimestamp ? block.timestamp : rewardStartTimestamp;
    }

    /**
     * @notice Allows a user to deposit a specified amount of tokens into a pool.
     * @dev This function can only be called when the contract is not paused and is protected against reentrancy.
     * @param _pid The ID of the pool into which the tokens are being deposited.
     * @param _amount The amount of tokens to deposit.
     *
     * Requirements:
     * - The pool must exist and have a valid multiplier.
     * - The user must have approved the contract to spend at least `_amount` of the staked token.
     *
     * Effects:
     * - Updates the user's stake and pool information.
     * - Transfers the specified amount of tokens from the user to the contract.
     * - Mints new Boost Tokens to the user based on the pool's multiplier.
     * - Emits a `Deposit` event.
     */
    function deposit(uint256 _pid, uint256 _amount) external whenNotPaused nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        if (pool.multiplier == 0) revert InvalidPid();

        _harvest();

        UserInfo storage user = userInfo[msg.sender];
        if (user.totalWeightedAmount > 0) {
            uint256 pending = (user.totalWeightedAmount * accTokenPerShare) / PRECISION - user.rewardDebt;
            if (pending > 0) {
                user.totalClaimed += pending;
                rewardToken.safeTransfer(msg.sender, pending);
            }
        }

        if (_amount > 0) {
            uint256 weightedAmount = pool.multiplier * _amount;
            Stake memory stake;
            stake.amount = _amount;
            stake.poolId = _pid;
            stake.weightedAmount = weightedAmount;
            stake.stakeTimestamp = block.timestamp;
            stake.unlockTimestamp = block.timestamp + pool.lockPeriod;
            stake.active = true;

            user.stakes.push(stake);
            user.totalAmount += _amount;
            user.totalWeightedAmount += weightedAmount;
            pool.totalAmount += _amount;

            stakeToken.safeTransferFrom(msg.sender, address(this), _amount);
            _mint(msg.sender, weightedAmount);

            emit Deposit(
                msg.sender,
                _pid,
                user.stakes.length - 1,
                _amount,
                stake.weightedAmount,
                stake.unlockTimestamp
            );
        }

        user.rewardDebt = (user.totalWeightedAmount * accTokenPerShare) / PRECISION;
    }

    /**
     * @notice Allows a user to withdraw their staked tokens from a specific stake.
     * @dev This function can only be called when the contract is not paused and is protected against reentrancy.
     * @param _stakeId The ID of the stake to withdraw from.
     *
     * Requirements:
     * - The stake must be active and the unlock timestamp must have passed.
     *
     * Effects:
     * - Transfers the staked tokens back to the user.
     * - Burns the corresponding Boost Tokens.
     * - Updates the user's stake and pool information.
     * - Emits a `Withdraw` event.
     */
    function withdraw(uint256 _stakeId) public whenNotPaused nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        Stake storage stake = user.stakes[_stakeId];
        PoolInfo storage pool = poolInfo[stake.poolId];
        if (block.timestamp < stake.unlockTimestamp) revert TooEarly();
        if (!stake.active) revert InvalidStake();

        _harvest();

        if (user.totalWeightedAmount > 0) {
            uint256 pending = (user.totalWeightedAmount * accTokenPerShare) / PRECISION - user.rewardDebt;
            if (pending > 0) {
                user.totalClaimed += pending;
                rewardToken.safeTransfer(msg.sender, pending);
            }
        }

        user.totalAmount -= stake.amount;
        user.totalWeightedAmount -= stake.weightedAmount;
        pool.totalAmount -= stake.amount;
        stake.active = false;

        stakeToken.safeTransfer(msg.sender, stake.amount);
        _burn(msg.sender, stake.weightedAmount);

        user.rewardDebt = (user.totalWeightedAmount * accTokenPerShare) / PRECISION;
        emit Withdraw(msg.sender, _stakeId, stake.amount, stake.weightedAmount);
    }

    /**
     * @notice Allows a user to upgrade their stake to a new pool with potentially different parameters.
     * @dev This function can only be called when the contract is not paused and is protected against reentrancy.
     * @param _stakeId The ID of the stake to upgrade.
     * @param _newPid The ID of the new pool to which the stake is being upgraded.
     *
     * Requirements:
     * - The stake must be active.
     * - The new pool's lock period must not be shorter than the remaining lock period of the current stake.
     * - The new pool's multiplier must be at least equal to the current stake's weighted amount per token.
     *
     * Effects:
     * - Updates the stake's pool ID and unlock timestamp.
     * - Adjusts the user's total weighted amount and mints additional Boost Tokens if necessary.
     * - Updates the total amount in the old and new pools.
     * - Emits an `Upgrade` event.
     */
    function upgrade(uint256 _stakeId, uint256 _newPid) public whenNotPaused nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        Stake storage stake = user.stakes[_stakeId];
        PoolInfo storage oldPool = poolInfo[stake.poolId];
        PoolInfo storage newPool = poolInfo[_newPid];
        if (!stake.active) revert InvalidStake();
        if (stake.stakeTimestamp + newPool.lockPeriod < stake.unlockTimestamp) revert LongerPeriod();
        if (newPool.multiplier < stake.weightedAmount / stake.amount) revert HigherMultiplier();

        _harvest();
        if (user.totalWeightedAmount > 0) {
            uint256 pending = (user.totalWeightedAmount * accTokenPerShare) / PRECISION - user.rewardDebt;
            if (pending > 0) {
                user.totalClaimed += pending;
                rewardToken.safeTransfer(msg.sender, pending);
            }
        }
        oldPool.totalAmount -= stake.amount;

        stake.poolId = _newPid;
        stake.unlockTimestamp = stake.stakeTimestamp + newPool.lockPeriod;

        uint256 upgradeAmount = newPool.multiplier * stake.amount - stake.weightedAmount;
        user.totalWeightedAmount += upgradeAmount;
        stake.weightedAmount += upgradeAmount;
        _mint(msg.sender, upgradeAmount);

        newPool.totalAmount += stake.amount;
        user.rewardDebt = (user.totalWeightedAmount * accTokenPerShare) / PRECISION;
        emit Upgrade(msg.sender, _stakeId, _newPid, stake.weightedAmount, stake.unlockTimestamp);
    }

    function batchWithdraw(uint256[] calldata _stakeIds) external {
        for (uint256 i; i < _stakeIds.length; i++) {
            withdraw(_stakeIds[i]);
        }
    }

    function batchUpgrade(uint256[] calldata _stakeIds, uint256[] calldata _newPids) external {
        if (_stakeIds.length != _newPids.length) revert LengthMismatch();
        for (uint256 i; i < _stakeIds.length; i++) {
            upgrade(_stakeIds[i], _newPids[i]);
        }
    }

    /**
     * @notice Internal function to distribute pending rewards to the vault.
     * @dev Updates the accumulated token per share and the last reward timestamp.
     *
     * Effects:
     * - Calculates the reward multiplier based on the time elapsed since the last update.
     * - Computes the total reward to be distributed and updates the accumulated token per share.
     * - Updates the last reward timestamp to the current block timestamp.
     *
     * Requirements:
     * - The function does nothing if the current timestamp is not greater than the last reward timestamp.
     * - If the total supply of the vault is zero, only updates the last reward timestamp.
     */
    function _harvest() internal {
        if (block.timestamp <= lastRewardTimeStamp) {
            return;
        }
        uint256 total = totalSupply();
        if (total == 0) {
            lastRewardTimeStamp = block.timestamp;
            return;
        }

        uint256 multiplier = _getMultiplier(lastRewardTimeStamp, block.timestamp);
        uint256 reward = multiplier * rewardPerSecond;
        accTokenPerShare += (reward * PRECISION) / total;
        lastRewardTimeStamp = block.timestamp;
    }

    /**
     * @notice Adds a new pool with specified parameters.
     * @dev Can only be called by the contract owner.
     * @param _multiplier The multiplier for the pool, used to calculate weighted amounts.
     * @param _lockPeriod The lock period for the pool in seconds.
     *
     * Requirements:
     * - The pool with the given multiplier and lock period must not already exist.
     * - The multiplier must be greater than zero.
     *
     * Effects:
     * - Creates a new pool and adds it to the list of pools.
     * - Updates the active pool mapping to include the new pool.
     * - Emits an `AddPool` event.
     */
    function add(uint256 _multiplier, uint256 _lockPeriod) public onlyOwner {
        if (activePoolMap[_multiplier][_lockPeriod] != 0) revert DuplicatePool();
        if (_multiplier == 0) revert InvalidMultiplier();
        poolInfo.push(PoolInfo({multiplier: _multiplier, lockPeriod: _lockPeriod, totalAmount: 0}));
        activePoolMap[_multiplier][_lockPeriod] = poolInfo.length;
        emit AddPool(poolInfo.length - 1, _multiplier, _lockPeriod);
    }

    /**
     * @notice Updates the parameters of an existing pool.
     * @dev Can only be called by the contract owner.
     * @param _pid The ID of the pool to update.
     * @param _multiplier The new multiplier for the pool.
     * @param _lockPeriod The new lock period for the pool in seconds.
     *
     * Requirements:
     * - The pool with the given multiplier and lock period must not already exist.
     * - The multiplier must be greater than zero.
     *
     * Effects:
     * - Updates the pool's multiplier and lock period.
     * - Adjusts the active pool mapping to reflect the changes.
     * - Emits a `SetPool` event.
     */
    function set(uint256 _pid, uint256 _multiplier, uint256 _lockPeriod) public onlyOwner {
        if (activePoolMap[_multiplier][_lockPeriod] != 0) revert DuplicatePool();
        if (_multiplier == 0) revert InvalidMultiplier();
        _harvest();

        PoolInfo storage pool = poolInfo[_pid];
        activePoolMap[pool.multiplier][pool.lockPeriod] = 0;
        pool.multiplier = _multiplier;
        pool.lockPeriod = _lockPeriod;
        activePoolMap[_multiplier][_lockPeriod] = _pid + 1;

        emit SetPool(_pid, _multiplier, _lockPeriod);
    }

    function _getMultiplier(uint256 _lastRewardTime, uint256 _currentTimestamp) internal view returns (uint256) {
        // Scenario 1: Not started yet
        if (block.timestamp < rewardStartTimestamp) {
            return 0;
        }
        // Scenario 2: Reward started and not ended. (on-going)
        if (_currentTimestamp <= rewardEndTimestamp) {
            return _currentTimestamp - _lastRewardTime;
        }
        // Scenario 3: pool's last reward already over rewardEndTimestamp
        if (_lastRewardTime >= rewardEndTimestamp) {
            return 0;
        }
        // Scenario 4: reward ended, calculate the diff from last claim
        return rewardEndTimestamp - _lastRewardTime;
    }

    /**
     * @notice Sets the reward per second to be distributed. Can only be called by the owner.
     * @param _rewardPerSecond The amount of reward token to be distributed per second.
     */
    function setRewardPerSecond(uint256 _rewardPerSecond) public onlyOwner {
        _harvest();
        rewardPerSecond = _rewardPerSecond;
        emit SetRewardPerSecond(_rewardPerSecond);
    }

    /**
     * @notice Sets the reward start timestamp. Can only be called by the owner.
     * @param _rewardStartTimestamp The timestamp when the reward starts.
     * @custom:throws VaultHasStarted if the vault has already started.
     * @custom:throws InvalidTimestamp if the reward start timestamp is invalid.
     */
    function setRewardStartTimestamp(uint256 _rewardStartTimestamp) public onlyOwner {
        if (block.timestamp > rewardStartTimestamp) revert VaultHasStarted();
        if (block.timestamp > _rewardStartTimestamp || _rewardStartTimestamp > rewardEndTimestamp)
            revert InvalidTimestamp();
        rewardStartTimestamp = _rewardStartTimestamp;
        emit SetRewardStartTimestamp(_rewardStartTimestamp);
    }

    /**
     * @notice Sets the reward end timestamp. Can only be called by the owner.
     * @param _rewardEndTimestamp The timestamp when the reward ends.
     * @custom:throws InvalidTimestamp if the reward end timestamp is invalid.
     */
    function setRewardEndTimestamp(uint256 _rewardEndTimestamp) public onlyOwner {
        if (block.timestamp > _rewardEndTimestamp || rewardStartTimestamp > _rewardEndTimestamp)
            revert InvalidTimestamp();

        _harvest();
        rewardEndTimestamp = _rewardEndTimestamp;
        emit SetRewardEndTimestamp(_rewardEndTimestamp);
    }

    function getUserInfo(address _user) external view returns (uint256, uint256, uint256, uint256, Stake[] memory) {
        UserInfo memory user = userInfo[_user];
        return (user.totalAmount, user.totalWeightedAmount, user.totalClaimed, user.rewardDebt, user.stakes);
    }

    /**
     * @dev Just in case there are too many Stakes and jams `getUserInfo`
     */
    function getUserStake(address _user, uint256 _stakeId) external view returns (Stake memory) {
        return userInfo[_user].stakes[_stakeId];
    }

    /**
     * @notice Calculates the pending reward for a user.
     * @dev This function provides a view of the rewards that a user can claim.
     * @param _user The address of the user for whom to calculate the pending reward.
     * @return The amount of reward tokens that are pending for the user.
     *
     * Effects:
     * - Computes the pending accumulated token per share if the current timestamp is greater than the last reward timestamp.
     * - Calculates the pending reward based on the user's total weighted amount and reward debt.
     */
    function pendingReward(address _user) external view returns (uint256) {
        UserInfo memory user = userInfo[_user];
        uint256 pendingAccTokenPerShare = accTokenPerShare;
        if (block.timestamp > lastRewardTimeStamp && totalSupply() != 0) {
            uint256 multiplier = _getMultiplier(lastRewardTimeStamp, block.timestamp);
            uint256 reward = multiplier * rewardPerSecond;
            pendingAccTokenPerShare += (reward * PRECISION) / totalSupply();
        }
        return (user.totalWeightedAmount * pendingAccTokenPerShare) / PRECISION - user.rewardDebt;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /**
     * @dev BOOST Token is currently non-transferable
     */
    function _beforeTokenTransfer(address _from, address _to, uint256) internal pure override {
        if (_from != address(0) && _to != address(0)) revert NonTransferable();
    }

    /**
     * @notice Pause contract
     *
     * Requirements:
     * - The contract should not be paused before calling this function
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     *
     * Requirements:
     * - The contract should be paused before calling this function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
