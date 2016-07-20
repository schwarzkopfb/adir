[![view on npm](http://img.shields.io/npm/v/adir.svg?style=flat-square)](https://www.npmjs.com/package/adir)
[![downloads per month](http://img.shields.io/npm/dm/adir.svg?style=flat-square)](https://www.npmjs.com/package/adir)
[![node version](https://img.shields.io/badge/node-%3E=0.8-brightgreen.svg?style=flat-square)](https://nodejs.org/download)
[![build status](https://img.shields.io/travis/schwarzkopfb/adir.svg?style=flat-square)](https://travis-ci.org/schwarzkopfb/adir)
[![test coverage](https://img.shields.io/coveralls/schwarzkopfb/adir.svg?style=flat-square)](https://coveralls.io/github/schwarzkopfb/adir)
[![license](https://img.shields.io/npm/l/adir.svg?style=flat-square)](https://github.com/schwarzkopfb/adir/blob/development/LICENSE)

# adir

Utility for recursive aggregation of directory trees.
Useful for creating directory [indices](./examples/tree.js),
[searching](./examples/search.js) by file attributes,
performing [calculations](./examples/directory-size.js) on a directory tree,
building [routing tables](./examples/express-routes/index.js) dynamically, etc.

## Usage

```js

const aggregate = require('adir'),
      tree      = {}

function onEntry(stats, subtree) {
    var name = stats.basename

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

aggregate('./', onEntry, tree, done)

```

## API

`adir(path, onEntry, [initialValue], [callback])` ⇒ `Promise` <br/>
`adir.fs`: The file system interface to use.<br/>
`adir.break`: Reference used to signal the end of an aggregation branch.<br/>
`adir.version`: The version string from package manifest.<br/>

```js

const fs   = require('fs'),
      adir = require('adir')

typeof adir === 'function'
adir.fs === fs
typeof adir.break === 'object'
typeof adir.version === 'string'

function onEntry(stats, value) {
    stats instanceof fs.Stats
    typeof stats.path === 'string'
    typeof stats.basename === 'string'

    value === 0

    return value
}

function callback(err) {
    err instanceof Error ||
    err === null
}

adir('./', onEntry, 0, callback) instanceof Promise

```

## How It Works?

`adir` iterates over subdirectories of a folder and calls the given `onEntry` handler on each directory or file,
taking an extended `fs.Stats` instance _and_ the value previously returned in the last invocation of `onEntry`, or `initialValue`, if supplied.
You can think of it like a kind of `Array.prototype.reduce()` except the reduction _forks_ when it meets a directory.

```js

const aggregate = require('adir')

function onEntry(stats, count) {
    if (stats.isDirectory())
        return count + 1
    else
        console.log(stats.path, 'has', count, 'parent directories')
}

aggregate('./', onEntry, 0)

```

If `onEntry` returns a `Promise` then it'll be awaited before the aggregation of the corresponding branch continues. See [this](./examples/concat-contents.js) for a working example.

### Cancellation

The aggregation of a branch stops immediately if `onEntry` returns with `adir.break` (or the `Promise` returned by `onEntry` resolves with that value).
[This](./examples/tree.js) example shows that in action.

## Compatibility

`adir` is compatible with Node 0.8 and above but a `Promise` implementation is required even if you're using the callback API only.
Tested with [bluebird](https://www.npmjs.com/package/bluebird).

## Installation

With npm:

    npm install adir

## License

[MIT](https://github.com/schwarzkopfb/adir/blob/master/LICENSE)
