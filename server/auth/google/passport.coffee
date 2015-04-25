
passport       = require('passport')
GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

googleConfig = (config) ->
  {
    clientID:     config.google.clientID
    clientSecret: config.google.clientSecret
    callbackURL:  config.google.callbackURL
  }

callback = (accessToken, refreshToken, profile, done) ->
  User.findOne { 'google.id': profile.id }, (err, user) ->
    unless user
      user = new User
        name: profile.displayName
        email: profile.emails[0].value
        role: 'user'
        username: profile.username
        provider: 'google'
        google: profile._json
      user.save (err) ->
        if err then done err
        done err, user
    else done(err, user)

exports.setup = (User, config) ->
  passport.use new GoogleStrategy(googleConfig(config), callback)
