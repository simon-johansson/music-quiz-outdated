
{ create , HistoryLocation, HashLocation } = require 'react-router'
routes = require './routes.cjsx'

module.exports = create
  # location: if process.env.NODE_ENV is 'production' then HashLocation else HistoryLocation
  location: HashLocation
  routes: routes
