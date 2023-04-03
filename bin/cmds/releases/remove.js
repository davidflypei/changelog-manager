const fs = require('fs');
const helpers = require('../../../lib/helpers');

exports.command = 'remove <release>';
exports.desc = 'Removes release from json file.';
exports.builder = {
  f: {
    default: 'CHANGELOG.json',
    description: 'JSON file.'
  },
  r: {
    description: 'Recursive. Removes all changes associated to release.'
  }
};
exports.handler = function (argv) {
  let readResult = helpers.readChangeLogJson(argv.f)

  if (readResult.err) {
    if (argv.verbose) {
      console.error(readResult.err);
    } else {
      switch (readResult.err.code && readResult.err.code.toUpperCase()) {
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

  delete readResult.Releases[argv.release];

  if (argv.r) {
    Object.entries(readResult.Changes).forEach((entry) => {
      let key = entry[0];
      let change = entry[1];

      console.log(argv.release);
      console.log(change.Release);

      if (change.Release === argv.release) {
        delete readResult.Changes[key];
      }
    });
  }

  let writeResult = helpers.writeToChangeLogJson(readResult, argv.f);

  if (writeResult.err) {
    if (argv.verbose) {
      console.error(writeResult.err);
    } else {
      switch (writeResult.err.code && writeResult.err.code.toUpperCase()) {
        case 'EACCES':
          console.error('Error: Permission denied to write file');
          break;
        default:
          console.error(`Error: ${writeResult.err.message}`);
          break;
      }
    }
    return false;
  }

  console.log('Removed Release ' + argv.release);
};