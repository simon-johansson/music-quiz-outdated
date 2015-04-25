'use strict'
mongoose = require('mongoose')
Schema = mongoose.Schema
crypto = require('crypto')
authTypes = [
  'github'
  'twitter'
  'facebook'
  'google'
]
UserSchema = new Schema(
  name: String
  email:
    type: String
    lowercase: true
  role:
    type: String
    default: 'user'
  hashedPassword: String
  provider: String
  salt: String
  facebook: {}
  google: {}
  github: {})

###*
# Virtuals
###

UserSchema.virtual('password').set((password) ->
  @_password = password
  @salt = @makeSalt()
  @hashedPassword = @encryptPassword(password)
  return
).get ->
  @_password
# Public profile information
UserSchema.virtual('profile').get ->
  {
    'name': @name
    'role': @role
  }
# Non-sensitive info we'll be putting in the token
UserSchema.virtual('token').get ->
  {
    '_id': @_id
    'role': @role
  }

###*
# Validations
###

# Validate empty email
UserSchema.path('email').validate ((email) ->
  if authTypes.indexOf(@provider) != -1
    return true
  email.length
), 'Email cannot be blank'
# Validate empty password
UserSchema.path('hashedPassword').validate ((hashedPassword) ->
  if authTypes.indexOf(@provider) != -1
    return true
  hashedPassword.length
), 'Password cannot be blank'
# Validate email is not taken
UserSchema.path('email').validate ((value, respond) ->
  self = this
  @constructor.findOne { email: value }, (err, user) ->
    if err
      throw err
    if user
      if self.id == user.id
        return respond(true)
      return respond(false)
    respond true
    return
  return
), 'The specified email address is already in use.'

validatePresenceOf = (value) ->
  value and value.length

###*
# Pre-save hook
###

UserSchema.pre 'save', (next) ->
  if !@isNew
    return next()
  if !validatePresenceOf(@hashedPassword) and authTypes.indexOf(@provider) == -1
    next new Error('Invalid password')
  else
    next()
  return

###*
# Methods
###

UserSchema.methods =
  authenticate: (plainText) ->
    @encryptPassword(plainText) == @hashedPassword
  makeSalt: ->
    crypto.randomBytes(16).toString 'base64'
  encryptPassword: (password) ->
    if !password or !@salt
      return ''
    salt = new Buffer(@salt, 'base64')
    crypto.pbkdf2Sync(password, salt, 10000, 64).toString 'base64'
module.exports = mongoose.model('User', UserSchema)
