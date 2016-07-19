'use strict'

require('./init')

if (typeof Promise === 'undefined')
    global.Promise = require('bluebird')

var resolve = require('path').resolve,
    assert  = require('assert'),
    test    = require('tap'),
    adir    = require('../'),
    home    = resolve(__dirname, 'tmp')

function noop() {
}

// Validate the exposed API.
test.test('api', function (test) {
    test.type(adir, 'function', 'main export should be a function')
    test.type(adir.version, 'string', 'adir.version should be a string')
    test.equal(
        adir.version,
        require('../package.json').version,
        'adir.version should equal to the version in package manifest'
    )
    test.throws(
        function () {
            adir.version = true
        },
        TypeError,
        'adir.version should be read-only'
    )

    test.test('fs interface', function (test) {
        var fs = require('fs')

        test.strictEqual(adir.fs, fs, 'adir.fs should default to the native fs module')

        test.throws(
            function () {
                adir.fs = true
            },
            assert.AssertionError,
            'adir.fs should be asserted'
        )
        test.throws(
            function () {
                adir.fs = 'error'
            },
            assert.AssertionError,
            'adir.fs should be asserted'
        )
        test.throws(
            function () {
                adir.fs = {}
            },
            assert.AssertionError,
            'adir.fs should be asserted'
        )
        test.throws(
            function () {
                adir.fs = adir
            },
            assert.AssertionError,
            'adir.fs should be asserted'
        )
        test.throws(
            function () {
                adir.fs = { readdir: true, lstat: true }
            },
            assert.AssertionError,
            'adir.fs should be asserted'
        )
        test.doesNotThrow(
            function () {
                adir.fs = { readdir: adir, lstat: adir }
            },
            'adir.fs should be accepted'
        )

        adir.fs = require('fs') // reset to default for later tests
        test.end()
    })

    test.test('signatures', function (test) {
        test.throws(
            adir,
            assert.AssertionError,
            'adir() arguments should be asserted'
        )
        test.throws(
            function () {
                adir(true)
            },
            assert.AssertionError,
            'adir() arguments should be asserted'
        )
        test.throws(
            function () {
                adir(adir, null, noop)
            },
            assert.AssertionError,
            'adir() arguments should be asserted'
        )
        test.throws(
            function () {
                adir({}, null, noop, noop)
            },
            assert.AssertionError,
            'adir() arguments should be asserted'
        )
        test.throws(
            function () {
                adir('path', null, noop, noop, true)
            },
            assert.AssertionError,
            'adir() arguments should be asserted'
        )

        test.end()
    })

    test.end()
})

// This test ensures that all the expected entries are iterated
// even if there is no aggregated value returned by `onDirectory`.
test.test('simple iteration', function (test) {
    var counter = 0

    function onDir() {
        counter++
    }

    function onFile() {
        counter++
    }

    function onEnd() {
        test.equal(counter, 12, 'all the entries should be iterated')
        test.end()
    }

    adir(home, 0, onDir, onFile, onEnd).catch(test.threw)
})

// Test aggregation with a primitive initial value.
test.test('parent count', function (test) {
    var actual   = [],
        expected = [ 0, 1, 2, 3, 5 ]

    function onDir(path, base, count) {
        return count + 1
    }

    function onFile(path, base, count) {
        actual.push(count)
    }

    function onEnd() {
        test.same(actual, expected, 'parent directory counters should be set correctly')
        test.end()
    }

    adir(home, 0, onDir, onFile, onEnd).catch(test.threw)
})

// Test aggregation with a reference initial value type.
test.test('directory tree', function (test) {
    var actual   = {},
        expected = {
            'test.txt': true,

            a: {
                'test.txt': true,

                test: {},

                b: {
                    'test.txt': true,

                    test: {},

                    c: {
                        'test.txt': true,

                        d: {
                            e: { 'test.txt': true }
                        }
                    }
                }
            }
        }

    function onDir(path, base, tree) {
        return tree[ base ] = {}
    }

    function onFile(path, base, tree) {
        tree[ base ] = true
    }

    function onEnd() {
        test.same(actual, expected, 'directory tree should be built correctly')
        test.end()
    }

    adir(home, actual, onDir, onFile)
        .then(onEnd) // test this signature
        .catch(test.threw)
})

// This test ensures that
// 1) the provided `onDirectory` and `onFile` handlers are called respectively and
// 2) the returned promises from `onDirectory` and `onFile` handlers are awaited as expected.
test.test('stats', function (test) {
    var lstat = require('fs').lstat,
        dirs  = 0

    function onDir(path) {
        return new Promise(function (ok, error) {
            lstat(path, function (err, stat) {
                if (err)
                    error(err)
                else {
                    dirs++

                    test.ok(stat.isDirectory())
                    ok()
                }
            })
        })
    }

    function onFile(path) {
        return new Promise(function (ok, error) {
            lstat(path, function (err, stat) {
                if (err)
                    error(err)
                else {
                    test.ok(
                        stat.isFile() ||
                        stat.isSymbolicLink()
                    )
                    ok()
                }
            })
        })
    }

    function onEnd() {
        /*
         * ./tmp/a
         * ./tmp/a/test
         * ./tmp/a/b
         * ./tmp/a/b/test
         * ./tmp/a/b/c
         * ./tmp/a/b/c/d
         * ./tmp/a/b/c/d/e
         */
        test.equal(dirs, 7, 'all the directories should be aggregated before `onEnd` fires')
        test.end()
    }

    adir(home, null, onDir, onFile, onEnd).catch(test.threw)
})

test.test('errors', function (test) {
    var path    = resolve(home, 'non-existing-path'),
        pending = 2

    function done(err) {
        test.type(err, Error)
        --pending || test.end()
    }

    // test error of the readdir call
    adir(path, null, noop, noop).catch(done)
    // this will cause an `ELOOP` because of the symlink loop
    // (unless lstat, stat follows symlinks)
    adir.fs.lstat = require('fs').stat
    // test error of the stat call
    adir(home, null, noop, noop).catch(done)
})
