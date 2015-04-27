
window.React = React = require 'react'
{ RouteHandler } = require 'react-router'

Background  = require './components/SpotifyBackground.cjsx'

QuizifyApp = React.createClass

  render: ->
    (
      <div className="quizify-app">
        <Background url='/api/album-covers' />
        <RouteHandler {...this.props} />
      </div>
    )

module.exports = QuizifyApp
