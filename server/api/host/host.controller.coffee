
_     = require 'lodash'
debug = require('debug') 'host'

handleError = (res, err) ->
  res.send 500, err

# Get list of things

exports.createNewGame = ->
  # Create a unique Socket.IO Room
  thisGameId = Math.random() * 100000 | 0

  # Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
  @emit 'newGameCreated',
    gameId: thisGameId
    mySocketId: @id

  # Join the Room and wait for the players
  @join thisGameId.toString()

# Get a single thing

exports.show = (req, res) ->
  Thing.findById req.params.id, (err, thing) ->
    if err then handleError(res, err)
    unless thing then res.send(404)
    res.json thing

# Creates a new thing in the DB.

exports.create = (req, res) ->
  Thing.create req.body, (err, thing) ->
    if err then handleError(res, err)
    res.json 201, thing

# Updates an existing thing in the DB.

exports.update = (req, res) ->
  if req.body._id
    delete req.body._id
  Thing.findById req.params.id, (err, thing) ->
    if err
      return handleError(res, err)
    if !thing
      return res.send(404)
    updated = _.merge(thing, req.body)
    updated.save (err) ->
      if err
        return handleError(res, err)
      res.json 200, thing

# Deletes a thing from the DB.

exports.destroy = (req, res) ->
  Thing.findById req.params.id, (err, thing) ->
    if err
      return handleError(res, err)
    if !thing
      return res.send(404)
    thing.remove (err) ->
      if err
        return handleError(res, err)
      res.send 204
