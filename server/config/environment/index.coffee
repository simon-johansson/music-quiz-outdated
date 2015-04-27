
path = require 'path'
_    = require 'lodash'

requiredProcessEnv = (name) ->
  if !process.env[name]
    throw new Error('You must set the ' + name + ' environment variable')
  process.env[name]

# All configurations will extend these options
# ============================================

all =
  env: process.env.NODE_ENV
  root: path.normalize(__dirname + '/../../..')
  port: process.env.PORT or 9000

  seedDB: false

  secrets: session: 'quizify-secret'

  userRoles: [
    'guest'
    'user'
    'admin'
  ]

  mongo: options: db: safe: true

  facebook:
    clientID: process.env.FACEBOOK_ID or 'id'
    clientSecret: process.env.FACEBOOK_SECRET or 'secret'
    callbackURL: (process.env.DOMAIN or '') + '/auth/facebook/callback'

  google:
    clientID: process.env.GOOGLE_ID or 'id'
    clientSecret: process.env.GOOGLE_SECRET or 'secret'
    callbackURL: (process.env.DOMAIN or '') + '/auth/google/callback'

  spotify:
    clientID: process.env.SPOTIFY_ID or 'id'
    clientSecret: process.env.SPOTIFY_SECRET or 'secret'

# Export the config object based on the NODE_ENV
# ==============================================

module.exports = _.merge(all, require("./#{process.env.NODE_ENV}.coffee") or {})
