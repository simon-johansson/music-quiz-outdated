###*
# Broadcast updates to client when the model changes
###

thing = require('./thing.model')

onSave = (socket, doc, cb) ->
  socket.emit 'thing:save', doc

onRemove = (socket, doc, cb) ->
  socket.emit 'thing:remove', doc


exports.register = (socket) ->
  thing.schema.post 'save', (doc) ->
    onSave socket, doc

  thing.schema.post 'remove', (doc) ->
    onRemove socket, doc


