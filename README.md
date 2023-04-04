# Changelog Manager
[![codecov](https://codecov.io/gh/davidflypei/changelog-manager/branch/main/graph/badge.svg?token=PSG95T7V1C)](https://codecov.io/gh/davidflypei/changelog-manager)
[![CI](https://github.com/davidflypei/changelog-manager/actions/workflows/main.yml/badge.svg)](https://github.com/davidflypei/changelog-manager/actions/workflows/main.yml)

This tool allows you to manage a changelog with the use of a changes file and JSON to store changes to be built into a changelog.

## Installation

```bash
npm install -g changelog-manager
```

## Usage

```bash
changelog-manager [command] [options]
```

## Commands

### changes add

Add changes from the changes file to the changelog json file.

```bash
changelog-manager changes add [options]
```

| Option | Description | Required |
| --- | --- | --- |
| -f, --file [file] | The changes file to add changes from. |
| -r, --release [release] | The release to add the changes to. |

### releases add

Adds a release to the changelog json file.

```bash
changelog-manager releases add [options]
```

### releases remove

Removes a release from the changelog json file.

```bash
changelog-manager releases remove [options]
```

### build

Builds the changelog from the changelog json file.

```bash
changelog-manager build [options]
```

