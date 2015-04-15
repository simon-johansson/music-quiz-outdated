
textfit = require './textfit.coffee'

module.exports = ($el, startTime, callback) ->
  # Decrement the displayed timer value on each 'tick'

  countItDown = ->
    startTime -= 1
    $el.text startTime
    textfit '#hostWord'
    if startTime <= 0
      # console.log('Countdown Finished.');
      # Stop the timer and do the callback.
      clearInterval timer
      callback()

  $el = $el or $('#hostWord')
  # Display the starting time on the screen.
  $el.text startTime
  textfit '#hostWord'
  # console.log('Starting Countdown...');
  # Start a 1 second timer
  timer = setInterval(countItDown, 1000)
