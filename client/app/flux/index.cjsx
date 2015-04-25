
React  = require 'react'
router = require './router.coffee'

require('fastclick')(document.body)

require('./utils/QuizifyWebAPIUtils').init()

router.run (Handler, state) ->
  React.render(
    <Handler {...state} />,
    document.body
  )
