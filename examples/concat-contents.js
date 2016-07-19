/**
 * todo: describe it
 */

'use strict'

var fs   = require('fs'),
    path = require('path'),
    adir = require('../'),
    file = fs.createWriteStream(path.resolve(__dirname, 'all_examples.js'), 'utf8')

function onEntry(stats) {
    if (stats.isFile() && stats.basename !== '.DS_Store')
        // if a promise is returned then that will be awaited
        return new Promise(function (done, error) {
            fs.readFile(stats.path, 'utf8', function (err, content) {
                if (err)
                    error(err)
                else {
                    file.write(content)
                    done()
                }
            })
        })
}

function done(err) {
    if (err)
        console.error(err.stack)
    else
        // it's guaranteed that all the io operations initiated by `onEntry`
        // are finished, because of the returned promises
        file.close()
}

adir(__dirname, onEntry, done)
