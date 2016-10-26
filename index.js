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
  console.log(`Installing ${extension}`);
};

program
  .command('install [ext...]')
  .alias('i')
  .description('Installs extension to current Periodic Project')
  .action(function (extensions) {
    if (!extensions) console.log('Please specify extension name: ex: "periodic-cli install oauth2server"')
    else {
      extensions.forEach(extension => installExtension(extension));
    }
  });

program
  (remove externsionsp

  upgrade(install periodicjs @ version)

  setup alias upgrade latest


program.parse(process.argv);