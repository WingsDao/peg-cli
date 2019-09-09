const {baseOptions} = require('../../core/yargs');
const cosmos = require('cosmos-lib');

module.exports.command = 'mnemonic-to-address <mnemonic>';
module.exports.desc = 'Transpile from mnemonic to address';

module.exports.builder = yargs => baseOptions(yargs)
	.positional('mnemonic', {
		describe: 'Mnemonic',
		type: 'string',
	});

module.exports.handler = async function(argv) {
	const {mnemonic} = argv;

	const keys     = cosmos.crypto.getKeysFromMnemonic(mnemonic);
	const address  = cosmos.address.getAddress(keys.publicKey);

	console.log(`0x${cosmos.address.getBytes32(address).toString('hex')}`);
};
