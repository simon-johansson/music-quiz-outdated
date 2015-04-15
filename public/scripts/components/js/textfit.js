/**
 * Make the text inside the given element as big as possible
 * See: https://github.com/STRML/textFit
 *
 * @param el The parent element of some text
 */
 module.exports = function (el) {
    textFit(
        $(el)[0],
        {
            alignHoriz: true,
            alignVert: false,
            widthOnly: true,
            reProcess: true,
            maxFontSize: 180
        }
    );
};
