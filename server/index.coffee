
path = require('path')
debug = require('debug')('http')
express = require('express')

quiz = require('./quizify.coffee')
spotify = require('./components/spotify.coffee')

app = express()

app.set 'port', process.env.PORT or 3000
app.use express.static(path.join(__dirname, '..', 'public'))

server = require('http').createServer(app).listen app.get('port'), ->
  debug 'listening on port ' + app.get('port')

app.get '/covers', (req, res) ->
  spotify.getAlbumCovers (data) ->
    res.json data.body.tracks.items

io = require('socket.io').listen(server)

io.sockets.on 'connection', (socket) ->
  debug 'client connected'
  quiz.initGame io, socket

