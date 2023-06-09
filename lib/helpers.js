const fs = require('fs');
const dayjs = require('dayjs');
const assert = require("assert");
const prompt = require('prompt-sync')({sigint: true});

exports.readConfig = function() {
  let jsonContent = null;
  try {
    jsonContent = fs.readFileSync('./.changelog-manager/config.json')
  } catch (e) {
    if (e.code.toUpperCase() === 'ENOENT')
    {
      return {err: new Error('Config file not found.'), success: false};
    } else {
      return {err: e, success: false};
    }
  }

  let json = {};

  if (jsonContent !== null && jsonContent.toString() !== "")
  {
    json = JSON.parse(jsonContent);
  }

  return json;
}

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

exports.readChangeJSONFile = function (changeIDP) {
  let jsonContent = null;

  try {
    jsonContent = fs.readFileSync('./.changelog-manager/change-entries/' + changeIDP + '.json')
  } catch (e) {
    if (e.code.toUpperCase() !== 'ENOENT')
    {
      return {err: e, success: false};
    }
  }

  let json = {};

  if (jsonContent !== null && jsonContent.toString() !== "")
  {
    json = JSON.parse(jsonContent);
  }

  return json;
}

exports.readReleaseJSONFile = function (releaseIDP) {
  let jsonContent = null;

  try {
    jsonContent = fs.readFileSync('./.changelog-manager/release-entries/' + releaseIDP + '.json')
  } catch (e) {
    if (e.code.toUpperCase() !== 'ENOENT')
    {
      return {err: e, success: false};
    }
  }

  let json = {};

  if (jsonContent !== null && jsonContent.toString() !== "")
  {
    json = JSON.parse(jsonContent);
  }

  return json;
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

exports.writeToChangeJSONFile = function (dataP, changeIDP) {
  const dir = './.changelog-manager/change-entries/';

  if(typeof dataP === "object")
  {
    dataP = JSON.stringify(dataP, null, 1);
  }


  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.writeFileSync(dir + changeIDP + '.json', dataP);
  } catch (e) {
    return {err: e, success: false};
  }

  return {err: null, success: true};
}

exports.writeToReleaseJSONFile = function (dataP, releaseIDP) {
  const dir = './.changelog-manager/release-entries/';

  if(typeof dataP === "object")
  {
    dataP = JSON.stringify(dataP, null, 1);
  }


  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.writeFileSync(dir + releaseIDP + '.json', dataP);
  } catch (e) {
    return {err: e, success: false};
  }

  return {err: null, success: true};
}

exports.loadChangeFiles = function () {
  let changes = {};

  let files = fs.readdirSync('./.changelog-manager/change-entries/');

  files.forEach((file) => {
    let changeJSON = {}
    let jsonContent = null;

    try {
      jsonContent = fs.readFileSync('./.changelog-manager/change-entries/' + file);
      changeJSON = JSON.parse(jsonContent);
    } catch (e) {
      console.log(e);
      return;
    }

    changes[changeJSON.ID] = changeJSON;
  });

  return changes;
}

exports.loadReleaseFiles = function () {
  let releases = {};

  let files = fs.readdirSync('./.changelog-manager/release-entries/');

  files.forEach((file) => {
    let releaseJSON = {}
    let jsonContent = null;

    try {
      jsonContent = fs.readFileSync('./.changelog-manager/release-entries/' + file);
      releaseJSON = JSON.parse(jsonContent);
    } catch (e) {
      console.log(e);
      return;
    }

    releases[releaseJSON.Version] = releaseJSON;
  });

  return releases;
}

exports.buildChangeLogObject = function (dataP) {
  let output = {"Releases": {
      ...dataP.Releases
    }};

  Object.entries(dataP.Changes).forEach((entry) => {
    let key = entry[0];
    let change = entry[1];

    if (change.Release == null) return;

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
      output.Releases[change.Release].Sections[sectionKey] = {...output.Releases[change.Release].Sections[sectionKey]}
      output.Releases[change.Release].Sections[sectionKey][key] = { "Issues": change.Issues, "Entries": section }
    });
  });

  output.Releases = Object.keys(output.Releases).sort((a, b) => {
    let asplit = a.split('.');
    let bsplit = b.split('.');

    if (asplit.length > bsplit.length) {
      bsplit.push(Array(asplit.length - bsplit.length))
    }

    for (let i = 0; i < asplit.length; i++)
    {
      if (parseInt(asplit[i]) > parseInt(bsplit[i])) {
        return 1;
      } else if (parseInt(asplit[i]) < parseInt(bsplit[i])) {
        return -1;
      }
    }

    console.log('=');
    return 0;
  }).reverse().reduce(
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
  }

  Object.entries(dataP.Releases).forEach((entry) => {
    let key = entry[0];
    let release = entry[1];
    outputContent += '## [' + key + '] ';
    if (release.Date) {
      outputContent += '- ' + dayjs(release.Date).format('YYYY-MM-DD');
    }
    outputContent += '\n\n';

    if (!release.Sections) {
      return;
    }

    Object.entries(release.Sections).forEach((sectionEntry) => {
      let sectionKey = sectionEntry[0];
      let section = sectionEntry[1];
      outputContent += '### ' + sectionKey + ': \n\n';
      Object.entries(section).forEach((changeEntry) => {
        let changeKey = changeEntry[0];
        let change = changeEntry[1];
        change.Entries.forEach((entry) => {
          let entryContent = '- ' + entry + '.';
          if (change.Issues && change.Issues.length > 0) {
            let issues = [];
            change.Issues.forEach((issue) => {
              if (refLinkPrefixP) {
                issues.push('[#' + issue + '](' + refLinkPrefixP + issue + ')');
              } else {
                issues.push('#' + issue);
              }
            });
            entryContent += ' (' + issues.join(',') + ')';
          }
          outputContent += entryContent+ '\n';

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
  let changes = {}
  contentSections.forEach((value, index) => {
    let sectionLines = value.split('\n');
    sectionLines = sectionLines.map((v) => exports.stripLineContent(v));
    let sectionHeader = sectionLines.shift();
    if (sectionHeader === '') return;
    changes[sectionHeader] = sectionLines.filter(v => v.length);
  });

  return changes;
}

exports.stripLineContent = function (dataP) {
  return dataP.replace(/^[# -]+|[.: ]+$/g, "");
}