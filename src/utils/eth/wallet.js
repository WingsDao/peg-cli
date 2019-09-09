/**
 * @module utils/eth/wallet
 */

'use strict';

const bip39 = require("bip39");
const hdkey = require('ethereumjs-wallet/hdkey');
const ethWallet = require('ethereumjs-wallet');
const {InvalidValueException} = require('../../core');

module.exports = exports = EthWallet;

/**
 * WB wallet which covers crypto-related operations
 *
 * @param       {Buffer | String} accountData Buffer of private key data or mnemonic string
 * @constructor
 */
function EthWallet(accountData) {
    let wallet = null;
    try {
        const pkBuffer = Buffer.from(accountData, 'hex');
        wallet = ethWallet.fromPrivateKey(pkBuffer);
    } catch (e) {
        // nothing
    }

    if(wallet) {
        Object.defineProperties(this, {
            address: {value: '0x' + wallet.getAddress().toString('hex')},
        });
        return;
    }

    const seed = bip39.mnemonicToSeedSync(accountData.toString());
    const hdwallet = hdkey.fromMasterSeed(seed);
    const walletPath = "m/44'/60'/0'/0/0";

    wallet = hdwallet.derivePath(walletPath).getWallet();
    if(!wallet) {
        throw new InvalidValueException('Failed to access account');
    }

    Object.defineProperties(this, {
        address: {value: '0x' + wallet.getAddress().toString('hex')},
    });
}
