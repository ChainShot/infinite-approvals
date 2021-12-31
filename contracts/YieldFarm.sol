//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Potato.sol";

contract YieldFarm {
    address public owner;
    address reserved;

    uint constant rate = 1e17;
    ERC20 constant seeds = ERC20(0x17420B1653AaB8a1379f64Bb3EDcAcC98C093849);
    Potato constant potatoes = Potato(0x93A520FDb31704837Da757235A60CbD18b381b8E);

    struct Planting {
        uint balance;
        uint timestamp;
    }

    mapping(address => Planting) plantings;
    
    function initialize() external {
        owner = msg.sender;
    }

    function plant(uint amount) external {
        require(plantings[msg.sender].timestamp == 0);
        seeds.transferFrom(msg.sender, address(this), amount);
        plantings[msg.sender].timestamp = block.timestamp;
        plantings[msg.sender].balance = amount;
    }

    function harvest() external {
        require(plantings[msg.sender].timestamp != 0);
        uint diff = block.timestamp - plantings[msg.sender].timestamp;
        potatoes.mint(msg.sender, diff * rate);
        plantings[msg.sender].timestamp = block.timestamp;
    }

    function unplant() external {
        require(plantings[msg.sender].timestamp != 0);
        seeds.transfer(msg.sender, plantings[msg.sender].balance);
        delete plantings[msg.sender];
    }
}