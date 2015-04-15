
module.exports = (el) ->
  textFit $(el)[0],
    alignHoriz:  true
    alignVert:   false
    widthOnly:   true
    reProcess:   true
    maxFontSize: 180
