
countdown = require './components/countdown.coffee'
audio     = require './components/audio.coffee'

App =

  gameId: 0
  myRole: ''
  mySocketId: ''
  currentRound: 0
  emitter: ''

  init: (data) ->
    App.emitter = data.emitter
    App.bindEmitterEvents()

  bindEmitterEvents: ->
    App.emitter

    .on 'io/connected', App.setSocketID

    .on 'io/beginNewGame', (data) ->
      App[App.myRole].gameCountdown data

    .on 'io/onNewWordData', (data) ->
      App.currentRound = data.round
      App[App.myRole].newWord data

    .on 'io/gameOver', (data) ->
      App[App.myRole].endGame data

    .on 'io/newGameCreated', (data) ->
      App.Host.gameInit data

    .on 'io/hostCheckAnswer', (data) ->
      if App.myRole == 'Host'
        App.Host.checkAnswer data

    .on 'io/playerJoinedRoom', (data) ->
      App[App.myRole].updateWaitingScreen data

    # .on 'view/playerJoinGame', App.Player.onPlayerStart
    .on 'view/playerAnswer', App.Player.onPlayerAnswer
    .on 'view/playerRestart', App.Player.onPlayerRestart

  setSocketID: (id) -> App.mySocketId = id

  Host:

    players: []
    isNewGame: false
    numPlayersInRoom: 0
    currentCorrectAnswer: ''

    gameInit: (data) ->
      App.gameId = data.gameId
      App.mySocketId = data.mySocketId
      App.myRole = 'Host'
      App.Host.numPlayersInRoom = 0
      App.emitter.emit 'host/displayNewGameScreen', App.gameId
      # console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);

    updateWaitingScreen: (data) ->
      if App.Host.isNewGame
        App.emitter.emit 'host/displayNewGameScreen', App.gameId
      App.emitter.emit 'host/playerJoinedRoom', data.playerName
      App.Host.players.push data
      App.Host.numPlayersInRoom += 1
      if App.Host.numPlayersInRoom == 2
        # console.log('Room is full. Almost ready!');
        App.emitter.emit 'host/hostRoomFull', App.gameId

    gameCountdown: ->
      App.emitter.emit 'host/gameCountdown', App.Host.players
      countdown false, 5, ->
        App.emitter.emit 'host/hostCountdownFinished', App.gameId

    newWord: (data) ->
      # Insert the new word into the DOM
      App.emitter.emit 'host/newWord', data.word
      audio.play data.audio
      # Update the data for the current round
      App.Host.currentCorrectAnswer = data.answer
      App.Host.currentRound = data.round

    checkAnswer: (data) ->
      # Verify that the answer clicked is from the current round.
      # This prevents a 'late entry' from a player whos screen has not
      # yet updated to the current round.
      if data.round == App.currentRound
        # Get the player's score
        $pScore = $('#' + data.playerId)
        # Advance player's score if it is correct
        if App.Host.currentCorrectAnswer == data.answer
          # Add 5 to the player's score
          $pScore.text +$pScore.text() + 5
          audio.stop()
          # Advance the round
          App.currentRound += 1
          # Prepare data to send to the server
          data =
            gameId: App.gameId
            round: App.currentRound
          # Notify the server to start the next round.
          App.emitter.emit 'host/hostNextRound', data
          # IO.socket.emit('hostNextRound', data);
        else
          # A wrong answer was submitted, so decrement the player's score.
          $pScore.text + $pScore.text() - 3

    endGame: (data) ->
      App.emitter.emit 'host/endGame', data
      # Reset game data
      App.Host.numPlayersInRoom = 0
      App.Host.isNewGame = true

    restartGame: ->
      App.$gameArea.html App.$templateNewGame
      $('#spanNewGameCode').text App.gameId

  Player:

    hostSocketId: ''
    myName: ''

    onPlayerStart: (data) ->
      App.myRole = 'Player'
      App.Player.myName = data.playerName
      App.emitter.emit 'player/playerJoinedRoom', data.gameId

    onPlayerAnswer: (answer) ->
      data =
        gameId: App.gameId
        playerId: App.mySocketId
        answer: answer
        round: App.currentRound
      App.emitter.emit 'player/playerAnswer', data

    onPlayerRestart: ->
      data =
        gameId: App.gameId
        playerName: App.Player.myName
      App.currentRound = 0
      App.emitter.emit 'player/playerRestart', data

    updateWaitingScreen: (data) ->
      if true
        App.myRole = 'Player'
        App.gameId = data.gameId
        App.emitter.emit 'player/playerJoinedRoom', App.gameId

    gameCountdown: (hostData) ->
      App.Player.hostSocketId = hostData.mySocketId
      App.emitter.emit 'player/gameCountdown'

    newWord: (data) ->
      App.emitter.emit 'player/newWord', data.list

    endGame: ->
      App.emitter.emit 'player/endGame'

module.exports = init: App.init
