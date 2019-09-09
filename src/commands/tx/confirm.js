const {baseOptions} = require('../../core/yargs');
const {InvalidValueException} = require('../../core/index');
const {ZERO_ADDRESS} = require("../../utils");

module.exports.command = 'confirm <transactionId>';
module.exports.desc = '(payable) Confirm transaction';

module.exports.builder = yargs => baseOptions(yargs)
	.positional('transactionId', {
		describe: 'PoA transaction ID',
		type: 'number',
	});

module.exports.handler = async function(argv) {
	const {transactionId, gas, ethApi, ethWallet, panicPrompt} = argv;

	const transaction = await ethApi._poa.methods.transactions(transactionId).call();

	if(!transaction.creator || transaction.creator === ZERO_ADDRESS) {
		throw new InvalidValueException('Transaction not found');
	}

	if(await ethApi._poa.methods.isConfirmed(transactionId).call()) {
		throw new InvalidValueException('Transaction already confirmed');
	}

	if(!await panicPrompt('Execute transaction?')) {
		return;
	}

	const options = {
		from: ethWallet.address,
		gas,
	}

	try {
		const data = await ethApi._poa.methods
			.confirmTransaction(transactionId, transaction.hash)
			.send(options);

		console.log('Success');
	} catch (e) {
		const msg = e.message;
		if(msg.includes('Transaction is confirmed')) {
			throw new InvalidValueException('Transaction already confirmed by this validator');
		} else if(msg.includes('Returned error:')) {
			throw new InvalidValueException(msg.match(/^Returned error: (.+)$/)[1]);
		} else {
			throw e;
		}
	}
}
