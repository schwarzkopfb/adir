/**
 * This example shows how to build the router stack of an Express application dynamically.
 */

'use strict'

if (typeof Promise === 'undefined')
    global.Promise = require('bluebird')

var resolve = require('path').resolve,
    express = require('express'),
    adir    = require('../..'),
    dir     = resolve(__dirname, 'routes'),
    app     = express()

function onEntry(stats, router) {
    if (stats.isDirectory()) {
        var subrouter = new express.Router
        router.use('/' + stats.basename, subrouter)
        return subrouter
    }
    else
        require(stats.path).call(router)
}

function onError(err) {
    console.error('cannot build the routing table :(')
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

function done(err) {
    if (err)
        onError(err)
    else
        onEnd()
}

// note:
// `app` is a function, so we have to pass `done` here,
// otherwise `app` itself would be treated as the aggregation callback.
// (Because aggregation initial value is optional.)
adir(dir, onEntry, app, done)
