'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var filters = require('../index').prompt_filters;

describe('generator-alfresco-common:prompt-filters', function () {
  describe('.booleanFilter()', function () {
    it('handles invalid input', function () {
      assert.strictEqual(filters.booleanFilter(undefined), undefined);
      assert.strictEqual(filters.booleanFilter(null), undefined);
      assert.strictEqual(filters.booleanFilter({}), undefined);
    });

    it('handles falsey input', function () {
      assert.strictEqual(filters.booleanFilter(false), false);
      assert.strictEqual(filters.booleanFilter('false'), false);
    });

    it('handles truthey input', function () {
      assert.strictEqual(filters.booleanFilter(true), true);
      assert.strictEqual(filters.booleanFilter('true'), true);
    });
  });

  describe('.booleanTextFilter()', function () {
    it('handles invalid input', function () {
      assert.strictEqual(filters.booleanTextFilter(undefined), undefined);
      assert.strictEqual(filters.booleanTextFilter(null), undefined);
      assert.strictEqual(filters.booleanTextFilter({}), undefined);
    });

    it('handles falsey input', function () {
      assert.strictEqual(filters.booleanTextFilter(undefined), undefined);
      assert.strictEqual(filters.booleanTextFilter(false), 'false');
      assert.strictEqual(filters.booleanTextFilter('false'), 'false');
    });

    it('handles truthey input', function () {
      assert.strictEqual(filters.booleanTextFilter(true), 'true');
      assert.strictEqual(filters.booleanTextFilter('true'), 'true');
    });
  });

  describe('.chooseOneFilter()', function () {
    it('detects invalid input', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.chooseOneFilter(undefined, choices), undefined);
      assert.strictEqual(filters.chooseOneFilter(null, choices), undefined);
      assert.strictEqual(filters.chooseOneFilter('', choices), undefined);
      assert.strictEqual(filters.chooseOneFilter(true, choices), undefined);
      assert.strictEqual(filters.chooseOneFilter(false, choices), undefined);
      assert.strictEqual(filters.chooseOneFilter('four', choices), undefined);
      assert.strictEqual(filters.chooseOneFilter('O', choices), undefined);
      assert.strictEqual(filters.chooseOneFilter('twobyfour', choices), undefined);
    });

    it('handles exact match for first item in list in case insensitive manner', function () {
      var choices = ['One', 'two', 'three'];
      assert.strictEqual(filters.chooseOneFilter('one', choices), 'One');
      assert.strictEqual(filters.chooseOneFilter('One', choices), 'One');
    });

    it('handles exact match for middle item in list in case insensitive manner', function () {
      var choices = ['one', 'twO', 'three'];
      assert.strictEqual(filters.chooseOneFilter('twO', choices), 'twO');
      assert.strictEqual(filters.chooseOneFilter('tWo', choices), 'twO');
    });

    it('handles exact matche for last item in list', function () {
      var choices = ['one', 'two', 'threE'];
      assert.strictEqual(filters.chooseOneFilter('three', choices), 'threE');
      assert.strictEqual(filters.chooseOneFilter('threE', choices), 'threE');
    });
  });

  describe('.chooseOneFilterFactory()', function () {
    it('detects invalid input', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.chooseOneFilterFactory(choices)(undefined), undefined);
      assert.strictEqual(filters.chooseOneFilterFactory(choices)(null), undefined);
      assert.strictEqual(filters.chooseOneFilterFactory(choices)(''), undefined);
      assert.strictEqual(filters.chooseOneFilterFactory(choices)(true), undefined);
      assert.strictEqual(filters.chooseOneFilterFactory(choices)(false), undefined);
      assert.strictEqual(filters.chooseOneFilterFactory(choices)('four'), undefined);
      assert.strictEqual(filters.chooseOneFilterFactory(choices)('O'), undefined);
      assert.strictEqual(filters.chooseOneFilterFactory(choices)('twobyfour'), undefined);
    });

    it('handles exact match for first item in list in case insensitive manner', function () {
      var choices = ['One', 'two', 'three'];
      assert.strictEqual(filters.chooseOneFilterFactory(choices)('one'), 'One');
      assert.strictEqual(filters.chooseOneFilterFactory(choices)('One'), 'One');
    });

    it('handles exact match for middle item in list in case insensitive manner', function () {
      var choices = ['one', 'twO', 'three'];
      assert.strictEqual(filters.chooseOneFilterFactory(choices)('twO'), 'twO');
      assert.strictEqual(filters.chooseOneFilterFactory(choices)('tWo'), 'twO');
    });

    it('handles exact matche for last item in list', function () {
      var choices = ['one', 'two', 'threE'];
      assert.strictEqual(filters.chooseOneFilterFactory(choices)('three'), 'threE');
      assert.strictEqual(filters.chooseOneFilterFactory(choices)('threE'), 'threE');
    });
  });

  describe('.chooseOneMapFilter()', function () {
    it('detects invalid input', function () {
      var choices = { 'one': 'won', 'two': 'tew', 'three': 'trEe' };
      assert.strictEqual(filters.chooseOneMapFilter(undefined, choices), undefined);
      assert.strictEqual(filters.chooseOneMapFilter(null, choices), undefined);
      assert.strictEqual(filters.chooseOneMapFilter('', choices), undefined);
      assert.strictEqual(filters.chooseOneMapFilter(true, choices), undefined);
      assert.strictEqual(filters.chooseOneMapFilter(false, choices), undefined);
      assert.strictEqual(filters.chooseOneMapFilter('four', choices), undefined);
      assert.strictEqual(filters.chooseOneMapFilter('twobyfour', choices), undefined);
    });

    it('handles exact match for first item in list in case insensitive manner', function () {
      var choices = { 'one': 'won', 'two': 'tew', 'three': 'trEe' };
      assert.strictEqual(filters.chooseOneMapFilter('one', choices), 'won');
      assert.strictEqual(filters.chooseOneMapFilter('One', choices), 'won');
      assert.strictEqual(filters.chooseOneMapFilter('won', choices), 'won');
      assert.strictEqual(filters.chooseOneMapFilter('Won', choices), 'won');
    });

    it('handles exact match for middle item in list in case insensitive manner', function () {
      var choices = { 'one': 'won', 'two': 'tew', 'three': 'trEe' };
      assert.strictEqual(filters.chooseOneMapFilter('twO', choices), 'tew');
      assert.strictEqual(filters.chooseOneMapFilter('tWo', choices), 'tew');
      assert.strictEqual(filters.chooseOneMapFilter('teW', choices), 'tew');
      assert.strictEqual(filters.chooseOneMapFilter('tEw', choices), 'tew');
    });

    it('handles exact matche for last item in list', function () {
      var choices = { 'one': 'won', 'two': 'tew', 'three': 'trEe' };
      assert.strictEqual(filters.chooseOneMapFilter('three', choices), 'trEe');
      assert.strictEqual(filters.chooseOneMapFilter('threE', choices), 'trEe');
      assert.strictEqual(filters.chooseOneMapFilter('tree', choices), 'trEe');
      assert.strictEqual(filters.chooseOneMapFilter('Tree', choices), 'trEe');
    });
  });

  describe('.chooseOneMapFilterFactory()', function () {
    it('detects invalid input', function () {
      var choices = { 'one': 'won', 'two': 'tew', 'three': 'thrE' };
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)(undefined), undefined);
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)(null), undefined);
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)(''), undefined);
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)(true), undefined);
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)(false), undefined);
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('four'), undefined);
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('twobyfour'), undefined);
    });

    it('handles exact match for first item in list in case insensitive manner', function () {
      var choices = { 'one': 'won', 'two': 'tew', 'three': 'trEe' };
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('one'), 'won');
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('One'), 'won');
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('won'), 'won');
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('Won'), 'won');
    });

    it('handles exact match for middle item in list in case insensitive manner', function () {
      var choices = { 'one': 'won', 'two': 'tew', 'three': 'trEe' };
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('twO'), 'tew');
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('tWo'), 'tew');
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('teW'), 'tew');
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('Tew'), 'tew');
    });

    it('handles exact matche for last item in list', function () {
      var choices = { 'one': 'won', 'two': 'tew', 'three': 'trEe' };
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('three'), 'trEe');
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('threE'), 'trEe');
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('Tree'), 'trEe');
      assert.strictEqual(filters.chooseOneMapFilterFactory(choices)('treE'), 'trEe');
    });
  });

  describe('.chooseOneStartsWithFilter()', function () {
    it('detects invalid input', function () {
      var choices = { 'one': 'won', 'two': 'tew', 'three': 'thrE' };
      assert.strictEqual(filters.chooseOneStartsWithFilter(undefined, choices), undefined);
      assert.strictEqual(filters.chooseOneStartsWithFilter(null, choices), undefined);
      assert.strictEqual(filters.chooseOneStartsWithFilter('', choices), undefined);
      assert.strictEqual(filters.chooseOneStartsWithFilter(true, choices), undefined);
      assert.strictEqual(filters.chooseOneStartsWithFilter(false, choices), undefined);
      assert.strictEqual(filters.chooseOneStartsWithFilter('four', choices), undefined);
    });

    it('handles partial matches', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.chooseOneStartsWithFilter('one', choices), 'one');
      assert.strictEqual(filters.chooseOneStartsWithFilter('ONE', choices), 'one');
      assert.strictEqual(filters.chooseOneStartsWithFilter('O', choices), 'one');
    });

    it('handles partial matches where first match wins', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.chooseOneStartsWithFilter('t', choices), 'two');
      assert.strictEqual(filters.chooseOneStartsWithFilter('tH', choices), 'three');
    });

    it('handles exact match when partial matche exists first', function () {
      var choices = ['one', 'twobyfour', 'three', 'two'];
      assert.strictEqual(filters.chooseOneStartsWithFilter('Two', choices), 'two');
    });
  });

  describe('.chooseOneStartsWithFilterFactory()', function () {
    it('detects invalid input', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)(undefined), undefined);
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)(null), undefined);
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)(''), undefined);
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)(true), undefined);
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)(false), undefined);
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)('four'), undefined);
    });

    it('handles partial matches', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)('one'), 'one');
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)('ONE'), 'one');
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)('O'), 'one');
    });

    it('handles partial matches where first match wins', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)('t'), 'two');
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)('tH'), 'three');
    });

    it('handles exact match when partial matche exists first', function () {
      var choices = ['one', 'twobyfour', 'three', 'two'];
      assert.strictEqual(filters.chooseOneStartsWithFilterFactory(choices)('Two'), 'two');
    });
  });

  describe('.optionalTextFilter()', function () {
    it('handles invalid input', function () {
      assert.strictEqual(filters.optionalTextFilter(undefined), undefined);
      assert.strictEqual(filters.optionalTextFilter(null), undefined);
    });

    it('handles empty input', function () {
      assert.strictEqual(filters.optionalTextFilter(true), '');
      assert.strictEqual(filters.optionalTextFilter(''), '');
    });

    it('handles textual input', function () {
      assert.strictEqual(filters.optionalTextFilter('asdf'), 'asdf');
    });

    it('handles boolean input', function () {
      assert.strictEqual(filters.optionalTextFilter(true), '');
      assert.strictEqual(filters.optionalTextFilter(false), undefined);
    });

    it('handles numeric input', function () {
      assert.strictEqual(filters.optionalTextFilter(1), '1');
      assert.strictEqual(filters.optionalTextFilter(1.0), '1'); // yeah this sucks
      assert.strictEqual(filters.optionalTextFilter(1.2), '1.2');
    });
  });

  describe('.requiredTextFilter()', function () {
    it('handles invalid input', function () {
      assert.strictEqual(filters.requiredTextFilter(undefined), undefined);
      assert.strictEqual(filters.requiredTextFilter(null), undefined);
      assert.strictEqual(filters.requiredTextFilter(true), undefined);
      assert.strictEqual(filters.requiredTextFilter(''), undefined);
    });

    it('handles textual input', function () {
      assert.strictEqual(filters.requiredTextFilter('asdf'), 'asdf');
    });

    it('handles numeric input', function () {
      assert.strictEqual(filters.requiredTextFilter(1), '1');
      assert.strictEqual(filters.requiredTextFilter(1.0), '1'); // yeah this sucks
      assert.strictEqual(filters.requiredTextFilter(1.2), '1.2');
    });
  });

  describe('.requiredTextListFilter()', function () {
    it('handles invalid input', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.requiredTextListFilter(undefined, '^'), undefined);
      assert.strictEqual(filters.requiredTextListFilter(null, '^'), undefined);
      assert.strictEqual(filters.requiredTextListFilter('', '^'), undefined);
      assert.deepStrictEqual(filters.requiredTextListFilter(true, '^'), undefined);
      assert.deepStrictEqual(filters.requiredTextListFilter('four', '^', choices), undefined);
    });

    it('can handle arbitrary data when no choices are provided', function () {
      assert.deepStrictEqual(filters.requiredTextListFilter('one^two^Three', '^'), ['one', 'two', 'Three']);
    });

    it('can handle multipe inputs and filter based on choices', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.requiredTextListFilter('Three^tWo^one', '^', choices), ['one', 'two', 'threE']);
    });

    it('filters out values not included in the choices list', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.requiredTextListFilter('four^Three^tWo^two and a half^one^zerO', '^', choices), ['one', 'two', 'threE']);
    });

    it('handles first match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.requiredTextListFilter('One', '^', choices), ['one']);
    });

    it('handles middle match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.requiredTextListFilter('tWo', '^', choices), ['two']);
    });

    it('handles last match in a case insensitive way', function () {
      var choices = ['one', 'two', 'Three'];
      assert.deepStrictEqual(filters.requiredTextListFilter('threE', '^', choices), ['Three']);
    });
  });

  describe('.requiredTextListFilterFactory()', function () {
    it('handles invalid input', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.requiredTextListFilterFactory('^')(undefined), undefined);
      assert.strictEqual(filters.requiredTextListFilterFactory('^')(null), undefined);
      assert.strictEqual(filters.requiredTextListFilterFactory('^')(''), undefined);
      assert.deepStrictEqual(filters.requiredTextListFilterFactory('^')(true), undefined);
      assert.deepStrictEqual(filters.requiredTextListFilterFactory('^', choices)('four'), undefined);
    });

    it('can handle arbitrary data when no choices are provided', function () {
      assert.deepStrictEqual(filters.requiredTextListFilterFactory('^')('one^two^Three'), ['one', 'two', 'Three']);
    });

    it('can handle multipe inputs and filter based on choices', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.requiredTextListFilterFactory('^', choices)('Three^tWo^one'), ['one', 'two', 'threE']);
    });

    it('filters out values not included in the choices list', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.requiredTextListFilterFactory('^', choices)('four^Three^tWo^two and a half^one^zerO'), ['one', 'two', 'threE']);
    });

    it('handles first match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.requiredTextListFilterFactory('^', choices)('One'), ['one']);
    });

    it('handles middle match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.requiredTextListFilterFactory('^', choices)('tWo'), ['two']);
    });

    it('handles last match in a case insensitive way', function () {
      var choices = ['one', 'two', 'Three'];
      assert.deepStrictEqual(filters.requiredTextListFilterFactory('^', choices)('threE'), ['Three']);
    });
  });

  describe('.requiredTextStartsWithListFilter()', function () {
    it('handles invalid input', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.requiredTextStartsWithListFilter(undefined, '^', choices), undefined);
      assert.strictEqual(filters.requiredTextStartsWithListFilter(null, '^', choices), undefined);
      assert.strictEqual(filters.requiredTextStartsWithListFilter('', '^', choices), undefined);
      assert.strictEqual(filters.requiredTextStartsWithListFilter(true, '^', choices), undefined);
      assert.strictEqual(filters.requiredTextStartsWithListFilter('four', '^', choices), undefined);
      assert.strictEqual(filters.requiredTextStartsWithListFilter('one^two^Three', '^', []), undefined);
    });

    it('can handle multipe inputs and filter based on choices', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.requiredTextStartsWithListFilter('Three^tWo^one', '^', choices), ['one', 'two', 'threE']);
    });

    it('filters out values not included in the choices list', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.requiredTextStartsWithListFilter('four^Three^tWo^two and a half^one^zerO', '^', choices), ['one', 'two', 'threE']);
    });

    it('handles first match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.requiredTextStartsWithListFilter('One', '^', choices), ['one']);
    });

    it('handles middle match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.requiredTextStartsWithListFilter('tWo', '^', choices), ['two']);
    });

    it('handles last match in a case insensitive way', function () {
      var choices = ['one', 'two', 'Three'];
      assert.deepStrictEqual(filters.requiredTextStartsWithListFilter('threE', '^', choices), ['Three']);
    });
  });

  describe('.requiredTextStartsWithListFilterFactory()', function () {
    it('handles invalid input', function () {
      var choices = ['one', 'two', 'three'];
      assert.strictEqual(filters.requiredTextStartsWithListFilterFactory('^', choices)(undefined), undefined);
      assert.strictEqual(filters.requiredTextStartsWithListFilterFactory('^', choices)(null), undefined);
      assert.strictEqual(filters.requiredTextStartsWithListFilterFactory('^', choices)(''), undefined);
      assert.strictEqual(filters.requiredTextStartsWithListFilterFactory('^', choices)(true), undefined);
      assert.strictEqual(filters.requiredTextStartsWithListFilterFactory('^', choices)('four'), undefined);
      assert.strictEqual(filters.requiredTextStartsWithListFilterFactory('^', [])('one^two^Three'), undefined);
    });

    it('can handle multipe inputs and filter based on choices', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.requiredTextStartsWithListFilterFactory('^', choices)('Three^tWo^one'), ['one', 'two', 'threE']);
    });

    it('filters out values not included in the choices list', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.requiredTextStartsWithListFilterFactory('^', choices)('four^Three^tWo^two and a half^one^zerO'), ['one', 'two', 'threE']);
    });

    it('handles first match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.requiredTextStartsWithListFilterFactory('^', choices)('One'), ['one']);
    });

    it('handles middle match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.requiredTextStartsWithListFilterFactory('^', choices)('tWo'), ['two']);
    });

    it('handles last match in a case insensitive way', function () {
      var choices = ['one', 'two', 'Three'];
      assert.deepStrictEqual(filters.requiredTextStartsWithListFilterFactory('^', choices)('threE'), ['Three']);
    });
  });

  describe('.requiredVersionFilter()', function () {
    it('handles invalid input', function () {
      assert.strictEqual(filters.requiredVersionFilter(undefined), undefined);
      assert.strictEqual(filters.requiredVersionFilter(null), undefined);
      assert.strictEqual(filters.requiredVersionFilter(true), undefined);
      assert.strictEqual(filters.requiredVersionFilter(''), undefined);
    });

    it('handles textual input', function () {
      assert.strictEqual(filters.requiredVersionFilter('asdf'), 'asdf');
    });

    it('handles numeric input', function () {
      assert.strictEqual(filters.requiredVersionFilter(1), '1');
      assert.strictEqual(filters.requiredVersionFilter(1.0), '1'); // yeah this sucks
      assert.strictEqual(filters.requiredVersionFilter(1.2), '1.2');
    });

    it('handles VERSION- prefixed input', function () {
      assert.strictEqual(filters.requiredVersionFilter('VERSION-1'), '1');
      assert.strictEqual(filters.requiredVersionFilter('VERSION-1.0'), '1.0');
      assert.strictEqual(filters.requiredVersionFilter('1.2'), '1.2');
    });
  });

  describe('.textListFilter()', function () {
    it('handles invalid input', function () {
      assert.strictEqual(filters.textListFilter(undefined, '^'), undefined);
      assert.strictEqual(filters.textListFilter(null, '^'), undefined);
    });

    it('can handle empty lists', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.textListFilter(true, '^'), []);
      assert.deepStrictEqual(filters.textListFilter('', '^'), []);
      assert.deepStrictEqual(filters.textListFilter('four', '^', choices), []);
    });

    it('can handle arbitrary data when no choices are provided', function () {
      assert.deepStrictEqual(filters.textListFilter('one^two^Three', '^'), ['one', 'two', 'Three']);
    });

    it('can handle multipe inputs and filter based on choices', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.textListFilter('Three^tWo^one', '^', choices), ['one', 'two', 'threE']);
    });

    it('filters out values not included in the choices list and return in choice list order', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.textListFilter('four^Three^tWo^two and a half^one^zerO', '^', choices), ['one', 'two', 'threE']);
    });

    it('handles first match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.textListFilter('One', '^', choices), ['one']);
    });

    it('handles middle match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.textListFilter('tWo', '^', choices), ['two']);
    });

    it('handles last match in a case insensitive way', function () {
      var choices = ['one', 'two', 'Three'];
      assert.deepStrictEqual(filters.textListFilter('threE', '^', choices), ['Three']);
    });
  });

  describe('.textListFilterFactory()', function () {
    it('handles invalid input', function () {
      assert.strictEqual(filters.textListFilterFactory('^')(undefined), undefined);
      assert.strictEqual(filters.textListFilterFactory('^')(null), undefined);
    });

    it('can handle empty lists', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.textListFilterFactory('^')(true), []);
      assert.deepStrictEqual(filters.textListFilterFactory('^')(''), []);
      assert.deepStrictEqual(filters.textListFilterFactory('^', choices)('four'), []);
    });

    it('can handle arbitrary data when no choices are provided', function () {
      assert.deepStrictEqual(filters.textListFilterFactory('^')('one^two^Three'), ['one', 'two', 'Three']);
    });

    it('can handle multipe inputs and filter based on choices', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.textListFilterFactory('^', choices)('Three^tWo^one'), ['one', 'two', 'threE']);
    });

    it('filters out values not included in the choices list and return in choice list order', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepStrictEqual(filters.textListFilterFactory('^', choices)('four^Three^tWo^two and a half^one^zerO'), ['one', 'two', 'threE']);
    });

    it('handles first match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.textListFilterFactory('^', choices)('One'), ['one']);
    });

    it('handles middle match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepStrictEqual(filters.textListFilterFactory('^', choices)('tWo'), ['two']);
    });

    it('handles last match in a case insensitive way', function () {
      var choices = ['one', 'two', 'Three'];
      assert.deepStrictEqual(filters.textListFilterFactory('^', choices)('threE'), ['Three']);
    });
  });

  describe('.sequentialFilterFactory()', function () {
    it('handles invalid input', function () {
      assert.strictEqual(filters.sequentialFilterFactory([])(undefined), undefined);
      assert.strictEqual(filters.sequentialFilterFactory([])(null), null);
    });
    it('handles single value in array', function () {
      assert.strictEqual(filters.sequentialFilterFactory([filters.requiredTextFilter])(undefined), undefined);
      assert.strictEqual(filters.sequentialFilterFactory([filters.requiredTextFilter])('one'), 'one');
      assert.strictEqual(filters.sequentialFilterFactory([filters.requiredTextFilter])(''), undefined);
    });
    it('handles multiple values in array', function () {
      assert.strictEqual(filters.sequentialFilterFactory([filters.requiredTextFilter, filters.optionalTextFilter])('one'), 'one');
      assert.strictEqual(filters.sequentialFilterFactory([filters.booleanFilter, filters.requiredTextFilter])('one'), undefined);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
