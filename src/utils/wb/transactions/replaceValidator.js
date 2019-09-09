/**
 * Issue TX constructor
 *
 * @module wb/txs/create
 */

'use strict';

/**
 * Get issue transaction object
 *
 * @param  {Wallet}  wallet  Current user's API
 * @param  {Account} account WB Account received from WB API
 * @param  {Issue}   issue   Issue to create in WB
 * @param  {String}  gas     Gas to use in this transaction
 * @return {Object}          Create issue transaction object
 */
module.exports = function createReplaceValidatorTransaction({wallet, account, gas}, validator) {
    const objectToSign = {
        account_number: account.account_number,
        chain_id:   'wings-testnet',
        fee: {
            amount: [],
            gas
        },
        memo:     '',
        msgs:     [
            {
                msg: {
                    eth_address: validator.ethAddress,
                    new_validator: validator.newAddress,
                    old_address: validator.oldAddress,
                    sender: account.address
                },
                sender: account.address,
                uniqueID: validator.uniqueId.toString()
            }

        ],
        sequence: account.sequence
    };

    const signature = wallet.sign(objectToSign);

    return {
        type: 'auth/StdTx',
        msg:  [
            {
                type: 'multisig/submit-call',
                value: {
                    msg: {
                        type: 'poa/replace-validator',
                        value: {
                            eth_address: validator.ethAddress,
                            new_validator: validator.newAddress,
                            old_address: validator.oldAddress,
                            sender: account.address
                        }
                    },
                    sender: account.address,
                    uniqueID: validator.uniqueId.toString()
                }
            }
        ],
        fee:  objectToSign.fee,
        memo: objectToSign.memo,
        signatures: [
            {
                account_number: account.account_number,
                pub_key: {
                    type: 'tendermint/PubKeySecp256k1',
                    value: wallet.publicKey.toString('base64')
                },
                sequence:  account.sequence,
                signature: signature.toString('base64')
            }
        ]
    };
};
