# Test Fixtures

Following is a summary of fixture information we use for tests in generator-alfresco-common.

## archetype-metadata.xml

This file is used to validate happy-path condition for the maven-archetype-metadata module
but we don't actually perform generation using this file.

## bad-archetype-metadata.xml

This file is used to validate exception handling for the maven-archetype-metadata module but
we don't actually perform generation using this file.

- No name attribute
- Partial attribute is invalid

## empty-archetype-metadata.xml

This file is used to validate exception handling for the maven-archetype-metadata module in cases
where expected root attributes and elements are missing. We don't actually perform generation
using this file.

- No root attributes
- No root elements

## mostly-empty-archetype-metadata.xml

This file is used to validate exception handling for the maven-archetype-metadata module in cases
where expected items in root elements are missing. We don't actually perform generation using this
file.

- No root attributes
- Empty root elements

## source-archetype

This is an exploded alfresco all in one archetype that has had a bunch of items removed. The
key here is to keep all of the unique features used by these archetypes but not have too much
duplication so there is less to maintain over time.

## generated-project

This is what we think should be produced when running `archetype:generate` on a project using
the `source-archetype` specification. This is used to validate the archetype generation code.

This is generated assuming the following inputs the the archetype generation process:

- groupId: my.groupid
- artifactId: myartifactid
- version: 1.0-SNAPSHOT
- package: my.package
