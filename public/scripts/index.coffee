EventEmitter = require('events').EventEmitter
emitter = new EventEmitter

require('./io.coffee').init emitter: emitter
require('./views.js').init emitter: emitter
require('./app.coffee').init emitter: emitter

FastClick.attach document.body
