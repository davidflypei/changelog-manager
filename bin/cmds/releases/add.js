const dayjs = require('dayjs');
const helpers = require('../../../lib/helpers');

exports.command = 'add';
exports.desc = 'Adds release to json file.';
exports.builder = {
  r: {
    demand: true,
    description: 'Release'
  },
  d: {
    default: '',
    description: "Date of the release."
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

  if (readResult.Releases[argv.r] && argv.d !== ``) {
    console.error(argv.r + ' already exists.');
    return false;
  }

  readResult.Releases[argv.r] = {
    "Date": null,
  }

  if (argv.d) {
    readResult.Releases[argv.r].Date = dayjs(argv.d).toJSON();
  }

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