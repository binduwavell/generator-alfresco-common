'use strict';
/* eslint-env node, mocha */
var assert = require('assert');

describe('generator-alfresco-common:maven-archetype-generate', function () {
  var yomock = {
    'config': {
      'get': function (key) { return undefined },
      'set': function (key, value) { },
    },
  };

  describe('.generate()', function () {
    it('handles the happy path', function () {
      var archetypeGenerator = require('../index').maven_archetype_generate(yomock);
      assert.ok(archetypeGenerator.generate());
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
