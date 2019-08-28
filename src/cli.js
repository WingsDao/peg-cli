#!/usr/bin/env node

const {yargs} = require('./core/yargs');

const setupMiddleware = require('./middleware/setup');

const cli = yargs
	.help()
	.version()
	.middleware(setupMiddleware)
	.commandDir('commands')
	.demandCommand()
	.wrap(yargs.terminalWidth())
	.exitProcess(true)
	.strict();

const args = cli.argv;
