'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var fileFiltering = require('../index').maven_archetype_file_filtering;

describe('generator-alfresco-common:maven-archetype-file-filtering', function () {
  describe('.filter()', function () {
    it('passes through normal text', function () {
      var unchanged = 'unchanged';
      assert.strictEqual(fileFiltering.filter(unchanged), unchanged);
    });

    it('renames properties', function () {
      var input = 'X${property}X';
      var output = 'XvalueX';
      assert.strictEqual(fileFiltering.filter(input, { property: 'value' }), output);
    });

    it('handles the set directive with bare reference', function () {
      var input = [
        '#set($keyword="value")',
        'X $keyword X',
      ].join('\n');
      var output = 'X value X';
      assert.strictEqual(fileFiltering.filter(input), output);
    });

    it('handles the set directive with bracketed reference', function () {
      var input = [
        '#set($keyword="value")',
        'X${keyword}X',
      ].join('\n');
      var output = 'XvalueX';
      assert.strictEqual(fileFiltering.filter(input), output);
    });

    it('does not apply set values before they are defined but does apply them afterward', function () {
      var input = [
        'X${keyword}X',
        '#set($keyword="value")',
        'X${keyword}X',
      ].join('\n');
      var output = 'X${keyword}X\nXvalueX';
      assert.strictEqual(fileFiltering.filter(input), output);
    });

    it('handles properties and the set directive', function () {
      var input = [
        '#set($symbol_dollar="$")',
        '${symbol_dollar}${keyword}',
      ].join('\n');
      var output = '$value';
      assert.strictEqual(fileFiltering.filter(input, { keyword: 'value' }), output);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
