const {baseOptions} = require('../../core/yargs');
const {InvalidValueException} = require('../../core/index');
const {ZERO_ADDRESS} = require("../../utils");

module.exports.command = 'info <transactionId>';
module.exports.desc = 'Get information about transaction';

module.exports.builder = yargs => baseOptions(yargs)
	.positional('transactionId', {
		describe: 'PoA transaction ID',
		type: 'number',
	})

module.exports.handler = async function(argv) {
	const {transactionId, wb} = argv;

	const transaction = await wb._poa.methods.transactions(transactionId).call();

	if(!transaction.creator || transaction.creator === ZERO_ADDRESS) {
		throw new InvalidValueException('Transaction not found');
	}

	const isConfirmed = await wb._poa.methods.isConfirmed(transactionId).call();
	const confirmationCount = await wb._poa.methods.getConfirmationCount(transactionId).call();

	console.log('Transaction ID: ' + transactionId);
	console.log('Hash: ' + transaction.hash);
	console.log('Creator: ' + transaction.creator);
	console.log('Executed: ' + transaction.executed);
	console.log('Confirmed: ' + isConfirmed);
	console.log('Confirmations: ' + confirmationCount);
	console.log('Destination: ' + transaction.destination);
}
