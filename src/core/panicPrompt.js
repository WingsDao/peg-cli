const inquirer = require('inquirer');

const prompt = async function(message = 'You sure?') {
	return inquirer
		.prompt([
			{
				type: 'confirm',
				name: 'result',
				message,
				default: false,
			},
		]);
};

module.exports = prompt;
