'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var pathFiltering = require('../index').maven_archetype_path_filtering;

describe('generator-alfresco-common:maven-archetype-path-filtering', function () {
  describe('.filter()', function () {
    it('passes through normal text', function () {
      var unchanged = 'unchanged';
      assert.strictEqual(pathFiltering.filter(unchanged), unchanged);
    });

    it('handles single instance replacement', function () {
      var input = '__placeholder__';
      var output = 'value';
      assert.strictEqual(pathFiltering.filter(input, { placeholder: 'value' }), output);
    });

    it('handles single instance with multiple path elements', function () {
      var input = '/before/__placeholder__/after';
      var output = '/before/ministry/of/magic/after';
      assert.strictEqual(pathFiltering.filter(input, { placeholder: 'ministry/of/magic' }), output);
    });

    it('handles multi instance replacement', function () {
      var input = '/__placeholder1__/__placeholder2__';
      var properties = {
        placeholder1: 'foo',
        placeholder2: 'bar',
      };
      var output = '/foo/bar';
      assert.strictEqual(pathFiltering.filter(input, properties), output);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
