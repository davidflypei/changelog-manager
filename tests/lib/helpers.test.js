
const mockfs = require('mock-fs');
const fs = require('fs');
const path = require('path');
const {when} = require("jest-when");
const prompt = require('prompt-sync');
const helpers = require('../../lib/helpers');

let originalArgv;

jest.mock('prompt-sync');


beforeEach(() => {
  jest.resetModules();
  originalArgv = process.argv;
  mockfs({
    'tests/lib/helpers/': {
      'readChangeLogJsonTest.json': '{"Changes":{"123":{"Release":"2023.4.0","Sections":{"Added":["Added stuff to thing.","Some other stuff."]}}},"Releases":{"2023.5.0":{"Date":"2023-03-23T03:00:00.000Z"}}}',
      'readChangeLogJsonTestEmptyData.json': '{"Changes":{},"Releases":{}}',
      'readChangeLogJsonTestEmptyFile.json': '',
    },
    '__mocks__':  mockfs.load(path.resolve(__dirname, '../../__mocks__')),
    'lib': mockfs.load(path.resolve(__dirname, '../../lib')),
    'node_modules': mockfs.load(path.resolve(__dirname, '../../node_modules')),
  });
})

describe('Testing Helpers', () => {
  describe('readChangeLogJson', () => {
    test('Data', () => {
      let result = helpers.readChangeLogJson('tests/lib/helpers/readChangeLogJsonTest.json');
      let test = JSON.parse('{"Changes":{"123":{"Release":"2023.4.0","Sections":{"Added":["Added stuff to thing.","Some other stuff."]}}},"Releases":{"2023.5.0":{"Date":"2023-03-23T03:00:00.000Z"}}}');

      expect(result).toEqual(test);
    });

    test('Empty Data', () => {
      let result = helpers.readChangeLogJson('tests/lib/helpers/readChangeLogJsonTestEmptyData.json');
      let test = JSON.parse('{"Changes":{},"Releases":{}}');

      expect(result).toEqual(test);
    });

    test('Empty File', () => {
      let result = helpers.readChangeLogJson('tests/lib/helpers/readChangeLogJsonTestEmptyFile.json');
      let test = JSON.parse('{"Changes":{},"Releases":{}}');

      expect(result).toEqual(test);
    });
  });

  describe('writeToChangeLogJson', () => {
    test('Write String', () => {
      let test = '{"Changes":{"123":{"Release":"2023.4.0","Sections":{"Added":["Added stuff to thing.","Some other stuff."]}}},"Releases":{"2023.5.0":{"Date":"2023-03-23T03:00:00.000Z"}}}';
      helpers.writeToChangeLogJson(test, 'tests/lib/helpers/writeToChangeLogJsonString.json');

      let result = helpers.readChangeLogJson('tests/lib/helpers/writeToChangeLogJsonString.json');
      expect(result).toEqual(JSON.parse(test));
    });

    test('Write Object', () => {
      let test = {"Changes":{"123":{"Release":"2023.4.0","Sections":{"Added":["Added stuff to thing.","Some other stuff."]}}},"Releases":{"2023.5.0":{"Date":"2023-03-23T03:00:00.000Z"}}};
      helpers.writeToChangeLogJson(test, 'tests/lib/helpers/writeToChangeLogJsonString.json');

      let result = helpers.readChangeLogJson('tests/lib/helpers/writeToChangeLogJsonString.json');
      expect(result).toEqual(test);
    });

    test('Error', () => {
      jest.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
        throw new Error("Mock Error.");
      });
      let test = {"Changes":{"123":{"Release":"2023.4.0","Sections":{"Added":["Added stuff to thing.","Some other stuff."]}}},"Releases":{"2023.5.0":{"Date":"2023-03-23T03:00:00.000Z"}}};
      const {err, success} = helpers.writeToChangeLogJson(test, 'tests/lib/helpers/writeToChangeLogJsonStringNo.json');

      expect(err).toMatchObject(Error("Mock Error."));
      expect(success).toBeFalsy();
    });
  });

  describe('promptYesNo', () => {
    // TODO: Figure out how to mock prompt-sync for all these tests.
    test('No TTY True', async () => {
      const consoleSpy = jest.spyOn(console, "warn");
      let tty = null;
      if (process.stdout.isTTY) {
        tty = process.stdout.isTTY;
      }
      process.stdout.isTTY = false;
      let result = helpers.promptYesNo('test');
      expect(result).toBeTruthy();
      expect(consoleSpy).lastCalledWith('Not running in TTY. Using default');
      process.stdout.isTTY = tty;
    });

    test('No TTY False', async () => {
      const consoleSpy = jest.spyOn(console, "warn");
      let tty = null;
      if (process.stdout.isTTY) {
        tty = process.stdout.isTTY;
      }
      process.stdout.isTTY = false;
      let result = helpers.promptYesNo('test', 'N');
      expect(result).toBeFalsy();
      expect(consoleSpy).lastCalledWith('Not running in TTY. Using default');
      process.stdout.isTTY = tty;
    });

    test('Yes', async () => {
      process.stdout.isTTY = true;
      let result = helpers.promptYesNo('test');
      expect(result).toBeTruthy();
      process.stdout.isTTY = false;
    });

    // test('No', () => {
    //   // jest.spyOn(process.stdout, 'isTTY').mockImplementationOnce(() => {return true;})
    //   process.stdout.isTTY = true;
    //   prompt.mockImplementation(() => {
    //     console.log('test');
    //   });
    //   let result = helpers.promptYesNo('test');
    //   expect(result).toBeFalsy();
    //   process.stdout.isTTY = false;
    // });
    //
    // test('Invalid', () => {
    //   // jest.spyOn(process.stdout, 'isTTY').mockImplementationOnce(() => {return true;})
    //   process.stdout.isTTY = true;
    //   prompt.mockReturnValueOnce('t').mockReturnValue('y');
    //   let result = helpers.promptYesNo('test');
    //   expect(result).toBeFalsy();
    //   process.stdout.isTTY = false;
    // });
  });

  describe('buildChangeLogObject', () => {
    test('Build With No Release For Changes', () => {
      let data = {"Changes":{"123":{"Release":"2023.4.0","Sections":{"Added":["Added stuff to thing","Some other stuff."]}}},"Releases":{"2023.5.0":{"Date":"2023-03-23T03:00:00.000Z"}}};

      let result = helpers.buildChangeLogObject(data);

      let test = {
        Releases: {
          "2023.5.0": {
            "Date": "2023-03-23T03:00:00.000Z",

          },
          "2023.4.0": {
            "Date": null,
            "Sections": {
              "Added": {
                "123": [
                  "Added stuff to thing",
                  "Some other stuff",
                ]
              }
            }
          }
        }
      }

      expect(result).toEqual(test);
    });

    test('Build With Release For Changes', () => {
      let data = {"Changes":{"123":{"Release":"2023.5.0","Sections":{"Added":["Added stuff to thing","Some other stuff."]}}},"Releases":{"2023.5.0":{"Date":"2023-03-23T03:00:00.000Z"}}};

      let result = helpers.buildChangeLogObject(data);

      let test = {
        Releases: {
          "2023.5.0": {
            "Date": "2023-03-23T03:00:00.000Z",
            "Sections": {
              "Added": {
                "123": [
                  "Added stuff to thing",
                  "Some other stuff",
                ]
              }
            }
          }
        }
      }

      expect(result).toEqual(test);
    });
  });

  describe('buildChangeLogContent', () => {
    test('Build With No Ref Prefix', () => {
      let data = {
        Releases: {
          "2023.5.0": {
            "Date": "2023-03-24T03:00:00.000Z",
            "Sections": {
              "Added": {
                "123": [
                  "Added stuff to thing",
                  "Some other stuff",
                ]
              }
            }
          }
        }
      }

      let result = helpers.buildChangeLogContent(data)

      expect(result).toEqual('# Changelog\n\n' +
        'All notable changes to this project will be documented in this file.\n\n' +
        'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).\n\n' +
        '## [2023.5.0] - 2023-03-24\n\n' +
        '### Added: \n\n' +
        '- Added stuff to thing. (#123)\n' +
        '- Some other stuff. (#123)\n' +
        '\n\n'
      )
    });

    test('Build With Ref Prefix', () => {
      let data = {
        Releases: {
          "2023.5.0": {
            "Date": "2023-03-24T03:00:00.000Z",
            "Sections": {
              "Added": {
                "123": [
                  "Added stuff to thing",
                  "Some other stuff",
                ]
              }
            }
          }
        }
      }

      let result = helpers.buildChangeLogContent(data, 'https://test.com/MR/')

      expect(result).toEqual('# Changelog\n\n' +
        'All notable changes to this project will be documented in this file.\n\n' +
        'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).\n\n' +
        '## [2023.5.0] - 2023-03-24\n\n' +
        '### Added: \n\n' +
        '- Added stuff to thing. ([#123](https://test.com/MR/123))\n' +
        '- Some other stuff. ([#123](https://test.com/MR/123))\n' +
        '\n\n'
      );
    });

    test('Build With No Date', () => {
      let data = {
        Releases: {
          "2023.5.0": {
            "Sections": {
              "Added": {
                "123": [
                  "Added stuff to thing",
                  "Some other stuff",
                ]
              }
            }
          }
        }
      }

      let result = helpers.buildChangeLogContent(data)

      expect(result).toEqual('# Changelog\n\n' +
        'All notable changes to this project will be documented in this file.\n\n' +
        'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).\n\n' +
        '## [2023.5.0] \n\n' +
        '### Added: \n\n' +
        '- Added stuff to thing. (#123)\n' +
        '- Some other stuff. (#123)\n' +
        '\n\n'
      )
    });
  });

  describe('parseChanges', () => {
    test('Parse', () => {
      let data = '## Added\n' +
        '- v1.1 French translation.\n' +
        '- v1.1 Dutch translation.\n' +
        '- v1.1 Russian translation.\n' +
        '- v1.1 Japanese translation.\n' +
        '\n' +
        '## Removed:\n' +
        '- Tester in action\n' +
        '\n' +
        '\n' +
        '## Fixed\n' +
        '- Testing something here.\n' +
        'Higher hair\n' +
        '  \n' +
        '## Changed';

      let result = helpers.parseChanges(data);
      let test = {
        "Sections": {
          "Added": [
            'v1.1 French translation',
            'v1.1 Dutch translation',
            'v1.1 Russian translation',
            'v1.1 Japanese translation',
          ],
          "Changed": [],
          "Removed": [
            "Tester in action"
          ],
          "Fixed": [
            "Testing something here",
            "Higher hair",
          ],
        }
      }
      expect(result).toEqual(test);
    });
  });

  describe('stripLineContent', () => {
    test('Strip Lines', () => {
      let data = [
        "- test",
        "- test.",
        "  Test:",
        "Test:",
        "  # Test",
        "## Test:",
        "Test",
        "Tested thing",
        " gi ",
        "v1.1 French: translation.",
        "- v1.1 French: translation.",
      ];

      let result = data.map((v) => helpers.stripLineContent(v));

      let test = [
        "test",
        "test",
        "Test",
        "Test",
        "Test",
        "Test",
        "Test",
        "Tested thing",
        "gi",
        "v1.1 French: translation",
        "v1.1 French: translation",
      ];

      expect(result).toEqual(test);
    })
  })
});

afterEach(() => {
  jest.resetAllMocks();

  // Set process arguments back to the original value
  process.argv = originalArgv;
  mockfs.restore();
});