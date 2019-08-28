const {baseOptions} = require('../../core/yargs');
const {InvalidValueException} = require('../../core/index');

module.exports.command = 'list [start] [count]';
module.exports.desc = 'Get list of transaction in ID range from <start> to <start + count> ';

module.exports.builder = yargs => baseOptions(yargs)
	.positional('start', {
		describe: 'Start ID at',
		type: 'number',
		default: 0
	})
	.positional('count', {
		describe: 'Count transactions',
		type: 'number',
		default: null,
	});

module.exports.handler = async function(argv) {
	const {wb, start, count} = argv;
	const countTransactions = await wb._poa.methods.transactionCount().call();

	if(countTransactions <= start) {
		throw new InvalidValueException('The number of transactions is less than "start" parameter');
	}

	let max = countTransactions;
	if(count) {
		max = start + count > countTransactions ? countTransactions : start + count;
	}

	const ids = [];
	for(let i = start; i < max; i++) {
		ids.push(i);
	}

	const transactions = await wb.getTransactionsInfo(ids);

	transactions.filter(v => v).forEach(tx => {
		console.log('Transaction ID: ' + tx.id);
		console.log('Hash: ' + tx.hash);
		console.log('Creator: ' + tx.creator);
		console.log('Executed: ' + tx.executed);
		console.log('Confirmed: ' + tx.isConfirmed);
		console.log('Confirmations: ' + tx.confirmationCount);
		console.log('Is Failed: ' + tx.isFailed);
		console.log('Destination: ' + tx.destination);
		console.log("----------");
		console.log("")
	});
}
