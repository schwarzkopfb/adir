/**
 * @module adir
 */

'use strict'

module.exports = aggregateDirectory

var fs     = require('fs'),
    join   = require('path').join,
    assert = require('assert'),
    equal  = assert.equal

/**
 * Aggregate a directory tree recursively.
 *
 * @param {string} path - Root directory to start iterating on.
 * @param {*} value - Initial value of aggregation.
 * @param {function} onDirectory - Called each time when iteration reaches a directory in tree.
 * @param {function} onFile - Called each time when iteration reaches a file in tree.
 * @param {function(Error|null)} [callback] - Called when the iteration ends.
 * @returns {Promise}
 */
function aggregateDirectory(path, value, onDirectory, onFile, callback) {
    equal(typeof path, 'string', 'directory path must be a string')
    equal(typeof onFile, 'function', 'onFile must be a function')
    equal(typeof onDirectory, 'function', 'onDirectory must be a function')

    if (callback !== undefined)
        equal(typeof callback, 'function', 'callback must be a function')

    var res = new Promise(function (done, error) {
        fs.readdir(path, function (err, list) {
            if (err)
                error(err)
            else {
                var tasks   = [],
                    pending = list.length

                if (!pending)
                    return done()

                list.forEach(function (item) {
                    var subpath = join(path, item)

                    fs.lstat(subpath, function (err, stat) {
                        if (err)
                            return error(err)

                        if (stat.isDirectory()) {
                            var next = function (value) {
                                return aggregateDirectory(subpath, value, onDirectory, onFile)
                            }

                            var transform = onDirectory(subpath, item, value)

                            if (transform instanceof Promise)
                                tasks.push(transform.then(next))
                            else {
                                var val = transform === undefined
                                    ? value
                                    : transform

                                tasks.push(next(val))
                            }
                        }
                        else {
                            var task = onFile(subpath, item, value)

                            if (task instanceof Promise)
                                tasks.push(task)
                        }

                        --pending || Promise.all(tasks)
                                            // result is the task array,
                                            // which is irrelevant to the user
                                            .then(function () {
                                                done(null)
                                            }, error)
                    })
                })
            }
        })
    })

    if (callback)
        res.then(callback, callback)

    return res
}

Object.defineProperties(aggregateDirectory, {
    /**
     * @prop {string} version - The version string from package manifest.
     */
    version: {
        enumerable: true,

        get: function () {
            return require('./package.json').version
        }
    },

    /**
     * @prop {string} fs - The file system interface to use.
     */
    fs: {
        enumerable: true,

        get: function () {
            return fs
        },
        set: function (value) {
            assert(value, 'fs interface must be an object')
            equal(typeof value.lstat, 'function', 'fs interface must have an lstat method')
            equal(typeof value.readdir, 'function', 'fs interface must have a readdir method')

            fs = value
        }
    }
})
