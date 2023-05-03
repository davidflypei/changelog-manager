# Changelog Manager
[![codecov](https://codecov.io/gh/davidflypei/changelog-manager/branch/main/graph/badge.svg?token=PSG95T7V1C)](https://codecov.io/gh/davidflypei/changelog-manager)
[![CI](https://github.com/davidflypei/changelog-manager/actions/workflows/main.yml/badge.svg)](https://github.com/davidflypei/changelog-manager/actions/workflows/main.yml)

This tool allows you to manage a changelog with the use of a changes file and JSON to store changes to be built into a changelog.

## Installation
Installing is as easy and running:
```bash
npm install -g @greathobbies/changelog-manager
```

## Usage

First run the init command to initialise the directories and config.
```bash
changelog-manager init
```

This will initialise the .changelog-manager directory, the entry directories and the config file. You can then use the manager as per below. 

```bash
changelog-manager [command] [options]
```

## Commands
### init

Initialises the directories and config.

```bash
changelog-manager init [options]
```

| Option       | Description                                                       | Required           |
|--------------|-------------------------------------------------------------------|--------------------|

### changes add

Parses and saves content from changes file to a change json file.

```bash
changelog-manager changes add <ID> [options]
```

| Option       | Description                                                       | Required           |
|--------------|-------------------------------------------------------------------|--------------------|
| ID           | Reference value. Typically MR number.                             | :heavy_check_mark: |
| --issues     | Issue numbers associated with change. Comma separated.            | :x:                |
| -r [release] | The release to add the changes to.                                | :x:                |
| -i [file]    | The changes file to add changes from.                             | :x:                |
| -s           | Strict mode. Returns an error if there are non standard sections. | :x:                |

### releases add

Adds release entry.

```bash
changelog-manager releases add <release> [options]
```

| Option    | Description              | Required           |
|-----------|--------------------------|--------------------|
| release   | Release name. E.g. 1.1.0 | :heavy_check_mark: |
| -d [date] | Date of release          | :x:                |

### releases set

Sets a release to a change or all changes with no release.

```bash
changelog-manager releases set <release> [options]
```

| Option      | Description                                                                | Required           |
|-------------|----------------------------------------------------------------------------|--------------------|
| release     | Release to set change(s) to.                                               | :heavy_check_mark: |
| -c [change] | Change to set release to. Don't set to set all changes without a release.  | :x:                |

### releases remove

Removes a release from the changelog json file.

```bash
changelog-manager releases remove <release> [options]
```

| Option   | Description         | Required            |
|----------|---------------------|---------------------|
| release  | Release to delete.  | :heavy_check_mark:  |

### build

Builds the changelog from the change JSON files.

```bash
changelog-manager build [options]
```

| Option            | Description                                                            | Required |
|-------------------|------------------------------------------------------------------------|----------|
| --header [string] | Use to replace default header text or set false to leave empty header. | :x:      |
| -o [file]         | Output changelog file.                                                 | :x:      |
| -l [url]          | Issue link prefix. Change issues get appended to this.                 | :x:      |

### cat

Builds and cats the changelog.

```bash
changelog-manager cat [options]
```

| Option          | Description                                                            | Required |
|-----------------|------------------------------------------------------------------------|----------|
| -l [url]        | Issue link prefix. Change issues get appended to this.                 | :x:      |
| -r [release]    | Output specific release.                                               | :x:      |
| --header [text] | Use to replace default header text or set false to leave empty header. | :x:      |

# Config
The config file is located under the `.changelog-manager` directory.

| Setting       | Description                                                                   | Default                                                                                                                                               |
|---------------|-------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| IssuesLink    | The prefix link for issues if `-l` isn't set in a command.                    | ""                                                                                                                                                    |
| HeaderContent | The header content that is placed between `Changelog` and the latest release. | All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). |