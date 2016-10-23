'use strict';

var common = module.exports;

common.alfresco_module_registry = require('./lib/alfresco-module-registry');
common.constants = require('./lib/constants');
common.dependency_versions = require('./lib/dependency-versions');
common.generator_output = require('./lib/generator-output');
common.java_properties = require('./lib/java-properties');
common.maven_pom = require('./lib/maven-pom');
common.mem_fs_utils = require('./lib/mem-fs-utils');
common.prompt_filters = require('./lib/prompt-filters');
common.prompt_validators = require('./lib/prompt-validators');
common.spring_context = require('./lib/spring-context');
common.tomcat_context = require('./lib/tomcat-context');
common.xml_dom_utils = require('./lib/xml-dom-utils');

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
