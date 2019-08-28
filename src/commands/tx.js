module.exports.command = 'tx <command>';
module.exports.desc = 'Manage transactions';
module.exports.builder = yargs => yargs.commandDir('tx');
module.exports.handler = function (argv) {};
