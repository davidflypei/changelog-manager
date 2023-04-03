const fs = require('fs');
const helpers = require('../../../lib/helpers');

exports.command = 'add';
exports.desc = 'Parses and saves content from changes file to json file.';
exports.builder = {
  n: {
    demand: true,
    description: 'Reference value. Typically MR number.'
  },
  r: {
    default: '',
    description: "Release changes are associated with."
  },
  i: {
    default: 'CHANGES.md',
    description: 'Input changes file.'
  },
  o: {
    description: 'JSON file to save to.',
    default: 'CHANGELOG.json',
  },
  s: {
    description: 'Strict mode. Errors on non standard sections.'
  }
};
exports.handler = function (argv) {
  let readResult = helpers.readChangeLogJson(argv.o);

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

  let content = fs.readFileSync(argv.i);
  let changes = helpers.parseChanges(content);

  if (argv.r) {
    changes.Release = argv.r;
  }

  readResult.Changes[argv.n] = changes;

  const writeResult = helpers.writeToChangeLogJson(readResult, argv.o);

  if (writeResult.err) {
    if (argv.verbose) {
      console.error(writeResult.err);
    } else {
      switch (writeResult.err.code.toUpperCase()) {
        case 'EACCES':
          console.error('Error: Permission denied to write file');
          break;
        default:
          console.error(`Error: ${writeResult.err.message}`);
          break;
      }
    }
  } else {
    console.log("Added " + argv.n);
  }
};