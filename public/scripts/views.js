
var $el = {};
var emitter = '';

function init (data) {
  emitter = data.emitter;

  cacheElements();
  bindDOMEvents();
  bindEmitterEvents();
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

}

function onCreateClick() {

}
function onJoinClick() {

}
function onPlayerStartClick() {

}
function onPlayerAnswerClick() {

}
function onPlayerRestart() {

}

module.exports = templates;
