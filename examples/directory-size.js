/**
 * This example shows how to calculate the size of a directory.
 */

'use strict'

if (typeof Promise === 'undefined')
    global.Promise = require('bluebird')

var fs   = require('fs'),
    path = require('path'),
    adir = require('../'),
    dir  = path.resolve(__dirname, '../'),
    sum  = 0

function onEntry(stats) {
    // only count the size of files (including symlinks)
    if (!stats.isDirectory())
        sum += stats.size
}

function onError(err) {
    console.error(err.stack)
}

function onEnd() {
    console.log('size of the project directory is', sum, 'bytes')
}

adir(dir, onEntry).then(onEnd, onError)
