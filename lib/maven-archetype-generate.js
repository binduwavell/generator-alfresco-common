'use strict';
var assert = require('assert');
var debug = require('debug')('generator-alfresco-common:maven-archetype-generate');
var trace = require('debug')('generator-alfresco-common-trace:maven-archetype-generate');
var extend = require('deep-extend');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var Buffer = require('safe-buffer').Buffer;
var fileFiltering = require('./maven-archetype-file-filtering');
var pathFiltering = require('./maven-archetype-path-filtering');
var mavenPomModule = require('./maven-pom');
var archetypeMetadataModule = require('./maven-archetype-metadata');

/**
 * Given an exploded archetype jar and the metadata xml file for the archetype,
 * this code will mimick `mvn archetype:generate` to the extent that we can use
 * this module for the Alfresco All-In-One archetype from the Alfresco SDK.
 */
module.exports = function (yo) {
  var module = {};

  /**
   *
   * @param {!string} metadataPath
   * @param {!string} resourcesPath
   * @param {!string} targetPath
   * @param {!Object} properties
   */
  module.generate = function (metadataPath, resourcesPath, targetPath, properties) {
    trace('generate, reading metadata');
    var metadata = archetypeMetadataModule(yo.fs.read(metadataPath));

    trace('Constructing archetype properties');
    var props = extend(metadata.getRequiredProperties(), properties);
    props.rootArtifactId = props.artifactId;

    trace('Copying top level pom');
    var pomPath = copyPom(resourcesPath, targetPath, '', props, yo.fs);

    trace('Processing top level FileSets');
    var filesets = metadata.getFileSets();
    processFileSets(resourcesPath, targetPath, '', filesets, props, yo.fs);

    trace('Processing Modules');
    var modules = metadata.getModules();
    processModules(resourcesPath, targetPath, '', modules, pomPath, props, yo.fs);
    trace('generate done');
  };

  return module;
};

/**
 * Copies a pom.xml file from <resourcesPath>/<directory> to <targetPath>/<directory>.
 * If there are __placeholders__ that match provided properties in the path, they will
 * be expanded in the target folder structure.
 *
 * @param {!string} resourcesPath
 * @param {!string} targetPath
 * @param {!string} directory
 * @param {!Object} properties
 * @param {!Object} yoFs
 * @returns {!string} the path to the copied pom.xml
 */
function copyPom (resourcesPath, targetPath, directory, properties, yoFs) {
  var fromPath = path.join(resourcesPath, directory, 'pom.xml');
  var targetDirectoryPath = path.join(targetPath, directory);
  var toPath = path.join(targetDirectoryPath, 'pom.xml');

  var copiedFiles = [];
  debug('Copying pom', toPath);
  yoFs.copy(fromPath, toPath, {
    process:
      processFunctionFactory(resourcesPath, directory, '', copiedFiles, properties, true, false),
  });

  copiedFiles = expandPathPlaceholders(targetPath, copiedFiles, properties, yoFs);

  debug('New pom file', path.join(targetPath, copiedFiles[0]));
  return path.join(targetPath, copiedFiles[0]);
}

/**
 * When a child module is instantiated we need to make sure the parent pom references
 * the child.
 *
 * @param {!string} parentPomPath
 * @param {!Object} properties
 * @param {!Object} yoFs
 */
function addModuleToParentPom (parentPomPath, properties, yoFs) {
  var pomStr = yoFs.read(parentPomPath);
  var pomEditor = mavenPomModule(pomStr);
  pomEditor.addModule(properties.artifactId);
  yoFs.write(parentPomPath, pomEditor.getPOMString());
}

/**
 * Given a list of filesets, this will process each one as follows. It arranges for any globbed
 * includes to be copied to an appropriate target folder structure and honors any exclusions. It
 * also arranges for individual (non-globbed) files to be copied. Once the copies have been
 * completed, any __placeholder__ path elements that match provided properties will also be
 * resolved.
 *
 * @param {!string} resourcesPath
 * @param {!string} targetPath
 * @param {!string} directory
 * @param {!Array<{directory: !string, filtered: !boolean, packaged: !boolean}>} filesets
 * @param {!Object} properties
 * @param {!Object} yoFs
 */
function processFileSets (resourcesPath, targetPath, directory, filesets, properties, yoFs) {
  // It appears in mvn archetype:generate, if multiple filesets copy the same file,
  // the first file copied wins and subsequent copies of the same file are ignored.
  // By running the filesets in reverse order we get the same result without having
  // to block copy for existing files, which is not currently supported by
  // mem-fs-editor.
  filesets.reverse().forEach(fileset => {
    debug('Processing FileSet', fileset);
    trace('Processing FileSet', fileset);
    var relativePath = path.join(directory, fileset.directory);
    var fromPath = path.join(resourcesPath, relativePath);
    if (!fs.existsSync(fromPath)) {
      debug('Skipping FileSet as source is missing');
      trace('Skipping FileSet as source is missing');
      return;
    }

    var toPath = path.join(targetPath, relativePath);
    var packagedPath = packageToPath(properties.package);
    if (fileset.packaged) {
      debug('Adding package to path');
      trace('Adding package to path');
      toPath = path.join(toPath, packageToPath(properties.package));
    }

    var copiedFiles = [];
    var includeGlobs = globsFromFileSet(fromPath, fileset);
    var excludeGlobs = globsToExcludeFromFileSet(fromPath, fileset);
    trace('Characterized FileSet');

    if (includeGlobs) {
      includeGlobs.forEach(includeGlob => {
        trace('Processing include glob', includeGlob);
        debug('Copy glob', includeGlob);
        debug('Copying to', toPath);
        var includeAndExcludeGlobs = includeGlob;
        if (excludeGlobs.length > 0) {
          includeAndExcludeGlobs = [includeGlob].concat(excludeGlobs);
          debug('Copy glob with exclusion(s)', includeAndExcludeGlobs);
        }
        try {
          trace('About to copy');
          yoFs.copy(includeAndExcludeGlobs, toPath, {
            process: processFunctionFactory(
              resourcesPath, relativePath, packagedPath, copiedFiles,
              properties, fileset.filtered, fileset.packaged),
          });
          trace('Copy complete');
        } catch (err) {
          // Following is pretty brittle given that mem-fs-editor may change
          // this message or how the error is reported.
          // TODO(bwavell): contribute option for mem-fs-editor.copy() to allow empties
          if (err instanceof assert.AssertionError && err.message.startsWith('Trying to copy from a source that does not exist')) {
            debug('It is ok to perform an empty copy');
          } else {
            throw err;
          }
        }
      });
    }

    trace('Looking for individual files to copy');
    var fromFiles = filesFromFileSet(fromPath, fileset);
    trace('Done looking');
    if (fromFiles.length > 0) {
      trace('Processing include files', fromFiles);
      fromFiles.forEach(fromFile => {
        var toFile = path.join(toPath, path.basename(fromFile));
        debug('Copy from', fromFile);
        debug('Copying to', toFile);
        trace('About to copy', fromFile);
        yoFs.copy(fromFile, toFile, {
          process: processFunctionFactory(
            resourcesPath, relativePath, packagedPath, copiedFiles,
            properties, fileset.filtered, fileset.packaged),
        });
        trace('Content %s', yoFs.read(toFile));
      });
    }

    trace('Starting path expansion');
    copiedFiles = expandPathPlaceholders(targetPath, copiedFiles, properties, yoFs);
    trace('Done with path expansion');

    debug('In summary, we copied', copiedFiles);
  });
}

/**
 * Given a list of modules, this accounts for the module directory and updates the artifactId
 * property. Then it copies the module pom.xml, any filesets defined in the module and finally
 * recuses on any sub-modules.
 *
 * @param {!string} resourcesPath
 * @param {!string} targetPath
 * @param {!string} directory
 * @param {!Array<{dir: !string, id: !string}>} modules
 * @param {!string} parentPomPath
 * @param {!Object} properties
 * @param {!Object} yoFs
 */
function processModules (resourcesPath, targetPath, directory, modules, parentPomPath, properties, yoFs) {
  modules.forEach(module => {
    debug('Processing module', module);
    var modulePath = path.join(directory, module.dir);
    properties.artifactId = pathFiltering.filter(module.dir, properties);
    addModuleToParentPom(parentPomPath, properties, yoFs);
    var pomPath = copyPom(resourcesPath, targetPath, modulePath, properties, yoFs);
    processFileSets(resourcesPath, targetPath, modulePath, module.fileSets, properties, yoFs);
    processModules(resourcesPath, targetPath, modulePath, module.modules, pomPath, properties, yoFs);
  });
}

/**
 * This is a helper that is used to produce a function that is passed to mem-fs-editor.copy() so we can
 * capture all of the files that are copied and also so that we can perform content filtering in-place.
 *
 * @param {!string} basePath is the root directory we are copying from
 * @param {!string} relativePath relative path from basePath to where fileset matches
 * @param {!string} packagedPath package in path form we can inject when packaged is true
 * @param {!Array<string>} list holds files copied relative to basePath
 * @param {!Object} properties holds key/value pairs that are replaced when filtered is true
 * @param {!boolean} filtered is a flag
 * @param {!boolean} packaged is a flag
 * @returns {!Function}
 */
function processFunctionFactory (
  basePath, relativePath, packagedPath, list, properties, filtered, packaged) {
  /**
   * @param {!(string|Buffer)} fileContent
   * @param {!string} filePath
   * @returns {!Buffer}
   */
  return function (fileContent, filePath) {
    var targetRelativeFilePath = path.relative(basePath, filePath);
    trace('Target relative file path: %s', targetRelativeFilePath);
    var filesetRelativeFilePath = path.relative(relativePath, targetRelativeFilePath);
    trace('Fileset relative file path %s', filesetRelativeFilePath);
    if (packaged) {
      var postPackage = path.relative(relativePath, targetRelativeFilePath);
      targetRelativeFilePath = path.join(relativePath, packagedPath, postPackage);
      trace('Target relative file path with packaging info included', targetRelativeFilePath);
    }
    debug('Copying %s with size %d', filesetRelativeFilePath, fileContent.length);
    list.push(targetRelativeFilePath);
    if (filtered) {
      debug('Filtering', targetRelativeFilePath);
      trace('Filtering', targetRelativeFilePath);

      var strFileContent = (fileContent instanceof Buffer ? fileContent.toString() : fileContent);
      var newFileContent = fileFiltering.filter(strFileContent, properties);
      trace('Filtered');

      return newFileContent;
    }
    return fileContent;
  };
}

/**
 * Helper goes through a list of files and expands any __placeholders__ that correspond
 * with properties that have been provided.
 *
 * @param {!string} targetPath the root location we are generating into
 * @param {!Array<string>} files a list of files relative to the target path
 * @param {!Object} properties list of properties that should be considered for expansion
 * @param {!Object} yoFs
 */
function expandPathPlaceholders (targetPath, files, properties, yoFs) {
  return files.map(file => {
    // Don't bother expanding paths without placeholders
    if (file.indexOf('__') === -1) {
      return file;
    }
    var newPath = pathFiltering.filter(file, properties);
    if (file !== newPath) {
      trace('Performing move for path expansion %s', file);
      yoFs.move(path.join(targetPath, file), path.join(targetPath, newPath));
      trace('Path expansion move completed %s', newPath);
      debug('Expanded path placeholder ', newPath);
    }
    return newPath;
  });
}

/**
 * The includes in a fileset may be globs or they may be individual files.
 * This extracts all of the individual files and makes them absolute.
 *
 * @param {!string} dirname
 * @param {!Array<{includes: Array<string>}>} fileset
 * @returns {!Array<string>}
 */
function filesFromFileSet (dirname, fileset) {
  if (!fileset.includes || !fileset.includes.length) {
    return [];
  }
  return fileset.includes
    .filter(include => !glob.hasMagic(include))
    .map(include => path.join(dirname, include));
}

/**
 * The includes in a fileset may be globs or they may be individual files.
 * This extracts all of the globs and makes them absolute.
 *
 * @param {!string} dirname
 * @param {!Array<{includes: Array<string>}>} fileset
 * @returns {!Array<string>}
 */
function globsFromFileSet (dirname, fileset) {
  if (!fileset.includes || !fileset.includes.length) {
    return [path.join(dirname, '**')];
  }
  return fileset.includes
    .filter(include => glob.hasMagic(include))
    .map(include => path.join(dirname, include));
}

/**
 * The excludes in a fileset are all treated as globs. This extracts all of
 * them and makes them absolute.
 *
 * @param {!string} dirname
 * @param {Array<{excludes: Array<string>}>} fileset
 * @returns {Array<string>}
 */
function globsToExcludeFromFileSet (dirname, fileset) {
  if (fileset.excludes && fileset.excludes.length) {
    return fileset.excludes.map(exclude => '!' + path.join(dirname, exclude));
  } else {
    return [];
  }
}

/**
 * Helper used to convert a.standard.package to a/standard/package.
 *
 * @param {string} pkg
 * @returns {string}
 */
function packageToPath (pkg) {
  return pkg.replace('.', '/');
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
