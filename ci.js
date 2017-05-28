#!/usr/bin/env node
'use strict';
/* eslint-env node, shelljs */
let execSync = require('child_process').execSync;

var nodeVersion = String(process.env.TRAVIS_NODE_VERSION);
var cmd;

if (nodeVersion === '7') {
  cmd = 'npm run codecov:color';
} else {
  cmd = 'npm run test:color';
}

try {
  execSync(cmd, {stdio: [process.stdout, process.stderr]});
} catch (err) {
  console.log('ERROR: unable to execute tests: %s', err.message);
  process.exit(1);
}
