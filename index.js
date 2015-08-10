#! /usr/bin/env node

var fs = require('fs');
var path = require('path');
var argv = require('yargs').argv;

var server = require('./server');
var tanks = {};

var normalizedPath = path.join(__dirname, "tanks");
fs.readdirSync(normalizedPath).forEach(function(file) {
	tanks[path.parse(file).name] = require("./tanks/" + file);
});

// console.log('tanks', tanks);

var tank = tanks[argv.tank || 'noop'];

server.start(tank);
