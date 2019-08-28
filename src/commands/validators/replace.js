const {baseOptions} = require('../../core/yargs');
const {InvalidValueException} = require('../../core/index');
const {DESTINATION} = require('../../utils/index');

module.exports.command = 'replace <oldEthAddress> <newEthAddress> <cosmosAddress>';
module.exports.desc = '(payable) Replace exist validator in the PoA contract';

module.exports.builder = yargs => baseOptions(yargs)
	.positional('oldEthAddress', {
		describe: 'Old Ethereum address',
		type: 'string',
	})
	.positional('newEthAddress', {
		describe: 'New Ethereum address',
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
	const {oldEthAddress, newEthAddress, cosmosAddress, wb, ethWallet, panicPrompt, gas} = argv;

	if(!wb.web3.utils.isAddress(oldEthAddress)) {
		throw new InvalidValueException(`'${oldEthAddress}' is not valid Ethereum address. Check arg <oldEthAddress>`);
	}

	if(!wb.web3.utils.isAddress(newEthAddress)) {
		throw new InvalidValueException(`'${newEthAddress}' is not valid Ethereum address. Check arg <newEthAddress>`);
	}

	if(!await panicPrompt('Execute transaction?')) {
		return;
	}

	const options = {
		from: '0x' + ethWallet.getAddress().toString('hex'),
		gas
	};

	try {
		const data = wb.PoA.replaceValidator(oldEthAddress, newEthAddress, cosmosAddress);
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
