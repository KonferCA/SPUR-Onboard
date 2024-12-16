/*
/// Module: spurcoin
module spurcoin::spurcoin;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module spurcoin::spurcoin {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// The type identifier of spurcoin
    public struct SPURCOIN has drop {}

    /// Mint new SPURCOIN
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<SPURCOIN>, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    fun init(witness: SPURCOIN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9, // decimals
            b"SPUR",
            b"SPUR",
            b"Investment funding coin for client projects",
            std::option::none(),
            ctx
        );
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
        transfer::public_share_object(metadata);
    }
}