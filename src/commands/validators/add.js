const {baseOptions} = require('../../core/yargs');
const {InvalidValueException} = require('../../core/index');
const {DESTINATION} = require('../../utils/index');

module.exports.command = 'add <ethAddress> <cosmosAddress>';
module.exports.desc = '(payable) Add new validator in the PoA contract';

module.exports.builder = yargs => baseOptions(yargs)
	.positional('ethAddress', {
		describe: 'Ethereum address',
		type: 'string',
	})
	.positional('cosmosAddress', {
		describe: 'Cosmos address',
		type: 'string',
	})
	.option('gas', {
		type: 'number',
		describe: 'gas limit',
		default: 600000
	});

module.exports.handler = async function(argv) {
	const {ethAddress, cosmosAddress, wb, ethWallet, panicPrompt, gas} = argv;

	if(!wb.web3.utils.isAddress(ethAddress)) {
		throw new InvalidValueException(`'${ethAddress}' is not valid Ethereum address. Check arg <ethAddress>`);
	}

	if(!await panicPrompt('Execute transaction?')) {
		return;
	}

	const options = {
		from: '0x' + ethWallet.getAddress().toString('hex'),
		gas
	};

	try {
		const data = wb.PoA.addValidator(ethAddress, cosmosAddress);
		const txId = await wb.sendTransaction(DESTINATION.SELF, data, options);
		console.log(`Transaction id: ${txId}`);
	} catch (e) {
		const msg = e.message;
		if(msg.includes('Returned error:')) {
			throw new InvalidValueException(msg.match(/^Returned error: (.+)$/)[1]);
		} else {
			throw e;
		}
	}
}
