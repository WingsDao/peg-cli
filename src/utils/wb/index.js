/**
 * Wings Blockchain (WB) module.
 * Implements api, txs and crypto part for WB.
 *
 * @module utils/wb
 */

/**
 * Possible init point for utils
 *
 * @param  {Object} config Configuration object with apiHost, mnemonic and path fields
 * @return {Object}        Object with initialized API and Wallet
 */
module.exports = exports = function initWb(apiHost, {path, mnemonic}) {

    const API = require('./api');
    const WbWallet = require('./wallet');

    const api    = new API(apiHost);
    const wallet = new WbWallet(mnemonic, path);

    return {api, wallet};
};
