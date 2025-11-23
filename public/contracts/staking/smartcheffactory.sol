// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
pragma abicoder v2;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./SmartChefInitializable.sol";

/**
 * @title SmartChefFactory
 * @dev Factory contract for deploying SmartChef staking pools
 * This contract allows anyone to deploy a new staking pool by paying a deployment fee
 * The owner can configure the deployment fee and fee collector address
 */
contract SmartChefFactory is Ownable {
    // Fee required to deploy a new pool
    uint256 public deploymentFee;
    
    // Address that receives deployment fees
    address public feeCollector;
    
    // Events
    event NewSmartChefContract(address indexed smartChef);
    event DeploymentFeeUpdated(uint256 newFee);
    event FeeCollectorUpdated(address newCollector);
    
    /**
     * @notice Constructor
     * @param _initialFee Initial deployment fee amount in ETH
     * @param _initialCollector Address to receive deployment fees
     */
    constructor(uint256 _initialFee, address _initialCollector) {
        require(_initialCollector != address(0), "Invalid fee collector");
        deploymentFee = _initialFee;
        feeCollector = _initialCollector;
    }
    
    /**
     * @notice Updates the deployment fee
     * @dev Only callable by owner
     * @param _newFee New fee amount in ETH
     */
    function updateDeploymentFee(uint256 _newFee) external onlyOwner {
        deploymentFee = _newFee;
        emit DeploymentFeeUpdated(_newFee);
    }
    
    /**
     * @notice Updates the fee collector address
     * @dev Only callable by owner
     * @param _newCollector New address to receive deployment fees
     */
    function updateFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid collector address");
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(_newCollector);
    }
    
    /**
     * @notice Deploys a new SmartChef staking pool
     * @dev Requires payment of deploymentFee in ETH
     * @param _stakedToken Token to be staked
     * @param _rewardToken Token given as rewards
     * @param _rewardPerBlock Reward tokens created per block
     * @param _startBlock Block number when mining starts
     * @param _bonusEndBlock Block number when mining ends
     * @param _poolLimitPerUser Pool limit per user in stakedToken (if any, else 0)
     * @param _numberBlocksForUserLimit Block numbers available for user limit (after start block)
     * @param _minStakingPeriod Minimum staking period in days (0 if disabled)
     * @param _useInitialLockPeriod Whether to use initial deposit time for lock period
     * @param _admin Address to receive ownership of the deployed pool
     * @param _manager Address to manage the staking pool
     */
    function deployPool(
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
    ) external payable {
        // Validate deployment fee
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        
        // Validate parameters
        require(address(_stakedToken) != address(0), "Invalid staked token");
        require(address(_rewardToken) != address(0), "Invalid reward token");
        require(_stakedToken.totalSupply() >= 0, "Invalid staked token");
        require(_rewardToken.totalSupply() >= 0, "Invalid reward token");
        require(_admin != address(0), "Invalid admin address");
        require(_startBlock >= block.number, "Start block must be future");
        require(_startBlock < _bonusEndBlock, "Start block must be before end block");
        require(_rewardPerBlock > 0, "Reward per block must be > 0");
        
        // Deploy new SmartChef contract using create2 for deterministic addresses
        bytes memory bytecode = type(SmartChefInitializable).creationCode;
        bytecode = abi.encodePacked(bytecode, abi.encode());
        bytes32 salt = keccak256(abi.encodePacked(_stakedToken, _rewardToken, _startBlock));
        address smartChefAddress;
        
        assembly {
            smartChefAddress := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        require(smartChefAddress != address(0), "Failed to deploy contract");
        
        // Initialize the newly deployed contract
        SmartChefInitializable(smartChefAddress).initialize(
            _stakedToken,
            _rewardToken,
            _rewardPerBlock,
            _startBlock,
            _bonusEndBlock,
            _poolLimitPerUser,
            _numberBlocksForUserLimit,
            _minStakingPeriod,
            _useInitialLockPeriod,
            _admin,
            _manager
        );
        
        // Transfer deployment fee to collector
        (bool success, ) = feeCollector.call{value: msg.value}("");
        require(success, "Fee transfer failed");
        
        emit NewSmartChefContract(smartChefAddress);
    }
    
    /**
     * @notice Calculates the address where a contract will be deployed using create2
     * @dev Useful for predicting pool addresses before deployment
     * @param _stakedToken Token to be staked
     * @param _rewardToken Token given as rewards
     * @param _startBlock Block number when mining starts
     * @return Predicted address of the pool
     */
    function predictPoolAddress(
        IERC20Metadata _stakedToken,
        IERC20Metadata _rewardToken,
        uint256 _startBlock
    ) external view returns (address) {
        bytes memory bytecode = type(SmartChefInitializable).creationCode;
        bytecode = abi.encodePacked(bytecode, abi.encode());
        bytes32 salt = keccak256(abi.encodePacked(_stakedToken, _rewardToken, _startBlock));
        
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        
        return address(uint160(uint256(hash)));
    }
    
    /**
     * @notice Allows the contract to receive ETH for deployment fees
     */
    receive() external payable {}
    
    /**
     * @notice Emergency function to recover ETH stuck in the contract
     * @dev Only callable by owner
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}