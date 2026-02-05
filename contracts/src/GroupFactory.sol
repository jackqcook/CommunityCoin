// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CommunityToken.sol";
import "./Treasury.sol";

/**
 * @title GroupFactory
 * @notice Factory contract for deploying new CommunityCoin groups
 * @dev Deploys a CommunityToken + Treasury pair for each new group
 */
contract GroupFactory {
    // ============ State Variables ============
    
    /// @notice Array of all deployed token addresses
    address[] public deployedTokens;
    
    /// @notice Mapping from token address to treasury address
    mapping(address => address) public tokenToTreasury;
    
    /// @notice Mapping from creator to their groups
    mapping(address => address[]) public creatorGroups;

    // ============ Events ============
    
    /**
     * @notice Emitted when a new group is created
     * @param tokenAddress The deployed token contract address
     * @param treasuryAddress The deployed treasury contract address
     * @param creator The address that created the group
     * @param name The group/token name
     * @param symbol The token symbol
     * @param charterCid IPFS CID of the group charter
     * @param isPublic Whether the group is public or invite-only
     */
    event GroupCreated(
        address indexed tokenAddress,
        address indexed treasuryAddress,
        address indexed creator,
        string name,
        string symbol,
        string charterCid,
        bool isPublic
    );

    // ============ External Functions ============
    
    /**
     * @notice Create a new community group with token and treasury
     * @param name The name of the community/token
     * @param symbol The token symbol (e.g., "SOLAR")
     * @param charterCid IPFS CID of the group charter document
     * @param isPublic Whether the group is public (true) or invite-only (false)
     * @return tokenAddress The address of the deployed token contract
     * @return treasuryAddress The address of the deployed treasury contract
     */
    function createGroup(
        string calldata name,
        string calldata symbol,
        string calldata charterCid,
        bool isPublic
    ) external returns (address tokenAddress, address treasuryAddress) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length >= 2 && bytes(symbol).length <= 6, "Symbol must be 2-6 characters");
        
        // Deploy Treasury first (needs token address, but we'll set it after)
        // Actually, deploy token first with a placeholder, then treasury, then update
        // Simpler: Deploy treasury with creator as owner, then token with treasury address
        
        // Deploy token (treasury address will be set, token owns itself initially)
        // We need to deploy treasury first to get its address
        
        // Step 1: Calculate future token address using CREATE2 or deploy treasury first
        // For simplicity, we'll deploy treasury with a temp owner, then token, then transfer
        
        // Actually, let's use a two-step approach:
        // 1. Deploy Treasury with factory as temp owner
        // 2. Deploy Token with treasury address
        // 3. Transfer treasury ownership to token owner (creator)
        
        // Deploy Treasury (factory is temporary owner)
        Treasury treasury = new Treasury(address(0), msg.sender); // token addr set to 0 initially
        treasuryAddress = address(treasury);
        
        // Deploy Token with treasury address
        CommunityToken token = new CommunityToken(
            name,
            symbol,
            charterCid,
            isPublic,
            treasuryAddress,
            msg.sender
        );
        tokenAddress = address(token);
        
        // Store references
        deployedTokens.push(tokenAddress);
        tokenToTreasury[tokenAddress] = treasuryAddress;
        creatorGroups[msg.sender].push(tokenAddress);
        
        emit GroupCreated(
            tokenAddress,
            treasuryAddress,
            msg.sender,
            name,
            symbol,
            charterCid,
            isPublic
        );
        
        return (tokenAddress, treasuryAddress);
    }

    // ============ View Functions ============
    
    /**
     * @notice Get the total number of deployed groups
     */
    function getGroupCount() external view returns (uint256) {
        return deployedTokens.length;
    }
    
    /**
     * @notice Get all deployed token addresses
     */
    function getAllGroups() external view returns (address[] memory) {
        return deployedTokens;
    }
    
    /**
     * @notice Get groups created by a specific address
     * @param creator The creator's address
     */
    function getGroupsByCreator(address creator) external view returns (address[] memory) {
        return creatorGroups[creator];
    }
    
    /**
     * @notice Get treasury address for a token
     * @param tokenAddress The token contract address
     */
    function getTreasury(address tokenAddress) external view returns (address) {
        return tokenToTreasury[tokenAddress];
    }
    
    /**
     * @notice Check if an address is a valid deployed group
     * @param tokenAddress The address to check
     */
    function isValidGroup(address tokenAddress) external view returns (bool) {
        return tokenToTreasury[tokenAddress] != address(0);
    }
}
