/**
 * This example shows how to find all the markdown files in a directory and it's subdirectories.
 */

'use strict'

var path = require('path'),
    adir = require('../'),
    dir  = path.resolve(__dirname, '..'),
    res  = []

function onEntry(stats) {
    if (
        stats.isFile() &&
        path.extname(stats.basename) === '.md'
    )
        res.push(stats.path)
}

function done(err) {
    if (err)
        console.error(err.stack)
    else
        console.log(res)
}

adir(dir, onEntry, done)
