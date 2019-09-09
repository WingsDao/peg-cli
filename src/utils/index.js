const Web3 = require('web3');

exports.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

exports.DESTINATION = {
	SELF:   '0',
	TARGET: '1'
};

exports.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

exports.eth = require('./eth/index');
exports.wb = require('./wb/index');
