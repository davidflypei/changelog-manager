const dayjs = require('dayjs');
const helpers = require('../../../lib/helpers');

exports.command = 'set <release>';
exports.desc = 'Sets a release on a change or all changes with no release.';
exports.builder = {
  release: {
    demand: true,
    description: "Release to set change(s) to."
  },
  c: {
    description: 'Change to set release on.',
  },
};
exports.handler = function (argv) {
  let changes = helpers.loadChangeFiles();

  Object.values(changes).forEach((change) => {
    if (argv.c) {
      if (change.ID === argv.c) {
        change.Release = argv.release;
        helpers.writeToChangeJSONFile(change, change.ID);
        console.log('Set change ' + change.ID + ' to release ' + argv.release);
      }
    } else {
      if (!change.Release) {
        change.Release = argv.release;
        helpers.writeToChangeJSONFile(change, change.ID);
        console.log('Set change ' + change.ID + ' to release ' + argv.release);
      }
    }
  });

  console.log('Done!');
};