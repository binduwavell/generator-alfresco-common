'use strict';

/*
 * General JavaScript utilities not provided by lodash
 */

/**
 * Converts 0, 1, true and false to boolean. Inputs can be booleans, numbers
 * or strings. If inp can't be converted to boolean then def will be returned.
 * def should be boolean or undefined.
 *
 * @param {*} inp input to convert to boolean
 * @param {(boolean|undefined)} def default if we can't figure out what the inp is
 * @returns {(boolean|undefined)} inp converted to boolean or def
 */
module.exports.toBoolean = function (inp, def) {
  if (inp === false) {
    return false;
  } else if (inp === true) {
    return true;
  } else if (inp === 0) {
    return false;
  } else if (inp === 1) {
    return true;
  } else if (typeof inp === 'string' && inp === '0') {
    return false;
  } else if (typeof inp === 'string' && inp === '1') {
    return true;
  } else if (typeof inp === 'string' && inp.toUpperCase() === 'FALSE') {
    return false;
  } else if (typeof inp === 'string' && inp.toUpperCase() === 'TRUE') {
    return true;
  }

  return def;
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
