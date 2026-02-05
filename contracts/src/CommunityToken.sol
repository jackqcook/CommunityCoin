// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CommunityToken
 * @notice ERC20 token with a bonding curve for price discovery
 * @dev Uses a linear bonding curve: price = basePrice + (supply * slope)
 *      2% of each trade goes to the community treasury
 */
contract CommunityToken is ERC20, Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    /// @notice The treasury contract that receives fees
    address public immutable treasury;
    
    /// @notice Base price in wei (starting price when supply is 0)
    uint256 public constant BASE_PRICE = 0.0001 ether;
    
    /// @notice Price increase per token (slope of bonding curve)
    uint256 public constant PRICE_SLOPE = 0.00000001 ether;
    
    /// @notice Fee percentage sent to treasury (2%)
    uint256 public constant TREASURY_FEE_PERCENT = 2;
    
    /// @notice IPFS CID of the group charter
    string public charterCid;
    
    /// @notice Whether the group is public or invite-only
    bool public isPublic;

    // ============ Events ============
    
    event TokensPurchased(
        address indexed buyer,
        uint256 ethIn,
        uint256 tokensOut,
        uint256 newPrice,
        uint256 treasuryFee
    );
    
    event TokensSold(
        address indexed seller,
        uint256 tokensIn,
        uint256 ethOut,
        uint256 newPrice,
        uint256 treasuryFee
    );
    
    event CharterUpdated(string newCharterCid);
    event VisibilityUpdated(bool isPublic);

    // ============ Constructor ============
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _charterCid,
        bool _isPublic,
        address _treasury,
        address _creator
    ) ERC20(_name, _symbol) Ownable(_creator) {
        require(_treasury != address(0), "Treasury cannot be zero address");
        treasury = _treasury;
        charterCid = _charterCid;
        isPublic = _isPublic;
    }

    // ============ External Functions ============
    
    /**
     * @notice Buy tokens with ETH using the bonding curve
     * @dev 2% fee goes to treasury, rest used to mint tokens
     */
    function buy() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        
        // Calculate treasury fee (2%)
        uint256 fee = (msg.value * TREASURY_FEE_PERCENT) / 100;
        uint256 ethForTokens = msg.value - fee;
        
        // Calculate tokens to mint based on bonding curve
        uint256 tokensToMint = calculatePurchaseReturn(ethForTokens);
        require(tokensToMint > 0, "Insufficient ETH for any tokens");
        
        // Mint tokens to buyer
        _mint(msg.sender, tokensToMint);
        
        // Send fee to treasury
        (bool sent, ) = treasury.call{value: fee}("");
        require(sent, "Treasury fee transfer failed");
        
        emit TokensPurchased(
            msg.sender,
            msg.value,
            tokensToMint,
            getCurrentPrice(),
            fee
        );
    }
    
    /**
     * @notice Sell tokens back to the contract for ETH
     * @param tokenAmount Amount of tokens to sell
     */
    function sell(uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Must sell some tokens");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");
        
        // Calculate ETH to return based on bonding curve
        uint256 ethToReturn = calculateSaleReturn(tokenAmount);
        require(ethToReturn > 0, "No ETH to return");
        require(address(this).balance >= ethToReturn, "Insufficient contract balance");
        
        // Calculate treasury fee (2%)
        uint256 fee = (ethToReturn * TREASURY_FEE_PERCENT) / 100;
        uint256 ethAfterFee = ethToReturn - fee;
        
        // Burn tokens
        _burn(msg.sender, tokenAmount);
        
        // Send fee to treasury
        (bool feeSent, ) = treasury.call{value: fee}("");
        require(feeSent, "Treasury fee transfer failed");
        
        // Send ETH to seller
        (bool sent, ) = msg.sender.call{value: ethAfterFee}("");
        require(sent, "ETH transfer failed");
        
        emit TokensSold(
            msg.sender,
            tokenAmount,
            ethAfterFee,
            getCurrentPrice(),
            fee
        );
    }

    // ============ View Functions ============
    
    /**
     * @notice Get the current token price based on supply
     * @return Current price in wei
     */
    function getCurrentPrice() public view returns (uint256) {
        return BASE_PRICE + (totalSupply() * PRICE_SLOPE / 1e18);
    }
    
    /**
     * @notice Calculate how many tokens you get for a given ETH amount
     * @param ethAmount Amount of ETH (after fees)
     * @return Number of tokens (in wei, 18 decimals)
     */
    function calculatePurchaseReturn(uint256 ethAmount) public view returns (uint256) {
        // Simplified linear bonding curve calculation
        // For a more accurate curve, we'd integrate, but this is good for MVP
        uint256 currentPrice = getCurrentPrice();
        return (ethAmount * 1e18) / currentPrice;
    }
    
    /**
     * @notice Calculate how much ETH you get for selling tokens
     * @param tokenAmount Amount of tokens to sell
     * @return Amount of ETH (before fees)
     */
    function calculateSaleReturn(uint256 tokenAmount) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        return (tokenAmount * currentPrice) / 1e18;
    }
    
    /**
     * @notice Get the contract's ETH balance (liquidity pool)
     */
    function getReserve() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Update the charter CID (governance can change this)
     * @param _newCharterCid New IPFS CID for the charter
     */
    function updateCharter(string calldata _newCharterCid) external onlyOwner {
        charterCid = _newCharterCid;
        emit CharterUpdated(_newCharterCid);
    }
    
    /**
     * @notice Update group visibility
     * @param _isPublic Whether the group is public
     */
    function setVisibility(bool _isPublic) external onlyOwner {
        isPublic = _isPublic;
        emit VisibilityUpdated(_isPublic);
    }

    // ============ Receive ============
    
    /// @notice Allow contract to receive ETH directly (for liquidity)
    receive() external payable {}
}
