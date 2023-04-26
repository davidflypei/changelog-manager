const mockfs = require('mock-fs');
const fs = require('fs');
const path = require('path');
const prompt = jest.requireActual('prompt-sync')({sigint: true});
const {when} = require('jest-when');

let originalArgv;

beforeEach(() => {
  jest.resetModules();
  originalArgv = process.argv;
  mockfs({
    'bin': mockfs.load(path.resolve(__dirname, '../../../bin')),
    'lib': mockfs.load(path.resolve(__dirname, '../../../lib')),
    '__mocks__':  mockfs.load(path.resolve(__dirname, '../../../__mocks__')),
    'node_modules': mockfs.load(path.resolve(__dirname, '../../../node_modules')),
    'package.json': mockfs.load(path.resolve(__dirname, '../../../package.json')),
    'CHANGELOG.json': '{"Changes":{"123":{"Release":"2023.5.0","Sections":{"Added":["Added stuff to thing.","Some other stuff."]}},"124":{"Release":"2023.6.0","Sections":{"Added":["Added stuff to thing.","Some other stuff."]}},"122":{"Release":"2023.5.0","Sections":{"Added":["Added stuff to thing.","Some other stuff."]}}},"Releases":{"2023.5.0":{"Date":"2023-03-23T03:00:00.000Z"},"2023.6.0":{"Date":"2023-03-24T03:00:00.000Z"}}}',
  });
});

describe('Testing Command Build', () => {
  test('Build Without Ref Link', async () => {
    const consoleSpy = jest.spyOn(console, "log");
    await runCommand("build");
    expect(consoleSpy).lastCalledWith("Changelog saved to CHANGELOG.md");

    let data = fs.readFileSync('CHANGELOG.md').toString();

    let test = '# Changelog\n' +
      '\n' +
      'All notable changes to this project will be documented in this file.\n' +
      '\n' +
      'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).\n' +
      '\n' +
      '## [2023.6.0] - 2023-03-24\n' +
      '\n' +
      '### Added: \n' +
      '\n' +
      '- Added stuff to thing. (#124)\n' +
      '- Some other stuff. (#124)\n' +
      '\n' +
      '\n' +
      '## [2023.5.0] - 2023-03-23\n' +
      '\n' +
      '### Added: \n' +
      '\n' +
      '- Added stuff to thing. (#122)\n' +
      '- Some other stuff. (#122)\n' +
      '- Added stuff to thing. (#123)\n' +
      '- Some other stuff. (#123)\n' +
      '\n' +
      '\n';

    expect(data).toEqual(test);
  });

  test('Build With Ref Link', async () => {
    const consoleSpy = jest.spyOn(console, "log");
    await runCommand("build", "-l", "https://office.thinkingbig.net/GH/awesomeware/-/merge_requests/");
    expect(consoleSpy).lastCalledWith("Changelog saved to CHANGELOG.md");

    let data = fs.readFileSync('CHANGELOG.md').toString();

    let test = '# Changelog\n' +
      '\n' +
      'All notable changes to this project will be documented in this file.\n' +
      '\n' +
      'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).\n' +
      '\n' +
      '## [2023.6.0] - 2023-03-24\n' +
      '\n' +
      '### Added: \n' +
      '\n' +
      '- Added stuff to thing. ([#124](https://office.thinkingbig.net/GH/awesomeware/-/merge_requests/124))\n' +
      '- Some other stuff. ([#124](https://office.thinkingbig.net/GH/awesomeware/-/merge_requests/124))\n' +
      '\n' +
      '\n' +
      '## [2023.5.0] - 2023-03-23\n' +
      '\n' +
      '### Added: \n' +
      '\n' +
      '- Added stuff to thing. ([#122](https://office.thinkingbig.net/GH/awesomeware/-/merge_requests/122))\n' +
      '- Some other stuff. ([#122](https://office.thinkingbig.net/GH/awesomeware/-/merge_requests/122))\n' +
      '- Added stuff to thing. ([#123](https://office.thinkingbig.net/GH/awesomeware/-/merge_requests/123))\n' +
      '- Some other stuff. ([#123](https://office.thinkingbig.net/GH/awesomeware/-/merge_requests/123))\n' +
      '\n' +
      '\n';

    expect(data).toEqual(test);
  });

  test('Build Read Perm Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Permission Denied");
      error.code = 'EACCES';
      throw error;
    });

    await runCommand("build");
    expect(consoleSpy).lastCalledWith("Error: Permission denied to open file");
  });

  test('Build Read General Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("build");
    expect(consoleSpy).lastCalledWith("Error: Mock Error.");
  });

  test('Build Read Error Verbose', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("build", "--verbose");
    expect(consoleSpy).lastCalledWith(new Error("Mock Error."));
  });

  test('Build Write Perm Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Permission Denied");
      error.code = 'EACCES';
      throw error;
    });

    await runCommand("build");
    expect(consoleSpy).lastCalledWith("Error: Permission denied to write file");
  });

  test('Build Write General Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("build");
    expect(consoleSpy).lastCalledWith("Error: Mock Error.");
  });

  test('Build Write Error Verbose', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("build", "--verbose");
    expect(consoleSpy).lastCalledWith(new Error("Mock Error."));
  });
});



afterEach(() => {
  jest.resetAllMocks();

  // Set process arguments back to the original value
  process.argv = originalArgv;
  mockfs.restore();
});

/**
 * Programmatically set arguments and execute the CLI script
 *
 * @param {...string} args - positional and option arguments for the command to run
 */
async function runCommand(...args) {
  process.argv = [
    "node", // Not used but a value is required at this index in the array
    "bin/index.js", // Not used but a value is required at this index in the array
    ...args,
  ];

  // Require the yargs CLI script
  return require('../../../bin/index.js');
}

