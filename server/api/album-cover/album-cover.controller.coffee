
_           = require 'lodash'
spotify     = require '../../components/spotify'

handleError = (res, err) ->
  res.send 500, err

exports.index = (req, res) ->
  spotify.getAlbumCovers (err, data) ->
    if err then handleError(res, err)
    else res.json data
