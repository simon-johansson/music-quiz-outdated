
var countdown = require('./components/countdown');
var audio = require('./components/audio');

var App = {

    gameId: 0,
    myRole: '', // 'Player' or 'Host'
    mySocketId: '',
    currentRound: 0,
    emitter: '',

    init: function(data) {
        App.emitter = data.emitter;
        App.bindEmitterEvents();
    },

    bindEmitterEvents: function () {
      App.emitter
        .on('io/connected', App.setSocketID)
        .on('io/beginNewGame', function(data) {
          App[App.myRole].gameCountdown(data);
        })
        .on('io/onNewWordData', function(data) {
          App.currentRound = data.round;
          App[App.myRole].newWord(data);
        })
        .on('io/gameOver', function(data) {
          App[App.myRole].endGame(data);
        })
        .on('io/newGameCreated', function(data) {
          App.Host.gameInit(data);
        })
        .on('io/hostCheckAnswer', function(data) {
          if(App.myRole === 'Host') {
            App.Host.checkAnswer(data);
          }
        })
        .on('io/playerJoinedRoom', function (data) {
          App[App.myRole].updateWaitingScreen(data);
        })
        .on('view/playerJoinGame', App.Player.onPlayerStart)
        .on('view/playerAnswer', App.Player.onPlayerAnswer)
        .on('view/playerRestart', App.Player.onPlayerRestart);
    },

    setSocketID: function (id) {
      App.mySocketId = id;
    },

    Host: {

        players: [],
        isNewGame: false,
        numPlayersInRoom: 0,
        currentCorrectAnswer: '',

        gameInit: function(data) {
            App.gameId = data.gameId;
            App.mySocketId = data.mySocketId;
            App.myRole = 'Host';
            App.Host.numPlayersInRoom = 0;

            App.emitter.emit('host/displayNewGameScreen', App.gameId);
            // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        },

        updateWaitingScreen: function(data) {
            if (App.Host.isNewGame) {
              App.emitter.emit('host/displayNewGameScreen', App.gameId);
            }

            App.emitter.emit('host/playerJoinedRoom', data.playerName);

            App.Host.players.push(data);
            App.Host.numPlayersInRoom += 1;
            if (App.Host.numPlayersInRoom === 2) {
              // console.log('Room is full. Almost ready!');

              App.emitter.emit('host/hostRoomFull', App.gameId);
            }
        },

        gameCountdown: function() {

          countdown(false, 5, function() {
            App.emitter.emit('host/hostCountdownFinished', App.gameId);
          });

          App.emitter.emit('host/gameCountdown', App.Host.players);
        },

        newWord: function(data) {
          // Insert the new word into the DOM
          App.emitter.emit('host/newWord', data.word);
          audio.play(data.audio);

          // Update the data for the current round
          App.Host.currentCorrectAnswer = data.answer;
          App.Host.currentRound = data.round;
        },

        checkAnswer: function(data) {
            // Verify that the answer clicked is from the current round.
            // This prevents a 'late entry' from a player whos screen has not
            // yet updated to the current round.
            if (data.round === App.currentRound) {

                // Get the player's score
                var $pScore = $('#' + data.playerId);

                // Advance player's score if it is correct
                if (App.Host.currentCorrectAnswer === data.answer) {
                    // Add 5 to the player's score
                    $pScore.text(+$pScore.text() + 5);
                    audio.stop();

                    // Advance the round
                    App.currentRound += 1;

                    // Prepare data to send to the server
                    var data = {
                        gameId: App.gameId,
                        round: App.currentRound
                    };

                    // Notify the server to start the next round.
                    App.emitter.emit('host/hostNextRound', data);
                    // IO.socket.emit('hostNextRound', data);

                } else {
                    // A wrong answer was submitted, so decrement the player's score.
                    $pScore.text(+$pScore.text() - 3);
                }
            }
        },

        endGame: function(data) {
          App.emitter.emit('host/endGame', data);

          // Reset game data
          App.Host.numPlayersInRoom = 0;
          App.Host.isNewGame = true;
        },

        /**
         * A player hit the 'Start Again' button after the end of a game.
         */
        restartGame: function() {
            App.$gameArea.html(App.$templateNewGame);
            $('#spanNewGameCode').text(App.gameId);
        }
    },

    Player: {

        hostSocketId: '',
        myName: '',

        onPlayerStart: function(data) {
          App.myRole = 'Player';
          App.Player.myName = data.playerName;
          App.emitter.emit('player/playerJoinedRoom', data);
        },

        onPlayerAnswer: function(answer) {
          var data = {
            gameId: App.gameId,
            playerId: App.mySocketId,
            answer: answer,
            round: App.currentRound
          };
          App.emitter.emit('player/playerAnswer', data);
        },

        onPlayerRestart: function() {
          var data = {
            gameId: App.gameId,
            playerName: App.Player.myName
          };
          App.currentRound = 0;
          App.emitter.emit('player/playerRestart', data);
        },

        updateWaitingScreen: function(data) {
          if (true /*IO.socket.socket.sessionid === data.mySocketId*/) {
            App.myRole = 'Player';
            App.gameId = data.gameId;

            App.emitter.emit('player/playerJoinedRoom', App.gameId);
          }
        },

        gameCountdown: function(hostData) {
          App.Player.hostSocketId = hostData.mySocketId;
          App.emitter.emit('player/gameCountdown');
        },

        newWord: function(data) {
          App.emitter.emit('player/newWord', data.list);
        },

        endGame: function() {
          App.emitter.emit('player/endGame');
        }
    },

};

module.exports = {
  init: App.init,
};
