/**
 * @module adir
 * @exports startDirectoryAggregation
 */

'use strict'

exports = module.exports = startDirectoryAggregation

var fs     = require('fs'),
    join   = require('path').join,
    assert = require('assert'),
    equal  = assert.equal,
    stop   = {}

/**
 * @param {string} path - Root directory to start iterating on.
 * @param {function(fs.Stats,*)} onEntry - Function to execute on each directory or file.
 * @param {*} value - Initial value of aggregation.
 * @returns {Promise}
 */
function aggregateDirectory(path, onEntry, value) {
    return new Promise(function (done, error) {
        fs.readdir(path, function (err, list) {
            if (err)
                return error(err)

            var tasks   = [],
                pending = list.length

            if (!pending)
                return done()

            list.forEach(function (basename) {
                var subpath = join(path, basename)

                function next(value) {
                    if (value !== stop)
                        return aggregateDirectory(subpath, onEntry, value).catch(error)
                }

                fs.lstat(subpath, function (err, stats) {
                    if (err)
                        return error(err)

                    stats.path     = subpath
                    stats.basename = basename

                    var result = onEntry(stats, value),
                        isTask = result instanceof Promise

                    if (stats.isDirectory()) {
                        if (isTask)
                            tasks.push(result.then(next, error))
                        else if (result !== stop)
                            tasks.push(next(result))
                    }
                    else if (isTask)
                        tasks.push(result)

                    if (!--pending)
                        Promise.all(tasks)
                               // result is the task array,
                               // which is irrelevant to the user
                               .then(function () {
                                   done(null)
                               }, error)
                })
            })
        })
    })
}

/**
 * Aggregate a directory tree recursively.
 *
 * @param {string} path - Root directory to start iterating on.
 * @param {function(fs.Stats,*)} onEntry - Function to execute on each directory or file.
 * @param {*} [value] - Initial value of aggregation.
 * @param {function(Error|null)} [callback] - Called when the aggregation ends.
 * @returns {Promise}
 */
function startDirectoryAggregation(path, onEntry, value, callback) {
    equal(typeof path, 'string', 'directory path must be a string')
    equal(typeof onEntry, 'function', 'onFile must be a function')

    if (callback !== undefined)
        equal(typeof callback, 'function', 'callback must be a function')
    else if (typeof value === 'function') {
        callback = value
        value    = undefined
    }

    var res = aggregateDirectory(path, onEntry, value)

    if (callback)
        res.then(callback, callback)

    return res
}

Object.defineProperties(exports, {
    // exclude inherited properties if any
    __proto__: null,

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
    },

    /**
     * @prop {object} break - Reference used to signal the end of an aggregation branch.
     */
    break: {
        enumerable: true,
        value:      stop
    }
})
