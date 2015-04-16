
module.exports = (el) ->
  textFit $(el)[0],
    alignHoriz:  true
    alignVert:   false
    widthOnly:   true
    reProcess:   true
    # minFontSize: 6,
    maxFontSize: 80,
