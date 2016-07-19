/**
 * This example shows how to create an object representing a directory tree.
 */

'use strict'

if (typeof Promise === 'undefined')
    global.Promise = require('bluebird')

var path  = require('path'),
    adir  = require('../'),
    dir   = path.resolve(__dirname, '../'),
    index = {}

function onDirectory(path, base, index) {
    var node      = {}
    index[ base ] = node
    return node
}

function onFile(path, base, index) {
    index[ base ] = true
}

function done(err) {
    if (err)
        console.error(err.stack)
    else
        console.log(index)
}

adir(dir, index, onDirectory, onFile, done)
