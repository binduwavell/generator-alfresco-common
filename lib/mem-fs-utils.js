'use strict';
var debug = require('debug')('generator-alfresco-common:mem-fs-utils');
var path = require('path');

module.exports = {

  /**
   * Check if a path exists in the provided memfs Store.
   *
   * As memfs only stores files (and not paths) we simply make sure we find at least one valid file
   * with the provided path as a prefix (or complete match). I'm not aware of
   *
   * @param {!Store|!EditionInterface} storeOrEditor
   * @param {string} file path or folder path
   */
  existsInMemory: function (storeOrEditor, path) {
    debug('Checking if ' + path + ' exists in the in-memory store.');
    var retv = false;
    this.processInMemoryStore(storeOrEditor, file => {
      debug('Evaluating ' + file.path + ' in state ' + file.state + ' with content length ' + (file && file.contents ? file.contents.length : 'unknown'));
      if (file.path.indexOf(path) === 0 && file.contents !== null && file.state !== 'deleted') {
        debug('FOUND');
        retv = true;
      }
    });
    debug('RESULT ' + retv);
    return retv;
  },

  /**
   * Given the path for a virtual file or folder and a destination path perform a copy
   * completely within mem-fs.
   *
   * @param {!Store|!EditionInterface} storeOrEditor
   * @param {string} from - file path or folder path
   * @param {string} to - folder path
   */
  inMemoryCopy: function (storeOrEditor, from, to) {
    debug('Performing inMemoryCopy from ' + from + ' to ' + to + '.');
    var fromLen = from.length;
    this.processInMemoryStore(storeOrEditor, (file, store) => {
      var idx = file.path.indexOf(from);
      if (idx === 0 && file.contents !== null && file.state !== 'deleted') {
        var absTo = path.join(to, file.path.substr(fromLen));
        // exact match so we are copying a single file and not a folder
        if (fromLen === file.path.length) {
          absTo = path.join(to, path.basename(file.path));
        }
        debug('CREATING COPY IN-MEMORY: ' + absTo);
        var newFile = store.get(absTo);
        newFile.contents = file.contents;
        newFile.state = 'modified';
        store.add(newFile);
      }
    });
  },

  /**
   * Given the path for a virtual file or folder and a destination path perform a move
   * completely within mem-fs.
   *
   * @param {!Store|!EditionInterface} storeOrEditor
   * @param {string} from - file path or folder path
   * @param {string} to - folder path
   */
  inMemoryMove: function (storeOrEditor, from, to) {
    debug('Performing inMemoryMove from ' + from + ' to ' + to);
    var store = (storeOrEditor && storeOrEditor.store ? storeOrEditor.store : storeOrEditor);
    var memFsEditor = require('mem-fs-editor').create(store);
    var fromLen = from.length;
    store.each(function (file) {
      var idx = file.path.indexOf(from);
      if (idx === 0 && file.contents !== null && file.state !== 'deleted') {
        var absTo = path.join(to, file.path.substr(fromLen));
        // exact match so we are copying a single file and not a folder
        if (fromLen === file.path.length) {
          absTo = path.join(to, path.basename(file.path));
        }
        debug('IN-MEMORY MOVING FROM: ' + file.path + ' TO: ' + absTo);
        memFsEditor.move(file.path, absTo);
      }
    });
  },

  /**
   * Log file path and sate information via a log function or console.log if not provided.
   *
   * @param {!Store|!EditionInterface} storeOrEditor
   * @param {(Function|undefined)} logFn
   */
  dumpFileNames: function (storeOrEditor, logFn) {
    debug('Dumping contents of in-memory store.');
    var logFunc = logFn || console.log;
    this.processInMemoryStore(storeOrEditor, file => {
      logFunc.call(this, file.path + ' [STATE:' + file.state + ']');
      /*
       logFunc.call(this, JSON.stringify(file, function (k, v) {
       if (k === '_contents') {
       if (undefined !== v) {
       return 'data';
       }
       }
       return v;
       }));
       */
    });
  },

  /**
   * Calls fn(entry) for each entry in the store.
   *
   * @param {!Store|!EditionInterface} storeOrEditor
   * @param {Function(String, !Store)} fn called with each entry and the store
   */
  processInMemoryStore: function (storeOrEditor, fn) {
    debug('Processing entries in in-memory store.');
    var store = (storeOrEditor && storeOrEditor.store ? storeOrEditor.store : storeOrEditor);
    store.each(function (file) {
      fn.call(this, file, store);
    });
  },
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
