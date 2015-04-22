
serverAction = require '../actions/QuizifyServerActionCreators.coffee'
io = require('socket.io-client')

bindSocketEvents = (socket) ->
  socket.on 'connect', ->
    serverAction.connectedToSocket socket.io.engine.id

  # socket.on 'disconnect', ->
    # serverAction.disconnectedFromSocket socket.socket.sessionid

  # socket.on 'newGameCreated', (data) ->
  #   serverAction.newGameCreated data

  # socket.on 'playerJoinedRoom', (data) ->
  #   serverAction.playerJoinedRoom data

  # socket.on 'beginNewGame', beginNewGame
  # socket.on 'newWordData', onNewWordData
  # socket.on 'hostCheckAnswer', hostCheckAnswer
  # socket.on 'showingAnswer', showingAnswer
  # socket.on 'gameOver', gameOver
  # socket.on 'error', error


module.exports =

  init: ->
    socket = io.connect()
    bindSocketEvents(socket)

