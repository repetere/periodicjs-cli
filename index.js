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
const nodemon = require('nodemon');
const npm = require('npm');
const npm_deploysync = require('./scripts/npm_deploymentsync');
const colors = require('colors');
const spawn = require('child_process').spawn;
let install_prefix = process.cwd();
let child;

program
  .version(require('./package').version)
  .option('-a, --all', 'all environments')

var run_cmd = function (cmd, args, callback, env) {
  var spawn = require('child_process').spawn;

  if (env) {
    child = spawn(cmd, args, env);		
  }
  else {
    child = spawn(cmd, args);		
  }

  child.stdout.on('error', function (err) {
    console.error(err);
    process.exit(0);
  });

  child.stdout.on('data', function (buffer) {
    console.log(buffer.toString());
  });

  child.stderr.on('data', function (buffer) {
    console.error(buffer.toString());
  });

  child.on('exit', function () {
    callback(null, 'command run: ' + cmd + ' ' + args);
    process.exit(0);
  }); 
};

// $ deploy deploy development
// $ deploy deploy staging
program
  .command('deploy [env]')
  .description('run deploy commands for specified environment')
  .action(function (env) {
    if (!env) {
      console.log('Please specify the environment')
    } else {
      try {
        console.log('deploying for %s env(s)', env);
        run_cmd( 'pm2', ['deploy', path.resolve(process.cwd(),'content/config/deployment/ecosystem.json')], function(err,text) { console.log (text); }, env);
      }
      catch (e) {
        logger.error(e);
        logger.error(e.stack);
        process.exit(0);
      }      
    }
  });

program
  .command('deploy-sync')
  .alias('deploysync')
  .alias('ds')
  .description('')
  .action(function () {
    console.log('Running deploysync'.america.underline);
    npm_deploysync.deploy_sync_promise()
      .then(result => {
        console.log(`Successfully ran deploysync`.green.underline);
      })
      .catch(err => { 
        console.log(`Error running deploysync: ${err}`.red);
      });
  });

program
  .command('start [env]')
  .description('starts the application in the specified environment')
  .action(function (env) {
    console.log(`Starting application in ${env}`.america.underline);
    run_cmd('nodemon', ['index.js', '--e', env], function (err, text) { console.log(text).rainbow.underline }, env);
  });

program
  .command('test')
  .description('Recursively runs mocha tests')
  .action(function () {
    console.log('Running tests'.green.underline);
    run_cmd('mocha', ['-R', 'spec', '--recursive'], function (err, text) { console.log(text.rainbow.underline) } );
  });

function installExtension(extension) {
  let npm_load_options = {
    'strict-ssl': false,
    'save-optional': true,
    'no-optional': true,
    'production': true,
    prefix: install_prefix
  };

  if (extension.indexOf('@') !== -1) {
    let [name, version] = extension.split('@');
    console.log(`Installing ${name}@${version}`.rainbow.underline);
    npm.load(npm_load_options, function (err) {
      if (err) return console.log(`Error installing extension ${name}`.red);
      npm.commands.install([`periodicjs.ext.${name}@${version}`], function (err, data) {
        if (err) return console.log(`Error installing extension ${name}`.red)
        console.log(`Successfully installed extension ${name}@${version}`.america);
      })
    })
  } else {
    console.log(`Installing ${extension}@latest`.rainbow.underline);
    npm.load(npm_load_options, function (err) {
      if (err) return console.log(`Error installing extension ${name}`.red);
      npm.commands.install([`periodicjs.ext.${extension}`], function (err, data) {
        if (err) return console.log(`Error installing extension ${extension}`.red)
        console.log(`Successfully installed extension ${extension}@$latest`.america);
      })
    })    
  }
};

function removeExtension(extension) {
  let npm_load_options = {
    'strict-ssl': false,
    'save-optional': true,
    'no-optional': true,
    'production': true,
    prefix: install_prefix
  };
  console.log(`Removing extension ${extension}`.rainbow);
  npm.load(npm_load_options, function (err) {
    if (err) return console.log(`Error removing extension ${err}`.red);
    npm.commands.remove([`periodicjs.ext.${extension}`], function (err, data) {
      if (err) return console.log(`Error removing extension ${err}`.red)
      console.log(`Successfully removed extension ${extension}`.america);
    })
  })
};

program
  .command('install [ext...]')
  .alias('i')
  .description('Installs extension for current Periodic Project')
  .action(function (extensions) {
    if (!extensions) console.log('Please specify extension name')
    extensions.forEach(extension => installExtension(extension));
  });

program
  .command('remove [ext...]')
  .alias('r')
  .description('Removes extensions from current Periodic Project')
  .action(function (extensions) {
    if (!extensions) return console.log('Please specify an extension you\'d like to remove');
    extensions.forEach(extension => removeExtension(extension));
  });

program
  .command('upgrade [version]')
  .alias('u')
  .description('Installs PeriodicJS in current directory at specified version')
  .action(function (version) {
    let npm_load_options = {
      'strict-ssl': false,
      'save-optional': true,
      'no-optional': true,
      'production': true,
      prefix: install_prefix
    };
    console.log(`Starting PeriodicJS@${version} install`.rainbow.underline);
    npm.load(npm_load_options, (err) => {
      if (err) return err;
      npm.commands.install([`periodicjs@${version}`], (err) => {
        if (err) return err
        fs.remove(install_prefix + '/node_modules/periodicjs', (err) => {
          if (err) return console.log('Error removing periodicjs from node_modules');
        });
        console.log(`Installed periodicjs@${version}`.america.underline)
      })
    })
  });

program
  .command('setup')
  .alias('s')
  .description('Installs PeriodicJS at latest version')
  .action(function () {
    let npm_load_options = {
      'strict-ssl': false,
      'save-optional': true,
      'no-optional': true,
      'production': true,
      prefix: install_prefix
    };
    console.log('Starting PeriodicJS install'.rainbow.underline);
    npm.load(npm_load_options, (err) => {
      if (err) return err;
      npm.commands.install(['periodicjs'], (err) => {
        if (err) return err
        console.log(install_prefix);
        fs.remove(install_prefix + '/node_modules/periodicjs', (err) => {
          if (err) return console.log('Error removing periodicjs from node_modules');
        });
        console.log('Installed periodicjs'.america.underline)
      })
    })
  });

program.parse(process.argv);