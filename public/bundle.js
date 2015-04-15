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

},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/app.coffee":[function(require,module,exports){
var App, audio, countdown;

countdown = require('./components/countdown.coffee');

audio = require('./components/audio.coffee');

App = {
  gameId: 0,
  myRole: '',
  mySocketId: '',
  currentRound: 0,
  emitter: '',
  init: function(data) {
    App.emitter = data.emitter;
    return App.bindEmitterEvents();
  },
  bindEmitterEvents: function() {
    return App.emitter.on('io/connected', App.setSocketID).on('io/beginNewGame', function(data) {
      return App[App.myRole].gameCountdown(data);
    }).on('io/onNewWordData', function(data) {
      App.currentRound = data.round;
      return App[App.myRole].newWord(data);
    }).on('io/gameOver', function(data) {
      return App[App.myRole].endGame(data);
    }).on('io/newGameCreated', function(data) {
      return App.Host.gameInit(data);
    }).on('io/hostCheckAnswer', function(data) {
      if (App.myRole === 'Host') {
        return App.Host.checkAnswer(data);
      }
    }).on('io/playerJoinedRoom', function(data) {
      return App[App.myRole].updateWaitingScreen(data);
    }).on('view/playerAnswer', App.Player.onPlayerAnswer).on('view/playerRestart', App.Player.onPlayerRestart);
  },
  setSocketID: function(id) {
    return App.mySocketId = id;
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
      return App.emitter.emit('host/displayNewGameScreen', App.gameId);
    },
    updateWaitingScreen: function(data) {
      if (App.Host.isNewGame) {
        App.emitter.emit('host/displayNewGameScreen', App.gameId);
      }
      App.emitter.emit('host/playerJoinedRoom', data.playerName);
      App.Host.players.push(data);
      App.Host.numPlayersInRoom += 1;
      if (App.Host.numPlayersInRoom === 2) {
        return App.emitter.emit('host/hostRoomFull', App.gameId);
      }
    },
    gameCountdown: function() {
      App.emitter.emit('host/gameCountdown', App.Host.players);
      return countdown(false, 5, function() {
        return App.emitter.emit('host/hostCountdownFinished', App.gameId);
      });
    },
    newWord: function(data) {
      App.emitter.emit('host/newWord', data.word);
      audio.play(data.audio);
      App.Host.currentCorrectAnswer = data.answer;
      return App.Host.currentRound = data.round;
    },
    checkAnswer: function(data) {
      var $pScore;
      if (data.round === App.currentRound) {
        $pScore = $('#' + data.playerId);
        if (App.Host.currentCorrectAnswer === data.answer) {
          $pScore.text(+$pScore.text() + 5);
          audio.stop();
          App.currentRound += 1;
          data = {
            gameId: App.gameId,
            round: App.currentRound
          };
          return App.emitter.emit('host/hostNextRound', data);
        } else {
          return $pScore.text + $pScore.text() - 3;
        }
      }
    },
    endGame: function(data) {
      App.emitter.emit('host/endGame', data);
      App.Host.numPlayersInRoom = 0;
      return App.Host.isNewGame = true;
    },
    restartGame: function() {
      App.$gameArea.html(App.$templateNewGame);
      return $('#spanNewGameCode').text(App.gameId);
    }
  },
  Player: {
    hostSocketId: '',
    myName: '',
    onPlayerStart: function(data) {
      App.myRole = 'Player';
      App.Player.myName = data.playerName;
      return App.emitter.emit('player/playerJoinedRoom', data.gameId);
    },
    onPlayerAnswer: function(answer) {
      var data;
      data = {
        gameId: App.gameId,
        playerId: App.mySocketId,
        answer: answer,
        round: App.currentRound
      };
      return App.emitter.emit('player/playerAnswer', data);
    },
    onPlayerRestart: function() {
      var data;
      data = {
        gameId: App.gameId,
        playerName: App.Player.myName
      };
      App.currentRound = 0;
      return App.emitter.emit('player/playerRestart', data);
    },
    updateWaitingScreen: function(data) {
      if (true) {
        App.myRole = 'Player';
        App.gameId = data.gameId;
        return App.emitter.emit('player/playerJoinedRoom', App.gameId);
      }
    },
    gameCountdown: function(hostData) {
      App.Player.hostSocketId = hostData.mySocketId;
      return App.emitter.emit('player/gameCountdown');
    },
    newWord: function(data) {
      return App.emitter.emit('player/newWord', data.list);
    },
    endGame: function() {
      return App.emitter.emit('player/endGame');
    }
  }
};

module.exports = {
  init: App.init
};



},{"./components/audio.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/audio.coffee","./components/countdown.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/countdown.coffee"}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/audio.coffee":[function(require,module,exports){
var audio, play, stop;

audio = new Audio;

play = function(track) {
  audio.src = track;
  return audio.play();
};

stop = function(track) {
  audio.pause();
  return audio.currentTime = 0;
};

module.exports = {
  play: play,
  stop: stop
};



},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/countdown.coffee":[function(require,module,exports){
var textfit;

textfit = require('./textfit.coffee');

module.exports = function($el, startTime, callback) {
  var countItDown, timer;
  countItDown = function() {
    startTime -= 1;
    $el.text(startTime);
    textfit('#hostWord');
    if (startTime <= 0) {
      clearInterval(timer);
      return callback();
    }
  };
  $el = $el || $('#hostWord');
  $el.text(startTime);
  textfit('#hostWord');
  return timer = setInterval(countItDown, 1000);
};



},{"./textfit.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/textfit.coffee"}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/js/textfit.js":[function(require,module,exports){
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

},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/textfit.coffee":[function(require,module,exports){
module.exports = function(el) {
  return textFit($(el)[0], {
    alignHoriz: true,
    alignVert: false,
    widthOnly: true,
    reProcess: true,
    maxFontSize: 180
  });
};



},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/index.coffee":[function(require,module,exports){
var EventEmitter, emitter;

EventEmitter = require('events').EventEmitter;

emitter = new EventEmitter;

require('./io.coffee').init({
  emitter: emitter
});

require('./views.js').init({
  emitter: emitter
});

require('./app.coffee').init({
  emitter: emitter
});

FastClick.attach(document.body);



},{"./app.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/app.coffee","./io.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/io.coffee","./views.js":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/views.js","events":"/Users/sijo/Projects/personal/spotify-quiz/quizify/node_modules/browserify/node_modules/events/events.js"}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/io.coffee":[function(require,module,exports){
var beginNewGame, bindEvents, emitter, error, gameOver, hostCheckAnswer, hostCountdownFinished, hostCreateNewGame, hostNextRound, hostRoomFull, init, onConnected, onNewGameCreated, onNewWordData, playerAnswer, playerJoinGame, playerJoinedRoom, playerRestart, socket;

socket = '';

emitter = '';

init = function(data) {
  socket = io.connect();
  emitter = data.emitter;
  return bindEvents();
};

bindEvents = function() {
  socket.on('connected', onConnected);
  socket.on('newGameCreated', onNewGameCreated);
  socket.on('playerJoinedRoom', playerJoinedRoom);
  socket.on('beginNewGame', beginNewGame);
  socket.on('newWordData', onNewWordData);
  socket.on('hostCheckAnswer', hostCheckAnswer);
  socket.on('gameOver', gameOver);
  socket.on('error', error);
  emitter.on('view/hostCreateNewGame', hostCreateNewGame);
  emitter.on('view/playerJoinGame', playerJoinGame);
  emitter.on('host/hostRoomFull', hostRoomFull);
  emitter.on('host/hostCountdownFinished', hostCountdownFinished);
  emitter.on('host/hostNextRound', hostNextRound);
  emitter.on('player/playerAnswer', playerAnswer);
  return emitter.on('player/playerRestart', playerRestart);
};

playerRestart = function(data) {
  return socket.emit('playerRestart', data);
};

playerAnswer = function(data) {
  return socket.emit('playerAnswer', data);
};

playerJoinGame = function(data) {
  return socket.emit('playerJoinGame', data);
};

hostNextRound = function(data) {
  return socket.emit('hostNextRound', data);
};

hostCountdownFinished = function(gameId) {
  return socket.emit('hostCountdownFinished', gameId);
};

hostRoomFull = function(gameId) {
  return socket.emit('hostRoomFull', gameId);
};

hostCreateNewGame = function() {
  return socket.emit('hostCreateNewGame');
};

onConnected = function() {
  return emitter.emit('io/connected', socket.socket.sessionid);
};

onNewGameCreated = function(data) {
  return emitter.emit('io/newGameCreated', data);
};

playerJoinedRoom = function(data) {
  return emitter.emit('io/playerJoinedRoom', data);
};

beginNewGame = function(data) {
  return emitter.emit('io/beginNewGame', data);
};

onNewWordData = function(data) {
  return emitter.emit('io/onNewWordData', data);
};

hostCheckAnswer = function(data) {
  return emitter.emit('io/hostCheckAnswer', data);
};

gameOver = function(data) {
  return emitter.emit('io/gameOver', data);
};

error = function(data) {
  return alert(data.message);
};

module.exports = {
  init: init
};



},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/views.js":[function(require,module,exports){

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

},{"./components/js/textfit.js":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/js/textfit.js"}]},{},["/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/index.coffee"]);
