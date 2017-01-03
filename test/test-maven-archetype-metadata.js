'use strict';
/* eslint-env node, mocha */
var assert = require('assert');

var archetypeDescriptor = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<archetype-descriptor xmlns="http://maven.apache.org/plugins/maven-archetype-plugin/archetype-descriptor/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/plugins/maven-archetype-plugin/archetype-descriptor/1.0.0 http://maven.apache.org/xsd/archetype-descriptor-1.0.0.xsd" name="example" partial="true">',
  '  <requiredProperties>',
  '    <requiredProperty key="foo">',
  '      <defaultValue>bar</defaultValue>',
  '    </requiredProperty>',
  '    <requiredProperty key="baz" />',
  '  </requiredProperties>',
  '  <fileSets>',
  '    <fileSet filtered="true" packaged="true" encoding="UTF-8">',
  '      <directory>src/main/java</directory>',
  '      <includes>',
  '        <include>**/*.java</include>',
  '        <include>**/*.class</include>',
  '      </includes>',
  '      <excludes>',
  '        <exclude>**/*Test.java</exclude>',
  '      </excludes>',
  '    </fileSet>',
  '    <fileSet filtered="false" packaged="false" encoding="UTF-8">',
  '      <directory>src/main/test</directory>',
  '      <includes>',
  '        <include>**/*.properties</include>',
  '      </includes>',
  '    </fileSet>',
  '  </fileSets>',
  '  <modules>',
  '    <module dir="one" id="one" name="name1">',
  '      <fileSets>',
  '        <fileSet packaged="true" filtered="false" encoding="UTF-8">',
  '          <directory>src/main/resources</directory>',
  '        </fileSet>',
  '      </fileSets>',
  '      <modules>',
  '        <module name="sub" dir="sub" id="sub">',
  '          <fileSets>',
  '            <fileSet packaged="false" filtered="true" encoding="UTF-8">',
  '              <directory>src/main/resources</directory>',
  '            </fileSet>',
  '          </fileSets>',
  '        </module>',
  '      </modules>',
  '    </module>',
  '    <module dir="two" id="two" name="name2">',
  '    </module>',
  '  </modules>',
  '</archetype-descriptor>',
].join('\n');

describe('generator-alfresco-common:maven-archetype-metadata', function () {
  describe('.getName()', function () {
    it('happy path', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      assert.equal(metadata.getName(), 'example');
    });
  });

  describe('.isPartial()', function () {
    it('happy path', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      assert.equal(metadata.isPartial(), true);
    });
  });

  describe('.getRequiredProperties()', function () {
    it('happy path', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      var props = metadata.getRequiredProperties();
      assert.equal(props['foo'], 'bar');
      assert.equal(props['baz'], undefined);
    });
    it('no requiredProperties', function () {
      var desc = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<archetype-descriptor xmlns="http://maven.apache.org/plugins/maven-archetype-plugin/archetype-descriptor/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/plugins/maven-archetype-plugin/archetype-descriptor/1.0.0 http://maven.apache.org/xsd/archetype-descriptor-1.0.0.xsd" name="example" partial="true">',
        '</archetype-descriptor>',
      ].join('\n');
      var metadata = require('../index').maven_archetype_metadata(desc);
      assert.deepEqual(metadata.getRequiredProperties(), {});
    });
    it('empty requiredProperties', function () {
      var desc = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<archetype-descriptor xmlns="http://maven.apache.org/plugins/maven-archetype-plugin/archetype-descriptor/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/plugins/maven-archetype-plugin/archetype-descriptor/1.0.0 http://maven.apache.org/xsd/archetype-descriptor-1.0.0.xsd" name="example" partial="true">',
        '  <requiredProperties>',
        '  </requiredProperties>',
        '</archetype-descriptor>',
      ].join('\n');
      var metadata = require('../index').maven_archetype_metadata(desc);
      assert.deepEqual(metadata.getRequiredProperties(), {});
    });
  });

  describe('.getFileSets()', function () {
    it('happy path', function () {
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
  });

  describe('.getModules()', function () {
    it('happy path', function () {
      var metadata = require('../index').maven_archetype_metadata(archetypeDescriptor);
      var modules = metadata.getModules();
      assert.equal(modules.length, 2);
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
      assert.deepEqual(modules[1], {dir: 'two', id: 'two', name: 'name2', fileSets: [], modules: []});
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
