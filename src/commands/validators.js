module.exports.command = ['validators <command>', 'vl <command>'];
module.exports.desc = 'Manage validators';
module.exports.builder = yargs => yargs.commandDir('validators');
module.exports.handler = function (argv) {};
