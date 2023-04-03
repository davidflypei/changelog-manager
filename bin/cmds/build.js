const fs = require('fs');
const dayjs = require('dayjs');
const helpers = require('../../lib/helpers');


exports.command = 'build';
exports.desc = 'Builds changelog from JSON file.';
exports.builder = {
  i: {
    default: 'CHANGELOG.json',
    description: 'Input json file.'
  },
  o: {
    description: 'File to save to.',
    default: 'CHANGELOG.md',
  },
  l: {
    description: 'Reference link prefix. Change reference gets appended to this.'
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
  let outputContent = helpers.buildChangeLogContent(output, argv.l);

  try {
    fs.writeFileSync(argv.o, outputContent)
  } catch (e) {
    if (argv.verbose) {
      console.error(e);
    } else {
      switch (e.code.toUpperCase()) {
        case 'EACCES':
          console.error('Error: Permission denied to write file');
          break;
        default:
          console.error(`Error: ${e.message}`);
          break;
      }
    }
    return false;
  }

  console.log("Changelog saved to " + argv.o);
};