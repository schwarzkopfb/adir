[![view on npm](http://img.shields.io/npm/v/adir.svg?style=flat-square)](https://www.npmjs.com/package/adir)
[![downloads per month](http://img.shields.io/npm/dm/adir.svg?style=flat-square)](https://www.npmjs.com/package/adir)
[![node version](https://img.shields.io/badge/node-%3E=0.8-brightgreen.svg?style=flat-square)](https://nodejs.org/download)
[![build status](https://img.shields.io/travis/schwarzkopfb/adir.svg?style=flat-square)](https://travis-ci.org/schwarzkopfb/adir)
[![test coverage](https://img.shields.io/coveralls/schwarzkopfb/adir.svg?style=flat-square)](https://coveralls.io/github/schwarzkopfb/adir)
[![license](https://img.shields.io/npm/l/adir.svg?style=flat-square)](https://github.com/schwarzkopfb/adir/blob/development/LICENSE)

# adir

Utility for recursive aggregation of directory trees

## Usage

```js

const aggregate = require('adir'),
      tree      = {}

function onDirectory(stat, subtree) {
    return subtree[ stat.base ] = {}
}

function onFile(stat, subtree) {
    subtree[ stat.base ] = stat.size
}

function callback(err) {
    if (err)
        console.error(err.stack)
    else
        console.log(tree)
}

aggregate('./', onDirectory, onFile, tree, callback)

```

## API

## How It Works?

## Compatibility

## Installation

With npm:

    npm install adir

## License

[MIT](https://github.com/schwarzkopfb/adir/blob/master/LICENSE)
