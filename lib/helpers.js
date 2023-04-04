const fs = require('fs');
const dayjs = require('dayjs');
const assert = require("assert");
const prompt = require('prompt-sync')({sigint: true});

exports.readChangeLogJson = function (inputFileP) {
  let jsonContent = null;

  try {
    jsonContent = fs.readFileSync(inputFileP)
  } catch (e) {
    if (e.code.toUpperCase() === 'ENOENT')
    {
      if (!exports.promptYesNo('File does not exist. Would you like to create it?')) {
        return {err: new Error('No file to write to.'), success: false};
      }
    } else {
      return {err: e, success: false};
    }
  }

  let json = {};

  if (jsonContent !== null && jsonContent.toString() !== "")
  {
    json = JSON.parse(jsonContent);
  }

  return {
    "Changes": {},
    "Releases": {},
    ...json
  };
}

exports.promptYesNo = function (askP, defaultP = 'Y') {
  if (!['Y', 'N'].includes(defaultP.toUpperCase())) {
    throw new assert.AssertionError({"message": "Default must be Y or N", actual: defaultP});
  }

  const options = ' [' + (defaultP.toUpperCase() === 'Y' ? 'Y' : 'y') + '/' + (defaultP.toUpperCase() === 'N' ? 'N' : 'n') + ']:';

  if (process.stdout.isTTY) {
    const input = prompt(askP + options, 'Y');
    console.log(input);

    if (input.toUpperCase() === 'Y') {
      return true;
    } else if (input.toUpperCase() === 'N') {
      return false;
    } else {
      console.log('Invalid entry.');
      return exports.promptYesNo(askP);
    }
  } else {
    console.log(askP + options);
    console.warn('Not running in TTY. Using default');
    return defaultP.toUpperCase() === 'Y';
  }
}

exports.writeToChangeLogJson = function (dataP, outputFileP) {
  if(typeof dataP === "object")
  {
    dataP = JSON.stringify(dataP, null, 1);
  }

  try {
    fs.writeFileSync(outputFileP, dataP);
  } catch (e) {
    return {err: e, success: false};
  }

  return {err: null, success: true};
}

exports.buildChangeLogObject = function (dataP) {
  let output = {"Releases": {
      ...dataP.Releases
    }};

  Object.entries(dataP.Changes).forEach((entry) => {
    let key = entry[0];
    let change = entry[1];
    output.Releases[change.Release] = {
      "Sections": {},
      "Date": null,
      ...output.Releases[change.Release]
    };

    Object.entries(change.Sections).forEach((sectionEntry) => {
      let sectionKey = sectionEntry[0];
      let section = sectionEntry[1];
      section = section.map((v) => this.stripLineContent(v));
      if (section.length === 0) return;
      output.Releases[change.Release].Sections[sectionKey] = {}
      output.Releases[change.Release].Sections[sectionKey][key] = section
    });
  });
  output.Releases = Object.keys(output.Releases).sort().reverse().reduce(
    (obj, key) => {
      obj[key] = output.Releases[key];
      return obj;
    },
    {}
  );

  return output;
}

exports.buildChangeLogContent = function (dataP, refLinkPrefixP = null, headerContentP = null) {
  let outputContent = '# Changelog\n\n';

  if (headerContentP && headerContentP !== "false") {
    headerContentP = headerContentP.trim();
    outputContent += headerContentP;
    if (headerContentP !== "") {
      outputContent += '\n\n';
    }
  } else if (headerContentP !== "false") {
    outputContent += 'All notable changes to this project will be documented in this file.\n\n' +
    'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).\n\n';
  }

  Object.entries(dataP.Releases).forEach((entry) => {
    let key = entry[0];
    let release = entry[1];
    outputContent += '## [' + key + '] ';
    if (release.Date) {
      outputContent += '- ' + dayjs(release.Date).format('YYYY-MM-DD');
    }
    outputContent += '\n\n';

    Object.entries(release.Sections).forEach((sectionEntry) => {
      let sectionKey = sectionEntry[0];
      let section = sectionEntry[1];
      outputContent += '### ' + sectionKey + ': \n\n';
      Object.entries(section).forEach((refEntry) => {
        let refKey = refEntry[0];
        let ref = refEntry[1];
        ref.forEach((change) => {
          if (refLinkPrefixP) {
            outputContent += '- ' + change + '. ([#' + refKey + '](' + refLinkPrefixP + refKey + '))\n';
          } else {
            outputContent += '- ' + change + '. (#' + refKey + ')\n';
          }
        });
      });
      outputContent += '\n';
    });

    outputContent += '\n';
  });

  return outputContent;
}

exports.parseChanges = function (dataP) {
  let contentSections = dataP.toString().split('## ');
  let changes = {
    "Sections": {},
  }
  contentSections.forEach((value, index) => {
    let sectionLines = value.split('\n');
    sectionLines = sectionLines.map((v) => exports.stripLineContent(v));
    let sectionHeader = sectionLines.shift();
    if (sectionHeader === '') return;
    changes.Sections[sectionHeader] = sectionLines.filter(v => v.length);
  });

  return changes;
}

exports.stripLineContent = function (dataP) {
  return dataP.replace(/^[# -]+|[.: ]+$/g, "");
}