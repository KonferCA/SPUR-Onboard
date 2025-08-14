// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SpurRegistry
 * @dev On-chain registry for platform addresses used by SPUR.
 * Stores the canonical platform wallet, SpurCoin token address, and ProjectFunding address.
 */
contract SpurRegistry is Ownable {
    // Canonical addresses
    address public platformWallet;
    address public spurCoin;
    address public projectFunding;

    // Events
    event PlatformWalletUpdated(address indexed wallet);
    event SpurCoinUpdated(address indexed token);
    event ProjectFundingUpdated(address indexed projectFunding);

    constructor(
        address initialOwner,
        address _platformWallet,
        address _spurCoin,
        address _projectFunding
    ) Ownable(initialOwner) {
        _setPlatformWallet(_platformWallet);
        _setSpurCoin(_spurCoin);
        _setProjectFunding(_projectFunding);
    }

    // Owner setters
    function setPlatformWallet(address _platformWallet) external onlyOwner {
        _setPlatformWallet(_platformWallet);
    }

    function setSpurCoin(address _spurCoin) external onlyOwner {
        _setSpurCoin(_spurCoin);
    }

    function setProjectFunding(address _projectFunding) external onlyOwner {
        _setProjectFunding(_projectFunding);
    }

    // Internal setters with validation + events
    function _setPlatformWallet(address _platformWallet) internal {
        require(_platformWallet != address(0), "invalid platform wallet");
        platformWallet = _platformWallet;
        emit PlatformWalletUpdated(_platformWallet);
    }

    function _setSpurCoin(address _spurCoin) internal {
        require(_spurCoin != address(0), "invalid spurcoin address");
        spurCoin = _spurCoin;
        emit SpurCoinUpdated(_spurCoin);
    }

    function _setProjectFunding(address _projectFunding) internal {
        require(_projectFunding != address(0), "invalid project funding address");
        projectFunding = _projectFunding;
        emit ProjectFundingUpdated(_projectFunding);
    }
}


