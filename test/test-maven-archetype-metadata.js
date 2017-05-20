'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var fs = require('fs');
var path = require('path');

var _archetypeMetadataPath = path.join(__dirname, 'fixtures/archetype-metadata.xml');
var archetypeDescriptor = fs.readFileSync(_archetypeMetadataPath, 'utf8');

var _badArchetypeMetadataPath = path.join(__dirname, 'fixtures/bad-archetype-metadata.xml');
var badArchetypeDescriptor = fs.readFileSync(_badArchetypeMetadataPath, 'utf8');

var _emptyArchetypeMetadataPath = path.join(__dirname, 'fixtures/empty-archetype-metadata.xml');
var emptyArchetypeDescriptor = fs.readFileSync(_emptyArchetypeMetadataPath, 'utf8');

var _mostlyEmptyArchetypeMetadataPath = path.join(__dirname, 'fixtures/mostly-empty-archetype-metadata.xml');
var mostlyEmptyArchetypeDescriptor = fs.readFileSync(_mostlyEmptyArchetypeMetadataPath, 'utf8');

describe('generator-alfresco-common:maven-archetype-metadata', function () {
  describe('.getName()', function () {
    it('grabs the right value', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      assert.equal(metadata.getName(), 'example');
    });

    it('throws when there is no data', function () {
      var metadata = require('../index').maven_archetype_metadata(badArchetypeDescriptor);
      assert.throws(() => metadata.getName(), TypeError);
    });
  });

  describe('.isPartial()', function () {
    it('reads a value when it is provided', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      assert.equal(metadata.isPartial(), true);
    });

    it('returns false when invalid partial value is specified', function () {
      var metadata = require('../index').maven_archetype_metadata(badArchetypeDescriptor);
      assert.equal(metadata.isPartial(), false);
    });

    it('returns false when partial is not specified', function () {
      var metadata = require('../index').maven_archetype_metadata(mostlyEmptyArchetypeDescriptor);
      assert.equal(metadata.isPartial(), false);
    });
  });

  describe('.getRequiredProperties()', function () {
    it('handles required property and associated value', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      var props = metadata.getRequiredProperties();
      assert.equal(props['foo'], 'bar');
    });

    it('handles required property when there is no value', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      var props = metadata.getRequiredProperties();
      assert.equal(props['baz'], undefined);
    });

    it('empty object when requiredProperties element is missing', function () {
      var metadata = require('../index').maven_archetype_metadata(emptyArchetypeDescriptor);
      assert.deepEqual(metadata.getRequiredProperties(), {});
    });

    it('empty object when requiredProperties element is empty', function () {
      var metadata = require('../index').maven_archetype_metadata(mostlyEmptyArchetypeDescriptor);
      assert.deepEqual(metadata.getRequiredProperties(), {});
    });
  });

  describe('.getFileSets()', function () {
    it('handles multiple valid fileSet elements', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      var fileSets = metadata.getFileSets();
      assert.equal(fileSets.length, 2);
      assert.deepEqual(fileSets[0], {
        filtered: true,
        packaged: true,
        encoding: 'UTF-8',
        directory: 'src/main/java',
        includes: ['**/*.java', '**/*.class'],
        excludes: ['**/*Test.java'],
      });
      assert.deepEqual(fileSets[1], {
        filtered: false,
        packaged: false,
        encoding: 'UTF-8',
        directory: 'src/main/test',
        includes: ['**/*.properties'],
        excludes: [],
      });
    });

    it('empty list when fileSets element is missing', function () {
      var metadata = require('../index').maven_archetype_metadata(emptyArchetypeDescriptor);
      var fileSets = metadata.getFileSets();
      assert.equal(fileSets.length, 0);
    });

    it('empty list when fileSets element is empty', function () {
      var metadata = require('../index').maven_archetype_metadata(mostlyEmptyArchetypeDescriptor);
      var fileSets = metadata.getFileSets();
      assert.equal(fileSets.length, 0);
    });
  });

  describe('.getModules()', function () {
    it('handles multiple valid module elements', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      var modules = metadata.getModules();
      assert.equal(modules.length, 2);
    });

    it('handles complex module with sub-module', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      var modules = metadata.getModules();
      assert.deepEqual(modules[0], {
        dir: 'one',
        id: 'one',
        name: 'name1',
        fileSets: [{
          filtered: false,
          packaged: true,
          encoding: 'UTF-8',
          directory: 'src/main/resources',
          includes: [],
          excludes: [],
        }],
        modules: [{
          dir: 'sub',
          id: 'sub',
          name: 'sub',
          fileSets: [{
            filtered: true,
            packaged: false,
            encoding: 'UTF-8',
            directory: 'src/main/resources',
            includes: [],
            excludes: [],
          }],
          modules: [],
        }],
      });
    });

    it('handles mostly empty module', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      var modules = metadata.getModules();
      assert.deepEqual(modules[1], {dir: 'two', id: 'two', name: 'name2', fileSets: [], modules: []});
    });

    it('empty list when fileSets element is missing', function () {
      var metadata = require('../index').maven_archetype_metadata(emptyArchetypeDescriptor);
      var modules = metadata.getModules();
      assert.equal(modules.length, 0);
    });

    it('empty list when fileSets element is empty', function () {
      var metadata = require('../index').maven_archetype_metadata(mostlyEmptyArchetypeDescriptor);
      var modules = metadata.getModules();
      assert.equal(modules.length, 0);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
