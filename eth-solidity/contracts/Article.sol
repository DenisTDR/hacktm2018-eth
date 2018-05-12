pragma solidity ^0.4.23;

import './math/SafeMath.sol';

contract Article {
    using SafeMath for uint256;

    uint256 public up;
    uint256 public down;

    string public hash;

    mapping(address => bool) public voteOf;
    mapping(address => bool) public didVote;

    constructor(string _newsHash) public {
        hash = _newsHash;
    }

    function doVote(bool _vote) public {
        address voter = msg.sender;
        if (didVote[voter]) {
            revert();
        }
        if (_vote) {
            up = up + 1;
        }
        else {
            up = up - 1;
        }
        voteOf[voter] = _vote;
        didVote[voter] = true;
    }

}
