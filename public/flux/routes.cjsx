React = require 'react'
{ Route } = require 'react-router'
App = require './app.cjsx'
CreateGamePage = require './pages/CreateGamePage.cjsx'
JoinGamePage = require './pages/JoinGamePage.cjsx'
# UserPage = require './pages/UserPage'

module.exports = (
  <Route name='index' path='/' handler={App}>
    <Route name='createGame' path='/create' handler={CreateGamePage} /> <br>
    <Route name='joinGame' path='/join' handler={JoinGamePage} />
  </Route>
)
