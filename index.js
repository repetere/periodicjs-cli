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
const app_pre_install = require('./scripts/app_pre_install');
const app_post_install = require('./scripts/app_post_install');
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
        run_cmd( 'pm2', ['deploy', path.resolve(process.cwd(),'content/config/deployment/ecosystem.json')], function (err, text) { console.log(text.green.underline) });
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
    console.log('Running deploysync'.green.underline);
    npm_deploysync.deploy_sync_promise()
      .then(result => {
        console.log(`Successfully ran deploysync`.green.underline);
      })
      .catch(err => { 
        console.log(`Error running deploysync: ${err}`.red.underline);
      });
  });

program
  .command('forever')
  .alias('f')
  .description('')
  .action((env = 'development') => {
    run_cmd('forever', ['start', '-o', 'logs/app-out.forever.log', '-e', 'logs/app-err.forever.log', '-c', 'nodemon', 'index.js', '--e', env], function (err, text) { console.log(text.green.underline) });
  });

program
  .command('coverage')
  .alias('c')
  .description('')
  .action(() => {
    run_cmd('mocha', ['-R', 'html-cov', '--recursive > test/coverage.html'], function (err, text) { console.log(text.green.underline) });
  });

program
  .command('start [env]')
  .description('starts the application in the specified environment')
  .action((env = 'development') => {
    let message = 'Starting application';
    if (env) message = `Starting application in ${env}`;
    console.log(message.green.underline);
    run_cmd('nodemon', ['index.js', '--e', env], function (err, text) { console.log(text.green.underline) });
  });

program
  .command('stop')
  .description('Stops the forever instance of the application')
  .action(() => {
    run_cmd('forever', ['stop', '-c', 'nodemon', 'index.js'], function (err, text) { console.log(text.green.underline) });
  });

program
  .command('test')
  .description('Recursively runs mocha tests')
  .action(function () {
    console.log('Running tests'.green.underline);
    run_cmd('mocha', ['-R', 'spec', '--recursive'], function (err, text) { console.log(text.green.underline) });
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
    console.log(`Installing ${name}@${version}`.green.underline);
    npm.load(npm_load_options, function (err) {
      if (err) return console.log(`Error installing extension ${name}`.red.underline);
      npm.commands.install([`periodicjs.ext.${name}@${version}`], function (err, data) {
        if (err) return console.log(`Error installing extension ${name}`.red.underline)
        console.log(`Successfully installed extension ${name}@${version}`.green.underline);
      })
    })
  } else {
    console.log(`Installing ${extension}@latest`.green.underline);
    npm.load(npm_load_options, function (err) {
      if (err) return console.log(`Error installing extension ${name}`.red.underline);
      npm.commands.install([`periodicjs.ext.${extension}`], function (err, data) {
        if (err) return console.log(`Error installing extension ${extension}`.red.underline)
        console.log(`Successfully installed extension ${extension}@$latest`.green.underline);
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
  console.log(`Removing extension ${extension}`.green.underline);
  npm.load(npm_load_options, function (err) {
    if (err) return console.log(`Error removing extension ${err}`.red.underline);
    npm.commands.remove([`periodicjs.ext.${extension}`], function (err, data) {
      if (err) return console.log(`Error removing extension ${err}`.red.underline)
      console.log(`Successfully removed extension ${extension}`.green.underline);
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
    console.log(`Starting PeriodicJS@${version} install`.green.underline);
    npm.load(npm_load_options, (err) => {
      if (err) return err;
      npm.commands.install([`periodicjs@${version}`], (err) => {
        if (err) return err
        fs.remove(install_prefix + '/node_modules/periodicjs', (err) => {
          if (err) return console.log('Error removing periodicjs from node_modules');
        });
        console.log(`Installed periodicjs@${version}`.green.underline)
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
    console.log('Starting PeriodicJS install'.green.underline);
    
    npm.load(npm_load_options, (err) => {
      if (err) return err;
      npm.commands.install(['periodicjs'], (err) => {
        if (err) return err
        console.log(install_prefix);
        fs.remove(install_prefix + '/node_modules/periodicjs', (err) => {
          if (err) return console.log('Error removing periodicjs from node_modules');
        });
        console.log('Installed periodicjs'.green.underline)
      })
    })
  });

program
  .command('pre-install')
  .alias('preinstall')
  .description('Runs periodicjs preinstall script')
  .action(function () {
    app_pre_install.init(install_prefix);
  });

program
  .command('post-install')
  .alias('postinstall')
  .description('Runs periodicjs postinstall script')
  .action(function () {
    app_post_install.init(install_prefix);
  });  

program.parse(process.argv);