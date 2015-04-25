
QuizifyAppDispatcher = require '../dispatcher/QuizifyAppDispatcher.coffee'
QuizifyConstants = require '../constants/QuizifyConstants.coffee'

{ EventEmitter } = require 'events'

assign = require 'object-assign'

ActionTypes = QuizifyConstants.ActionTypes
CHANGE_EVENT = 'change'

_data = {}

GameStore = assign {}, EventEmitter.prototype,

  emitChange: ->
    @emit CHANGE_EVENT

  addChangeListener: (callback) ->
    @on CHANGE_EVENT, callback

  removeChangeListener: (callback) ->
    @removeListener CHANGE_EVENT, callback

  getSessionID: ->
    _data.sessionid


GameStore.dispatchToken = QuizifyAppDispatcher.register (action) ->

  switch action.type

    when ActionTypes.CONNECTED
      console.log action
      _data.sessionID = action.sessionID
      GameStore.emitChange()

    when ActionTypes.NEW_GAME_CREATED
      console.log action
      # _data.gameID
        # mySocketID: data.mySocketID

module.exports = GameStore
