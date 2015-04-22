
QuizifyAppDispatcher = require '../dispatcher/QuizifyAppDispatcher.coffee'
QuizifyConstants = require '../constants/QuizifyConstants.coffee'

ActionTypes = QuizifyConstants.ActionTypes

module.exports =

  connectedToSocket: ->
    QuizifyAppDispatcher.dispatch
      type: ActionTypes.CONNECTED
