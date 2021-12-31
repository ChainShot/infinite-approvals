// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Potato is ERC20, Ownable {
    constructor(address owner) ERC20("Potato", "TAT") {
        transferOwnership(owner);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}