
var IO = require('./io');
var App = require('./app');

var players = [];
var isNewGame = false;
var numPlayersInRoom = 0;
var currentCorrectAnswer = '';
var audio = new Audio();

function onCreateClick() {
  // console.log('Clicked "Create A Game"');
  IO.socket.emit('hostCreateNewGame');
}

function gameInit(data) {
  App.gameId = data.gameId;
  App.mySocketId = data.mySocketId;
  App.myRole = 'Host';

  numPlayersInRoom = 0;

  displayNewGameScreen();
  // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
}

function displayNewGameScreen() {
  // Fill the game screen with the appropriate HTML
  App.$gameArea.html(App.$templateNewGame);

  // Display the URL on screen
  $('#gameURL').text(window.location.href);
  App.doTextFit('#gameURL');

  // Show the gameId / room id on screen
  $('#spanNewGameCode').text(App.gameId);
}

function updateWaitingScreen(data) {
  // If this is a restarted game, show the screen.
  if (isNewGame) {
    displayNewGameScreen();
  }
  // Update host screen
  $('#playersWaiting')
      .append('<p/>')
      .text('Player ' + data.playerName + ' joined the game.');

  // Store the new player's data on the Host.
  players.push(data);

  // Increment the number of players in the room
  numPlayersInRoom += 1;

  // If two players have joined, start the game!
  if (numPlayersInRoom === 2) {
    // console.log('Room is full. Almost ready!');

    // Let the server know that two players are present.
    IO.socket.emit('hostRoomFull', App.gameId);
  }
}

function gameCountdown() {
  // Prepare the game screen with new HTML
  App.$gameArea.html(App.$hostGame);
  App.doTextFit('#hostWord');

  // Begin the on-screen countdown timer
  var $secondsLeft = $('#hostWord');
  App.countDown($secondsLeft, 5, function() {
      IO.socket.emit('hostCountdownFinished', App.gameId);
  });

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

function newWord(data) {
  // Insert the new word into the DOM
  $('#hostWord').text(data.word);
  App.doTextFit('#hostWord');
  play(data.audio);

  // Update the data for the current round
  currentCorrectAnswer = data.answer;
  currentRound = data.round;
}

function play(track) {
  audio.src = track;
  audio.play();
}

function stop(track) {
  audio.pause();
  audio.currentTime = 0;
}

function checkAnswer(data) {
  if (data.round === App.currentRound) {

    // Get the player's score
    var $pScore = $('#' + data.playerId);

    // Advance player's score if it is correct
    if (Host.currentCorrectAnswer === data.answer) {
      // Add 5 to the player's score
      $pScore.text(+$pScore.text() + 5);

      stop();

      // Advance the round
      App.currentRound += 1;

      // Prepare data to send to the server
      var data = {
        gameId: App.gameId,
        round: App.currentRound
      };

      // Notify the server to start the next round.
      IO.socket.emit('hostNextRound', data);

    } else {
      // A wrong answer was submitted, so decrement the player's score.
      $pScore.text(+$pScore.text() - 3);
    }
  }
}

function endGame(data) {
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
    App.doTextFit('#hostWord');

    // Reset game data
    numPlayersInRoom = 0;
    isNewGame = true;
}

function restartGame() {
  App.$gameArea.html(App.$templateNewGame);
  $('#spanNewGameCode').text(App.gameId);
}

module.exports = {
  gameInit: gameInit,
  onCreateClick: onCreateClick
  // displayNewGameScreen
  // updateWaitingScreen
  // gameCountdown
  // newWord
  // play
  // stop
  // checkAnswer
  // endGame
  // restartGame
};
