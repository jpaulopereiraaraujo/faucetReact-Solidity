// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


contract Owned {
    address public owner;

    constructor () {
        owner = msg.sender;
    }

    modifier isOwner {
        require(msg.sender == owner,"Only owner can use this.");
        _;
    }

}

