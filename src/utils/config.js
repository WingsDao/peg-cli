const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../userConfig.json');

exports.saveConfig = function(config) {
	fs.writeFileSync(configPath, JSON.stringify(config));
};

exports.loadConfigFile = function(configPath) {
	const rcFile = configPath || path.resolve(__dirname, '../../userConfig.json');
	const rcFileResolved = path.resolve(rcFile);
	return fs.existsSync(rcFileResolved)
		? JSON.parse(JSON.stringify(require(rcFileResolved)))
		: {};
};
