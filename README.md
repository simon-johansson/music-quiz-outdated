# Spotify quiz

A multi-player, multi-screen music quiz game that uses Spotify APIs. <br>

**WARNING!** Does not work in its current state. The version running on http://quizify.trol.la is the following  [commit](https://github.com/simon-johansson/Quizify/commit/b7fae62d5bddb25a24009b0cf18b4d597d9acbc7).

Built with:
* [Node.js](https://nodejs.org/) (server)
* [CoffeeScript](http://coffeescript.org/) (server & client)
* [Socket.IO](http://socket.io/) (server & client)
* [Browserify](http://browserify.org/) (client)
* [React](https://facebook.github.io/react/) (client)

There is *sometimes* a working demo up at http://quizify.trol.la - but no guarantees.

## To install and play locally

1. Ensure Node.js is installed.
2. `git clone https://github.com/simon-johansson/spotify-quiz.git` to clone this repository.
3. Install the dependences:
  1. `cd spotify-quiz`
  2. `npm install`
5. Setup a [Spotify Dev account](https://developer.spotify.com) and create an applications to get your 'Client ID' and 'Client Secret'.
6. Rename `keys.json.example` to `keys.json` and fill in the appropriate keys.
4. `npm run compile` to complie SCSS into CSS, client side CoffeeScript into JavaScript and bundle scripts using Browserify.
5. `npm start` to start the server on port 3000.
6. Visit [http://localhost:3000](http://localhost:3000) in a browser and click CREATE.

## Development

Preform steps 1-6 above. Run `grunt dev` to start the development server and watch for file changes. Changes to files will trigger the server to restart and SCSS/CoffeeScript files to be recompiled.

## Contributing

If your interested in contributing then please do so! Raise an issue in the tracker if you have ideas for improvements or new features. Or better yet, fork the repo and make pull requests (would be awesome!)

<!-- ## To Play locally

### Setup
1. Ensure 3 devices are on a local network, or that the application server is accessable by 3 devices.
2. Start the Anagrammatix application
3. Visit http://your.ip.address:8080 on a PC, Tablet, SmartTV or other large screen device
4. Click CREATE
5. On a mobile device, visit http://your.ip.address:8080
6. Click JOIN on the mobile device screen.
7. Follow the on-screen instructions to join a game.
8. Find an opponent and have him/her repeat steps 5-7 on another mobile device.

### Gameplay
1. On the large screen (the game Host), a word will appear.
2. On each players' devices, a list of words appear.
3. The players must find an anagram of the word on the Host screen within the list of words on the mobile device.
4. The player who taps the correct anagram first gets 5 points.
5. Tapping an incorrect word will subtract 3 points.
6. The player with the most points after 10 rounds wins! -->

