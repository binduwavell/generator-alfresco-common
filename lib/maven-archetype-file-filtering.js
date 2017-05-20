'use strict';

var lineEndingRE = /\r?\n/;
var setDirectiveRE = /^\s*#set\s*\(\s*\$([^\s]*)\s*=\s*(['"])((?:(?!\2).)*)\2\s*\)\s*/;

/*
 * This is a very minimal velocity template processor that can handle property replacement
 * and the #set directive. To date, these are the only features of velocity that are used
 * in the Maven archetypes provided for the Alfresco SDK.
 *
 * WARNING: This is all very brute force and can easily be broken with valid velocity.
 */

module.exports = {
  filter: function (content, properties) {
    var lines = content.split(lineEndingRE);
    lines = replaceProperties(lines, properties);
    lines = replaceSymbols(lines);
    return lines.join('\n');
  },
};

/**
 * Given some text, we go through and find $shorthand references and ${formal} references
 * and replace them with the provided value.
 *
 * @param {String} text the text to process
 * @param {String} reference is the name of the reference we will replace
 * @param {String} value is the what the reference will be replaced with
 * @returns {string} text with reference replaced with value
 */
function expandReference (text, reference, value) {
  // Shorthand $property has to have whitespace around it, we need to restore them
  var shorthandRe = new RegExp('(\\s)\\$' + reference + '(\\s)', 'g');
  // Formal ${property} can be smooshed in between other text like this X${property}Y
  var formalRe = RegExp('\\${' + reference + '}', 'g');

  text = text.replace(shorthandRe, (str, one, two) => one + value + two);
  text = text.replace(formalRe, value);

  return text;
}
/**
 * Given a list of lines from a file, we go through each line and replace properties that
 * are provided with the associated value.
 *
 * NOTE: This does not process properties if they are not in the properties parameter.
 *
 * @param {Array<String>} lines are processed one at a time
 * @param {Object} properties are replaced
 * @returns {Array<String>} original lines with properties replaced
 */
function replaceProperties (lines, properties) {
  var filteredLines = [];
  lines.forEach((line) => {
    for (var prop in properties) {
      line = expandReference(line, prop, properties[prop]);
    }
    filteredLines.push(line);
  });
  return filteredLines;
}

/**
 * Given a list of lines, we look for #set directives alone on each line, we capture the
 * defined references and remove them finally, we replace those references on all subsequent
 * lines with the value that was associated with the reference.
 *
 * WARNING: This handles a very basic syntax for #set directives and expects them to be the
 * only item on a line, like this:
 *
 * #set( $keyword = 'Value' )
 *
 * See the setDirectiveRE RegExp above for the full grammar supported.
 *
 * NOTE: This appears to be overkill, from reviewing SDKs 2.0.0, 2.1.0, 2.1.1, 2.2.0 and 3.0.0,
 * it appears that #set is used to define symbol references, but they are never used so we
 * could get away with just removing set statements.
 *
 * @param {Array<String>} lines are processed one at a time
 * @returns {Array} original lines, with #set directives removed and associated
 *     references replaced
 */
function replaceSymbols (lines) {
  var filteredLines = [];
  var symbols = {};
  lines.forEach((line) => {
    var match = line.match(setDirectiveRE);
    if (match) {
      symbols[match[1]] = match[3];
    } else {
      for (var symbol in symbols) {
        line = expandReference(line, symbol, symbols[symbol]);
      }
      filteredLines.push(line);
    }
  });
  return filteredLines;
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
