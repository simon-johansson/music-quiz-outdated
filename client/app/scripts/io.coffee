
socket = ''
emitter = ''

init = (data) ->
  socket = io.connect()
  emitter = data.emitter
  bindEvents()

bindEvents = ->
  socket.on 'connected', onConnected
  socket.on 'newGameCreated', onNewGameCreated
  socket.on 'playerJoinedRoom', playerJoinedRoom
  socket.on 'beginNewGame', beginNewGame
  socket.on 'newWordData', onNewWordData
  socket.on 'hostCheckAnswer', hostCheckAnswer
  socket.on 'showingAnswer', showingAnswer
  socket.on 'gameOver', gameOver
  socket.on 'error', error

  emitter.on 'view/hostCreateNewGame', hostCreateNewGame
  emitter.on 'view/playerJoinGame', playerJoinGame

  emitter.on 'host/roomReady', roomReady
  emitter.on 'host/hostCountdownFinished', hostCountdownFinished
  emitter.on 'host/showAnswer', hostShowAnswer
  emitter.on 'host/hostNextRound', hostNextRound

  # emitter.on 'player/playerJoinGame', playerJoinGame
  emitter.on 'player/roomReady', roomReady
  emitter.on 'player/playerAnswer', playerAnswer
  emitter.on 'player/playerRejoin', playerRejoin

# socket
playerRejoin = (data) ->
  socket.emit 'playerRestart', data

playerAnswer = (data) ->
  socket.emit 'playerAnswer', data

playerJoinGame = (data) ->
  socket.emit 'playerJoinGame', data

hostNextRound = (data) ->
  socket.emit 'hostNextRound', data

hostCountdownFinished = (gameId) ->
  socket.emit 'hostCountdownFinished', gameId

hostShowAnswer = (gameId) ->
  socket.emit 'hostShowAnswer', gameId

roomReady = (gameId) ->
  socket.emit 'hostRoomFull', gameId

hostCreateNewGame = ->
  socket.emit 'hostCreateNewGame'

onConnected = ->
  emitter.emit 'io/connected', socket.socket.sessionid

onNewGameCreated = (data) ->
  emitter.emit 'io/newGameCreated', data

playerJoinedRoom = (data) ->
  emitter.emit 'io/playerJoinedRoom', data

beginNewGame = (data) ->
  emitter.emit 'io/beginNewGame', data

onNewWordData = (data) ->
  emitter.emit 'io/onNewWordData', data

hostCheckAnswer = (data) ->
  emitter.emit 'io/hostCheckAnswer', data

showingAnswer = (data) ->
  emitter.emit 'io/showingAnswer', data

gameOver = (data) ->
  emitter.emit 'io/gameOver', data

error = (data) -> alert data.message


module.exports = init: init

