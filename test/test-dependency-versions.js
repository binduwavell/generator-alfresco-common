'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var dependencyVersions = require('../index').dependency_versions;

describe('generator-alfresco-common:dependency-versions', function () {
  describe('.getJavaVersion()', function () {
    this.timeout(10000);

    it('gets a java version with JAVA_HOME', function () {
      var javaHome = process.env.JAVA_HOME;
      if (javaHome) {
        var ver = dependencyVersions.getJavaVersion();
        assert.ok(ver);
      } else {
        console.log('WARNING: JAVA_HOME not set, test skipped');
      }
    });

    it('gets a java version without JAVA_HOME', function () {
      var javaHome = process.env.JAVA_HOME;
      if (javaHome) {
        delete process.env.JAVA_HOME;
        var ver = dependencyVersions.getJavaVersion();
        process.env.JAVA_HOME = javaHome;
        assert.ok(ver);
      } else {
        console.log('WARNING: JAVA_HOME not set, test skipped');
      }
    });

    it('does not get a java version if bad cmd is provided', function () {
      var ver = dependencyVersions.getJavaVersion('asdfASDF');
      assert.strictEqual(ver, undefined);
    });
  });

  describe('.getMavenVersion()', function () {
    it('gets a maven version with default mvn', function () {
      var ver = dependencyVersions.getMavenVersion();
      assert.ok(ver);
    });

    it('does not get a maven version if bad cmd is provided', function () {
      var ver = dependencyVersions.getMavenVersion('asdfASDF');
      assert.strictEqual(ver, undefined);
    });

    it('does not get a maven version if cmd with incompatible version string is provided', function () {
      var ver = dependencyVersions.getMavenVersion('/bin/bash');
      assert.strictEqual(ver, undefined);
    });

    it('does not get a maven version if bad M2_HOME is provided', function () {
      var m2Home = process.env.M2_HOME;
      process.env.M2_HOME = 'asdfASDF';
      var ver = dependencyVersions.getMavenVersion('/bin/bash');
      if (m2Home) {
        process.env.M2_HOME = m2Home;
      } else {
        delete process.env.M2_HOME;
      }
      assert.strictEqual(ver, undefined);
    });
  });

  describe('.getRegExpMatchFromProcessOutput()', function () {
    // Assumes /bin/bash is installed on the test system
    it('gets a bash version', function () {
      // GNU bash, version 3.2.57(1)-release (x86_64-apple-darwin15)
      var match = dependencyVersions.getRegExpMatchFromProcessOutput(
        '/bin/bash',
        ['-version'],
        /^.*bash.*version ([0-9.]*)/
      );
      assert.ok(match);
    });

    // Assumes no process called asdfASDF can be found
    it('does not get a version if a bad cmd is provided', function () {
      // GNU bash, version 3.2.57(1)-release (x86_64-apple-darwin15)
      var match = dependencyVersions.getRegExpMatchFromProcessOutput(
        'asdfASDF',
        ['-version'],
        /^.*bash.*version ([0-9.]*)/
      );
      assert.strictEqual(match, undefined);
    });

    // Assumes /bin/echo is installed on the test system
    it('does not get a version if no version is found', function () {
      // GNU bash, version 3.2.57(1)-release (x86_64-apple-darwin15)
      var match = dependencyVersions.getRegExpMatchFromProcessOutput(
        '/bin/echo',
        ['-version'],
        /^.*bash.*version ([0-9.]*)/
      );
      assert.strictEqual(match, undefined);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
