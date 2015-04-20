
_             = require('lodash')
debug         = require('debug')('spotify')
SpotifyWebApi = require('spotify-web-api-node')

words     = require '../data/common_english_words'
playlists = require '../data/spotify_playlists'

spotifyApi = new SpotifyWebApi require('../../keys.json')

refreshAccessToken = ->
  spotifyApi.clientCredentialsGrant()
  .then (data) ->
    spotifyApi.setAccessToken data.body['access_token']
    debug 'Access token set'
  .catch (err) ->
    debug 'Unfortunately, something has gone wrong.', err.message
    throw new Error(err)

refreshAccessToken()
# Refresh every hour
setInterval refreshAccessToken, 60000

getQuestion = (clb) ->
  spotifyApi.searchTracks words.getRandom()
  .then (data) ->
    clb parseResponse(data)
  .catch (err) ->
    debug 'Unfortunately, something has gone wrong.', err.message
    throw new Error(err)

getAlbumCovers = (clb) ->
  spotifyApi.getPlaylist 'spotify', playlists.getRandom().id,
    country: 'SE'
    limit: 50
    offset: 0
  .then (data) ->
    clb data
  .catch (err) ->
    debug 'Unfortunately, something has gone wrong.', err.message
    throw new Error(err)

parseResponse = (data) ->
  list = []
  items = data.body.tracks.items

  # Limit list to 10, the most "popular" songs
  while items.length > 10 then items.pop()

  _.shuffle(items).forEach (el) ->
    track = extractTrackDetails el
    notInList = true unless _.find list, {'artist': track.artist}
    if list.length <= 5 and notInList
      list.push obj

  correctAnswer = _.sample(list)
  {
    answer: correctAnswer.artist
    audio: correctAnswer.preview_url
    song: correctAnswer.song
    cover: correctAnswer.cover
    list: _.pluck(list, 'artist')
  }

extractTrackDetails = (track) ->
  obj = {}
  obj.preview_url = track.preview_url
  obj.song = track.name
  obj.cover = track.album.images[0].url
  obj.artist = track.artists.map( (artist) -> artist.name ).join(' & ')
  obj


module.exports =
  getAlbumCovers: getAlbumCovers
  getQuestion: getQuestion
