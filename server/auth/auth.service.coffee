###*
# Attaches the user object to the request if authenticated
# Otherwise returns 403
###

isAuthenticated = ->
  compose().use (req, res, next) ->
    # allow access_token to be passed through query parameter as well
    if req.query and req.query.hasOwnProperty('access_token')
      req.headers.authorization = "Bearer #{req.query.access_token}"
    validateJwt req, res, next
  .use (req, res, next) ->
    User.findById req.user._id, (err, user) ->
      if err then return next(err)
      if !user then return res.send(401)
      req.user = user
      next()

###*
# Checks if the user role meets the minimum requirements of the route
###

hasRole = (roleRequired) ->
  if !roleRequired then throw new Error 'Required role needs to be set'
  compose().use(isAuthenticated()).use (req, res, next) ->
    if config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)
      next()
    else res.send 403

###*
# Returns a jwt token signed by the app secret
###

signToken = (id) ->
  jwt.sign { _id: id }, config.secrets.session, expiresInMinutes: 60 * 5

###*
# Set token cookie directly for oAuth strategies
###

setTokenCookie = (req, res) ->
  if !req.user
    return res.json(404, message: 'Something went wrong, please try again.')
  token = signToken(req.user._id, req.user.role)
  res.cookie 'token', JSON.stringify(token)
  res.redirect '/'

mongoose   = require 'mongoose'
passport   = require 'passport'
config     = require '../config/environment'
jwt        = require 'jsonwebtoken'
expressJwt = require 'express-jwt'
compose    = require 'composable-middleware'
User       = require '../api/user/user.model'

validateJwt = expressJwt(secret: config.secrets.session)
exports.isAuthenticated = isAuthenticated
exports.hasRole = hasRole
exports.signToken = signToken
exports.setTokenCookie = setTokenCookie
