
serverAction = require '../actions/QuizifyServerActionCreators.coffee'
io = require('socket.io-client')

bindSocketEvents = (socket) ->
  socket.on 'connect', ->
    serverAction.connectedToSocket socket.io.engine.id

  socket.on 'disconnect', ->
    serverAction.disconnectedFromSocket socket.socket.sessionid

  socket.on 'new-game-created', (data) ->
    serverAction.newGameCreated data

  # playerJoinedRoom
  # socket.on 'player-entered-room', (data) ->
    # serverAction.playerJoinedRoom data

  # socket.on 'beginNewGame', beginNewGame
  # socket.on 'newWordData', onNewWordData
  # socket.on 'hostCheckAnswer', hostCheckAnswer
  # socket.on 'showingAnswer', showingAnswer
  # socket.on 'gameOver', gameOver
  # socket.on 'error', error


module.exports =

  init: ->
    socket = io.connect '', {path: '/socket.io-client'}
    bindSocketEvents(socket)
