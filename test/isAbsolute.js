/**
 * `path.isAbsolute()` polyfill for Node <=0.11
 * Extracted from Node 6.3 core
 */

'use strict'

if (require.main === module)
    return require('tap').pass('yes')

var path = require('path')

if (path.isAbsolute !== undefined)
    return
else if (process.platform === 'win32')
    path.isAbsolute = isAbsoluteWin32
else
    path.isAbsolute = isAbsolutePosix

var inspect = require('util').inspect

function assertPath(path) {
    if (typeof path !== 'string')
        throw new TypeError('Path must be a string. Received ' + inspect(path))
}

function isAbsoluteWin32(path) {
    assertPath(path)

    var len = path.length

    if (len === 0)
        return false

    var code = path.charCodeAt(0)

    if (code === 47/*/*/ || code === 92/*\*/)
        return true
    else if ((code >= 65/*A*/ && code <= 90/*Z*/) ||
        (code >= 97/*a*/ && code <= 122/*z*/)) {
        // Possible device root

        if (len > 2 && path.charCodeAt(1) === 58/*:*/) {
            code = path.charCodeAt(2)

            if (code === 47/*/*/ || code === 92/*\*/)
                return true
        }
    }

    return false
}

function isAbsolutePosix(path) {
    assertPath(path)
    return path.length > 0 && path.charCodeAt(0) === 47/*/*/
}
