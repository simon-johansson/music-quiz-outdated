React = require 'react'
{ Route, DefaultRoute } = require 'react-router'

App = require './app.cjsx'
Home = require './pages/Home'
CreateGamePage = require './pages/CreateGamePage.cjsx'
JoinGamePage = require './pages/JoinGamePage.cjsx'
# UserPage = require './pages/UserPage'

module.exports = (
  <Route name='app' path='/' handler={App}>
    <DefaultRoute name="home" handler={Home}/>
    <Route name='createGame' path='/create' handler={CreateGamePage} /> <br>
    <Route name='joinGame' path='/join' handler={JoinGamePage} />
  </Route>
)
