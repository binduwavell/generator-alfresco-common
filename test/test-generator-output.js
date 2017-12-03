'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var stripAnsi = require('strip-ansi');

describe('generator-alfresco-common:generator-output', function () {
  beforeEach(function () {
    this.msg = '';
    this.logmock = {
      log: function (message) {
        if (this.msg) {
          this.msg += '\n';
        }
        this.msg += message;
      }.bind(this),
      get: function () {
        return this.msg;
      }.bind(this),
    };
  });

  it('can provide info', function () {
    var out = require('../index').generator_output(this.logmock);
    out.info('HELLO');
    assert.equal(stripAnsi(this.logmock.get()), 'INFO: HELLO');
  });

  it('can warn or issues', function () {
    var out = require('../index').generator_output(this.logmock);
    out.warn('WORLD');
    assert.equal(stripAnsi(this.logmock.get()), 'WARN: WORLD');
  });

  it('can error out', function () {
    var out = require('../index').generator_output(this.logmock);
    out.error('OBLITERATION!');
    assert.equal(stripAnsi(this.logmock.get()), 'ERROR: OBLITERATION!');
  });

  it('does not display anything when docs is called without arguments', function () {
    var out = require('../index').generator_output(this.logmock);
    out.docs();
    assert.equal(this.logmock.get(), '');
  });

  it('can display documentation without a link', function () {
    var out = require('../index').generator_output(this.logmock);
    out.docs('useful info');
    assert.equal(stripAnsi(this.logmock.get()), 'useful info');
  });

  it('can display a link without documentation', function () {
    var out = require('../index').generator_output(this.logmock);
    out.docs(undefined, 'link');
    assert.equal(stripAnsi(this.logmock.get()), 'See: link');
  });

  it('can display documentation with a link', function () {
    var out = require('../index').generator_output(this.logmock);
    out.docs('useful info', 'link');
    assert.equal(stripAnsi(this.logmock.get()), 'useful info\nSee: link');
  });

  it('can display multi-line documentation', function () {
    var out = require('../index').generator_output(this.logmock);
    out.docs(['useful', 'info']);
    assert.equal(stripAnsi(this.logmock.get()), 'useful\n\ninfo');
  });

  it('can provide a definition', function () {
    var out = require('../index').generator_output(this.logmock);
    out.definition('example', 'this is an example.');
    assert.equal(stripAnsi(this.logmock.get()), 'example: this is an example.');
  });

  it('can produce a color banner', function () {
    var out = require('../index').generator_output(this.logmock);
    assert.equal(stripAnsi(out.bannerText()), out.rawBannerText());
  });

  it('can produce a fancy banner', function () {
    var out = require('../index').generator_output(this.logmock);
    out.banner('    ', 120);
    assert.equal(stripAnsi(this.logmock.get()), out.rawBannerText());
  });

  it('can produce a fancy logo', function () {
    var out = require('../index').generator_output(this.logmock);
    out.banner('    ', 100);
    assert.equal(stripAnsi(this.logmock.get()), out.rawLogoText());
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
