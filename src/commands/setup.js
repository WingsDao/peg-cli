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
				name: 'ethPrivateKeyPath',
				message: 'Absolute path to Ethereum private key or mnemonic file:',
				validate: function (input) {
					return fs.existsSync(input) ? true : "File does not exist";
				}
			},
			{
				type: 'input',
				name: 'wbPrivateKeyPath',
				message: 'Absolute path to Wings Blockchain private key or mnemonic file:',
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
				name: 'wbNetworkUrl',
				message: 'Wings Blockchain network url:',
				default: 'http://localhost:1317',
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
		ethPrivateKeyPath: answers.ethPrivateKeyPath,
		wbPrivateKeyPath: answers.wbPrivateKeyPath,
		ethNetworkUrl: answers.ethNetworkUrl,
		wbNetworkUrl: answers.wbNetworkUrl,
		panicMode: answers.panicMode,
		contractAddresses
	};

	saveConfig(res);
};
