(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sijo/Projects/personal/spotify-quiz/quizify/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/app.js":[function(require,module,exports){

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

        // Initialize the fastclick library
        FastClick.attach(document.body);
    },

    cacheElements: function() {
        App.$doc = $(document);

        // Templates
        // App.$gameArea = $('#gameArea');
        // App.$templateIntroScreen = $('#intro-screen-template').html();
        // App.$templateNewGame = $('#create-game-template').html();
        // App.$templateJoinGame = $('#join-game-template').html();
        // App.$hostGame = $('#host-game-template').html();
    },

    bindDOMEvents: function() {
        // Host
        App.$doc
          .on('click', '#btnCreateGame', App.Host.onCreateClick);

        // Player
        App.$doc
          .on('click', '#btnJoinGame', App.Player.onJoinClick)
          .on('click', '#btnStart', App.Player.onPlayerStartClick)
          .on('click', '.btnAnswer', App.Player.onPlayerAnswerClick)
          .on('click', '#btnPlayerRestart', App.Player.onPlayerRestart);
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

},{"./components/audio":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/audio.js","./components/countdown":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/countdown.js","./components/templates":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/templates.js","./components/textfit":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/textfit.js"}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/audio.js":[function(require,module,exports){

var audio = new Audio();

function play(track) {
  audio.src = track;
  audio.play();
}

function stop(track) {
  audio.pause();
  audio.currentTime = 0;
}

module.exports = {
  play: play,
  stop: stop,
};

},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/countdown.js":[function(require,module,exports){

var textfit = require('./textfit');

/**
 * Display the countdown timer on the Host screen
 *
 * @param $el The container element for the countdown timer
 * @param startTime
 * @param callback The function to call when the timer ends.
 */

 module.exports = function( $el, startTime, callback) {

    // Display the starting time on the screen.
    $el.text(startTime);
    textfit('#hostWord');

    // console.log('Starting Countdown...');

    // Start a 1 second timer
    var timer = setInterval(countItDown, 1000);

    // Decrement the displayed timer value on each 'tick'
    function countItDown(){
        startTime -= 1
        $el.text(startTime);
        textfit('#hostWord');

        if( startTime <= 0 ){
            // console.log('Countdown Finished.');

            // Stop the timer and do the callback.
            clearInterval(timer);
            callback();
            return;
        }
    }

};

},{"./textfit":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/textfit.js"}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/templates.js":[function(require,module,exports){

var templates = {};

templates.$gameArea = $('#gameArea');
templates.$templateIntroScreen = $('#intro-screen-template').html();
templates.$templateNewGame = $('#create-game-template').html();
templates.$templateJoinGame = $('#join-game-template').html();
templates.$hostGame = $('#host-game-template').html();

module.exports = templates;

},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/textfit.js":[function(require,module,exports){
/**
 * Make the text inside the given element as big as possible
 * See: https://github.com/STRML/textFit
 *
 * @param el The parent element of some text
 */
 module.exports = function (el) {
    textFit(
        $(el)[0],
        {
            alignHoriz: true,
            alignVert: false,
            widthOnly: true,
            reProcess: true,
            maxFontSize: 180
        }
    );
};

},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/index.js":[function(require,module,exports){

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

require('./io').init({
   emitter: emitter
});

require('./app').init({
   emitter: emitter
});

// require('./original');

},{"./app":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/app.js","./io":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/io.js","events":"/Users/sijo/Projects/personal/spotify-quiz/quizify/node_modules/browserify/node_modules/events/events.js"}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/io.js":[function(require,module,exports){

module.exports = {
  init: init,
};

var socket = "";
var emitter = "";

function init(data) {
  socket = io.connect();
  emitter = data.emitter;
  bindEvents();
}

function bindEvents() {
  socket.on('connected', onConnected );
  socket.on('newGameCreated', onNewGameCreated );
  socket.on('playerJoinedRoom', playerJoinedRoom );
  socket.on('beginNewGame', beginNewGame );
  socket.on('newWordData', onNewWordData);
  socket.on('hostCheckAnswer', hostCheckAnswer);
  socket.on('gameOver', gameOver);
  socket.on('error', error );

  emitter.on('host/hostCreateNewGame', hostCreateNewGame );
  emitter.on('host/hostRoomFull', hostRoomFull );
  emitter.on('host/hostCountdownFinished', hostCountdownFinished );
  emitter.on('host/hostNextRound', hostNextRound );
  emitter.on('player/playerJoinGame', playerJoinGame );
  emitter.on('player/playerAnswer', playerAnswer );
  emitter.on('player/playerRestart', playerRestart );
}

function playerRestart(data) {
  socket.emit('playerRestart', data);
}

function playerAnswer(data) {
  socket.emit('playerAnswer', data);
}

function playerJoinGame(data) {
  socket.emit('playerJoinGame', data);
}

function hostNextRound(data) {
  socket.emit('hostNextRound', data);
}

function hostCountdownFinished(gameId) {
  socket.emit('hostCountdownFinished', gameId);
}

function hostRoomFull(gameId) {
  socket.emit('hostRoomFull', gameId);
}

function hostCreateNewGame() {
  socket.emit('hostCreateNewGame');
}

function onConnected() {
  emitter.emit('io/connected', socket.socket.sessionid);
}

function onNewGameCreated(data) {
  emitter.emit('io/newGameCreated', data);
}

function playerJoinedRoom(data) {
  emitter.emit('io/playerJoinedRoom', data);
}

function beginNewGame(data) {
  emitter.emit('io/beginNewGame', data);
}

function onNewWordData(data) {
  emitter.emit('io/onNewWordData', data);
}

function hostCheckAnswer(data) {
  emitter.emit('io/hostCheckAnswer', data);
}

function gameOver(data) {
  emitter.emit('io/gameOver', data);
}

function error(data) {
  alert(data.message);
}

},{}]},{},["/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/index.js"]);
