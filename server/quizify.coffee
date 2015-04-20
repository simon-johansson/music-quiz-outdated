
debug = require('debug')('game')
_ = require('lodash')

spotify = require('./components/spotify.coffee')

io = undefined
gameSocket = undefined
numberOfQuestions = 7

hostCreateNewGame = ->
  # Create a unique Socket.IO Room
  thisGameId = Math.random() * 100000 | 0

  # Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
  @emit 'newGameCreated',
    gameId: thisGameId
    mySocketId: @id

  # Join the Room and wait for the players
  @join thisGameId.toString()

hostPrepareGame = (gameId) ->
  data =
    mySocketId: @id
    gameId: gameId

  debug 'Attempting to start game.'
  io.sockets.in(data.gameId).emit 'beginNewGame', data

hostStartGame = (gameId) ->
  debug 'Game Started.'
  sendWord 0, gameId

hostShowAnswer = (data) ->
  io.sockets.in(data.gameId).emit 'showingAnswer', data

hostNextRound = (data) ->
  if data.round < numberOfQuestions
    sendWord data.round, data.gameId
  else
    io.sockets.in(data.gameId).emit 'gameOver', data

playerJoinGame = (data) ->
  debug "Player #{data.playerName} attempting to join game: #{data.gameId}"
  # Look up the room ID in the Socket.IO manager object.
  room = gameSocket.manager.rooms["/#{data.gameId}"]
  # If the room exists...
  if room? != undefined
    data.mySocketId = @id
    @join data.gameId
    debug "Player #{data.playerName} joining game: #{data.gameId}"
    io.sockets.in(data.gameId).emit 'playerJoinedRoom', data
  else
    @emit 'error', message: 'This room does not exist.'

playerAnswer = (data) ->
  debug "Player ID: #{data.playerId} answered a question with: #{data.answer}"
  io.sockets.in(data.gameId).emit 'hostCheckAnswer', data

playerRestart = (data) ->
  debug "Player: #{data.playerName} ready for new game."
  data.playerId = @id
  io.sockets.in(data.gameId).emit 'playerJoinedRoom', data

sendWord = (round, gameId) ->
  spotify.getQuestion (data) ->
    data = _.defaults data, {
      round: round,
      word: 'Name the artist'
    }
    io.sockets.in(gameId).emit 'newWordData', data

exports.initGame = (sio, socket) ->
  io = sio
  gameSocket = socket
  gameSocket.emit 'connected', message: 'You are connected!'

  # Host Events
  gameSocket.on 'hostCreateNewGame', hostCreateNewGame
  gameSocket.on 'hostRoomFull', hostPrepareGame
  gameSocket.on 'hostCountdownFinished', hostStartGame
  gameSocket.on 'hostNextRound', hostNextRound
  gameSocket.on 'hostShowAnswer', hostShowAnswer

  # Player Events
  gameSocket.on 'playerJoinGame', playerJoinGame
  gameSocket.on 'playerAnswer', playerAnswer
  gameSocket.on 'playerRestart', playerRestart
