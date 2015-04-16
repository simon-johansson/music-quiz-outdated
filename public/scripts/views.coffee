textfit = require('./components/textfit.coffee')

$el = {}
emitter = undefined

init = (data) ->
  emitter = data.emitter
  cacheElements()
  bindDOMEvents()
  bindEmitterEvents()
  showInitScreen()

cacheElements = ->
  $el.doc = $(document)
  $el.gameArea = $('#gameArea')
  $el.templateIntroScreen = $('#intro-screen-template').html()
  $el.templateNewGame = $('#create-game-template').html()
  $el.templateJoinGame = $('#join-game-template').html()
  $el.hostGame = _.template $('#host-game-template').html()

bindDOMEvents = ->
  $el.doc
    .on 'click', '#btnCreateGame', onCreateClick
    .on 'click', '#btnJoinGame', onJoinClick
    .on 'click', '#btnJoin', onPlayerJoinClick
    .on 'click', '#btnStart', onPlayerStartClick
    .on 'click', '.btnAnswer', onPlayerAnswerClick
    .on 'click', '#btnPlayerRejoin', onPlayerRejoin

bindEmitterEvents = ->
  emitter
    .on 'host/displayNewGameScreen', displayNewGameScreen
    .on 'host/playerJoinedRoom', updateHostWaitingScreen
    .on 'host/gameCountdown', hostGameCountdown
    .on 'host/showAnswer', hostShowAnswer
    .on 'host/newWord', newWordHost
    .on 'host/endGame', endGameHost

    .on 'player/playerJoinedRoom', updatePlayerWaitingScreen
    .on 'player/gameCountdown', playerGameCountdown
    .on 'player/showAnswer', playerShowAnswer
    .on 'player/newWord', newWordPlayer
    .on 'player/endGame', endGamePlayer

endGameHost = () ->

  $('.artist, .song, .cover').hide()
  list = []
  $('.playerScore').each (i) ->
    $score = $ @
    score = +$score.find('.score').text()
    name = $score.find('.playerName').text()
    list.push {name: name, score: score}

  winner = if list.length > 1
    _.max(list, 'score').name
  else
    list[0].name
  tie = false

  if tie
    $('#hostWord').text 'It\'s a Tie!'
  else
    $('#hostWord').text  "#{winner} Wins!!"
  textfit '#hostWord'

endGamePlayer = (data) ->
  $button = $('<button>Play Again</button>')
              .attr 'id', 'btnPlayerRejoin'
              .addClass 'btn'
              .addClass 'btnGameOver'
  render '<div class="gameOver">Game Over!</div>', $button


newWordHost = (word) ->
  $('#hostWord').text word
  $('.artist, .song, .cover').hide()

  textfit '#hostWord'

newWordPlayer = (list) ->
  $list = $('<ul/>').attr('id', 'ulAnswers')
  $.each list, ->
    $button = $('<button/>')
                .addClass('btnAnswer')
                .addClass('btn')
                .val(this)
                .html(this)
    $list
      .append ($('<li/>')
      .append $button)
  render $list

showInitScreen = ->
  render $el.templateIntroScreen
  # textfit '.title'

displayNewGameScreen = (gameId) ->
  render $el.templateNewGame
  # Visa lokala/publika ip?
  port = if window.location.port then ":#{window.location.port}"
  $('#gameURL').text "#{window.location.hostname}#{port}"
  textfit '#gameURL'
  $('#spanNewGameCode').text gameId

hostGameCountdown = (players) ->
  render $el.hostGame {players: players}
  textfit '#hostWord'
  # Display the players' names on screen
  # $('#player1Score').find('.playerName').html players[0].playerName
  # $('#player2Score').find('.playerName').html players[1].playerName
  # # Set the Score section on screen to 0 for each player.
  # $('#player1Score').find('.score').attr 'id', players[0].mySocketId
  # $('#player2Score').find('.score').attr 'id', players[1].mySocketId

hostShowAnswer = (data) ->
  $('.artist').text data.artist
  $('.song').text data.song
  $('.cover').attr 'src', data.cover
  $('.artist, .song, .cover').show()

playerShowAnswer = (data) ->
  $('#gameArea')
    .html '<div class="gameOver">Get Ready for the next round!</div>'

playerGameCountdown = ->
  $('#gameArea')
    .html '<div class="gameOver">Get Ready!</div>'

updateHostWaitingScreen = (playerName) ->
  $('#playersWaiting')
    .append('<p/>')
    .text "Player #{playerName} joined the game."

updatePlayerWaitingScreen = (gameId) ->
  $('#btnJoin').addClass 'hide'
  $('#btnStart').removeClass 'hide'
  msg = "<b>Joined Game #{gameId}.</b> <br/> Wait for other players to join, then press start."
  $('#playerWaitingMessage p').html msg

onCreateClick = ->
  emitter.emit 'view/hostCreateNewGame'

onJoinClick = ->
  render $el.templateJoinGame

onPlayerJoinClick = ->
  data =
    gameId: +$('#inputGameId').val()
    playerName: $('#inputPlayerName').val() or _.sample(['Elvis', 'Madonna', 'Chaka', 'Gaga', 'Queen b'])
    # Get color and set name in input
  emitter.emit 'view/playerJoinGame', data

onPlayerStartClick = ->
  emitter.emit 'player/startGame'

onPlayerAnswerClick = ->
  $btn = $ @
  unless $btn.hasClass 'disable'
    answer = $btn.val()
    $btn.addClass 'disable'
    emitter.emit 'view/playerAnswer', answer

onPlayerRejoin = ->
  emitter.emit 'view/playerRejoin'
  $button = $('<button>Start!</button>')
              .attr 'id', 'btnStart'
              .addClass 'btn'
  render '<h3>Wait for other players to join, then press start.</h3>', $button

render = (template, appendix) ->
  $el.gameArea.html(template).append appendix

module.exports = init: init
