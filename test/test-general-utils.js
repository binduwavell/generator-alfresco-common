'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var utils = require('../index').general_utils;

describe('generator-alfresco-common:general-utils', function () {
  describe('toBoolean()', function () {
    it('handles no input', function () {
      assert.equal(undefined, utils.toBoolean());
    });
    it('handles false', function () {
      assert.equal(false, utils.toBoolean(false));
    });
    it('handles true', function () {
      assert.equal(true, utils.toBoolean(true));
    });
    it('handles 0', function () {
      assert.equal(false, utils.toBoolean(0));
    });
    it('handles 1', function () {
      assert.equal(true, utils.toBoolean(1));
    });
    it('handles "0"', function () {
      assert.equal(false, utils.toBoolean('0'));
    });
    it('handles "1"', function () {
      assert.equal(true, utils.toBoolean('1'));
    });
    it('handles "false"', function () {
      assert.equal(false, utils.toBoolean('false'));
    });
    it('handles "true"', function () {
      assert.equal(true, utils.toBoolean('true'));
    });
    it('handles "FaLsE"', function () {
      assert.equal(false, utils.toBoolean('FaLsE'));
    });
    it('handles "TrUe"', function () {
      assert.equal(true, utils.toBoolean('TrUe'));
    });
    it('uses def with undefined input', function () {
      assert.equal('DEFAULT', utils.toBoolean(undefined, 'DEFAULT'));
    });
    it('uses def with NaN input', function () {
      assert.equal('DEFAULT', utils.toBoolean(NaN, 'DEFAULT'));
    });
    it('uses def with object input', function () {
      assert.equal('DEFAULT', utils.toBoolean({}, 'DEFAULT'));
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
