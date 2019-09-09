const {baseOptions} = require('../../core/yargs');
const {InvalidValueException} = require('../../core/index');

module.exports.command = 'info <transactionId>';
module.exports.desc = 'Get information about transaction';

module.exports.builder = yargs => baseOptions(yargs)
	.positional('transactionId', {
		describe: 'PoA transaction ID',
		type: 'number',
	})

module.exports.handler = async function(argv) {
	const {transactionId, ethApi} = argv;

	const transaction = await ethApi.getTransactionsInfo(transactionId);

	if(!transaction) {
		throw new InvalidValueException('Transaction not found');
	}

	console.log('Transaction ID: ' + transaction.id);
	console.log('Hash: ' + transaction.hash);
	console.log('Creator: ' + transaction.creator);
	console.log('Executed: ' + transaction.executed);
	console.log('Confirmed: ' + transaction.isConfirmed);
	console.log('Confirmations: ' + transaction.confirmationCount);
	console.log('Is Failed: ' + transaction.isFailed);
	console.log('Destination: ' + transaction.destination);
}
