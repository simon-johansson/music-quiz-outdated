_ = require('lodash')
debug = require('debug')('spotify')
SpotifyWebApi = require('spotify-web-api-node')

spotifyApi = new SpotifyWebApi require('../../keys.json')

# spotifyApi.getArtistRelatedArtists('0qeei9KQnptjwb8MgkqEoy')
# spotifyApi.getNewReleases({ limit : 5, offset: 0, country: 'SE' })
# spotifyApi.getFeaturedPlaylists({ limit : 50, offset: 1, country: 'SE', locale: 'sv_SE' })
# spotifyApi.getCategories({ limit : 5, offset: 0, country: 'SE', locale: 'sv_SE' })
# spotifyApi.getCategory('party', { country: 'SE', locale: 'sv_SE'})
# spotifyApi.getPlaylistsForCategory('toplists', { country: 'SE', limit : 10, offset : 0})
spotifyApi.getPlaylist('spotify', '7jmQBEvJyGHPqKEl5UcEe9')
.then (data) ->
  console.log JSON.stringify(data.body, null, 2)
.catch (err) ->
  console.log 'Unfortunately, something has gone wrong.', err.message
