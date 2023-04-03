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
    'CHANGELOG.json': '{"Changes":{"123":{"Release":"2023.5.0","Sections":{"Added":["Added stuff to thing.","Some other stuff."]}},"124":{"Release":"2023.6.0","Sections":{"Added":["Added stuff to thing.","Some other stuff."]}}},"Releases":{"2023.5.0":{"Date":"2023-03-23T03:00:00.000Z"}}}',
  });
});

describe('Testing Command Releases Remove', () => {
  test('Remove', async () => {
    const consoleSpy = jest.spyOn(console, "log");
    await runCommand("releases", "remove", "2023.5.0");
    expect(consoleSpy).lastCalledWith("Removed Release 2023.5.0");

    let data = JSON.parse(fs.readFileSync('CHANGELOG.json'));

    let test = {
      "Changes": {
        "123": {
          "Release": "2023.5.0",
          "Sections": {
            "Added": [
              "Added stuff to thing.",
              "Some other stuff."
            ]
          }
        },
        "124": {
          "Release": "2023.6.0",
          "Sections": {
            "Added": [
              "Added stuff to thing.",
              "Some other stuff."
            ]
          }
        },
      },
      "Releases": {},
    };

    expect(data).toEqual(test);
  });

  test('Remove Recursive', async () => {
    const consoleSpy = jest.spyOn(console, "log");
    await runCommand("releases", "remove", "2023.5.0", "-r");
    expect(consoleSpy).lastCalledWith("Removed Release 2023.5.0");

    let data = JSON.parse(fs.readFileSync('CHANGELOG.json'));

    let test = {
      "Changes": {
        "124": {
          "Release": "2023.6.0",
          "Sections": {
            "Added": [
              "Added stuff to thing.",
              "Some other stuff."
            ]
          }
        }
      },
      "Releases": {},
    };

    expect(data).toEqual(test);
  });

  test('Remove Read Perm Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Permission Denied");
      error.code = 'EACCES';
      throw error;
    });

    await runCommand("releases", "remove", "2023.5.0");
    expect(consoleSpy).lastCalledWith("Error: Permission denied to open file");
  });

  test('Remove Read General Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("releases", "remove", "2023.5.0");
    expect(consoleSpy).lastCalledWith("Error: Mock Error.");
  });

  test('Remove Read Error Verbose', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const fsMock = jest.spyOn(fs, 'readFileSync');

    when(fsMock).calledWith("CHANGELOG.json").mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("releases", "remove", "2023.5.0", "--verbose");
    expect(consoleSpy).lastCalledWith(new Error("Mock Error."));
  });

  test('Remove Write Perm Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Permission Denied");
      error.code = 'EACCES';
      throw error;
    });

    await runCommand("releases", "remove", "2023.5.0");
    expect(consoleSpy).lastCalledWith("Error: Permission denied to write file");
  });

  test('Remove Write General Error', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("releases", "remove", "2023.5.0");
    expect(consoleSpy).lastCalledWith("Error: Mock Error.");
  });

  test('Remove Write Error Verbose', async () => {
    const consoleSpy = jest.spyOn(console, "error");
    jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      let error = new Error("Mock Error.");
      error.code = 'ETIMEDOUT';
      throw error;
    });

    await runCommand("releases", "remove", "2023.5.0", "--verbose");
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

