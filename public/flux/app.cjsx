
window.React = React = require 'react'

Home         = require './components/Home.cjsx'
Background   = require './components/SpotifyBackground.cjsx'

QuizifyApp = React.createClass

  render: ->
    (
      <div className="quizify-app">
        <Background url='/covers' />
        <Home/>
      </div>
    )

module.exports = QuizifyApp
