
React  = require 'react'
router = require './router.coffee'

require('./utils/QuizifyWebAPIUtils.coffee').init()

router.run (Handler, state) ->
  React.render(
    <Handler {...state} />,
    document.body
  )
