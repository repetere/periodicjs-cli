#!/usr/bin/env node
'use strict';

/**
 * Require dependencies
 */
const program = require('commander');
const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const path = require('path');
const async = require('async');


program
  .version(require('./package').version)
  .option('-a, --all', 'all environments')

// $ deploy deploy development
// $ deploy deploy staging
program
  .command('deploy [env]')
  .description('run deploy commands for specified environment')
  .action(function (env) {
    if (!env) {
      console.log('Please specify the environment')
    } else {
      env = env;
      console.log('deploy for %s env(s)', env);
    }
  });

program
  .command('deploy-sync')
  .alias('deploysync')
  .alias('ds')
  .description('')
  .action(function () {
    console.log('Running deploysync');
  });

program
  .command('post-install')
  .alias('postinstall')
  .description('Runs postinstall scripts for Periodic')
  .action(function () {
    console.log('Running post install script');
  });

program
  .command('pre-install')
  .alias('preinstall')
  .description('Runs preinstall scripts for Periodic')
  .action(function () {
    console.log('Running pre install script');
  });  

program
  .command('start [env]')
  .description('starts the application in the specified environment')
  .action(function (ext) {
    console.log(`Starting application in ${env}`);
  });

program
  .command('stop')
  .description('stops the application')
  .action(function () {
    console.log('Stopping application');
  });

program
  .command('test')
  .description('Recursively runs mocha tests')
  .action(function () {
    console.log('Running tests');
  });

function installExtension(extension) {
  if (extension.indexOf('@') !== -1) {
    let [name, version] = extension.split('@');
    console.log(`Installing ${name}@${version}`);
  } else {
    console.log(`Installing ${extension}@latest`);
  }
};

function removeExtension(extension) {
  console.log(`Removing ${extension}`);
};

program
  .command('install [ext...]')
  .alias('i')
  .description('Installs extension for current Periodic Project')
  .action(function (extensions) {
    if (!extensions) console.log('Please specify extension name')
    else {
      extensions.forEach(extension => installExtension(extension));
    }
  });

program
  .command('remove [ext...]')
  .alias('r')
  .description('Removes extensions from current Periodic Project')
  .action(function (extensions) {
    if (!extensions) console.log('Please specify an extension you\'d like to remove');
    else {
      extensions.forEach(extension => removeExtension(extension));
    }
  });

program
  .command('upgrade [version]')
  .alias('u')
  .description('Installs PeriodicJS in current directory at specified version')
  .action(function (version) {

  });

program
  .command('setup')
  .alias('s')
  .description('Installs PeriodicJS at latest version')
  .action(function () {
    
  });

program.parse(process.argv);