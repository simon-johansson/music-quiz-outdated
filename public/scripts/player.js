var IO = require('./io.js');
var App = require('./app.js');

var Player = {

    /**
     * A reference to the socket ID of the Host
     */
    hostSocketId: '',

    /**
     * The player's name entered on the 'Join' screen.
     */
    myName: '',

    /**
     * Click handler for the 'JOIN' button
     */
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
        IO.socket.emit('playerJoinGame', data);

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
        }
        IO.socket.emit('playerAnswer', data);
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
        IO.socket.emit('playerRestart', data);
        App.currentRound = 0;
        $('#gameArea').html("<h3>Waiting on host to start new game.</h3>");
    },

    /**
     * Display the waiting screen for player 1
     * @param data
     */
    updateWaitingScreen: function(data) {
        if (IO.socket.socket.sessionid === data.mySocketId) {
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
            )
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
};

module.exports = Player;
