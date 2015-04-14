
var countdown = require('./components/countdown');
var textfit = require('./components/textfit');
var audio = require('./components/audio');

var Views = require('./components/templates');

var App = {

    gameId: 0,
    myRole: '', // 'Player' or 'Host'
    mySocketId: '',
    currentRound: 0,
    emitter: '',

    init: function(data) {
        App.emitter = data.emitter;

        App.cacheElements();
        App.showInitScreen();
        App.bindDOMEvents();
        App.bindEmitterEvents();
    },

    cacheElements: function() {
        // App.$doc = $(document);

        // Templates
        // App.$gameArea = $('#gameArea');
        // App.$templateIntroScreen = $('#intro-screen-template').html();
        // App.$templateNewGame = $('#create-game-template').html();
        // App.$templateJoinGame = $('#join-game-template').html();
        // App.$hostGame = $('#host-game-template').html();
    },

    bindDOMEvents: function() {
        // Host
        // App.$doc
          // .on('click', '#btnCreateGame', App.Host.onCreateClick);

        // Player
        // App.$doc
        //   .on('click', '#btnJoinGame', App.Player.onJoinClick)
        //   .on('click', '#btnStart', App.Player.onPlayerStartClick)
        //   .on('click', '.btnAnswer', App.Player.onPlayerAnswerClick)
        //   .on('click', '#btnPlayerRestart', App.Player.onPlayerRestart);
    },

    bindEmitterEvents: function () {
      App.emitter
        .on('io/connected', function(sessionid) {
          App.mySocketId = sessionid;
        })
        .on('io/playerJoinedRoom', function(data) {
          App[App.myRole].updateWaitingScreen(data);
        })
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
        });
    },

    showInitScreen: function() {
        temp.$gameArea.html(App.$templateIntroScreen);
        textfit('.title');
    },


    /* *******************************
     *         HOST CODE           *
     ******************************* */
    Host: {

        players: [],
        isNewGame: false,
        numPlayersInRoom: 0,
        currentCorrectAnswer: '',

        onCreateClick: function() {
            // console.log('Clicked "Create A Game"');
            App.emitter.emit('host/hostCreateNewGame');
            // IO.socket.emit('hostCreateNewGame');
        },

        gameInit: function(data) {
            App.gameId = data.gameId;
            App.mySocketId = data.mySocketId;
            App.myRole = 'Host';
            App.Host.numPlayersInRoom = 0;

            App.Host.displayNewGameScreen();
            // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        },

        displayNewGameScreen: function() {
            // Fill the game screen with the appropriate HTML
            App.$gameArea.html(App.$templateNewGame);

            // Display the URL on screen
            $('#gameURL').text(window.location.href);
            textfit('#gameURL');

            // Show the gameId / room id on screen
            $('#spanNewGameCode').text(App.gameId);
        },

        /**
         * Update the Host screen when the first player joins
         * @param data{{playerName: string}}
         */
        updateWaitingScreen: function(data) {
            // If this is a restarted game, show the screen.
            if (App.Host.isNewGame) {
                App.Host.displayNewGameScreen();
            }
            // Update host screen
            $('#playersWaiting')
                .append('<p/>')
                .text('Player ' + data.playerName + ' joined the game.');

            // Store the new player's data on the Host.
            App.Host.players.push(data);

            // Increment the number of players in the room
            App.Host.numPlayersInRoom += 1;

            // If two players have joined, start the game!
            if (App.Host.numPlayersInRoom === 2) {
                // console.log('Room is full. Almost ready!');

                // Let the server know that two players are present.
                App.emitter.emit('host/hostRoomFull', App.gameId);
                // IO.socket.emit('hostRoomFull', App.gameId);
            }
        },

        /**
         * Show the countdown screen
         */
        gameCountdown: function() {

            // Prepare the game screen with new HTML
            App.$gameArea.html(App.$hostGame);
            textfit('#hostWord');

            // Begin the on-screen countdown timer
            var $secondsLeft = $('#hostWord');
            countdown($secondsLeft, 5, function() {
              App.emitter.emit('host/hostCountdownFinished', App.gameId);
              // IO.socket.emit('hostCountdownFinished', App.gameId);
            });

            // Display the players' names on screen
            $('#player1Score')
                .find('.playerName')
                .html(App.Host.players[0].playerName);

            $('#player2Score')
                .find('.playerName')
                .html(App.Host.players[1].playerName);

            // Set the Score section on screen to 0 for each player.
            $('#player1Score').find('.score').attr('id', App.Host.players[0].mySocketId);
            $('#player2Score').find('.score').attr('id', App.Host.players[1].mySocketId);
        },

        /**
         * Show the word for the current round on screen.
         * @param data{{round: *, word: *, answer: *, list: Array}}
         */
        newWord: function(data) {
            // Insert the new word into the DOM
            $('#hostWord').text(data.word);
            textfit('#hostWord');
            audio.play(data.audio);

            // Update the data for the current round
            App.Host.currentCorrectAnswer = data.answer;
            App.Host.currentRound = data.round;
        },

        /**
         * Check the answer clicked by a player.
         * @param data{{round: *, playerId: *, answer: *, gameId: *}}
         */
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


        /**
         * All 10 rounds have played out. End the game.
         * @param data
         */
        endGame: function(data) {
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


    /* *****************************
     *        PLAYER CODE        *
     ***************************** */

    Player: {

        hostSocketId: '',
        myName: '',

        onJoinClick: function() {
            // console.log('Clicked "Join A Game"');

            // Display the Join Game HTML on the player's screen.
            App.$gameArea.html(App.$templateJoinGame);
        },

        /**
         * The player entered their name and gameId (hopefully)
         * and clicked Start.
         */
        onPlayerStartClick: function() {
            // console.log('Player clicked "Start"');

            // collect data to send to the server
            var data = {
                gameId: +($('#inputGameId').val()),
                playerName: $('#inputPlayerName').val() || 'anon'
            };

            // Send the gameId and playerName to the server
            App.emitter.emit('player/playerJoinGame', data);
            // IO.socket.emit('playerJoinGame', data);

            // Set the appropriate properties for the current player.
            App.myRole = 'Player';
            App.Player.myName = data.playerName;
        },

        /**
         *  Click handler for the Player hitting a word in the word list.
         */
        onPlayerAnswerClick: function() {
            // console.log('Clicked Answer Button');
            var $btn = $(this); // the tapped button
            var answer = $btn.val(); // The tapped word

            // Send the player info and tapped word to the server so
            // the host can check the answer.
            var data = {
                gameId: App.gameId,
                playerId: App.mySocketId,
                answer: answer,
                round: App.currentRound
            };
            App.emitter.emit('player/playerAnswer', data);
            // IO.socket.emit('playerAnswer', data);
        },

        /**
         *  Click handler for the "Start Again" button that appears
         *  when a game is over.
         */
        onPlayerRestart: function() {
            var data = {
                gameId: App.gameId,
                playerName: App.Player.myName
            };
            App.emitter.emit('player/playerRestart', data);
            // IO.socket.emit('playerRestart', data);
            App.currentRound = 0;
            $('#gameArea').html("<h3>Waiting on host to start new game.</h3>");
        },

        /**
         * Display the waiting screen for player 1
         * @param data
         */
        updateWaitingScreen: function(data) {
            if (true /*IO.socket.socket.sessionid === data.mySocketId*/) {
                App.myRole = 'Player';
                App.gameId = data.gameId;

                $('#playerWaitingMessage')
                    .append('<p/>')
                    .text('Joined Game ' + data.gameId + '. Please wait for game to begin.');
            }
        },

        /**
         * Display 'Get Ready' while the countdown timer ticks down.
         * @param hostData
         */
        gameCountdown: function(hostData) {
            App.Player.hostSocketId = hostData.mySocketId;
            $('#gameArea')
                .html('<div class="gameOver">Get Ready!</div>');
        },

        /**
         * Show the list of words for the current round.
         * @param data{{round: *, word: *, answer: *, list: Array}}
         */
        newWord: function(data) {
            // Create an unordered list element
            var $list = $('<ul/>').attr('id', 'ulAnswers');

            // Insert a list item for each word in the word list
            // received from the server.
            $.each(data.list, function() {
                $list //  <ul> </ul>
                    .append($('<li/>') //  <ul> <li> </li> </ul>
                    .append($('<button/>') //  <ul> <li> <button> </button> </li> </ul>
                        .addClass('btnAnswer') //  <ul> <li> <button class='btnAnswer'> </button> </li> </ul>
                        .addClass('btn') //  <ul> <li> <button class='btnAnswer'> </button> </li> </ul>
                        .val(this) //  <ul> <li> <button class='btnAnswer' value='word'> </button> </li> </ul>
                        .html(this) //  <ul> <li> <button class='btnAnswer' value='word'>word</button> </li> </ul>
                    )
                );
            });

            // Insert the list onto the screen.
            $('#gameArea').html($list);
        },

        /**
         * Show the "Game Over" screen.
         */
        endGame: function() {
            $('#gameArea')
                .html('<div class="gameOver">Game Over!</div>')
                .append(
                    // Create a button to start a new game.
                    $('<button>Start Again</button>')
                    .attr('id', 'btnPlayerRestart')
                    .addClass('btn')
                    .addClass('btnGameOver')
                );
        }
    },

};

module.exports = {
  init: App.init,
};
