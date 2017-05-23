'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var pathFiltering = require('../index').maven_archetype_path_filtering;

describe('generator-alfresco-common:maven-archetype-path-filtering', function () {
  describe('.filter()', function () {
    it('passes through normal text', function () {
      var unchanged = 'unchanged';
      assert.equal(pathFiltering.filter(unchanged), unchanged);
    });

    it('handles single instance replacement', function () {
      var input = '__placeholder__';
      var output = 'value';
      assert.equal(pathFiltering.filter(input, {placeholder: 'value'}), output);
    });

    it('handles multi instance replacement', function () {
      var input = '/__placeholder1__/__placeholder2__';
      var properties = {
        placeholder1: 'foo',
        placeholder2: 'bar',
      };
      var output = '/foo/bar';
      assert.equal(pathFiltering.filter(input, properties), output);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
