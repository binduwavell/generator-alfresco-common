'use strict';

/*
 * This can replace __placeholders__ in path strings with related property values.
 */

module.exports = {
  filter: function (path, properties) {
    var newPath = path;
    for (var prop in properties) {
      var placeholderRE = new RegExp('__' + prop + '__', 'g');
      newPath = newPath.replace(placeholderRE, properties[prop]);
    }
    return newPath;
  },
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
