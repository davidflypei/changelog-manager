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
    'bin': mockfs.load(path.resolve(__dirname, '../../../../bin')),
    'lib': mockfs.load(path.resolve(__dirname, '../../../../lib')),
    '__mocks__':  mockfs.load(path.resolve(__dirname, '../../../../__mocks__')),
    'node_modules': mockfs.load(path.resolve(__dirname, '../../../../node_modules')),
    'package.json': mockfs.load(path.resolve(__dirname, '../../../../package.json')),
    'releaseAlreadyExists.json': '{"Changes":{},"Releases":{"2023.5.0":{"Date":"2023-03-23T03:00:00.000Z"}}}',
  });
});

describe('Testing Command Releases Add', () => {
  test('Add No Date', async () => {
    const consoleSpy = jest.spyOn(console, "log");
    await runCommand("releases", "add", "-r", "2023.4.0");
    expect(consoleSpy).lastCalledWith("Added Release 2023.4.0");

    let data = JSON.parse(fs.readFileSync('CHANGELOG.json'));

    let test = {
      "Changes": {},
      "Releases": {
        "2023.4.0": {
          "Date": null,
        }
      }
    };

    expect(data).toEqual(test);
  });

  test('Add With Date', async () => {
    const consoleSpy = jest.spyOn(console, "log");
    await runCommand("releases", "add", "-r", "2023.4.0", "-d", "2023-04-03");
    expect(consoleSpy).lastCalledWith("Added Release 2023.4.0");

    let data = JSON.parse(fs.readFileSync('CHANGELOG.json'));

    let test = {
      "Changes": {},
      "Releases": {
        "2023.4.0": {
          "Date": "2023-04-03T03:00:00.000Z",
        }
      }
    };

    expect(data).toEqual(test);
  });

  test('Add Already Exists', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    await runCommand("releases", "add", "-r", "2023.5.0", "-o", "releaseAlreadyExists.json");
    expect(consoleSpy).lastCalledWith("2023.5.0 already exists.");

    let data = JSON.parse(fs.readFileSync('releaseAlreadyExists.json'));

    let test = {
      "Changes": {},
      "Releases": {
        "2023.5.0": {
          "Date": "2023-03-23T03:00:00.000Z"
        }
      }
    };

    expect(data).toEqual(test);
  });

  test('Add Read Perm Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Permission Denied");
      error.code = 'EACCES';
      throw error;
    });

    await runCommand("releases", "add", "-r", "2023.4.0");
    expect(consoleSpy).lastCalledWith("Error: Permission denied to open file");
  });

  test('Add Read General Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("releases", "add", "-r", "2023.4.0");
    expect(consoleSpy).lastCalledWith("Error: Mock Error.");
  });

  test('Add Read Error Verbose', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("releases", "add", "-r", "2023.4.0", "--verbose");
    expect(consoleSpy).lastCalledWith(new Error("Mock Error."));
  });

  test('Add Write Perm Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Permission Denied");
      error.code = 'EACCES';
      throw error;
    });

    await runCommand("releases", "add", "-r", "2023.4.0");
    expect(consoleSpy).lastCalledWith("Error: Permission denied to write file");
  });

  test('Add Write General Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("releases", "add", "-r", "2023.4.0");
    expect(consoleSpy).lastCalledWith("Error: Mock Error.");
  });

  test('Add Write Error Verbose', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("releases", "add", "-r", "2023.4.0", "--verbose");
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
  return require('../../../../bin/index.js');
}

