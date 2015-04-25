EventEmitter = require('events').EventEmitter
emitter = new EventEmitter

require('./io.coffee').init emitter: emitter
require('./views.coffee').init emitter: emitter
require('./app.coffee').init emitter: emitter

SpotifyBackground = require './views/SpotifyBackground.cjsx'

FastClick.attach document.body
