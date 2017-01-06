'use strict';
var domutils = require('./xml-dom-utils.js');
var utils = require('./general-utils.js');

/*
 * Provides helpers for consuming archetype-metadata.xml files.
 */

module.exports = function (archetypeMetadataString) {
  var module = {};

  var doc = domutils.parseFromString(archetypeMetadataString);

  /**
   * Read the @name text attribute from the root archetype-descriptor element.
   */
  module.getName = function () {
    var nameAttribute = domutils.getFirstNodeMatchingXPath('/desc:archetype-descriptor/@name', doc);
    return nameAttribute.value;
  };

  /**
   * Read the @parital boolean attribute from the root archetype-descriptor element.
   */
  module.isPartial = function () {
    var partial = domutils.getFirstNodeMatchingXPath('/desc:archetype-descriptor/@partial', doc);
    return utils.toBoolean(partial.value, false);
  };

  /**
   * Reads any requiredProperty elements and produces a map with the @key attribute maped
   * to any provided defaultValue (or undefined if no defaultValue is provided.)
   */
  module.getRequiredProperties = function () {
    var xp = '/desc:archetype-descriptor/desc:requiredProperties/desc:requiredProperty';
    var elements = domutils.selectMatchingXPath(xp, doc);
    var props = {};
    var numProps = elements.length;
    for (var propIdx = 0; propIdx < numProps; propIdx++) {
      var prop = elements[propIdx];
      var key = prop.getAttribute('key');
      if (key !== undefined) {
        var defaultValue;
        var defaultValueElement = domutils.getChild(prop, 'desc', 'defaultValue');
        if (defaultValueElement !== undefined) {
          defaultValue = defaultValueElement.textContent;
        } else {
          defaultValue = undefined;
        }
        props[key] = defaultValue;
      }
    }
    return props;
  };

  /**
   * Reads any top level fileSet elements and produces an array of objects describing
   * each such fileSet.
   *
   * @returns {Array}
   */
  module.getFileSets = function () {
    var xp = '/desc:archetype-descriptor/desc:fileSets/desc:fileSet';
    var elements = domutils.selectMatchingXPath(xp, doc);
    var fileSets = [];
    var numFileSets = elements.length;
    for (var idx = 0; idx < numFileSets; idx++) {
      fileSets.push(_getFileSet(elements[idx]));
    }
    return fileSets;
  };

  /**
   * Produces a JavaScript object representing a fileSet.
   *
   * @param {Element} fileSetElement
   * @returns {{filtered: (boolean|undefined), packaged: (boolean|undefined), encoding: (string|*), directory, includes: Array, excludes: Array}}
   * @private
   */
  function _getFileSet (fileSetElement) {
    var filtered = utils.toBoolean(fileSetElement.getAttribute('filtered'), false);
    var packaged = utils.toBoolean(fileSetElement.getAttribute('packaged'), false);
    var encoding = fileSetElement.getAttribute('encoding');
    var directory = domutils.getChild(fileSetElement, 'desc', 'directory').textContent;
    var includes = domutils.selectMatchingXPath('desc:includes/desc:include', fileSetElement);
    var excludes = domutils.selectMatchingXPath('desc:excludes/desc:exclude', fileSetElement);
    var fileSet = {
      filtered: filtered, packaged: packaged, encoding: encoding, directory: directory, includes: [], excludes: [],
    };
    includes.forEach(function (include) {
      fileSet.includes.push(include.textContent);
    });
    excludes.forEach(function (exclude) {
      fileSet.excludes.push(exclude.textContent);
    });
    return fileSet;
  }

  /**
   * Reads any top level module elements and produces an array of objects describing
   * each such module.
   *
   * @returns {Array}
   */
  module.getModules = function () {
    var xp = '/desc:archetype-descriptor/desc:modules/desc:module';
    var elements = domutils.selectMatchingXPath(xp, doc);
    var modules = [];
    var numModules = elements.length;
    for (var idx = 0; idx < numModules; idx++) {
      modules.push(_getModule(elements[idx]));
    }
    return modules;
  };

  /**
   * Produces a JavaScript object representing a module.
   *
   * @param moduleElement
   * @returns {{id: (string|*), dir: (string|*), name: (string|*), fileSets: Array, modules: Array}}
   * @private
   */
  function _getModule (moduleElement) {
    var id = moduleElement.getAttribute('id');
    var dir = moduleElement.getAttribute('dir');
    var name = moduleElement.getAttribute('name');
    var fileSets = domutils.getChild(moduleElement, 'desc', 'fileSets');
    var modules = domutils.getChild(moduleElement, 'desc', 'modules');
    var module = {id: id, dir: dir, name: name, fileSets: [], modules: []};
    if (fileSets !== undefined) {
      var fileSetElements = domutils.selectMatchingXPath('desc:fileSet', fileSets);
      var numFileSets = fileSetElements.length;
      for (var fsIdx = 0; fsIdx < numFileSets; fsIdx++) {
        module.fileSets.push(_getFileSet(fileSetElements[fsIdx]));
      }
    }
    if (modules !== undefined) {
      var moduleElements = domutils.selectMatchingXPath('desc:module', modules);
      var numModules = moduleElements.length;
      for (var mIdx = 0; mIdx < numModules; mIdx++) {
        module.modules.push(_getModule(moduleElements[mIdx]));
      }
    }
    return module;
  }

  return module;
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
