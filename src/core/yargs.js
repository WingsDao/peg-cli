const yargs = require('yargs');
const InvalidValueException = require("./invalidValueException");
const {loadConfigFile} = require("../utils/config");

const instance = yargs
	.parserConfiguration({
		'strip-dashed': false,
	})
	.help(false)
	.version(false)
	.fail(function (msg, err) {
		if(err) {
			if (!(err instanceof InvalidValueException)) throw err;
			console.error(err.message);
			process.exit(1);
			return;
		}

		console.error(msg);
		process.exit(1)
	})
	.config(loadConfigFile(yargs.argv.config));

module.exports = {
	yargs: instance,
	baseOptions: function baseOptions(yargs) {
		return yargs
			.option('config', {
				describe: 'The path to the config file',
				type: 'string',
			})
			.option('contracts-dir', {
				describe: 'The path to the config file',
				type: 'string',
			})
			.option('eth-private-key-path', {
				describe: 'The path to the config file',
				type: 'string',
			})
			.option('wb-private-key-path', {
				describe: 'The path to the config file',
				type: 'string',
			})
			.option('contract-addresses', {
				describe: 'The path to the config file',
				type: 'string',
				hidden: true,
			})
			.option('eth-network-url', {
				describe: 'The path to the config file',
				type: 'string',
				hidden: true,
			})
			.option('wb-network-url', {
				describe: 'The path to the config file',
				type: 'string',
				hidden: true,
			})
			.option('panic-mode', {
				describe: 'The path to the config file',
				type: 'boolean',
				hidden: false,
			})
	}
};
