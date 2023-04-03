const mockfs = require('mock-fs');
const path = require("path");
const fs = require('fs');
const {when} = require('jest-when');

let originalArgv;

beforeEach(() => {
  jest.resetModules();

  originalArgv = process.argv;
  mockfs({
    'bin': mockfs.load(path.resolve(__dirname, '../../../../bin')),
    'lib': mockfs.load(path.resolve(__dirname, '../../../../lib')),
    '__mocks__':  mockfs.load(path.resolve(__dirname, '../../../../__mocks__')),
    'node_modules':  mockfs.load(path.resolve(__dirname, '../../../../node_modules')),
    'package.json':  mockfs.load(path.resolve(__dirname, '../../../../package.json')),
    'CHANGELOG.json': '{}',
    'CHANGES.md': '## Added\n' +
      '- v1.1 French translation.\n' +
      '- v1.1 Dutch translation.\n' +
      '- v1.1 Russian translation.\n' +
      '- v1.1 Japanese translation.\n' +
      '\n' +
      '## Removed\n' +
      '\n' +
      '\n' +
      '\n' +
      '## Fixed\n' +
      '- Testing something here.\n' +
      'Higher hair\n' +
      '  \n' +
      '## Changed',
  });
});

describe('Testing Command Changes Add', () => {
  test('Add No Release', async () => {
    const consoleSpy = jest.spyOn(console, "log");
    await runCommand("changes", "add", "-n", "123");
    expect(consoleSpy).lastCalledWith("Added 123");

    let data = JSON.parse(fs.readFileSync('CHANGELOG.json'));

    let test = {
      "Changes": {
        "123": {
          "Sections": {
            "Added": [
              "v1.1 French translation",
              "v1.1 Dutch translation",
              "v1.1 Russian translation",
              "v1.1 Japanese translation",
            ],
            "Removed": [],
            "Fixed": [
              "Testing something here",
              "Higher hair",
            ],
            "Changed": [],
          }
        }
      },
      "Releases": {}
    };

    expect(data).toEqual(test);
  });

  test('Add With Release', async () => {
    const consoleSpy = jest.spyOn(console, "log");
    await runCommand("changes", "add", "-n", "123", "-r", "2023.4.0");
    expect(consoleSpy).lastCalledWith("Added 123");

    let data = JSON.parse(fs.readFileSync('CHANGELOG.json'));

    let test = {
      "Changes": {
        "123": {
          "Release": "2023.4.0",
          "Sections": {
            "Added": [
              "v1.1 French translation",
              "v1.1 Dutch translation",
              "v1.1 Russian translation",
              "v1.1 Japanese translation",
            ],
            "Removed": [],
            "Fixed": [
              "Testing something here",
              "Higher hair",
            ],
            "Changed": [],
          }
        }
      },
      "Releases": {}
    };

    expect(data).toEqual(test);
  });

  test('Add Read Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Permission Denied");
      error.code = 'EACCES';
      throw error;
    });

    const result = await runCommand("changes", "add", "-n", "123", "-r", "2023.4.0");
    expect(consoleSpy).lastCalledWith("Error: Permission denied to open file");
  });

  test('Add Read Permission Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Permission Denied");
      error.code = 'EACCES';
      throw error;
    });
    const result = await runCommand("changes", "add", "-n", "123", "-r", "2023.4.0");
    expect(consoleSpy).lastCalledWith("Error: Permission denied to open file");
  });

  test('Add Read General Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');
    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error2 = new Error("Mock Error.");
      error2.code = 'ETIMEDOUT';
      throw error2;
    });
    const result = await runCommand("changes", "add", "-n", "123", "-r", "2023.4.0");
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
    const result = await runCommand("changes", "add", "-n", "123", "-r", "2023.4.0", '--verbose');
    expect(consoleSpy).lastCalledWith(new Error("Mock Error."));
  });

  test('Add Write Permission Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Permission Denied");
      error.code = 'EACCES';
      throw error;
    });
    const result = await runCommand("changes", "add", "-n", "123", "-r", "2023.4.0");
    expect(consoleSpy).lastCalledWith("Error: Permission denied to write file");
  });

  test('Add Write General Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });
    const result = await runCommand("changes", "add", "-n", "123", "-r", "2023.4.0");
    expect(consoleSpy).lastCalledWith("Error: Mock Error.");
  });

  test('Add Write Error Verbose', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });
    const result = await runCommand("changes", "add", "-n", "123", "-r", "2023.4.0", "--verbose");
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