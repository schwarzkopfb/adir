'use strict'

if (require.main === module)
    return require('tap').pass('yes')

var fs      = require('fs'),
    slice   = Array.prototype.slice,
    resolve = require('path').resolve,
    rimraf  = require('rimraf'),
    mkdirp  = require('mkdirp'),
    data    = new Buffer('test')

function pathOf(dirs) {
    var args = slice.call(arguments)
    args.unshift(__dirname)
    return resolve.apply(null, args)
}

rimraf.sync(pathOf('tmp')) // reset
mkdirp.sync(pathOf('tmp', 'a', 'b', 'c', 'd', 'e'))
mkdirp.sync(pathOf('tmp', 'a', 'b', 'test'))
mkdirp.sync(pathOf('tmp', 'a', 'test'))
fs.writeFileSync(pathOf('tmp', 'test.txt'), data)
fs.writeFileSync(pathOf('tmp', 'a', 'test.txt'), data)
fs.writeFileSync(pathOf('tmp', 'a', 'b', 'c', 'd', 'e', 'test.txt'), data)

// create a symlink loop
fs.symlinkSync(
    pathOf('tmp', 'a', 'b', 'test.txt'),
    pathOf('tmp', 'a', 'b', 'c', 'test.txt')
)
fs.symlinkSync(
    pathOf('tmp', 'a', 'b', 'c', 'test.txt'),
    pathOf('tmp', 'a', 'b', 'test.txt')
)
