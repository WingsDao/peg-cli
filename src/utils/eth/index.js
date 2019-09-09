/**
 * Wings Blockchain (WB) module.
 * Implements api, txs and crypto part for WB.
 *
 * @module utils/eth
 */
'use strict';

/**
 * Possible init point for utils
 *
 * @param  {Object} apiOptions Configuration object with web3, poa
 * @param  {Buffer | String} accountData Buffer of private key data or mnemonic string
 * @return {Object}        Object with initialized API and Wallet
 */
module.exports = exports = function initEth(apiOptions, accountData) {

    const API = require('./api');
    const EthWallet = require('./wallet');

    const api    = new API(apiOptions);
    const wallet = new EthWallet(accountData);

    return {api, wallet};
};
