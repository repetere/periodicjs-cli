# Periodicjs-CLI

[![Build Status](https://travis-ci.org/typesettin/periodicjs.svg?branch=master)](https://travis-ci.org/typesettin/periodic-cli) [![NPM version](https://badge.fury.io/js/periodic-cli.svg)](http://badge.fury.io/js/periodic-cli) 

## Periodic is an application framework for data driven, web and mobile applications. 

The platform is 100% open source and composed of extremely modular components that enable creating bespoke [Node.js](nodejs.org)/[Express](expressjs.com)/[MongoDB](http://www.mongodb.org/) based applications efficiently with new or existing themes and extensions.

### What can I build with Periodic?
The platform is built with the UNIX / small utility / modular application design philosophy in mind. Content creators, developers, software engineers and entrepreneurs are encouraged to build large robust applications by integrating small single purposed extensions.

Periodic emphasizes a curated (and non-opinionated) workflow, using Express with MongoDB and an extremely malleable data model. 

The use of additional frameworks, templating languages and design libraries is highly encouraged.

Applications built with Periodic range from simple blogs, complicated enterprise media publications, mobile application datastores, e-commerce platforms and more.

### Installation
```
$ npm i periodic-cli nodemon -g
```

### CLI Commands
```
$ periodicjs setup [version (default is to install the latest version)] # installs periodicjs from npm
$ periodicjs start [name-of-environment (development by default)] # runs nodemon
$ periodicjs deploy [name-of-environment (development by default)] # deploys with pm2
$ periodicjs deploy-sync # synchronize extensions with manifest json file
$ periodicjs test # synchronize extensions with manifest json file
$ periodicjs install [ext] # install new periodic extension
$ periodicjs remove [ext] # remove periodic extension
$ periodicjs upgrade [version (default is to install the latest version)] # upgrade periodicjs from npm
```