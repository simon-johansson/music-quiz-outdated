
controller = require './host.controller'

exports.register = (socket) ->
  socket.on 'host:createNewGame',     controller.createNewGame
  socket.on 'host:roomFull',          controller.roomFull
  socket.on 'host:countdownFinished', controller.countdownFinished
  socket.on 'host:nextRound',         controller.nextRound
  socket.on 'host:showAnswer',        controller.showAnswer
