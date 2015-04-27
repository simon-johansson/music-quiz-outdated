
_         = require 'lodash'
debug     = require('debug')('spotify')
playlists = require './data/playlists'
client    = require('./api-client').client

options =
  country: 'SE'
  limit: 50
  offset: 0

parseResponse = (data) ->
  data.body.tracks.items.map (e) ->
    { id: e.track.id, url: e.track.album.images[1].url }

module.exports = (clb) ->
  playlist = playlists.getRandom()
  client.getPlaylist playlist.owner, playlist.id, options
  .then parseResponse
  .then (data) -> clb null, data
  .catch (err) ->
    debug 'Unfortunately, something has gone wrong.', err.message
    clb err
