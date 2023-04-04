const helpers = require('../../lib/helpers');


exports.command = 'cat';
exports.desc = 'Outputs changelog from JSON file.';
exports.builder = {
  i: {
    default: 'CHANGELOG.json',
    description: 'Input json file.'
  },
  l: {
    description: 'Reference link prefix. Change reference gets appended to this.'
  },
  r: {
    description: 'Release to output.'
  },
  header: {
    description: 'Header content to output.'
  }
};
exports.handler = function (argv) {
  let readResult = helpers.readChangeLogJson(argv.i);

  if (readResult.err) {
    if (argv.verbose) {
      console.error(readResult.err);
    } else {
      switch (readResult.err.code.toUpperCase()) {
        case 'EACCES':
          console.error('Error: Permission denied to open file');
          break;
        default:
          console.error(`Error: ${readResult.err.message}`);
          break;
      }
    }
    return false;
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