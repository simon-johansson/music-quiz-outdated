
path = require('path')
debug = require('debug')('http')
express = require('express')

# quiz = require('./quizify.coffee')
spotify = require('./components/spotify.coffee')

app = express()

app.set 'port', process.env.PORT or 3000
app.use express.static(path.join(__dirname, '..', 'public'))

app.get '/covers', (req, res) ->
  spotify.getAlbumCovers (data) ->
    res.json data.body.tracks.items

server = require('http').createServer(app).listen app.get('port'), ->
  console.log 'listening on port ' + app.get('port')

io = require('socket.io').listen(server)

io.sockets.on 'connection', (socket) ->
  debug 'client connected'
  socket.emit 'connected', message: 'You are connected!'
