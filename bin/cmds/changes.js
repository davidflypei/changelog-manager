exports.command = 'changes <command>'
exports.desc = 'Manage changes'
exports.builder = function (yargs) {
  return yargs.commandDir('changes')
}