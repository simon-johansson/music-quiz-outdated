
var textfit = require('./components/js/textfit.js');

module.exports = {
  init: init
};

var $el = {};
var emitter = '';

function init (data) {
  emitter = data.emitter;

  cacheElements();
  bindDOMEvents();
  bindEmitterEvents();

  showInitScreen();
}

function cacheElements () {
  $el.doc = $(document);
  $el.gameArea = $('#gameArea');
  $el.templateIntroScreen = $('#intro-screen-template').html();
  $el.templateNewGame = $('#create-game-template').html();
  $el.templateJoinGame = $('#join-game-template').html();
  $el.hostGame = $('#host-game-template').html();
}

function bindDOMEvents () {
  $el.doc
    .on('click', '#btnCreateGame', onCreateClick)
    .on('click', '#btnJoinGame', onJoinClick)
    .on('click', '#btnStart', onPlayerStartClick)
    .on('click', '.btnAnswer', onPlayerAnswerClick)
    .on('click', '#btnPlayerRestart', onPlayerRestart);
}

function bindEmitterEvents () {
  emitter
    .on('host/displayNewGameScreen', displayNewGameScreen)
    .on('host/playerJoinedRoom', updateHostWaitingScreen)
    .on('host/gameCountdown', hostGameCountdown)
    .on('host/newWord', newWordHost)
    .on('host/endGame', endGameHost)

    .on('player/playerJoinedRoom', updatePlayerWaitingScreen)
    .on('player/gameCountdown', playerGameCountdown)
    .on('player/newWord', newWordPlayer)
    .on('player/endGame', endGamePlayer)
}

function endGameHost (data) {
  // Get the data for player 1 from the host screen
  var $p1 = $('#player1Score');
  var p1Score = +$p1.find('.score').text();
  var p1Name = $p1.find('.playerName').text();

  // Get the data for player 2 from the host screen
  var $p2 = $('#player2Score');
  var p2Score = +$p2.find('.score').text();
  var p2Name = $p2.find('.playerName').text();

  // Find the winner based on the scores
  var winner = (p1Score < p2Score) ? p2Name : p1Name;
  var tie = (p1Score === p2Score);

  // Display the winner (or tie game message)
  if (tie) {
      $('#hostWord').text("It's a Tie!");
  } else {
      $('#hostWord').text(winner + ' Wins!!');
  }
  textfit('#hostWord');
}

function endGamePlayer (data) {
  $button = $('<button>Start Again</button>')
              .attr('id', 'btnPlayerRestart')
              .addClass('btn')
              .addClass('btnGameOver');

  render('<div class="gameOver">Game Over!</div>', $button);
}

function newWordHost(word) {
  $('#hostWord').text(word);
  textfit('#hostWord');
}

function newWordPlayer(list) {
  var $list = $('<ul/>').attr('id', 'ulAnswers');

  $.each(list, function() {
    $list
      .append($('<li/>')
      .append($('<button/>')
        .addClass('btnAnswer')
        .addClass('btn')
        .val(this)
        .html(this)
      )
    );
  });

  render($list);
}

function showInitScreen() {
    render($el.templateIntroScreen);
    textfit('.title');
}

function displayNewGameScreen(gameId) {
    render($el.templateNewGame);

    // Visa lokala/publika ip?
    $('#gameURL').text(window.location.href);
    textfit('#gameURL');

    $('#spanNewGameCode').text(gameId);
}

function hostGameCountdown (players) {
  render($el.hostGame);
  textfit('#hostWord');

  // Display the players' names on screen
  $('#player1Score')
      .find('.playerName')
      .html(players[0].playerName);

  $('#player2Score')
      .find('.playerName')
      .html(players[1].playerName);

  // Set the Score section on screen to 0 for each player.
  $('#player1Score').find('.score').attr('id', players[0].mySocketId);
  $('#player2Score').find('.score').attr('id', players[1].mySocketId);

}

function playerGameCountdown () {
  $('#gameArea')
      .html('<div class="gameOver">Get Ready!</div>');
}

function updateHostWaitingScreen (playerName) {
  $('#playersWaiting')
    .append('<p/>')
    .text('Player ' + playerName + ' joined the game.');
}

function updatePlayerWaitingScreen (gameId) {
  console.log(gameId);
  $('#playerWaitingMessage')
    .append('<p/>')
    .text('Joined Game ' + gameId + '. Please wait for game to begin.');

}

function onCreateClick() {
  emitter.emit('view/hostCreateNewGame');
}

function onJoinClick() {
  render($el.templateJoinGame);
}

function onPlayerStartClick() {
  var data = {
      gameId: +($('#inputGameId').val()),
      playerName: $('#inputPlayerName').val() || 'anon'
  };
  emitter.emit('view/playerJoinGame', data);
}

function onPlayerAnswerClick() {
  var $btn = $(this);
  var answer = $btn.val();
  emitter.emit('view/playerAnswer', answer);
}

function onPlayerRestart() {
  emitter.emit('view/playerRestart');
  render("<h3>Waiting on host to start new game.</h3>");
}

function render (template, appendix) {
  $el.gameArea
    .html(template)
    .append(appendix);
}
