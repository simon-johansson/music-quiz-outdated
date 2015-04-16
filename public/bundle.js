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
var Host, Player, Role, audio, countdown, emitter, game, init, mySocketId,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

countdown = require('./components/countdown.coffee');

audio = require('./components/audio.coffee');

game = '';

mySocketId = '';

emitter = '';

init = function(data) {
  emitter = data.emitter;
  return emitter.on('io/connected', function(id) {
    return mySocketId = id;
  }).on('io/newGameCreated', function(data) {
    return game = new Host(data);
  }).on('view/playerJoinGame', function(data) {
    return game = new Player(data);
  });
};

Role = (function() {
  function Role(data) {
    this.mySocketId = mySocketId;
    this.gameId = void 0;
    this.currentRound = void 0;
    this.emitter = emitter;
    this.bindEvents();
  }

  Role.prototype.bindEvents = function() {
    return this.emitter.on('io/beginNewGame', this.gameCountdown).on('io/playerJoinedRoom', this.updateWaitingScreen).on('io/onNewWordData', this.newWord).on('io/gameOver', this.endGame);
  };

  return Role;

})();

Host = (function(superClass) {
  extend(Host, superClass);

  function Host(data) {
    this.endGame = bind(this.endGame, this);
    this.checkAnswer = bind(this.checkAnswer, this);
    this.newWord = bind(this.newWord, this);
    this.gameCountdown = bind(this.gameCountdown, this);
    this.updateWaitingScreen = bind(this.updateWaitingScreen, this);
    Host.__super__.constructor.apply(this, arguments);
    this.myRole = 'Host';
    this.mySocketId = data.mySocketId;
    this.gameInit(data.gameId);
    this.bindHostEvets();
  }

  Host.prototype.bindHostEvets = function() {
    return this.emitter.on('io/hostCheckAnswer', this.checkAnswer);
  };

  Host.prototype.gameInit = function(id) {
    this.gameId = id;
    this.players = [];
    this.maxNumberOfPlayers = 8;
    this.isNewGame = false;
    this.currentCorrectAnswer = void 0;
    this.currentSong = void 0;
    return this.emitter.emit('host/displayNewGameScreen', this.gameId);
  };

  Host.prototype.updateWaitingScreen = function(data) {
    if (this.isNewGame) {
      this.emitter.emit('host/displayNewGameScreen', this.gameId);
    }
    this.emitter.emit('host/playerJoinedRoom', data.playerName);
    return this.players.push(data);
  };

  Host.prototype.gameCountdown = function() {
    this.emitter.emit('host/gameCountdown', this.players);
    return countdown(false, 5, (function(_this) {
      return function() {
        return _this.emitter.emit('host/hostCountdownFinished', _this.gameId);
      };
    })(this));
  };

  Host.prototype.newWord = function(data) {
    this.emitter.emit('host/newWord', data.word);
    this.currentRound = data.round;
    this.currentCorrectAnswer = data.answer;
    this.currentSong = {
      song: data.song,
      cover: data.cover
    };
    return audio.play(data.audio);
  };

  Host.prototype.checkAnswer = function(data) {
    var $pScore;
    if (data.round === this.currentRound) {
      $pScore = $('#' + data.playerId);
      if (this.currentCorrectAnswer === data.answer) {
        $pScore.addClass('round-winner');
        $pScore.text(+$pScore.text() + 5);
        this.currentRound += 1;
        data = {
          gameId: this.gameId,
          round: this.currentRound,
          artist: this.currentCorrectAnswer,
          song: this.currentSong.song,
          cover: this.currentSong.cover
        };
        this.emitter.emit('host/showAnswer', data);
        return countdown(false, 8, (function(_this) {
          return function() {
            audio.stop();
            $('.score').removeClass('round-winner');
            return _this.emitter.emit('host/hostNextRound', data);
          };
        })(this));
      } else {
        return $pScore.text(+$pScore.text() - 6);
      }
    }
  };

  Host.prototype.endGame = function(data) {
    this.emitter.emit('host/endGame', this.players);
    this.players = [];
    return this.isNewGame = true;
  };

  Host.prototype.restartGame = function() {
    App.$gameArea.html(App.$templateNewGame);
    return $('#spanNewGameCode').text(App.gameId);
  };

  return Host;

})(Role);

Player = (function(superClass) {
  extend(Player, superClass);

  function Player(data) {
    this.endGame = bind(this.endGame, this);
    this.newWord = bind(this.newWord, this);
    this.showAnswer = bind(this.showAnswer, this);
    this.gameCountdown = bind(this.gameCountdown, this);
    this.onPlayerRejoin = bind(this.onPlayerRejoin, this);
    this.onPlayerAnswer = bind(this.onPlayerAnswer, this);
    this.startGame = bind(this.startGame, this);
    this.updateWaitingScreen = bind(this.updateWaitingScreen, this);
    Player.__super__.constructor.apply(this, arguments);
    this.myRole = 'Player';
    this.myName = data.playerName;
    this.gameId = data.gameId;
    this.hostSocketId = void 0;
    this.bindPlayerEvets();
  }

  Player.prototype.bindPlayerEvets = function() {
    return this.emitter.on('player/startGame', this.startGame).on('view/playerAnswer', this.onPlayerAnswer).on('view/playerRejoin', this.onPlayerRejoin).on('io/showingAnswer', this.showAnswer);
  };

  Player.prototype.updateWaitingScreen = function(data) {
    if (true) {
      this.myRole = 'Player';
      this.gameId = data.gameId;
      return this.emitter.emit('player/playerJoinedRoom', this.gameId);
    }
  };

  Player.prototype.startGame = function() {
    return emitter.emit('player/roomReady', this.gameId);
  };

  Player.prototype.onPlayerAnswer = function(answer) {
    var data;
    data = {
      gameId: this.gameId,
      playerId: this.mySocketId,
      answer: answer,
      round: this.currentRound
    };
    return this.emitter.emit('player/playerAnswer', data);
  };

  Player.prototype.onPlayerRejoin = function() {
    var data;
    data = {
      gameId: this.gameId,
      playerName: this.myName
    };
    this.currentRound = 0;
    return this.emitter.emit('player/playerRejoin', data);
  };

  Player.prototype.gameCountdown = function(data) {
    this.hostSocketId = data.mySocketId;
    return this.emitter.emit('player/gameCountdown');
  };

  Player.prototype.showAnswer = function(data) {
    return this.emitter.emit('player/showAnswer');
  };

  Player.prototype.newWord = function(data) {
    this.currentRound = data.round;
    return this.emitter.emit('player/newWord', data.list);
  };

  Player.prototype.endGame = function() {
    return this.emitter.emit('player/endGame');
  };

  return Player;

})(Role);

module.exports = {
  init: init
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



},{"./textfit.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/textfit.coffee"}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/dynamic_background.coffee":[function(require,module,exports){
var imgs, tracks, update_cover;

tracks = ['spotify:track:7b71WsDLb8gG0cSyDTFAEW', 'spotify:track:4B4zDmbHdkXZ1wUJv1yKFy', 'spotify:track:3cySlItpiPiIAzU3NyHCJf', 'spotify:track:3W3KtDwAIg3mAruSpnfG3Q', 'spotify:track:6K8qKeWo5MsFED7wCR6Kop', 'spotify:track:6HFbq7cewJ7rPiffV0ciil', 'spotify:track:2CAK2t1reUgPK6OMgAMURB', 'spotify:track:6PtXobrqImYfnpIxNsJApa', 'spotify:track:2wqaekenSQZm7hxQOYt8oE', 'spotify:track:5Sf3GyLEAzJXxZ5mbCPXTu', 'spotify:track:0TVV2gFROJaB3kIZyCUvIY', 'spotify:track:3U4isOIWM3VvDubwSI3y7a', 'spotify:track:5b88tNINg4Q4nrRbrCXUmg', 'spotify:track:3tCwjWLicbjsMCvXhN0WOE', 'spotify:track:4J8WVHRtXM6SMgsF7qohXy', 'spotify:track:2Dz8KeCYs9awlwUJStJlmh', 'spotify:track:4kgsK0fftHtg9gZOzkU5T2', 'spotify:track:1BltsyC5W3SAABdxyrDXwi', 'spotify:track:67awxiNHNyjMXhVgsHuIrs', 'spotify:track:27jdUE1EYDSXZqhjuNxLem', 'spotify:track:1huvTbEYtgltjQRXzrNKGi', 'spotify:track:4pn0G7yHNfTgRYRWca8gYA', 'spotify:track:0N6Bxsif1tT4vHz8tnkjzP', 'spotify:track:2Oehrcv4Kov0SuIgWyQY9e', 'spotify:track:1KqlVt63Q4bl1VdSlymr5C', 'spotify:track:3D4QFgYa3P9P0gjmv4eX6I', 'spotify:track:5ymtzcwlS4rLXJ2PMlSNPr', 'spotify:track:3cHyrEgdyYRjgJKSOiOtcS', 'spotify:track:5j9iuo3tMmQIfnEEQOOjxh', 'spotify:track:519uJbE3zyKLlToVA65PrP', 'spotify:track:1iXBApi39l5r6lJj9WEXXS', 'spotify:track:3gbBpTdY8lnQwqxNCcf795', 'spotify:track:1mzGywacjpeik00PVLBPpF', 'spotify:track:5pY3ovFxbvAg7reGZjJQSp', 'spotify:track:0tJGzJjUVlEsn8s3Mn32Jb', 'spotify:track:2KlArcPWLSRhD5JWCxqwHh', 'spotify:track:1FsH6OZCKLWbBgqj8JcCvO', 'spotify:track:6DcDdDevI94Dh4vc5anXBE', 'spotify:track:3G6hD9B2ZHOsgf4WfNu7X1', 'spotify:track:0BhZWr9gPZNlVdWWigvYA9', 'spotify:track:57ef886Y0RQDGLm2jvmYEq', 'spotify:track:6g1NlCpW7fgqDnWbCCDrHl', 'spotify:track:0idc0XRnLRovVqpWnGQ6hC', 'spotify:track:6jizk5lOUnfpaZXYMdfeC6', 'spotify:track:4G8gkOterJn0Ywt6uhqbhp', 'spotify:track:2rJojRundKuKFgbvmCAYva', 'spotify:track:7DFNE7NO0raLIUbgzY2rzm', 'spotify:track:6NGet2NFndj4XvpjH9iMvb', 'spotify:track:1A2UmLDZzDmpdzUjEkCc3z', 'spotify:track:5fnA9mkIfScSqHIpeDyvck', 'spotify:track:5l3CML2OnzfNs5RfVgbcLt', 'spotify:track:4r8hRPbidDIoDPphxi78aY', 'spotify:track:72lvNqggmcOnS4C8XxZwuj', 'spotify:track:6jdOi5U5LBzQrc4c1VT983', 'spotify:track:3zKST4nk4QJE77oLjUZ0Ng', 'spotify:track:3bidbhpOYeV4knp8AIu8Xn', 'spotify:track:015IsLQFXbEm0f541N2qoX', 'spotify:track:2dLLR6qlu5UJ5gk0dKz0h3', 'spotify:track:0xCA70t1ZA4fa9UOE0lIJm', 'spotify:track:3rq5w4bQGigXOfdN30ATJt', 'spotify:track:1HNkqx9Ahdgi1Ixy2xkKkL', 'spotify:track:0zkiQH567SDLqfWNBaU3hv', 'spotify:track:3DmW6y7wTEYHJZlLo1r6XJ', 'spotify:track:5TvFfDlVoUWZvfqrhTJzD7', 'spotify:track:0ktV2JoOsoTGURzKaZnjJL', 'spotify:track:0qcr5FMsEO85NAQjrlDRKo', 'spotify:track:13qqdlSeF8FcxsRyapDMZ0', 'spotify:track:11SynawYlFYwzk3k9VARLV', 'spotify:track:48gsLPdOUEDjr7P8Wvykne', 'spotify:track:5U8hKxSaDXB8cVeLFQjvwx', 'spotify:track:0xMd5bcWTbyXS7wPrBtZA6', 'spotify:track:3wPPWcVuinAU7dXcJXtCID', 'spotify:track:0Rz1KXsP4bhGxs0ffySSSn', 'spotify:track:4Uc6BcPeBKfZUlX6jhumGv', 'spotify:track:7qfwcqfGOkQYtzjF4UzJHM', 'spotify:track:2Vogx6NbF6o4bfLhzKmo3O', 'spotify:track:0xIVvRmjztR1AwuHrkhH41', 'spotify:track:34gCuhDGsG4bRPIf9bb02f', 'spotify:track:0D2TtUbiX4QszhgMuye71Z', 'spotify:track:5EmCpD8tUj78VW3kgaEjME', 'spotify:track:1fzJyTCKeZuTSLByCsLRHl', 'spotify:track:0ZR9NFol0hcgLSVJoQmREl', 'spotify:track:6D5pfooPP6hi99RaXjkDsP', 'spotify:track:3qZkpG7RW81clweFyefCe2', 'spotify:track:2N8F9mupXs9oyCLeerRfCw', 'spotify:track:3bDGwl0X3EjQmIyFD1uif5', 'spotify:track:5v4sZRuvWDcisoOk1PFv6T', 'spotify:track:4eLSCSELtKxZwXnFbNLXT5', 'spotify:track:2FvE1VYiztTWlj3ivgMAeY', 'spotify:track:3zdv56EdfZi0ydbAZqbQ3M', 'spotify:track:2FiceoWDJ67rrmb5tGBpgE', 'spotify:track:3GKSfF6c3Rv3a1knSjxnXa', 'spotify:track:0cJLYpRTqODzv9SiQukE4Z', 'spotify:track:1Y7497MCCpZ19EuwIaqoZ0', 'spotify:track:2ia7iiEtpiOL2ZVuWxBZGB', 'spotify:track:2x4UdnjXPMMwjZtDTqpEjT', 'spotify:track:6zlOUIqcU6juXFww9UNpJK', 'spotify:track:5hTx6e0H4tQHiPyx5AuuwS', 'spotify:track:2Foc5Q5nqNiosCNqttzHof', 'spotify:track:1j8z4TTjJ1YOdoFEDwJTQa'];

imgs = [];

update_cover = function() {
  var img, li_img, li_uid, rand, rand2;
  rand = _.random(imgs.length - 20);
  rand2 = _.random(imgs.length - 1);
  li_uid = imgs[rand].uid;
  li_img = imgs[rand2].img;
  img = new Image;
  img.src = li_img;
  img.width = 200;
  img.height = 200;
  return $("#" + li_uid + " img").animate({
    opacity: 0
  }, 1000, function() {
    $("#" + li_uid).html(img);
    $("#" + li_uid + " img").css('opacity', '0');
    return $("#" + li_uid + " img").animate({
      opacity: 1
    }, 1000);
  });
};

tracks.forEach(function(el) {
  return $.ajax({
    url: "https://embed.spotify.com/oembed/?url=" + el + "&callback=callme",
    type: 'GET',
    crossDomain: true,
    dataType: 'jsonp',
    success: function(data) {
      var img, randLetter, uid;
      img = new Image;
      img.src = data.thumbnail_url;
      img.width = 200;
      img.height = 200;
      randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      uid = randLetter + Date.now();
      $('.background ul').append('<li id=\'' + uid + '\'></li>');
      $('.background ul li:last-child').append(img);
      return imgs.push({
        img: img.src,
        uid: uid
      });
    },
    error: function(err) {
      return console.log(err);
    }
  });
});

setInterval(update_cover, 500);



},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/textfit.coffee":[function(require,module,exports){
module.exports = function(el) {
  return textFit($(el)[0], {
    alignHoriz: true,
    alignVert: false,
    widthOnly: true,
    reProcess: true,
    maxFontSize: 80
  });
};



},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/index.coffee":[function(require,module,exports){
var EventEmitter, emitter;

EventEmitter = require('events').EventEmitter;

emitter = new EventEmitter;

require('./io.coffee').init({
  emitter: emitter
});

require('./views.coffee').init({
  emitter: emitter
});

require('./app.coffee').init({
  emitter: emitter
});

require('./components/dynamic_background.coffee');

FastClick.attach(document.body);



},{"./app.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/app.coffee","./components/dynamic_background.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/dynamic_background.coffee","./io.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/io.coffee","./views.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/views.coffee","events":"/Users/sijo/Projects/personal/spotify-quiz/quizify/node_modules/browserify/node_modules/events/events.js"}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/io.coffee":[function(require,module,exports){
var beginNewGame, bindEvents, emitter, error, gameOver, hostCheckAnswer, hostCountdownFinished, hostCreateNewGame, hostNextRound, hostShowAnswer, init, onConnected, onNewGameCreated, onNewWordData, playerAnswer, playerJoinGame, playerJoinedRoom, playerRejoin, roomReady, showingAnswer, socket;

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
  socket.on('showingAnswer', showingAnswer);
  socket.on('gameOver', gameOver);
  socket.on('error', error);
  emitter.on('view/hostCreateNewGame', hostCreateNewGame);
  emitter.on('view/playerJoinGame', playerJoinGame);
  emitter.on('host/roomReady', roomReady);
  emitter.on('host/hostCountdownFinished', hostCountdownFinished);
  emitter.on('host/showAnswer', hostShowAnswer);
  emitter.on('host/hostNextRound', hostNextRound);
  emitter.on('player/roomReady', roomReady);
  emitter.on('player/playerAnswer', playerAnswer);
  return emitter.on('player/playerRejoin', playerRejoin);
};

playerRejoin = function(data) {
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

hostShowAnswer = function(gameId) {
  return socket.emit('hostShowAnswer', gameId);
};

roomReady = function(gameId) {
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

showingAnswer = function(data) {
  return emitter.emit('io/showingAnswer', data);
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



},{}],"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/views.coffee":[function(require,module,exports){
var $el, bindDOMEvents, bindEmitterEvents, cacheElements, displayNewGameScreen, emitter, endGameHost, endGamePlayer, hostGameCountdown, hostShowAnswer, init, newWordHost, newWordPlayer, onCreateClick, onJoinClick, onPlayerAnswerClick, onPlayerJoinClick, onPlayerRejoin, onPlayerStartClick, playerGameCountdown, playerShowAnswer, render, showInitScreen, textfit, updateHostWaitingScreen, updatePlayerWaitingScreen;

textfit = require('./components/textfit.coffee');

$el = {};

emitter = void 0;

init = function(data) {
  emitter = data.emitter;
  cacheElements();
  bindDOMEvents();
  bindEmitterEvents();
  return showInitScreen();
};

cacheElements = function() {
  $el.doc = $(document);
  $el.gameArea = $('#gameArea');
  $el.templateIntroScreen = $('#intro-screen-template').html();
  $el.templateNewGame = $('#create-game-template').html();
  $el.templateJoinGame = $('#join-game-template').html();
  return $el.hostGame = _.template($('#host-game-template').html());
};

bindDOMEvents = function() {
  return $el.doc.on('click', '#btnCreateGame', onCreateClick).on('click', '#btnJoinGame', onJoinClick).on('click', '#btnJoin', onPlayerJoinClick).on('click', '#btnStart', onPlayerStartClick).on('click', '.btnAnswer', onPlayerAnswerClick).on('click', '#btnPlayerRejoin', onPlayerRejoin);
};

bindEmitterEvents = function() {
  return emitter.on('host/displayNewGameScreen', displayNewGameScreen).on('host/playerJoinedRoom', updateHostWaitingScreen).on('host/gameCountdown', hostGameCountdown).on('host/showAnswer', hostShowAnswer).on('host/newWord', newWordHost).on('host/endGame', endGameHost).on('player/playerJoinedRoom', updatePlayerWaitingScreen).on('player/gameCountdown', playerGameCountdown).on('player/showAnswer', playerShowAnswer).on('player/newWord', newWordPlayer).on('player/endGame', endGamePlayer);
};

endGameHost = function() {
  var list, tie, winner;
  $('.artist, .song, .cover').hide();
  list = [];
  $('.playerScore').each(function(i) {
    var $score, name, score;
    $score = $(this);
    score = +$score.find('.score').text();
    name = $score.find('.playerName').text();
    return list.push({
      name: name,
      score: score
    });
  });
  winner = list.length > 1 ? _.max(list, 'score').name : list[0].name;
  tie = false;
  if (tie) {
    $('#hostWord').text('It\'s a Tie!');
  } else {
    $('#hostWord').text(winner + " Wins!!");
  }
  return textfit('#hostWord');
};

endGamePlayer = function(data) {
  var $button;
  $button = $('<button>Play Again</button>').attr('id', 'btnPlayerRejoin').addClass('btn').addClass('btnGameOver');
  return render('<div class="gameOver">Game Over!</div>', $button);
};

newWordHost = function(word) {
  $('#hostWord').text(word);
  $('.artist, .song, .cover').hide();
  return textfit('#hostWord');
};

newWordPlayer = function(list) {
  var $list;
  $list = $('<ul/>').attr('id', 'ulAnswers');
  $.each(list, function() {
    var $button;
    $button = $('<button/>').addClass('btnAnswer').addClass('btn').val(this).html(this);
    return $list.append($('<li/>').append($button));
  });
  return render($list);
};

showInitScreen = function() {
  return render($el.templateIntroScreen);
};

displayNewGameScreen = function(gameId) {
  var port;
  render($el.templateNewGame);
  port = window.location.port ? ":" + window.location.port : void 0;
  $('#gameURL').text("" + window.location.hostname + port);
  textfit('#gameURL');
  return $('#spanNewGameCode').text(gameId);
};

hostGameCountdown = function(players) {
  render($el.hostGame({
    players: players
  }));
  return textfit('#hostWord');
};

hostShowAnswer = function(data) {
  $('.artist').text(data.artist);
  $('.song').text(data.song);
  $('.cover').attr('src', data.cover);
  return $('.artist, .song, .cover').show();
};

playerShowAnswer = function(data) {
  return $('#gameArea').html('<div class="gameOver">Get Ready for the next round!</div>');
};

playerGameCountdown = function() {
  return $('#gameArea').html('<div class="gameOver">Get Ready!</div>');
};

updateHostWaitingScreen = function(playerName) {
  return $('#playersWaiting').append('<p/>').text("Player " + playerName + " joined the game.");
};

updatePlayerWaitingScreen = function(gameId) {
  var msg;
  $('#btnJoin').addClass('hide');
  $('#btnStart').removeClass('hide');
  msg = "<b>Joined Game " + gameId + ".</b> <br/> Wait for other players to join, then press start.";
  return $('#playerWaitingMessage p').html(msg);
};

onCreateClick = function() {
  return emitter.emit('view/hostCreateNewGame');
};

onJoinClick = function() {
  return render($el.templateJoinGame);
};

onPlayerJoinClick = function() {
  var data;
  data = {
    gameId: +$('#inputGameId').val(),
    playerName: $('#inputPlayerName').val() || _.sample(['Elvis', 'Madonna', 'Chaka', 'Gaga', 'Queen b'])
  };
  return emitter.emit('view/playerJoinGame', data);
};

onPlayerStartClick = function() {
  return emitter.emit('player/startGame');
};

onPlayerAnswerClick = function() {
  var $btn, answer;
  $btn = $(this);
  if (!$btn.hasClass('disable')) {
    answer = $btn.val();
    $btn.addClass('disable');
    return emitter.emit('view/playerAnswer', answer);
  }
};

onPlayerRejoin = function() {
  var $button;
  emitter.emit('view/playerRejoin');
  $button = $('<button>Start!</button>').attr('id', 'btnStart').addClass('btn');
  return render('<h3>Wait for other players to join, then press start.</h3>', $button);
};

render = function(template, appendix) {
  return $el.gameArea.html(template).append(appendix);
};

module.exports = {
  init: init
};



},{"./components/textfit.coffee":"/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/components/textfit.coffee"}]},{},["/Users/sijo/Projects/personal/spotify-quiz/quizify/public/scripts/index.coffee"]);
