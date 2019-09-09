const {baseOptions} = require('../../core/yargs');
const {InvalidValueException} = require('../../core/index');

module.exports.command = 'failed';
module.exports.desc = 'List of all failed transactions';

module.exports.builder = yargs => baseOptions(yargs);
module.exports.handler = async function(argv) {
	const {ethApi} = argv;

	const failedTxs = (await ethApi._poa.getPastEvents('TX_EXECUTION_FAILED', {
		fromBlock: 0,
		toBlock: 'latest'
	})).map(event => event.returnValues._transactionId);

	let transactions = await ethApi.getTransactionsInfo(failedTxs, {checkFailed: false});

	transactions = (await Promise.all(transactions)).filter(v => v);

	if(transactions.length === 0) {
		throw new InvalidValueException('No failed transactions');
	}

	transactions.forEach((tx) => {
		console.log('Transaction ID: ' + tx.id);
		console.log('Hash: ' + tx.hash);
		console.log('Creator: ' + tx.creator);
		console.log('Executed: ' + tx.executed);
		console.log('Confirmed: ' + tx.isConfirmed);
		console.log('Confirmations: ' + tx.confirmationCount);
		console.log('Is Failed: ' + true);
		console.log('Destination: ' + tx.destination);
		console.log("----------");
		console.log("")
	})
}
