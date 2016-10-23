# generator-alfresco-common

[![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency Status][bithound-dep-image]][bithound-dep-url] [![Dev Dependency Status][bithound-dev-image]][bithound-dev-url] [![Join the Chat][gitter-image]][gitter-url] [![Quick Contribution on Codenvy][codenvy-image]][codenvy-url]

## Getting Started

### What is [generator-alfresco](https://github.com/binduwavell/generator-alfresco)?

generator-alfresco is a yeoman generator for creating Alfresco SDK projects and subsequently for scaffolding a growing number of common extension points.

### What is this project for?

In this project, we have broken out a bunch of common helper modules that were originally embedded in the generator-alfresco project. By breaking these out, we make them easier to consume for other projects. We also simplify testing for the main project. Following is a summary of the modules included here:

#### alfresco-module-registry

Helpers for managing a list of modules that have been applied to one of our projects in the `.yo-rc.json` file. We use this to keep track of if modules are amps or jars, if they are local or remote, etc.

#### constants

Constants used by our generators.

#### dependency-versions

Code that allows us to detect the version of Maven and Java on a machine. We use this to block folks from creating an SDK project if said project will not run in the current environment.

#### generator-output

Some simple methods for logging consistently.

#### java-properties

Provides methods for reading, modifying and writing Java properties files. This is by no means a complete impelemntation of the properties file spect, but it's enough for our generators at this time.

#### maven-pom

Helpers for reading, modifying and writing Maven POM files.

#### mem-fs-utils

A few utilities that add to the `mem-fs` tool used by yeoman.

#### prompt-filters

Common filters for prompting.

#### prompt-validators

Common validators for prompting.

#### spring-context

Provides methods for reading, modifying and writing Springframework context files.

#### tomcat-context

Provides methods for reading, modifying and writing Tomcat context files.

#### xml-dom-utils

A few utilities that add to the `xmldom` module we use for XML handling.

## Getting Help

If you find a bug or something is confusing, you can review [existing](https://github.com/binduwavell/generator-alfresco/issues) or create a [new issue](https://github.com/binduwavell/generator-alfresco/issues/new). If you'd like to chat, you can reach out on our [Gitter](https://gitter.im/binduwavell/generator-alfresco) channel.

## License

Apache 2.0

[travis-image]: https://img.shields.io/travis/binduwavell/generator-alfresco-common/master.svg
[travis-url]: https://travis-ci.org/binduwavell/generator-alfresco-common
[bithound-dep-image]: https://www.bithound.io/github/binduwavell/generator-alfresco-common/badges/dependencies.svg
[bithound-dep-url]: https://www.bithound.io/github/binduwavell/generator-alfresco-common/master/dependencies/npm
[bithound-dev-image]: https://www.bithound.io/github/binduwavell/generator-alfresco-common/badges/devDependencies.svg
[bithound-dev-url]: https://www.bithound.io/github/binduwavell/generator-alfresco-common/master/dependencies/npm
[codecov-image]: https://codecov.io/github/binduwavell/generator-alfresco-common/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/binduwavell/generator-alfresco-common?branch=master
[coveralls-image]: https://coveralls.io/repos/binduwavell/generator-alfresco-common/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/binduwavell/generator-alfresco-common?branch=master
[gitter-image]: https://img.shields.io/badge/gitter-join%20chat%20%E2%86%92-brightgreen.svg
[gitter-url]: https://gitter.im/binduwavell/generator-alfresco?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
