const dayjs = require('dayjs');
const helpers = require('../../../lib/helpers');

exports.command = 'add <release>';
exports.desc = 'Adds release entry.';
exports.builder = {
  release: {
    demand: true,
    description: 'Release name. E.g. 1.1.0'
  },
  d: {
    default: null,
    description: "Date of the release."
  },
};
exports.handler = function (argv) {
  let readResult = helpers.readReleaseJSONFile(argv.release)

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

  if (readResult.Version && (argv.d === null || argv.d === '')) {
    console.error(argv.release + ' already exists.');
    return false;
  }

  readResult.Version = argv.release;
  readResult.Date = argv.d !== null ? dayjs(argv.d).toJSON() : null;

  let writeResult = helpers.writeToReleaseJSONFile(readResult, argv.release);

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

  console.log('Added Release ' + argv.release);
};