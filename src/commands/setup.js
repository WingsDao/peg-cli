const {saveConfig} = require("../utils/config");
const {baseOptions} = require('../core/yargs');
const inquirer = require('inquirer');
const web3 = require('web3');
const fs = require('fs');

module.exports.command = 'setup';
module.exports.desc = 'Setup configuration';
module.exports.builder = yargs => baseOptions(yargs);
module.exports.handler = async function(argv) {
	const answers = await inquirer
		.prompt([
			{
				type: 'input',
				name: 'contractsDir',
				message: 'Absolute path to directory contained contracts ABI files:',
				validate: function (input) {
					return fs.existsSync(input) ? true : "Directory does not exist";
				}
			},
			{
				type: 'input',
				name: 'privateKeyPath',
				message: 'Absolute path to private key or mnemonic file:',
				validate: function (input) {
					return fs.existsSync(input) ? true : "File does not exist";
				}
			},
			{
				type: 'input',
				name: 'ethNetworkUrl',
				message: 'Ethereum network url:',
				default: 'http://localhost:7545',
				validate: function (input) {
					return !!input;
				}
			},
			{
				type: 'input',
				name: 'adr_PoAGovernment',
				message: 'Setting PoAGovernment contract address',
				validate: function (input) {
					return web3.utils.isAddress(input) ? true : 'Invalid contract address'
				}
			},
			{
				type: 'confirm',
				name: 'panicMode',
				message: 'Use panic mode?',
				default: false,
			},
			{
				type: 'confirm',
				name: 'saveConfig',
				message: 'Save this config file?',
				default: true,
			},
		]);

	const contractAddresses = {};

	Object.keys(answers)
		.forEach(key => {
			const match = key.match(/^adr_(.+)/)
			if(!match) {
				return;
			}

			contractAddresses[match[1]] = answers[key];
		});

	const res = {
		contractsDir: answers.contractsDir,
		privateKeyPath: answers.privateKeyPath,
		ethNetworkUrl: answers.ethNetworkUrl,
		panicMode: answers.panicMode,
		contractAddresses
	};

	saveConfig(res);
};
