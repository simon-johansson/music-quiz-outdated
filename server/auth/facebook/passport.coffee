
passport = require('passport')
FacebookStrategy = require('passport-facebook').Strategy

facebookConfig = (config) ->
  {
    clientID: config.facebook.clientID
    clientSecret: config.facebook.clientSecret
    callbackURL: config.facebook.callbackURL
  }

callback = (accessToken, refreshToken, profile, done) ->
  User.findOne { 'facebook.id': profile.id }, (err, user) ->
    if err then return done(err)
    unless user
      user = new User(
        name: profile.displayName
        email: profile.emails[0].value
        role: 'user'
        username: profile.username
        provider: 'facebook'
        facebook: profile._json)
      user.save (err) ->
        if err then done err
        done err, user
    else done(err, user)

exports.setup = (User, config) ->
  passport.use new FacebookStrategy(facebookConfig(config), callback)

