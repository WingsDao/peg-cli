/**
 * WB API module.
 * Implements class to work with WB REST API.
 *
 * @module utils/wb/api
 */

'use strict';

const request = require('request-promise-native');
const rp      = (uri) => (typeof uri === 'string') ? request({uri, json: true}) : request(uri);
const cosmos = require('cosmos-lib');

/**
 * WbAPI class to work with WB REST API.
 */
module.exports = class WbAPI {

    /**
     * @constructor
     * @param {String} restAPI URL of rest api base path.
     */
    constructor(restAPI) {
        this.restAPI = restAPI;
    }

    /**
     * Convert hex string address to to cosmos network address.
     * E.g: 0xd7a96582ebf6c79131ba687d23019500804c5e64000000000000000000000000 => cosmos1675ktqht7mrezvd6dp7jxqv4qzqychnyrfa55m
     *
     * @param address {String} hex string address
     * @returns {String} cosmos address
     */
    getAddressFromString(address) {
        return cosmos.address.getAddressFromBytes32(Buffer.from(address.slice(2), 'hex'));
    }

    /**
     * Get list of validators from WB
     *
     * @return {Promise}
     */
    getValidators() {
        return rp(`${this.restAPI}/poa/validators`).then(resp => resp.validators);
    }

    /**
     * Get index of validator.
     *
     * 1. We assume that list of validators is immutable and order is permanent
     * 2. All new validators are added into the end of the list, so previous positions are saved
     *
     * Caveats: when validator loses his position, other validators are moved as well, so
     * currently we don't have solution for covering this case.
     *
     * @param  {String}           address Address to check in list of validators
     * @return {Promise<Array>}          Order number of Validator in list / null when not present and total number of validators
     */
    async getValidatorIndex(address) {
        const validators = await this.getValidators();
        const index      = validators.map((acc) => acc.address).indexOf(address);

        return [
            (index === -1) ? null : (index + 1),    // index
            validators.length                       // total
        ];
    }

    /**
     * Get account from rest api.
     *
     * @param {String}  address Address of account.
     * @param {Promise}
     */
    getAccount(address) {
        return rp(`${this.restAPI}/auth/accounts/${address}`).then(resp => resp && resp.value || null);
    }

    /**
     * Get transaction by hash.
     *
     * @param  {String}  hash Transaction hash.
     * @return {Promise}
     */
    getTransactionByHash(hash) {
        return rp(`${this.restAPI}/txs/${hash}`);
    }

    /**
     * Get human-readable response for issue status
     *
     * @param  {String} uniqueID Unique ID to query issue
     * @return {Object}          Issue status in readable format
     */
    async getIssueStatus(uniqueID) {
        const status = await this.getCallByUniqueId(uniqueID).catch((err) => console.log(err) || null);

        if (!status) {
            return {
                exists: false,
                msgId: null,
                approved: false,
                votes: [],
                data: [],
                raw: null
            };
        }

        return {
            exists:    true,
            msgId:     status.call.msg_id,
            msgData:   status.call.msg_data,
            approved:  status.call.approved,
            votes:     status.votes,
            raw:       status
        };
    }

    /**
     * Get multisig call by unique ID.
     * Unique id is usually sha256(chainID + symbol + txHash) serialized to hex.
     *
     * @param  {String}  uniqueID Multisig call unique ID.
     * @return {Promise}
     */
    getCallByUniqueId(uniqueID) {
        return rp(`${this.restAPI}/multisig/unique/${uniqueID}`)
            .catch((e) => {
                const error = parseError(e);
                if (error.code == 403) { // not found error, return null
                    return null;
                }
            });
    }

    /**
     * Broadcast signed tx to wb.
     *
     * @param  {Object}  tx   Signed transaction object.
     * @param  {String}  mode Mode of broadcasting, 'async', 'sync', or 'block'.
     * @return {Promise}
     */
    broadcastTx(tx, mode = 'async') {
        return rp({
            json: true,
            method: 'POST',
            uri: `${this.restAPI}/txs`,
            body: {
                tx,
                return: mode
            }
        }).catch((err) => Promise.reject(parseError(err)));
    }
};

/**
 * Parse error from rest api.
 *
 * @param  {Object} e Error object.
 * @return {Object}   Parsed rest api error object.
 */
function parseError(rpErr) {
    try {
        return JSON.parse(rpErr.error.error);
    } catch (err) {
        return rpErr.error;
    }
}
