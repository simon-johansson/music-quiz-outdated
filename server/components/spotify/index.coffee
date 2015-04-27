
_             = require 'lodash'
debug         = require('debug') 'spotify'
config        = require '../../config/environment/'

keys =
  clientId: config.spotify.clientID
  clientSecret: config.spotify.clientSecret

require('./api-client').setup keys

module.exports =
  getAlbumCovers: require './album-covers'
