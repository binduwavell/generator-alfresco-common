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
  var yomock = {
    'fs': fs,
  };

  describe('.generate()', function () {
    it('handles fixture archetype', function (/* done */) {
      var archetypeGenerator = require('../index').maven_archetype_generate(yomock);
      var properties = {
        'groupId': 'my.groupid',
        'artifactId': 'myartifactid',
        'version': '1.0-SNAPSHOT',
        'package': 'my.package',
      };
      var tempDir = path.join(os.tmpdir(), 'generated-project');

      archetypeGenerator.generate(
        _archetypeMetadataPath,
        _archetypeResourcesPath,
        tempDir,
        properties
      );

      // Can use the following to write stuff out to disk and visually inspect what is
      // produced. Don't forget to uncomment done in the it() function definition above.

      // debug('LOOKING IN TEMP DIR', tempDir);
      // yomock.fs.commit(done);

      [
        'pom.xml',
        'README.md',
        'run.sh',
        'myartifactid-repo-amp/pom.xml',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.desc.xml',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.html.ftl',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.js',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/module/myartifactid-repo-amp/alfresco-global.properties',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/module/myartifactid-repo-amp/context/bootstrap-context.xml',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/module/myartifactid-repo-amp/context/webscript-context.xml',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/module/myartifactid-repo-amp/model/content-model.xml',
        'myartifactid-repo-amp/src/main/amp/config/alfresco/module/myartifactid-repo-amp/module-context.xml',
        'myartifactid-repo-amp/src/main/amp/module.properties',
        'myartifactid-repo-amp/src/main/java/my/package/demoamp/Demo.java',
        'repo/src/main/properties/local/alfresco-global.properties',
        'repo/src/main/properties/local/README.md',
        'repo/src/main/resources/alfresco/extension/dev-log4j.properties',
      ].forEach(file => {
        assert.ok(memFsUtils.existsInMemory(yomock.fs, path.join(tempDir, file)));
      });

      // TODO(bwavell): Test file contents have been filtered or not as expected
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
