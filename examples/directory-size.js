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

function onDirectory() {
    // only count the size of files
}

function onFile(path) {
    return new Promise(function (done, error) {
        fs.lstat(path, function (err, stat) {
            if (err)
                error(err)
            else {
                sum += stat.size
                done()
            }
        })
    })
}

function onEnd() {
    console.log('size of the project directory is', sum, 'bytes')
}

adir(dir, null, onDirectory, onFile)
    .then(onEnd)
    .catch(function (err) {
        console.error(err.stack)
    })
