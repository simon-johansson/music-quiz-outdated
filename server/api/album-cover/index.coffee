
express    = require 'express'
controller = require './album-cover.controller'

router = express.Router()
router.get '/', controller.index

module.exports = router
