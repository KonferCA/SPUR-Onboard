// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SpurCoin
 * @dev simple erc20 token for the spur platform.
 * inherits from openzeppelin's erc20 and ownable contracts.
 * the owner (deployer) can mint additional tokens.
 */
contract SpurCoin is ERC20, Ownable {
    /**
     * @dev constructor for the spurcoin contract.
     * @param initialOwner the address that will initially own the contract and receive the initial supply.
     *                     this address will also be able to mint more tokens later.
     * @param initialSupply the initial amount of spurcoin tokens to mint and send to the initialOwner.
     *                      remember that erc20 tokens usually have 18 decimal places, so provide the value accordingly.
     *                      e.g., for 1 million tokens, use 1_000_000 * 10**18.
     */
    constructor(address initialOwner, uint256 initialSupply) 
        ERC20("SpurCoin", "SPUR") // sets the token name to "SpurCoin" and symbol to "SPUR"
        Ownable(initialOwner) // sets the contract owner to the initialOwner address
    {
        // mint the initial supply of tokens to the deployer's address (who is also the initial owner)
        _mint(initialOwner, initialSupply);
    }

    /**
     * @dev creates `amount` tokens and assigns them to `account`, increasing the total supply.
     * requires that the caller is the contract owner.
     * emits a {transfer} event with `from` set to the zero address.
     * @param account the address that will receive the minted tokens.
     * @param amount the amount of tokens to mint.
     */
    function mint(address account, uint256 amount) public onlyOwner {
        // internal mint function provided by openzeppelin's erc20 contract
        _mint(account, amount);
    }

    // note: the standard transfer, approve, transferfrom, etc., functions are inherited from the openzeppelin erc20 contract.
    // the decimals function (typically returning 18) is also inherited.
} 