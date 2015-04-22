
React = require 'react'
{ Link } = require 'react-router'

Button = React.createClass

  render: ->
    (
      <Link to={@props.to}>
        <button className="btn">
          {@props.text}
        </button>
      </Link>
    )

module.exports = Button
