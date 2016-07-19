/**
 * This example shows how to create an object representing a directory tree with basic ignore file support.
 */

'use strict'

if (typeof Promise === 'undefined')
    global.Promise = require('bluebird')

var fs      = require('fs'),
    resolve = require('path').resolve,
    adir    = require('../'),
    dir     = resolve(__dirname, '../'),
    gignore = [
        '.DS_Store',
        '.git',
        '.idea'
    ],
    ignore  = fs.readFileSync(resolve(dir, '.gitignore'), 'utf8')
                .split(/\n+|\r+/g)
                .filter(Boolean)
                .concat(gignore),
    tree    = {}

function onEntry(stats, subtree) {
    var name = stats.basename

    if (~ignore.indexOf(name))
        // stop aggregation under the excluded folder
        return adir.break

    if (stats.isDirectory())
        return subtree[ name ] = {}
    else
        subtree[ name ] = stats.size
}

function done(err) {
    if (err)
        console.error(err.stack)
    else
        console.log(tree)
}

adir(dir, onEntry, tree, done)
