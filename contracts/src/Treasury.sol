// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Treasury
 * @notice Holds community funds from trading fees
 * @dev Controlled by governance (token-weighted voting via Snapshot)
 */
contract Treasury is Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    /// @notice The community token contract
    address public immutable communityToken;
    
    /// @notice Minimum voting period for proposals (in seconds)
    uint256 public constant MIN_VOTING_PERIOD = 3 days;
    
    /// @notice Quorum percentage required (10% of supply)
    uint256 public constant QUORUM_PERCENT = 10;

    // ============ Events ============
    
    event FundsReceived(address indexed from, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount, string reason);
    event EmergencyWithdrawal(address indexed to, uint256 amount);

    // ============ Constructor ============
    
    constructor(address _communityToken, address _creator) Ownable(_creator) {
        communityToken = _communityToken;
    }

    // ============ External Functions ============
    
    /**
     * @notice Withdraw funds (called after successful governance vote)
     * @dev In production, this would verify a Snapshot vote passed
     * @param to Recipient address
     * @param amount Amount to withdraw
     * @param reason Description of what the funds are for
     */
    function withdraw(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Cannot withdraw to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Transfer failed");
        
        emit FundsWithdrawn(to, amount, reason);
    }
    
    /**
     * @notice Emergency withdrawal by owner (multisig in production)
     * @dev Should only be used in emergencies, requires multisig
     * @param to Recipient address
     */
    function emergencyWithdraw(address to) external onlyOwner nonReentrant {
        require(to != address(0), "Cannot withdraw to zero address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool sent, ) = to.call{value: balance}("");
        require(sent, "Transfer failed");
        
        emit EmergencyWithdrawal(to, balance);
    }

    // ============ View Functions ============
    
    /**
     * @notice Get the treasury balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ Receive ============
    
    /// @notice Receive ETH from token contract fees
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
}
