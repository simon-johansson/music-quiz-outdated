
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
