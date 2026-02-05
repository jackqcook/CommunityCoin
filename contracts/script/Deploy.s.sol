// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GroupFactory.sol";

contract DeployScript is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying from:", deployer);
        console.log("Balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the GroupFactory
        GroupFactory factory = new GroupFactory();
        
        console.log("");
        console.log("===========================================");
        console.log("GroupFactory deployed at:", address(factory));
        console.log("===========================================");
        console.log("");
        console.log("Add this to your .env file:");
        console.log("NEXT_PUBLIC_GROUP_FACTORY_ADDRESS=", address(factory));
        
        vm.stopBroadcast();
    }
}

// Separate script for verifying deployment
contract VerifyScript is Script {
    function run() external view {
        address factoryAddress = vm.envAddress("NEXT_PUBLIC_GROUP_FACTORY_ADDRESS");
        GroupFactory factory = GroupFactory(factoryAddress);
        
        console.log("GroupFactory at:", factoryAddress);
        console.log("Group count:", factory.getGroupCount());
    }
}
