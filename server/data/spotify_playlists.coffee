
_ = require 'lodash'

playlists = [
  {
    name: 'Top Tracks in Sweden'
    id: '7jmQBEvJyGHPqKEl5UcEe9'
  }, {
    name: 'Today\'s Top Hits'
    id: '5FJXhjdILmRA2z5bvz4nzf'
  }, {
    name: 'Top 100 tracks currently on Spotify'
    id: '4hOKQuZbraPDIfaGbM3lKI'
  }, {
    name: 'Top 100 Pop Tracks on Spotify'
    id: '3ZgmfR6lsnCwdffZUan8EA'
  }, {
    name: 'Top 100 Rock Tracks on Spotify'
    id: '3qu74M0PqlkSV76f98aqTd'
  }, {
    name: 'Top 100 Indie Tracks on Spotify'
    id: '4dJHrPYVdKgaCE3Lxrv1MZ'
  }, {
    name: 'Top 100 Alternative Tracks on Spotify'
    id: '3jtuOxsrTRAWvPPLvlW1VR'
  }, {
    name: 'Top 100 Hip-Hop Tracks on Spotify'
    id: '06KmJWiQhL0XiV6QQAHsmw'
  }, {
    name: 'Top 100 R&B Tracks on Spotify'
    id: '76h0bH2KJhiBuLZqfvPp3K'
  }
]

module.exports =
  getRandom: -> _.sample playlists
