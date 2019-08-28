const {baseOptions} = require('../../core/yargs');
const {InvalidValueException} = require('../../core/index');
const {ZERO_ADDRESS} = require("../../utils");

module.exports.command = ['exec <transactionId>', 'execute <transactionId>'];
module.exports.desc = '(payable) Execute transaction';

module.exports.builder = yargs => baseOptions(yargs)
	.positional('transactionId', {
		describe: 'PoA transaction ID',
		type: 'number',
	})
	.option('gas', {
		type: 'number',
		describe: 'gas limit',
		default: 600000
	});

module.exports.handler = async function(argv) {
	const {transactionId, gas, wb, ethWallet, panicPrompt} = argv;

	const transaction = await wb._poa.methods.transactions(transactionId).call();

	if(!transaction.creator || transaction.creator === ZERO_ADDRESS) {
		throw new InvalidValueException('Transaction not found');
	}

	if(!await panicPrompt('Execute transaction?')) {
		return;
	}

	const options = {
		from: '0x' + ethWallet.getAddress().toString('hex'),
		gas,
	}

	try {
		const data = await wb._poa.methods
			.executeTransaction(transactionId, transaction.hash)
			.send(options);

		console.log('Success');
	} catch (e) {
		const msg = e.message;
		if(msg.includes('Transaction executed already')) {
			throw new InvalidValueException('The transaction has already been executed and confirmation cannot be revoked.');
		} else if(msg.includes('Returned error:')) {
			throw new InvalidValueException(msg.match(/^Returned error: (.+)$/)[1]);
		} else {
			throw e;
		}
	}
}
