pragma solidity ^0.4.23;

import './math/SafeMath.sol';

contract Article {
    using SafeMath for uint256;

    uint256 public up;
    uint256 public upW;
    uint256 public down;
    uint256 public downW;

    string public hash;

    mapping(address => bool) public voteOf;
    mapping(address => uint32) public weights;
    mapping(address => bool) public didVote;

    constructor(string _newsHash) public {
        hash = _newsHash;
    }

    function doVote(bool _vote, uint32 _weight) public {
        address voter = msg.sender;
        if (didVote[voter]) {
            revert();
        }
        if (_vote) {
            up = up.add(1);
            upW = upW.add(_weight);
        }
        else {
            down = down.add(1);
            downW = downW.add(_weight);
        }
        voteOf[voter] = _vote;
        didVote[voter] = true;
        weights[voter] = _weight;
    }

}
