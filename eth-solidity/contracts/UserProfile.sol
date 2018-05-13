pragma solidity ^0.4.0;

import "./Ownable.sol";

contract UserProfile is Ownable {

    address public userAddress;

    uint64 public reputation;

    mapping(address => bool) public usedArticles;

    constructor(address _userAddress) public{
        userAddress = _userAddress;
        reputation = 1000;
    }

    function setArticleAsUsed(address articleAddress) public onlyOwner {
        if (usedArticles[articleAddress]) {
            revert();
        }
        usedArticles[articleAddress] = true;
    }

    function setReputation(uint64 _reputation) public onlyOwner {
        reputation = _reputation;
    }
}
