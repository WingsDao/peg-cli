const fs = require('fs');
const path = require('path');
const web3 = require('web3');
const {InvalidValueException, prompt} = require('../core');
const {eth, wb} = require('../utils/index');

const REQUIRED_CONTRACTS = ['PoAGovernment'];

module.exports = async function(argv, yargs) {
	const ignoredCommands = [['setup']];

	const skip = ignoredCommands.find(cmd => {
		return cmd.length === argv._.length && cmd.every((v,i) => v === argv._[i])
	});

	if(skip) {
		return ;
	}

	const { ethPrivateKeyPath, wbPrivateKeyPath, wbNetworkUrl, contractAddresses, contractsDir, ethNetworkUrl, panicMode } = argv;

	if (!ethPrivateKeyPath || !contractAddresses || !contractsDir || !ethNetworkUrl || !wbPrivateKeyPath || !wbNetworkUrl) {
		throw new InvalidValueException(`You need to configure the settings. Follow the "${argv.$0} setup" to continue.`)
	}

	if(!fs.existsSync(ethPrivateKeyPath)) {
		throw new InvalidValueException(`Ethereum private key file not found (path: "${ethPrivateKeyPath}")`);
	}

	if(!fs.existsSync(wbPrivateKeyPath)) {
		throw new InvalidValueException(`Wings Blockchain private key file not found (path: "${wbPrivateKeyPath}")`);
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

	const files = {};
	REQUIRED_CONTRACTS.forEach(file => files[file] = () => JSON.parse(fs.readFileSync(path.resolve(contractsDir, file + '.json'), 'utf8')));

	const ethPrivateKeyFileData = fs.readFileSync(ethPrivateKeyPath, 'utf8');
	const wbPrivateKeyFileData = fs.readFileSync(wbPrivateKeyPath, 'utf8');

	const {wallet: ethWallet, api: ethApi} = eth(
		{
			poa: { abi: files['PoAGovernment']().abi, address: contractAddresses['PoAGovernment'] },
			web3: new web3(new web3.providers.HttpProvider(ethNetworkUrl))
		},
		ethPrivateKeyFileData
	);

	const {wallet: wbWallet, api: wbApi} = wb(
		wbNetworkUrl,
		{
			mnemonic: wbPrivateKeyFileData
		}
	);

	argv.ethWallet = ethWallet;
	argv.ethApi = ethApi;

	argv.wbWallet = wbWallet;
	argv.wbApi = wbApi;

	argv.panicPrompt = async function(...args) {
		if(!panicMode) {
			return true
		}

		return (await prompt(...args)).result;
	}
};
