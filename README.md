# Peg Zone Cli

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)
[![Gitter](https://badges.gitter.im/WingsChat/community.svg)](https://gitter.im/WingsChat/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

**THIS IS WORK IN PROGRESS, NOT FOR PRODUCTION/TESTNET USAGE**

## Installation
Requirements:

* [Node.js](https://nodejs.org/en/)
* [Truffle Framework](https://truffleframework.com)
* [eth-peg-zone](https://github.com/WingsDao/eth-peg-zone)

### Installation for development:

```bash
yarn install
npm link
```

After running these commands, you will see the `peg-cli` command in the global **ENV**.

You can modify the code and all changes will be applied the next time you run the `peg-cli` command.
Read more about the [npm link](https://docs.npmjs.com/cli/link) command.

### Installation for use:

```bash
yarn global add https://github.com/WingsDao/peg-cli
```

After running these commands, you will see the `peg-cli` command in the global **ENV**.

## Usage

Before first usage you need configure cli. Call `peg-cli setup` for configure.

See help:

```bash
peg-cli help
peg-cli tx help
peg-cli validators help
```

```bash
$ peg-cli help

peg-cli <command>

Commands:
  peg-cli setup                 Setup configuration
  peg-cli tx <command>          Manage transactions
  peg-cli validators <command>  Manage validators                                                                                                                                                                                                              [aliases: vl]

Options:
  --help     Show help                                                                                                                                                                                                                                             [boolean]
  --version  Show version number 

$ peg-cli tx help

peg-cli tx <command>

Manage transactions

Commands:
  peg-cli tx confirm <transactionId>  (payable) Confirm transaction
  peg-cli tx exec <transactionId>     (payable) Execute transaction                                                                                                                                                                                       [aliases: execute]
  peg-cli tx info <transactionId>     Get information about transaction
  peg-cli tx list [start] [count]     Get list of transaction in ID range from <start> to <start + count>
  peg-cli tx revoke <transactionId>   (payable) Revoke transaction confirmation

Options:
  --help     Show help                                                                                                                                                                                                                                             [boolean]
  --version  Show version number 

$ peg-cli validators help

peg-cli validators <command>

Manage validators

Commands:
  peg-cli validators add <ethAddress> <cosmosAddress>                         (payable) Add new validator in the PoA contract
  peg-cli validators remove <ethAddress>                                      (payable) Remove validator in the PoA contract
  peg-cli validators replace <oldEthAddress> <newEthAddress> <cosmosAddress>  (payable) Replace exist validator in the PoA contract

Options:
  --help     Show help                                                                                                                                                                                                                                             [boolean]
  --version  Show version number  
```

### Setup
```bash
peg-cli setup
```
Setup configuration before usage this cli.
 * Setting path to contracts interfaces directory. The directory should contain the contract interfaces that are compiled using truffle in the [eth-peg-zone](https://github.com/WingsDao/eth-peg-zone) project;
 * Setting path to private key or mnemonic file. This file should contain private key as text or mnemonic;
 * Setting Ethereum RPC url;
 * Setting Contract addresses.
 * Setting panic mode. If true, then when you call each method in which a transaction occurs on the blockchain, you will need to confirm it.
 
 
### Transactions

```bash
peg-cli tx info <transactionId>
```
Getting info for transaction by **transaction id**.

Example:
```bash
$ peg-cli tx info 7   

Transaction ID: 7
Hash: 0xb5692162d2bfae80fbc70b26645e35f8e54ecfcfc20f8b69be75208649f7926c
Creator: 0xc06F51cf4f0f76ECEA5128b1ee9BE9780D390762
Executed: false
Confirmed: false
Confirmations: 1
Destination: 0x3FeDf730FB6804842FfC6Bf41bb9b9Cb7E01E5CF
```
___


```bash
peg-cli tx list [start] [count]
```
List of all transaction in ID range from `start` to `start + count`

Example:
```bash
$ peg-cli tx list 4 10   

Transaction ID: 4
Hash: 0xb5692162d2bfae80fbc70b26645e35f8e54ecfcfc20f8b69be75208649f7926c
Creator: 0xc06F51cf4f0f76ECEA5128b1ee9BE9780D390762
Executed: false
Confirmed: false
Confirmations: 1
Destination: 0x3FeDf730FB6804842FfC6Bf41bb9b9Cb7E01E5CF
----------
.
.
.
.

Transaction ID: 13
Hash: 0x12ced22bdaeeda72b82d241101d416d30447f3833a01b87b72c21c6be5e12b0e
Creator: 0xc06F51cf4f0f76ECEA5128b1ee9BE9780D390762
Executed: false
Confirmed: false
Confirmations: 1
Destination: 0x3FeDf730FB6804842FfC6Bf41bb9b9Cb7E01E5CF
----------

```
___


```bash
peg-cli tx confirm <transactionId> [--gas <number>]
```
Confirm transaction by **transaction id**, not transaction hash.

Example:
```bash
$ peg-cli tx confirm 7 

Success
```

If one of the modifiers in the contract rejected the transaction:
```bash
$ peg-cli tx confirm 7

Transaction already confirmed by this validator
```
___


```bash
peg-cli tx execute <transactionId> [--gas <number>]
```
Execute transaction by **transaction id**.

Example:
```bash
peg-cli tx execute 7   

Success
```

If one of the modifiers in the contract rejected the transaction:
```bash
$ peg-cli tx execute 7

Transaction already executed
```

If error:
```bash
$ peg-cli tx execute 7 --gas 100

base fee exceeds gas limit
```
___


```bash
peg-cli tx execute <transactionId>
```
Execute transaction by **transaction id**.

Example:
```bash
peg-cli tx execute 7   

Success
```

If one of the modifiers in the contract rejected the transaction:
```bash
$ peg-cli tx execute 7

Transaction already executed
```

If error:
```bash
$ peg-cli tx execute 7 --gas 100

base fee exceeds gas limit
```
___


```bash
peg-cli tx revoke <transactionId>
```
Revoke transaction by **transaction id**.

Example:
```bash
peg-cli tx revoke 7   

Success
```

If one of the modifiers in the contract rejected the transaction:
```bash
$ peg-cli tx revoke 7

The transaction has already been executed and confirmation cannot be revoked.
```

If error:
```bash
$ peg-cli tx execute 7 --gas 100

base fee exceeds gas limit
```
___

### Validators

```bash
peg-cli validators add <ethAddress> <cosmosAddress>
```
Add new validator in the PoA contract.

Example:
```bash
peg-cli validators add 0x3FeDf730FB6804842FfC6Bf41bb9b9Cb7E01E5CF 0x2386bdd0730a48c26e9a705b5b5a8ee57068391b000000000000000000000000

Transaction id: 10
```
___


```bash
peg-cli validators remove <ethAddress>
```
Remove exist validator in the PoA contract.

Example:
```bash
peg-cli validators remove 0x3FeDf730FB6804842FfC6Bf41bb9b9Cb7E01E5CF

Transaction id: 10
```
___


```bash
peg-cli validators replace <oldEthAddress> <newEthAddress> <cosmosAddress>
```
Replace exist validator in the PoA contract.

Example:
```bash
peg-cli validators replace 0x3FeDf730FB6804842FfC6Bf41bb9b9Cb7E01E5CF 0xc06F51cf4f0f76ECEA5128b1ee9BE9780D390762 0x2386bdd0730a48c26e9a705b5b5a8ee57068391b000000000000000000000000

Transaction id: 11
```
___
