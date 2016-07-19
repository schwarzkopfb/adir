'use strict'

require('./init')

if (typeof Promise === 'undefined')
    global.Promise = require('bluebird')

var fs      = require('fs'),
    resolve = require('path').resolve,
    assert  = require('assert'),
    test    = require('tap'),
    adir    = require('../'),
    home    = resolve(__dirname, 'tmp')

// see only debug output
switch (process.argv[ 2 ]) {
    case '-d':
    case '--debug':
        test.unpipe(process.stdout)
            .pipe(fs.createWriteStream('/dev/null'))
}

function noop() {
}

process.on('unhandledRejection', function () {
    test.fail('all the rejections should be handled')
})

// Validate the exposed API.
test.test('api', function (test) {
    test.type(adir, 'function', 'main export should be a function')
    test.type(adir(home, noop), Promise, 'adir() should return a Promise')

    test.test('callback signatures', function (test) {
        var ival = {}

        return adir(home, function (stats, val) {
            test.type(stats, fs.Stats, 'first argument for `onEntry` should be an `fs.Stats` instance')
            test.type(stats.path, 'string', '`fs.Stats` instance should be extended with `path`')
            test.type(stats.basename, 'string', '`fs.Stats` instance should be extended with `basename`')
            test.strictEqual(val, ival, '`initialValue` should be passed to `onEntry` when first called')

            return val
        }, ival)
    })

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

    test.type(adir.break, 'object', 'adir.break should be an object')
    test.throws(
        function () {
            adir.break = true
        },
        TypeError,
        'adir.break should be read-only'
    )

    test.test('fs interface', function (test) {
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

        adir.fs = fs // reset to default for later tests
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
                adir('path')
            },
            assert.AssertionError,
            'adir() arguments should be asserted'
        )
        test.throws(
            function () {
                adir(adir, noop)
            },
            assert.AssertionError,
            'adir() arguments should be asserted'
        )
        test.throws(
            function () {
                adir({}, noop, noop)
            },
            assert.AssertionError,
            'adir() arguments should be asserted'
        )
        test.throws(
            function () {
                adir('path', noop, null, true)
            },
            assert.AssertionError,
            'adir() arguments should be asserted'
        )
        test.throws(
            function () {
                adir('path', true, null, noop)
            },
            assert.AssertionError,
            'adir() arguments should be asserted'
        )

        // valid signatures
        var tasks = [
            adir(home, noop),
            adir(home, noop, noop),
            adir(home, noop, true, noop),
        ]
        Promise.all(tasks)
               .then(test.end, test.threw)
    })

    test.end()
})

// This test ensures that all the expected entries are iterated
// even if there is no aggregated value returned by `onEntry`.
test.test('simple iteration', function (test) {
    var expected = [
            'a', 'b', 'c', 'd', 'e',
            'test', 'test',
            'test.txt', 'test.txt', 'test.txt',
            'test.txt', 'test.txt'
        ],
        actual   = []

    function onEntry(stats) {
        actual.push(stats.basename)
    }

    function onEnd() {
        test.same(actual.sort(), expected, 'all the expected entries should be iterated')
        test.end()
    }

    adir(home, onEntry).then(onEnd, test.threw)
})

// Test aggregation with a primitive initial value.
test.test('parent count', function (test) {
    var actual   = [],
        expected = [ 0, 1, 2, 3, 5 ]

    function onEntry(stats, count) {
        if (stats.isDirectory())
            return count + 1
        else
            actual.push(count)
    }

    function onEnd() {
        test.same(actual, expected, 'parent directory counters should be set correctly')
        test.end()
    }

    adir(home, onEntry, 0).then(onEnd, test.threw)
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

    function onEntry(stats, tree) {
        var name = stats.basename

        if (stats.isDirectory())
            return tree[ name ] = {}
        else
            tree[ name ] = true
    }

    function onEnd() {
        test.same(actual, expected, 'directory tree should be built correctly')
        test.end()
    }

    adir(home, onEntry, actual)
        .then(onEnd)
        .catch(test.threw)
})

// This test ensures that
// 1) the expected `fs.Stats` instances are provided to `onEntry` and
// 2) the returned promises from `onEntry` calls are awaited.
test.test('stats', function (test) {
    var lstat = fs.lstat,
        dirs  = 0

    function onEntry(stats) {
        var path  = stats.path,
            isDir = stats.isDirectory()

        return new Promise(function (ok, error) {
            lstat(path, function (err, stats) {
                if (err)
                    error(err)
                else {
                    var res

                    if (isDir) {
                        dirs++
                        res = stats.isDirectory()
                    }
                    else
                        res = stats.isFile() || stats.isSymbolicLink()

                    test.ok(res)
                    ok()
                }
            })
        })
    }

    function done(err) {
        if (err)
            return test.threw(err)

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

    adir(home, onEntry, done)
})

// This test ensures that the user can stop an aggregation branch if returns `adir.break` from an `onEntry` handler.
test.test('stop aggregation', function (test) {
    test.plan(2)

    test.test('sync', function (test) {
        var counter = 0

        function onEntry(stats) {
            counter++

            if (stats.basename === 'b')
                return adir.break
        }

        function onEnd() {
            test.equal(counter, 5, 'aggregation should be stopped')
            test.end()
        }

        adir(home, onEntry).then(onEnd, test.threw)
    })

    test.test('async', function (test) {
        var counter = 0

        function onEntry(stats) {
            counter++

            if (stats.basename === 'b')
                return new Promise(function (done) {
                    process.nextTick(function () {
                        done(adir.break)
                    })
                })
        }

        function onEnd() {
            test.equal(counter, 5, 'aggregation should be stopped')
            test.end()
        }

        adir(home, onEntry).then(onEnd, test.threw)
    })
})

test.test('errors', function (test) {
    var path    = resolve(home, 'non-existing-path'),
        pending = 2

    function onError(err) {
        test.type(err, Error)
        --pending || test.end()
    }

    // test error of the readdir call
    adir(path, noop).catch(onError)
    // this will cause an `ELOOP` because of the symlink loop in the test tree
    // (unless lstat, stat follows symlinks)
    adir.fs.lstat = fs.stat
    // test error of the stat call
    adir(home, noop).catch(onError)
})
