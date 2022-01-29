# untangled-maker-lib
UntangledManager contract
https://github.com/untangledfinance/untangled-maker-lib

## Vault Operations
`join(uint)`
`exit(uint)`
`draw(uint)`
`wipe(uint)`
`join(uint)`

`Join` takes a `uint wad` as an argument and can only be called by the `owner`. It only functions if the Vault is in a `safe`, `glad`, and `live` state. The manager transfers from the `owner` to the manager some `wad`, gives itself a `gem` balance in the `vat`, and calls `frob()` to place that `gem` into `vat`. The `join()` in this case combines a traditional `join` without the adapter, and a `lock()`. This method requires the owner to toss an approval to the manager so it can transfer `gem`.

exit(uint)
`Exit` takes a `uint` wad as an argument and can only be called by the `owner`. It only functions if the Vault is in a `safe`, `glad`, and `live` state. The manager calls `frob()` to remove the `gem` from the `vat`. The `gem` balance is removed from the `vat` and transferred from the manager to the `owner`. The `exit()` in this case combines a traditional `free()` with an `exit()` to the `owner`.

draw(uint)
`Draw` takes a uint wad as an argument and can only be called by the owner. It only functions if the Vault is in a safe, glad, and live state. The manager calculates the rate adjusted amount of wad it needs to frob() from the Vault and then calls DaiJoin.exit() to send that amount of DAI to the owner.
wipe(uint)

`Wipe` takes a uint wad as an argument and can only be called by the owner. It only functions if the Vault is in a safe, glad, and live state. The manager first transfers DAI from the owner to itself and calls DaiJoin.join() to get a vat DAI balance. It then calculates the rate adjusted amount of wad it needs to repay the Vault. The owner must toss an approval to allow the manager to transfer DAI tokens.

## Administration
setOwner(address)
migrate(address)
setOwner(address)

This allows the current owner to reassign the ownership to another contract. Reminder, the owner can call join(), exit(), draw(), wipe(), and take().
migrate(address)

Periodically, changes may be made to the Maker Protocol that require module upgrades. Some of these changes may impact an interface or add a feature that could be required in the manager. For this reason, the smart contract domain team suggested the addition of migrate(). This function can only be called by a GSM delayed Maker governance to perform the following actions:
call vat.hope() on a new manager
give the new manager an infinite DAI approval
give the new manager an infinite gem approval
and cage() the old manager

NOTE: Because this cages the existing manager, it also means the owner could call tell() and take() after. For this reason, it’s best to take the following steps in the same block after a call to migrate():
move the vault
deny the manager on the vat
move the vault and any erc20 balances to a new manager

## Liquidation
tell()
unwind(uint)
sink()
recover()
tell()

Tell kicks off a liquidation. Typically in MCD this would occur via the cat.bite() or dog.bark(); however, in MIP22 there are much longer liquidations with a chance to recover DAI.  tell() starts the process. Once started, tell() liquidates the entire Vault irreversibly changing the state of safe to false. This means, if governance triggers a tell, it must be followed to completion.

unwind(uint)
This is the primary liquidation function. Unwind performs the function of a flip.tend() for the protocol. Anyone can call this function. It will recover DAI, paying down the debt for the Vault and removing the corresponding gem amounts.

sink()
Sink is called when the liquidation process has failed, and we must accrue the bad debt to sin. This function sets glad to false, cleans up the Vault, and adds the balance to bad debt in the system. This bad debt will later be resolved with either the surplus buffer if available, or flop() auctions.

recover(uint)
Recover is a public function similar to unwind(), but it can only be called after the debt has been written off with sink(). This allows any possible long tail of recoverable debt to be collected and sent back to the surplus. We do this here because we already accounted for the remaining debt as bad when sink() was called. This function can be called until the adapter is no longer live() (the result of calling migrate() or cage()).

## Global Settlement
take(uint)
cage()
take(uint)

Take only functions once the adapter has been caged with cage() or the migrate() call. It allows the owner to finish up any pending liquidations. A call to tell() must happen first. Also, see the note in migrate() about the actions one should take after a migration.
cage()

This function can be called by governance after the GSM delay to disable the manager. Only tell()and take() to facilitate a liquidation may be called after a cage().

## Additional Comments
This does not use a typical Maker oracle. Instead, it uses a DSValue contract that is periodically updated by governance with the correct price. Since the price of the asset doesn’t change, and is instead related to the amount of debt taken against the position by the owner and the fees, this collateral can go a number of weeks without an update. Just like with MIP21, MIP22 doesn’t currently have an oracle attack surface beyond the DSValue authorization, which is just governance behind the GSM pause.
