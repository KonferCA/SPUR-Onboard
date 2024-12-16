/*
/// Module: spurcoin
module spurcoin::spurcoin;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module spurcoin::spurcoin {
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::TxContext;

    /// The type identifier of spurcoin
    public struct SPURCOIN has drop {}

    /// Module initializer is called once on module publish
    fun init(witness: SPURCOIN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness, 
            9, // decimals
            b"SPUR", // symbol
            b"Spur", // name
            b"Spur description", // description
            std::option::none(), // icon url
            ctx
        );
        // Transfer the treasury cap to the module publisher
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
        // Make the metadata immutable and share it
        transfer::public_share_object(metadata);
    }
}


