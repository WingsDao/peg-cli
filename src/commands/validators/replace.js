const {baseOptions} = require('../../core/yargs');
const {InvalidValueException} = require('../../core/index');
const {DESTINATION} = require('../../utils/index');
const createReplaceValidatorTransaction = require('../../utils/wb/transactions/replaceValidator');
const crypto = require('crypto');
const util = require('util');

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
	const {oldEthAddress, newEthAddress, cosmosAddress, ethApi, wbApi, wbWallet, ethWallet, panicPrompt, gas} = argv;

	if(!ethApi.web3.utils.isAddress(oldEthAddress)) {
		throw new InvalidValueException(`'${oldEthAddress}' is not valid Ethereum address. Check arg <oldEthAddress>`);
	}

	if(!ethApi.web3.utils.isAddress(newEthAddress)) {
		throw new InvalidValueException(`'${newEthAddress}' is not valid Ethereum address. Check arg <newEthAddress>`);
	}

	if(!await panicPrompt('Execute transaction?')) {
		return;
	}

	const ethValidator = (await ethApi._poa.getPastEvents('ADDED_VALIDATOR', {
		fromBlock: 0,
		toBlock: 'latest'
	})).find(event => event.returnValues._ethAddress === oldEthAddress);

	if(!ethValidator) {
		throw new InvalidValueException('Validator not exist');
	}

	const wbAccount = await wbApi.getAccount(wbWallet.address);
	const uniqueId = crypto.randomBytes(32).toString('hex');
	const tx = createReplaceValidatorTransaction({wallet: wbWallet, account: wbAccount, gas: "200000"}, {
		oldAddress: wbApi.getAddressFromString(ethValidator.returnValues._cosmosAddress),
		newAddress: wbApi.getAddressFromString(cosmosAddress),
		ethAddress: newEthAddress,
		uniqueId,
	});

	const options = {
		from: ethWallet.address,
		gas
	};

	try {
		const wbTxId = await wbApi.broadcastTx(tx, 'block')
			.then(res => {
				return wbApi.getCallByUniqueId(uniqueId)
			})
			.then(res => {
				return res.call.msg_id;
			})
			.catch(res => {
				console.log(res);
				throw Error('Returned error: WB:' + JSON.parse(res[0].log).message);
			});

		console.log(`Wings call id: ${wbTxId}`);

		const data = ethApi.PoA.replaceValidator(oldEthAddress, newEthAddress, cosmosAddress);
		const txId = await ethApi.sendTransaction(DESTINATION.SELF, data, options);

		console.log(`Ethereum transaction id: ${txId}`);
	} catch (e) {
		const msg = e.message;
		if(msg.includes('Returned error:')) {
			throw new InvalidValueException(msg.match(/^Returned error: (.+)$/)[1]);
		} else {
			throw e;
		}
	}
}
