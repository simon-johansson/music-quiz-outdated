
React = React = require 'react'
Button = require './Button.cjsx'

Home = React.createClass

  render: ->
    (
      <div className="home-screen">
        <div className="title-wrapper">
          <div className="title">
            <h1>Quizify</h1>
          </div>
          <div className="buttons">
            <Button to="createGame" text="Create"/>
            <Button to="joinGame" text="Join"/>
          </div>
        </div>
      </div>
    )

module.exports = Home
