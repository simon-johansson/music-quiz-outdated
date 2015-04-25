
express  = require('express')
passport = require('passport')
auth     = require('../auth.service')
router   = express.Router()

router.post '/', (req, res, next) ->

  passport.authenticate('local', (err, user, info) ->
    error = err or info
    if error then return res.json(401, error)
    if !user
      return res.json(404, message: 'Something went wrong, please try again.')
    token = auth.signToken(user._id, user.role)
    res.json token: token
  ) req, res, next

module.exports = router
