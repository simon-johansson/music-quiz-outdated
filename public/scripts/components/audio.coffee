
audio = new Audio

play = (track) ->
  audio.src = track
  audio.play()

stop = (track) ->
  audio.pause()
  audio.currentTime = 0

module.exports =
  play: play
  stop: stop
