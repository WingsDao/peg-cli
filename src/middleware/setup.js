const fs = require('fs');
const path = require('path');
const web3 = require('web3');
const bip39 = require("bip39");
const hdkey = require('ethereumjs-wallet/hdkey');
const ethWallet = require('ethereumjs-wallet');
const {WB, InvalidValueException, prompt} = require('../core');

const REQUIRED_CONTRACTS = ['PoAGovernment'];

module.exports = async function(argv, yargs) {
	const ignoredCommands = [['setup']];

	const skip = ignoredCommands.find(cmd => {
		return cmd.length === argv._.length && cmd.every((v,i) => v === argv._[i])
	});

	if(skip) {
		return ;
	}

	const { privateKeyPath, contractAddresses, contractsDir, ethNetworkUrl, panicMode } = argv;

	if (!privateKeyPath || !contractAddresses || !contractsDir || !ethNetworkUrl) {
		throw new InvalidValueException(`You need to configure the settings. Follow the "${argv.$0} setup" to continue.`)
	}

	if(!fs.existsSync(privateKeyPath)) {
		throw new InvalidValueException(`Private key file not found (path: "${privateKeyPath}")`);
	}

	if(!fs.existsSync(contractsDir)) {
		throw new InvalidValueException(`Directory with ABI contracts does not exist (path: "${contractsDir}")`);
	}

	const contractFiles = fs.readdirSync(contractsDir).filter(f => f.match(/\.json$/));

	if(contractFiles.length === 0) {
		throw new InvalidValueException(
			`Perhaps you forgot to compile the contracts? \nThe json files for the ` +
			`following contracts are required:\n\t- ${REQUIRED_CONTRACTS.join("\n\t- ")}`);
	}

	const notExistsContracts = REQUIRED_CONTRACTS.filter(file => !contractFiles.includes(file + '.json'));

	if(notExistsContracts.length > 0) {
		throw new InvalidValueException(`CLI requires ABI for the following contracts:\n\t- ${notExistsContracts.join("\n\t- ")}`);
	}

	const invalidAddresses = [];

	Object.keys(contractAddresses)
		.forEach(contract => {
			const address = contractAddresses[contract];
			if(!web3.utils.isAddress(address)) {
				invalidAddresses.push([contract, address]);
			}
		});

	if(invalidAddresses.length > 0) {
		throw new InvalidValueException(`Incorrect addresses for contracts:\n\t- ${invalidAddresses.map(i => `${i[0]}: ${i[1]}`).join("\n\t- ")}`);
	}

	const privateKeyFileData = fs.readFileSync(privateKeyPath, 'utf8');
	const wallet = await getEthWallet(privateKeyFileData);

	if(!wallet) {
		throw new InvalidValueException('Failed to access account');
	}

	const files = {};
	REQUIRED_CONTRACTS.forEach(file => files[file] = () => JSON.parse(fs.readFileSync(path.resolve(contractsDir, file + '.json'), 'utf8')));

	argv.ethWallet = wallet;
	argv.wb = new WB({
		poa: { abi: files['PoAGovernment']().abi, address: contractAddresses['PoAGovernment'] },
		web3: new web3(new web3.providers.HttpProvider(ethNetworkUrl))
	});

	argv.panicPrompt = async function(...args) {
		if(!panicMode) {
			return true
		}

		return (await prompt(...args)).result;
	}
};

async function getEthWallet(data, count) {
	try {
		const pkBuffer = Buffer.from(data, 'hex');
		const wallet = ethWallet.fromPrivateKey(pkBuffer);

		return wallet
	} catch (e) {
		// nothing
	}

	const seed = await bip39.mnemonicToSeed(data.toString());
	const hdwallet = hdkey.fromMasterSeed(seed);
	const walletPath = "m/44'/60'/0'/0/0";

	const wallet = hdwallet.derivePath(walletPath).getWallet();
	// const address = '0x' + wallet.getAddress().toString("hex");
	// const privateKey = wallet.getPrivateKey().toString("hex");

	return wallet
}
