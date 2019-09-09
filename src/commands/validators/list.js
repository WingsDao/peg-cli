const {baseOptions} = require('../../core/yargs');
const cosmos = require('cosmos-lib');

module.exports.command = 'list';
module.exports.desc = 'List of all active validators';

module.exports.builder = yargs => baseOptions(yargs);
module.exports.handler = async function(argv) {
	const {ethApi} = argv;

	const allValidators = (await ethApi._poa.getPastEvents('ADDED_VALIDATOR', {
		fromBlock: 0,
		toBlock: 'latest'
	})).map(event => event.returnValues);

	let activeValidators = allValidators.map(validator => {
		return ethApi._poa.methods.isValidator(validator._ethAddress)
			.call()
			.then(isValidator => {
				if(isValidator) {
					return {ethAddress: validator._ethAddress, cosmosAddress: validator._cosmosAddress};
				}

				return null;
			})
	});

	activeValidators = await Promise.all(activeValidators);

	activeValidators.filter(v => v).forEach((validator, i) => {
		console.log(`Validator ${i + 1}:`);
		console.log(`Eth address: ${validator.ethAddress}`);
		console.log(`Cosmos address: ${validator.cosmosAddress} (${cosmos.address.getAddressFromBytes32(Buffer.from(validator.cosmosAddress.slice(2)))})`);
		console.log("----------\n");
	})
}
