
var _ = require('lodash');
var debug = require('debug')('spotify');
var SpotifyWebApi = require('spotify-web-api-node');

var playlists = {
  "Top Tracks in Sweden": "7jmQBEvJyGHPqKEl5UcEe9",
  "Today's Top Hits": "5FJXhjdILmRA2z5bvz4nzf",
  "Top 100 tracks currently on Spotify": "4hOKQuZbraPDIfaGbM3lKI",
  "Top 100 Pop Tracks on Spotify": "3ZgmfR6lsnCwdffZUan8EA",
  "Top 100 Rock Tracks on Spotify": "3qu74M0PqlkSV76f98aqTd",
  "Top 100 Indie Tracks on Spotify": "4dJHrPYVdKgaCE3Lxrv1MZ",
  "Top 100 Alternative Tracks on Spotify": "3jtuOxsrTRAWvPPLvlW1VR",
  "Top 100 Hip-Hop Tracks on Spotify": "06KmJWiQhL0XiV6QQAHsmw",
  "Top 100 R&B Tracks on Spotify": "76h0bH2KJhiBuLZqfvPp3K",
};

var commonEnglishWords = ["time", "person", "year", "way", "day", "thing", "man", "world", "life", "hand", "part", "child", "eye", "woman", "place", "work", "week", "case", "point", "government", "company", "number", "group", "problem", "fact", "be", "have", "do", "say", "get", "make", "go", "know", "take", "see", "come", "think", "look", "want", "give", "use", "find", "tell", "ask", "work", "seem", "feel", "try", "leave", "call", "good", "new", "first", "last", "long", "great", "little", "own", "other", "old", "right", "big", "high", "different", "small", "large", "next", "early", "young", "important", "few", "public", "bad", "same", "able", "to", "of", "in", "for", "on", "with", "at", "by", "from", "up", "about", "into", "over", "after", "beneath", "under", "above", "the", "and", "a", "that", "I", "it", "not", "he", "as", "you", "this", "but", "his", "they", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "people", "history", "way", "art", "world", "information", "map", "two", "family", "government", "health", "system", "computer", "meat", "year", "thanks", "music", "person", "reading", "method", "data", "food", "understanding", "theory", "law", "bird", "literature", "problem", "software", "control", "knowledge", "power", "ability", "economics", "love", "internet", "television", "science", "library", "nature", "fact", "product", "idea", "temperature", "investment", "area", "society", "activity", "story", "time", "work", "film", "water", "money", "example", "while", "business", "study", "game", "life", "form", "air", "day", "place", "number", "part", "field", "fish", "back", "process", "heat", "hand", "experience", "job", "book", "end", "point", "type", "home", "economy", "value", "body", "market", "guide", "interest", "state", "radio", "course", "company", "price", "size", "card", "list", "mind", "trade", "line", "care", "group", "risk", "word", "fat", "force", "key", "light", "training", "name", "school", "top", "amount", "level", "order", "practice", "research", "sense", "service", "piece", "a", "you", "it", "can", "will", "if", "one", "many", "most", "other", "use", "make", "good", "look", "help", "go", "great", "being", "few", "might", "still", "public", "read", "keep", "start", "give", "human", "local", "general", "she", "specific", "long", "play", "feel", "high", "tonight", "put", "common", "set", "change", "simple", "past", "big", "possible", "particular", "today", "major", "personal", "current", "national", "cut", "natural", "physical", "show", "try"];

var spotifyApi = new SpotifyWebApi({
  clientId : '8426958422464716b5fa1885e3c795e8',
  clientSecret : '169eba052e89450ba53aaaf7b338601b'
});

// Retrieve an access token
function refreshAccessToken () {

  spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      // Set the access token on the API object so that it's used in all future requests
      spotifyApi.setAccessToken(data.body['access_token']);
      debug('Access token set');
    }).catch(function(err) {
      debug('Unfortunately, something has gone wrong.', err.message);
    });
}

refreshAccessToken();
// Refresh every hour
setInterval(refreshAccessToken, 60000);

var getQuestion = function (clb) {
  spotifyApi.searchTracks(_.sample(commonEnglishWords))
    .then(function(data) {
      parseResponse(data, clb);
    }).catch(function(err) {
      debug('Unfortunately, something has gone wrong.', err.message);
      throw new Error(err);
    });
};

var getAlbumCovers = function (clb) {
  spotifyApi.getPlaylist('spotify', '5FJXhjdILmRA2z5bvz4nzf', {
    country: 'SE',
    limit : 50,
    offset : 0
  })
  .then(function(data) {
    // debugger;
    clb(data);
  }).catch(function(err) {
    debug('Unfortunately, something has gone wrong.', err.message);
    throw new Error(err);
  });
};

// setTimeout(getAlbumCovers, 1000);

var parseResponse = function(data) {
  var list = [];
  var items = data.body.tracks.items;
  // Limit list to 10, the most "popular" songs
  while(items.length > 10) items.pop();
  _.shuffle(items).forEach(function (el) {
    if(typeof el.artists !== 'undefined' && el.artists.length) {
      var obj = {};
      obj.preview_url = el.preview_url;
      obj.song = el.name;
      obj.cover = el.album.images[0].url;
      obj.artist = el.artists.map(function (el) {
        return el.name;
      }).join(' & ');
      var alreadyInList = obj.artist ? _.find(list, { 'artist': obj.artist }) : true;
      if(list.length <= 5 && !alreadyInList) {
        list.push(obj);
      }
    }
  });
  var correctAnswer = _.sample(list);
  clb({
    answer: correctAnswer.artist,
    audio:  correctAnswer.preview_url,
    song:   correctAnswer.song,
    cover:  correctAnswer.cover,
    list:   _.pluck(list, 'artist'),
  });
};

function test () {
  // spotifyApi.getArtistRelatedArtists('0qeei9KQnptjwb8MgkqEoy')
  // spotifyApi.getNewReleases({ limit : 5, offset: 0, country: 'SE' })
  // spotifyApi.getFeaturedPlaylists({ limit : 50, offset: 1, country: 'SE', locale: 'sv_SE' })
  // spotifyApi.getCategories({ limit : 5, offset: 0, country: 'SE', locale: 'sv_SE' })
  // spotifyApi.getCategory('party', { country: 'SE', locale: 'sv_SE'})
  // spotifyApi.getPlaylistsForCategory('toplists', { country: 'SE', limit : 10, offset : 0})
  spotifyApi.getPlaylist('spotify', '7jmQBEvJyGHPqKEl5UcEe9')
    .then(function(data) {
      console.log(JSON.stringify(data.body, null, 2));
    })
    .catch(function(err) {
      console.log('Unfortunately, something has gone wrong.', err.message);
    });
}

module.exports = {
  getAlbumCovers: getAlbumCovers,
  getQuestion: getQuestion
};

// toplists
// mood
// party
// pop
// popculture
