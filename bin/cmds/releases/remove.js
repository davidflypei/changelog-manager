const fs = require('fs');
const helpers = require('../../../lib/helpers');

exports.command = 'remove <release>';
exports.desc = 'Removes release from json file.';
exports.builder = {
  release: {
    demand: true,
    description: "Release to delete."
  }
};
exports.handler = function (argv) {
  if (fs.existsSync('./.changelog-manager/release-entries/' + argv.release + '.json')){
    fs.unlinkSync('./.changelog-manager/release-entries/' + argv.release + '.json');
    console.log('Removed Release ' + argv.release);
  } else {
    console.log('No release file found for ' + argv.release);
    return false;
  }
};