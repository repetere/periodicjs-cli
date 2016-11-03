'use strict';
/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2016 Yaw Joseph Etse. All rights reserved.
 */

const fs =  require('fs');
const path = require('path');
const colors = require('colors');
const node_modules_dir_path = path.join(process.cwd(),'node_modules');
const package_json_file_path = path.join(process.cwd(),'package.json');

var npm_init_polyfill_promise = new Promise((resolve,reject)=>{
	//check existing node_modules folder
	fs.stat(node_modules_dir_path,(err,filedata)=>{
		if(err){
			reject(err);
		}
		else{
			resolve(filedata);
		}
	});
});

const init = function () {
	return npm_init_polyfill_promise.then(null,(/*error*/)=>{
		//folder doesn't exist
		return new Promise((resolve,reject)=>{
			fs.mkdir(node_modules_dir_path,(err)=>{
				if(err){
					reject(err);
				}
				else {
					resolve();
				}
			});
		});
	})
	.then(()=>{
		//check package json
		return new Promise((resolve,reject)=>{
			fs.stat(package_json_file_path, (err, filedata) => {
				if(err){
					reject(err);
				}
				else {
					resolve(filedata);
				}
			});
		});
	})
	.then((/*package_json_data*/)=>{
			console.log('Completed Preinstall'.green);
		},(/*error*/)=>{
		//package.json doesn't exist
		fs.writeFile(package_json_file_path, '{}', 'utf8', (err) => {
				if(err){
						console.log('Could not Preinstall Periodic while creating package.json',err.stack);
					}
				else{
					console.log('Completed Preinstall'.green);
				}
			});
	})
	.catch((e)=>{
		console.log('Could not Preinstall Periodic',e.stack);
	});
}

module.exports = { init };