
countdown = require './components/countdown.coffee'
audio     = require './components/audio.coffee'

game = ''
mySocketId = ''
emitter = ''

init = (data) ->
 emitter = data.emitter
 emitter
   .on 'io/connected', (id) -> mySocketId = id
   .on 'io/newGameCreated', (data) -> game = new Host(data)
   .on 'view/playerJoinGame', (data) -> game = new Player(data)


class Role
  constructor: (data) ->
    @mySocketId = mySocketId
    @gameId = undefined
    @currentRound = undefined
    @emitter = emitter
    @bindEvents()

  bindEvents: ->
    @emitter
      .on 'io/beginNewGame', @gameCountdown
      .on 'io/playerJoinedRoom', @updateWaitingScreen
      .on 'io/onNewWordData', @newWord
      .on 'io/gameOver', @endGame


class Host extends Role
  constructor: (data) ->
    super
    @myRole = 'Host'
    @mySocketId = data.mySocketId
    @gameInit data.gameId
    @bindHostEvets()

  bindHostEvets: ->
    @emitter.on 'io/hostCheckAnswer', @checkAnswer

  gameInit: (id) ->
    @gameId = id
    @players = []
    # @numPlayersInRoom = 0
    @maxNumberOfPlayers = 8
    @isNewGame = false
    @currentCorrectAnswer = undefined
    @currentSong = undefined
    @emitter.emit 'host/displayNewGameScreen', @gameId

  updateWaitingScreen: (data) =>
    if @isNewGame
      @emitter.emit 'host/displayNewGameScreen', @gameId
    @emitter.emit 'host/playerJoinedRoom', data.playerName
    @players.push data
    # if @players.length is @maxNumberOfPlayers
      # @emitter.emit 'host/roomReady', @gameId

  gameCountdown: =>
    @emitter.emit 'host/gameCountdown', @players
    countdown false, 5, =>
      @emitter.emit 'host/hostCountdownFinished', @gameId

  newWord: (data) =>
    @emitter.emit 'host/newWord', data.word
    @currentRound = data.round
    @currentCorrectAnswer = data.answer
    @currentSong =
      song: data.song
      cover: data.cover
    audio.play data.audio

  checkAnswer: (data) =>
    if data.round is @currentRound
      $pScore = $('#' + data.playerId)
      if @currentCorrectAnswer is data.answer
        $pScore.addClass 'round-winner'
        $pScore.text +$pScore.text() + 5
        # audio.stop()
        @currentRound += 1
        data =
          gameId: @gameId
          round: @currentRound
          artist: @currentCorrectAnswer
          song: @currentSong.song
          cover: @currentSong.cover

        @emitter.emit 'host/showAnswer', data
        countdown false, 8, =>
          audio.stop()
          $('.score').removeClass 'round-winner'
          @emitter.emit 'host/hostNextRound', data

      else $pScore.text +$pScore.text() - 6

  endGame: (data) =>
    @emitter.emit 'host/endGame', @players
    @players = []
    @isNewGame = true

  restartGame: ->
    App.$gameArea.html App.$templateNewGame
    $('#spanNewGameCode').text App.gameId




class Player extends Role
  constructor: (data) ->
    super
    @myRole = 'Player'
    @myName = data.playerName
    @gameId = data.gameId
    @hostSocketId = undefined
    @bindPlayerEvets()

  bindPlayerEvets: ->
    @emitter
      .on 'player/startGame',  @startGame
      .on 'view/playerAnswer',  @onPlayerAnswer
      .on 'view/playerRejoin', @onPlayerRejoin
      .on 'io/showingAnswer', @showAnswer

  updateWaitingScreen: (data) =>
    if true # IO.socket.socket.sessionid === data.mySocketId
      @myRole = 'Player'
      @gameId =  data.gameId
      @emitter.emit 'player/playerJoinedRoom', @gameId

  startGame: =>
    emitter.emit 'player/roomReady',  @gameId

  onPlayerAnswer: (answer) =>
    data =
      gameId:   @gameId
      playerId: @mySocketId
      answer:   answer
      round:    @currentRound

    @emitter.emit 'player/playerAnswer', data

  onPlayerRejoin: =>
    data =
      gameId:     @gameId
      playerName: @myName
    @currentRound = 0
    @emitter.emit 'player/playerRejoin', data

  gameCountdown: (data) =>
    @hostSocketId = data.mySocketId
    @emitter.emit 'player/gameCountdown'

  showAnswer: (data) =>
    @emitter.emit 'player/showAnswer'

  newWord: (data) =>
    @currentRound = data.round
    @emitter.emit 'player/newWord', data.list

  endGame: =>
    @emitter.emit 'player/endGame'


module.exports = init: init
