exports.command = 'releases <command>'
exports.desc = 'Manage releases'
exports.builder = function (yargs) {
  return yargs.commandDir('releases')
}