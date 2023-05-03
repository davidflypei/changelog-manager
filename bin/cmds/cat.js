const helpers = require('../../lib/helpers');
const config = helpers.readConfig()

exports.command = 'cat';
exports.desc = 'Outputs changelog from JSON file.';
exports.builder = {
  l: {
    description: 'Issue link prefix. Change issues get appended to this.',
    default: config.IssuesLink ?? null
  },
  r: {
    description: 'Release to output.'
  },
  header: {
    description: 'Header content to output.',
    default: config.HeaderContent ?? null
  }
};
exports.handler = function (argv) {
  let readResult = {
    "Changes": helpers.loadChangeFiles(),
    "Releases": helpers.loadReleaseFiles()
  }

  let output = helpers.buildChangeLogObject(readResult);

  if (argv.r) {
    let release = output.Releases[argv.r];
    output = {"Releases": {}};
    output.Releases[argv.r] = release;
  }

  let outputContent = helpers.buildChangeLogContent(output, argv.l, argv.header);

  console.log(outputContent)
};