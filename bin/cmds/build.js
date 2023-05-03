const fs = require('fs');
const dayjs = require('dayjs');
const helpers = require('../../lib/helpers');
const config = helpers.readConfig()

exports.command = 'build';
exports.desc = 'Builds changelog from JSON file.';
exports.builder = {
  l: {
    description: 'Issue link prefix. Change issues get appended to this.',
    default: config.IssuesLink ?? null
  },
  o: {
    description: 'File to save to.',
    default: 'CHANGELOG.md',
  },
  header: {
    description: 'Header content to output.',
    default: config.HeaderContent ?? null
  }
};
exports.handler = function (argv) {
  let changes = {
    "Changes": helpers.loadChangeFiles(),
    "Releases": helpers.loadReleaseFiles(),
  }

  let output = helpers.buildChangeLogObject(changes);
  let outputContent = helpers.buildChangeLogContent(output, argv.l, argv.header);

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