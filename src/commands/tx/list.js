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

	const promises = [];

	let max = countTransactions;
	if(count) {
		max = start + count > countTransactions ? countTransactions : start + count;
	}

	for(let i = start; i < max; i++) {
		promises.push(new Promise(async res => {
			const tx = await wb._poa.methods.transactions(i).call();
			tx.id = i;
			tx.isConfirmed = await wb._poa.methods.isConfirmed(i).call();
			tx.confirmationCount = await wb._poa.methods.getConfirmationCount(i).call();
			res(tx);
		}));
	}

	await Promise.all(promises);

	promises.forEach(tx => {
		tx.then(tx => {
			console.log('Transaction ID: ' + tx.id);
			console.log('Hash: ' + tx.hash);
			console.log('Creator: ' + tx.creator);
			console.log('Executed: ' + tx.executed);
			console.log('Confirmed: ' + tx.isConfirmed);
			console.log('Confirmations: ' + tx.confirmationCount);
			console.log('Destination: ' + tx.destination);
			console.log("----------");
			console.log("")
		});
	})
}
