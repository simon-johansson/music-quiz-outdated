
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

  emitter.on('view/hostCreateNewGame', hostCreateNewGame );
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
