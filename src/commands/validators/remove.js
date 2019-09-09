const {baseOptions} = require('../../core/yargs');
const {InvalidValueException} = require('../../core/index');
const {DESTINATION} = require('../../utils/index');
const crypto = require('crypto');
const createRemoveValidatorTransaction = require('../../utils/wb/transactions/removeValidator');

module.exports.command = 'remove <ethAddress>';
module.exports.desc = '(payable) Remove validator in the PoA contract';

module.exports.builder = yargs => baseOptions(yargs)
	.positional('ethAddress', {
		describe: 'Ethereum address',
		type: 'string',
	})
	.option('gas', {
		type: 'number',
		describe: 'gas limit',
		default: 600000
	});

module.exports.handler = async function(argv) {
	const {ethAddress, ethApi, wbApi, ethWallet, wbWallet, panicPrompt, gas} = argv;

	if(!ethApi.web3.utils.isAddress(ethAddress)) {
		throw new InvalidValueException(`'${ethAddress}' is not valid Ethereum address. Check arg <ethAddress>`);
	}

	if(!await panicPrompt('Execute transaction?')) {
		return;
	}

	const ethValidator = (await ethApi._poa.getPastEvents('ADDED_VALIDATOR', {
		fromBlock: 0,
		toBlock: 'latest'
	})).find(event => event.returnValues._ethAddress === ethAddress);

	if(!ethValidator) {
		throw new InvalidValueException('Validator not exist');
	}

	const wbAccount = await wbApi.getAccount(wbWallet.address);

	const uniqueId = crypto.randomBytes(32).toString('hex');
	const tx = createRemoveValidatorTransaction({wallet: wbWallet, account: wbAccount, gas: "200000"}, {
		ethAddress,
		cosmosAddress: wbApi.getAddressFromString(ethValidator.returnValues._cosmosAddress),
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
				throw Error('Returned error: WB:' + JSON.parse(res[0].log).message);
			});
		console.log(`Wings call id: ${wbTxId}`);

		const ethData = ethApi.PoA.removeValidator(ethAddress);
		const ethTxId = await ethApi.sendTransaction(DESTINATION.SELF, ethData, options);
		console.log(`Ethereum Transaction id: ${ethTxId}`);
	} catch (e) {
		const msg = e.message;
		if(msg.includes('Returned error:')) {
			throw new InvalidValueException(msg.match(/^Returned error: (.+)$/)[1]);
		} else {
			throw e;
		}
	}
}
