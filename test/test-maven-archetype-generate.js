'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
// var debug = require('debug')('generator-alfresco-common-test:maven-archetype-generate');
var memFs = require('mem-fs');
var memFsEditor = require('mem-fs-editor');
var memFsUtils = require('../index').mem_fs_utils;
var os = require('os');
var path = require('path');

var _sourceArchetypePath = path.join(__dirname, 'fixtures/source-archetype');
var _archetypeMetadataPath = path.join(_sourceArchetypePath, 'META-INF', 'maven', 'archetype-metadata.xml');
var _archetypeResourcesPath = path.join(_sourceArchetypePath, 'archetype-resources');

// var _generatedProjectPath = path.join(__dirname, 'fixtures/generated-project');

describe('generator-alfresco-common:maven-archetype-generate', function () {
  var store = memFs.create();
  var fs = memFsEditor.create(store);
  var tempDir = path.join(os.tmpdir(), 'generated-project');
  var yomock = {
    'fs': fs,
  };

  describe('.generate()', function () {
    before(function (/* done */) {
      var archetypeGenerator = require('../index').maven_archetype_generate(yomock);
      var properties = {
        'groupId': 'my.groupid',
        'artifactId': 'myartifactid',
        'version': '1.0-SNAPSHOT',
        'package': 'my.package',
      };

      archetypeGenerator.generate(
        _archetypeMetadataPath,
        _archetypeResourcesPath,
        tempDir,
        properties
      );

      // Can use the following to write stuff out to disk and visually inspect what is
      // produced. Don't forget to uncomment done in the before() function definition
      // above.

      // debug('LOOKING IN TEMP DIR', tempDir);
      // yomock.fs.commit(done);
    });

    it('copies pom files', function () {
      [
        'pom.xml',
        'myartifactid-repo-amp/pom.xml',
      ].forEach(file => {
        assert.ok(memFsUtils.existsInMemory(yomock.fs, path.join(tempDir, file)));
      });
    });

    it('copies top level files via multiple includes', function () {
      [
        'README.md',
        'run.sh',
      ].forEach(file => {
        assert.ok(memFsUtils.existsInMemory(yomock.fs, path.join(tempDir, file)));
      });
    });

    it('copies files when module has multiple fileset elements', function () {
      [
        'repo/src/main/properties/local/alfresco-global.properties',
        'repo/src/main/properties/local/README.md',
        'repo/src/main/resources/alfresco/extension/dev-log4j.properties',
      ].forEach(file => {
        assert.ok(memFsUtils.existsInMemory(yomock.fs, path.join(tempDir, file)));
      });
    });

    it('copies files with __placeholders__ in the path', function () {
      [
        'myartifactid-repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.desc.xml',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.html.ftl',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.js',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/module/myartifactid-repo-amp/alfresco-global.properties',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/module/myartifactid-repo-amp/context/bootstrap-context.xml',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/module/myartifactid-repo-amp/context/webscript-context.xml',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/module/myartifactid-repo-amp/model/content-model.xml',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/module/myartifactid-repo-amp/module-context.xml',
        'myartifactid-repo-amp/src/main/amp/module.properties',
      ].forEach(file => {
        assert.ok(memFsUtils.existsInMemory(yomock.fs, path.join(tempDir, file)));
      });
    });

    it('copies files that are packaged', function () {
      [
        'myartifactid-repo-amp/src/main/java/my/package/demoamp/Demo.java',
      ].forEach(file => {
        assert.ok(memFsUtils.existsInMemory(yomock.fs, path.join(tempDir, file)));
      });
    });

    it('filters pom.xml files', function () {
      assertFileDoesNotInclude(tempDir, 'pom.xml', [
        '${groupId}',
        '${artifactId}',
        '${version}',
      ]);

      assertFileIncludes(tempDir, 'pom.xml', [
        '<groupId>my.groupid</groupId>',
        '<artifactId>myartifactid</artifactId>',
        '<version>1.0-SNAPSHOT</version>',
      ]);
    });

    it('filters child module pom.xml files', function () {
      assertFileIncludes(tempDir, 'myartifactid-repo-amp/pom.xml', [
        '<artifactId>myartifactid-repo-amp</artifactId>',
      ]);
      assertFileIncludes(tempDir, 'repo/pom.xml', [
        '<artifactId>repo</artifactId>',
      ]);
    });

    it('filtering happens when paths in fileset don\'t have __placeholders__', function () {
      assertFileDoesNotInclude(tempDir, '/repo/src/main/resources/alfresco/extension/dev-log4j.properties',
        'log4j.logger.${package}.demoamp.DemoComponent=${app.log.root.level}'
      );

      assertFileIncludes(tempDir, '/repo/src/main/resources/alfresco/extension/dev-log4j.properties',
        'log4j.logger.my.package.demoamp.DemoComponent=${app.log.root.level}'
      );
    });

    it('filtering happens when paths in fileset have __placeholders__', function () {
      assertFileDoesNotInclude(tempDir, '/myartifactid-repo-amp/src/main/java/my/package/demoamp/Demo.java',
        'package ${package}.demoamp;'
      );

      assertFileIncludes(tempDir, '/myartifactid-repo-amp/src/main/java/my/package/demoamp/Demo.java',
        'package my.package.demoamp;'
      );
    });

    it('adds child modules to parent poms', function () {
      assertFileIncludes(tempDir, 'pom.xml', [
        '<module>myartifactid-repo-amp</module>',
        '<module>repo</module>',
      ]);
    });

    it('does not add modules to poms with no children', function () {
      assertFileDoesNotInclude(tempDir, 'repo/pom.xml', '<modules>');
      assertFileDoesNotInclude(tempDir, 'myartifactid-repo-amp/pom.xml', '<modules>');
    });

    // TODO(bwavell): write a test that compares generated project to fixtures/generated-project
  });

  var assertFileIncludes = function (filePath, fileName, incs) {
    var includes = (Array.isArray(incs) ? incs : [incs]);
    var fileText = yomock.fs.read(path.join(filePath, fileName));
    includes.forEach(include => {
      if (include instanceof RegExp) {
        assert.ok(fileText.match(include));
      } else {
        assert.ok(fileText.includes(include));
      }
    });
  };

  var assertFileDoesNotInclude = function (filePath, fileName, incs) {
    var includes = (Array.isArray(incs) ? incs : [incs]);
    var fileText = yomock.fs.read(path.join(filePath, fileName));
    includes.forEach(include => {
      if (include instanceof RegExp) {
        assert.ok(!fileText.match(include));
      } else {
        assert.ok(!fileText.includes(include));
      }
    });
  };
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
