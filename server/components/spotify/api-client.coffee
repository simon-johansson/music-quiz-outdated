
SpotifyWebApi = require('spotify-web-api-node')

class SpotifyClient
  constructor: ->
    @refreshInterval = 60000

  setup: (keys) ->
    @client = new SpotifyWebApi keys
    @_refreshAccessToken()
    @_startRefreshCycle()

  _refreshAccessToken: ->
    @client.clientCredentialsGrant()
    .then (data) =>
      @client.setAccessToken data.body['access_token']
      console.log 'Access token set'
    .catch (err) ->
      console.log 'Unfortunately, something has gone wrong.', err.message
      throw new Error(err)

  _startRefreshCycle: ->
    setInterval =>
      @_refreshAccessToken()
    , @refreshInterval

module.exports = new SpotifyClient()




