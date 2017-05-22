'use strict';
var debug = require('debug')('generator-alfresco-common:maven-archetype-generate');
var glob = require('glob');
var path = require('path');
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
    var metadata = archetypeMetadataModule(yo.fs.read(metadataPath));

    properties.rootArtifactId = properties.artifactId;

    var pomPath = copyPom(resourcesPath, targetPath, '', properties, yo.fs);

    var filesets = metadata.getFileSets();
    processFileSets(resourcesPath, targetPath, '', filesets, properties, yo.fs);

    var modules = metadata.getModules();
    processModules(resourcesPath, targetPath, '', modules, pomPath, properties, yo.fs);
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
  var relativePath = path.join(targetPath, directory);
  var toPath = path.join(relativePath, 'pom.xml');

  var copiedFiles = [];
  debug('COPYING POM', toPath);
  yoFs.copy(fromPath, toPath, {
    process:
      processFunctionFactory(resourcesPath, relativePath, '', copiedFiles, properties, true, false),
  });

  copiedFiles = expandPathPlaceholders(targetPath, copiedFiles, properties, yoFs);

  debug('NEW POM FILE', path.join(targetPath, copiedFiles[0]));
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
  filesets.forEach(fileset => {
    debug('PROCESSING FILESET', fileset);
    var copiedFiles = [];
    var relativePath = path.join(directory, fileset.directory);
    var fromPath = path.join(resourcesPath, relativePath);
    var toPath = path.join(targetPath, relativePath);
    var packagedPath = packageToPath(properties.package);

    if (fileset.packaged) {
      debug('ADDING PACKAGE TO PATH');
      toPath = path.join(toPath, packageToPath(properties.package));
    }

    var includeGlobs = globsFromFileSet(fromPath, fileset);
    var ignoreGlobs = globsToIgnoreFromFileSet(fromPath, fileset);

    if (includeGlobs) {
      includeGlobs.forEach(includeGlob => {
        debug('COPY GLOB', includeGlob);
        debug('COPYING TO', toPath);
        debug('IGNORING', ignoreGlobs);
        yoFs.copy(includeGlob, toPath, {
          globOptions: {
            ignore: ignoreGlobs,
          },
          process: processFunctionFactory(
            resourcesPath, relativePath, packagedPath, copiedFiles,
            properties, fileset.filtered, fileset.packaged),
        });
      });
    }

    var fromFiles = filesFromFileSet(fromPath, fileset);
    if (fromFiles.length > 0) {
      fromFiles.forEach(fromFile => {
        var toFile = path.join(toPath, path.basename(fromFile));
        debug('COPY FROM', fromFile);
        debug('COPYING TO', toFile);
        yoFs.copy(fromFile, toFile, {
          process: processFunctionFactory(
            resourcesPath, relativePath, packagedPath, copiedFiles,
            properties, fileset.filtered, fileset.packaged),
        });
      });
    }

    copiedFiles = expandPathPlaceholders(targetPath, copiedFiles, properties, yoFs);

    debug('IN SUMMARY, WE COPIED', copiedFiles);
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
    debug('PROCESSING MODULE', module);
    var modulePath = path.join(directory, module.dir);
    properties.artifactId = fileFiltering.filter(module.id, properties);
    addModuleToParentPom(parentPomPath, properties, yoFs);
    var pomPath = copyPom(resourcesPath, targetPath, modulePath, properties, yoFs);
    processFileSets(resourcesPath, targetPath, modulePath, module.fileSets, properties, yoFs);
    processModules(resourcesPath, targetPath, modulePath, module.modules, pomPath, properties, yoFs);
  });
}

/**
 * This is a helper that is passed to mem-fs-editor.copy() so we can capture all of the files that
 * are copied and also so that we can perform content filtering in-place.
 *
 * @param {!string} basePath
 * @param {!string} relativePath
 * @param {!string} packagedPath
 * @param {!Array<string>} list
 * @param {!Object} properties
 * @param {!boolean} filtered
 * @param {!boolean} packaged
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
    var shortFilePath = filePath.substr(basePath.length);
    // +1 accounts for leading / in shortFilePath that is not in relativePath
    var veryShortFilePath = shortFilePath.substr(relativePath.length + 1);
    if (packaged) {
      // +1 accounts for leading / shortFilePath that is not in relativePath
      var pre = shortFilePath.substr(0, relativePath.length + 1);
      // +2 accounts for the leading / and also a trailing / to make joinable path elements
      var post = shortFilePath.substr(relativePath.length + 2);
      debug('PACKAGING PATH', pre, packagedPath, post);
      shortFilePath = path.join(pre, packagedPath, post);
    }
    debug('COPYING', veryShortFilePath, 'WITH SIZE', fileContent.length);
    list.push(shortFilePath);
    if (filtered) {
      debug('FILTERING', shortFilePath);

      var strFileContent = (fileContent instanceof Buffer ? fileContent.toString() : fileContent);
      fileContent = new Buffer(fileFiltering.filter(strFileContent, properties));
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
    var newPath = pathFiltering.filter(file, properties);
    if (file !== newPath) {
      yoFs.move(path.join(targetPath, file), path.join(targetPath, newPath));
      debug('EXPANDED PATH PLACEHOLDER ', newPath);
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
    throw new TypeError('At least one include must be provided');
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
    throw new TypeError('At least one include must be provided');
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
function globsToIgnoreFromFileSet (dirname, fileset) {
  if (fileset.excludes && fileset.excludes.length) {
    return fileset.excludes.map(exclude => path.join(dirname, exclude));
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
