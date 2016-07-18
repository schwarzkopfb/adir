'use strict'

module.exports = aggregateDirectory

const fs    = require('fs'),
      join  = require('path').join,
      equal = require('assert').equal

function aggregateDirectory(path, value, onDirectory, onFile) {
    equal(typeof path, 'string', 'directory path must be a string')
    equal(typeof onFile, 'function', 'function must be a function')
    equal(typeof onDirectory, 'function', 'onDirectory must be a function')

    return new Promise((done, error) => {
        fs.readdir(path, (err, list) => {
            if (err)
                error(err)
            else {
                let pending = list.length

                if (!pending)
                    return done()

                const tasks = []

                for (let i = pending; i--;) {
                    const item    = list[ i ],
                          subpath = join(path, item)

                    fs.lstat(subpath, (err, stat) => {
                        if (err)
                            return error(err)

                        if (stat.isDirectory()) {
                            const transform = onDirectory(subpath, item, value),
                                  next      = value => aggregateDirectory(subpath, value, onDirectory, onFile)

                            if (transform instanceof Promise)
                                tasks.push(transform.then(next))
                            else {
                                const val = transform === undefined ? value : transform
                                tasks.push(next(val))
                            }
                        }
                        else
                            onFile(subpath, item, value)

                        --pending || done(Promise.all(tasks))
                    })
                }
            }
        })
    })
}

Object.defineProperty(aggregateDirectory, 'version', {
    enumerable: true,
    get: function () {
        return require('./package.json').version
    }
})
