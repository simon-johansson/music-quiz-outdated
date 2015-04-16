var path = require('path');

var debug = require('debug')('http');
var express = require('express');

// Create a new instance of Express
var app = express();

// Import the Anagrammatix game file.
var quiz = require('./quizify');

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, '..', 'public')));

// Create a Node.js based http server on port 8080
var server = require('http').createServer(app).listen(app.get('port'), function () {
  debug('listening on port ' + app.get('port'));
});

// Create a Socket.IO server and attach it to the http server
var io = require('socket.io').listen(server);

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (socket) {
    debug('client connected');
    quiz.initGame(io, socket);
});


