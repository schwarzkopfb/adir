/**
 * This example shows how to build the router stack of an Express application dynamically.
 */

'use strict'

if (typeof Promise === 'undefined')
    global.Promise = require('bluebird')

var path = require('path'),
    expr = require('express'),
    adir = require('../..'),
    dir  = path.resolve(__dirname, 'routes'),
    app  = expr()

function onDir(path, base, router) {
    var subRouter = new expr.Router
    router.use('/' + base, subRouter)
    return subRouter
}

function onFile(path, base, router) {
    require(path).call(router)
}

function onError(err) {
    console.error('cannot build the routing stack :(')
    console.error(err.stack)
}

function onEnd() {
    app.listen(3333, function () {
        console.log(
            'server is ready to accept connections on port 3333\n\n' +
            'try:\n' +
            "$ curl 'http://localhost:3333/users/1'\n" +
            "$ curl 'http://localhost:3333/posts/1'\n"
        )
    })
}

adir(dir, app, onDir, onFile)
    .catch(onError)
    .then(onEnd)
