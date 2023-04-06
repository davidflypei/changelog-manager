# Changelog Manager
[![codecov](https://codecov.io/gh/davidflypei/changelog-manager/branch/main/graph/badge.svg?token=PSG95T7V1C)](https://codecov.io/gh/davidflypei/changelog-manager)
[![CI](https://github.com/davidflypei/changelog-manager/actions/workflows/main.yml/badge.svg)](https://github.com/davidflypei/changelog-manager/actions/workflows/main.yml)

This tool allows you to manage a changelog with the use of a changes file and JSON to store changes to be built into a changelog.

## Installation

```bash
npm install -g @greathobbies/changelog-manager
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
| -n [value] | Reference value. Typically MR number. | :heavy_check_mark: |
| -r [release] | The release to add the changes to. | :x: |
| -i [file] | The changes file to add changes from. | :x: |
| -o [file] | The changelog json file to add changes to. | :x: |
| -s | Strict mode. Returns an error if there are non standard sections. | :x: |

### releases add

Adds a release to the changelog json file.

```bash
changelog-manager releases add [options]
```

| Option | Description | Required |
| --- | --- | --- |
| -r [release] | Release value | :heavy_check_mark: |
| -d [date] | Date of release | :x: |
| -o [file] | The changelog json file. | :x: |

### releases set

Sets a release to a change or all changes with no release.

```bash
changelog-manager releases set <release> [options]
```

| Option | Description | Required |
| --- | --- | --- |
| -c [change] | Change to set release to. Don't set to set all changes without a release. | :x: |
| -o [file] | The changelog json file. | :x: |

### releases remove

Removes a release from the changelog json file.

```bash
changelog-manager releases remove <release> [options]
```

| Option | Description | Required |
| --- | --- | --- |
| -f [file] | Changelog JSON file. | :x: |
| -r | Recursive. Removes all changes associated to release. | :x: |

### build

Builds the changelog from the changelog json file.

```bash
changelog-manager build [options]
```

| Option | Description | Required |
| --- | --- | --- |
| -i [file] | Changelog JSON file. | :x: |
| -o [file] | Output changelog file. | :x: |
| -l [url] | Reference link prefix. Change reference gets appended to this. | :x: |

### cat

Cats the changelog from the changelog json file.

```bash
changelog-manager cat [options]
```

| Option | Description | Required |
| --- | --- | --- |
| -i [file] | Changelog JSON file. | :x: |
| -l [url] | Reference link prefix. Change reference gets appended to this. | :x: |
| -r [release] | Output specific release. | :x: |
| --header [text] | Use to replace default header text or set false to leave empty header. | :x: |