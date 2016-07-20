[![view on npm](http://img.shields.io/npm/v/adir.svg?style=flat-square)](https://www.npmjs.com/package/adir)
[![downloads per month](http://img.shields.io/npm/dm/adir.svg?style=flat-square)](https://www.npmjs.com/package/adir)
[![node version](https://img.shields.io/badge/node-%3E=0.8-brightgreen.svg?style=flat-square)](https://nodejs.org/download)
[![build status](https://img.shields.io/travis/schwarzkopfb/adir.svg?style=flat-square)](https://travis-ci.org/schwarzkopfb/adir)
[![test coverage](https://img.shields.io/coveralls/schwarzkopfb/adir.svg?style=flat-square)](https://coveralls.io/github/schwarzkopfb/adir)
[![license](https://img.shields.io/npm/l/adir.svg?style=flat-square)](https://github.com/schwarzkopfb/adir/blob/development/LICENSE)

# adir

Utility for recursive aggregation of directory trees.
Useful for creating directory [indices](/examples/tree.js),
[searching](/examples/search.js) by file attributes,
performing [calculations](/examples/directory-size.js) on a directory tree,
building dynamic [routing tables](/examples/express-routes.js), etc.

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

## How It Works?

## Compatibility

`adir` is compatible with Node 0.8 and above but a `Promise` implementation is required even if you're only using the callback API.
Tested with [bluebird](https://www.npmjs.com/package/bluebird).

## Installation

With npm:

    npm install adir

## License

[MIT](https://github.com/schwarzkopfb/adir/blob/master/LICENSE)
