
QuizifyAppDispatcher = require '../dispatcher/QuizifyAppDispatcher.coffee'
QuizifyConstants     = require '../constants/QuizifyConstants.coffee'

ActionTypes = QuizifyConstants.ActionTypes

module.exports =

  connectedToSocket: (sessionID) ->
    QuizifyAppDispatcher.dispatch
      type: ActionTypes.CONNECTED
      sessionID: sessionID

  disconnectedFromSocket: (sessionID) ->
    QuizifyAppDispatcher.dispatch
      type: ActionTypes.DISCONNECTED
      # använda mitt personliga ID här
      # sessionID: sessionID

  newGameCreated: (data) ->
    QuizifyAppDispatcher.dispatch
      type: ActionTypes.NEW_GAME_CREATED
      gameID: data.gameID
      mySocketID: data.mySocketID
