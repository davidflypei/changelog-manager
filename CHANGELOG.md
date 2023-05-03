# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.0.0] - 2023-05-03

### Added: 

- Added links to issues instead of links to merge requests.
- Added config file.
- Added an init command to initialize the required folders and config file.

### Changed: 

- Changed from using a single json file to using a json file for each change due to issues with conflicts when merging.


## [1.1.2] - 2023-04-26

### Fixed: 

- Fixed multiple changes in one release section not working.


## [1.1.1] - 2023-04-21

### Fixed: 

- Issue with release with no sections crashing.
- Issue with releases set command.


## [1.1.0] - 2023-04-06

### Added: 

- Added Release set command, so you can bulk set releases on changes.

### Changed: 

- If you use -d on releases add it will now set the release date.


## [1.0.1] - 2023-04-04

### Fixed: 

- Fixed release action.
- Fixed build and cat outputting empty sections.


## [1.0.0] - 2023-04-04

### Added: 

- Changes add command.
- Releases add command.
- Releases remove command.
- Build command.
- Cat command.


