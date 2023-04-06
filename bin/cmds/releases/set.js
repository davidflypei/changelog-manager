const dayjs = require('dayjs');
const helpers = require('../../../lib/helpers');

exports.command = 'set <release>';
exports.desc = 'Sets a release to a change or all changes with no release.';
exports.builder = {
  c: {
    description: 'Change to set release to.',
  },
  o: {
    description: 'JSON file to save to.',
    default: 'CHANGELOG.json',
  },
};
exports.handler = function (argv) {
  let readResult = helpers.readChangeLogJson(argv.o)

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

  Object.entries(readResult.Changes).forEach((entry) => {
    let key = entry[0];
    let change = entry[1];

    if (argv.c) {
      if (key === argv.c) {
        readResult.Changes[key].Release = argv.r;
      }
    } else {
      if (!change.Release) {
        readResult.Changes[key].Release = argv.r;
      }
    }
  });

  let writeResult = helpers.writeToChangeLogJson(readResult, argv.o);

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

  console.log('Added Release ' + argv.r);
};