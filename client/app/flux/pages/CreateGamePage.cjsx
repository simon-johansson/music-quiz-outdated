
React = require 'react'
{ PropTypes } = require 'react'

# User = require '../components/User'
# Repo = require '../components/Repo'
# HostActionCreators = require '../actions/HostActionCreators'
GameStore = require '../stores/GameStore.coffee'
# PlayerStore = require '../stores/PlayerStore'

# getStateFromStores = ->
#   {
#     gameURL: GameStore.getGameURL()
#     players: PlayerStore.getAllPlayers()
#   }

CreateGamePage = React.createClass

  # getInitialState: ->
  #   getStateFromStores()

  # componentDidMount: ->
  #   MessageStore.addChangeListener @_onChange
  #   ThreadStore.addChangeListener  @_onChange

  # _onChange: ->
  #   @setState getStateFromStores()

  render: ->
    (
      <div className="create-game-screen">

        <h2 className="instructions">Open this site on your mobile device:</h2>
        <div id="gameURL" className="infoBig">http://...</div>

        <h2 className="instructions">Then click <strong>JOIN</strong> and <br/> enter the following Game ID:</h2>
        <div id="spanNewGameCode" className="gameId">Error!</div>

        <div className="playersWaiting"></div>
      </div>
    )

module.exports = CreateGamePage
