const fs = require('fs');
const helpers = require('../../../lib/helpers');

exports.command = 'add <ID>';
exports.desc = 'Parses and saves content from changes file to a change json file.';
exports.builder = {
  ID: {
    demand: true,
    description: 'ID value. Typically MR number.'
  },
  r: {
    default: null,
    description: "The release changes are associated with."
  },
  issues: {
    default: null,
    description: "Issue numbers associated with change. Comma separated."
  },
  i: {
    default: 'CHANGES.md',
    description: 'Input changes file.'
  },
  s: {
    description: 'Strict mode. Errors on non standard sections.'
  }
};
exports.handler = function (argv) {
  let content = fs.readFileSync(argv.i);
  let change = {}

  change.Sections = helpers.parseChanges(content);
  change.ID = argv.ID;
  change.Release = argv.r;
  change.Issues = argv.issues !== null ? argv.issues.toString().split(',') : null;

  const writeResult = helpers.writeToChangeJSONFile(change, argv.ID);

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
    console.log("Added " + argv.ID);
  }
};