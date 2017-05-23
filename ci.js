#!/usr/bin/env node
/* eslint-env node, shelljs */
require('shelljs/global');

var nodeVersion = String(process.env.TRAVIS_NODE_VERSION);
var cmd;

if (nodeVersion === '7') {
  cmd = 'npm run codecov:color';
} else {
  cmd = 'npm run test:color';
}

var proc = exec(cmd, {stdin: 'inherit'});
if (proc === undefined || proc === null) {
  echo('ERROR: unable to execute tests');
  exit(1);
} else if (proc.code !== 0) {
  echo('ERROR: unable to execute tests');
  exit(proc.code);
}
