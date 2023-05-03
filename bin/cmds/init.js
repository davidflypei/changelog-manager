const fs = require('fs');

exports.command = 'init';
exports.desc = 'Initialises folders and config.';
exports.builder = {};
exports.handler = function (argv) {
  const dirs = [
    './.changelog-manager',
    './.changelog-manager/change-entries/',
    './.changelog-manager/release-entries/',
  ];
  const configFile = './.changelog-manager/config.json';

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
  })

  if (!fs.existsSync(configFile)){
    let configJson = {
      "IssuesLink": null,
      "HeaderContent": 'All notable changes to this project will be documented in this file.\n\n' +
        'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).\n\n',
    }
    fs.writeFileSync(configFile, JSON.stringify(configJson, null, 1));
  }
}