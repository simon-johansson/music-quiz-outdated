
var textfit = require('./textfit');

/**
 * Display the countdown timer on the Host screen
 *
 * @param $el The container element for the countdown timer
 * @param startTime
 * @param callback The function to call when the timer ends.
 */

 module.exports = function( $el, startTime, callback) {

    // Display the starting time on the screen.
    $el.text(startTime);
    textfit('#hostWord');

    // console.log('Starting Countdown...');

    // Start a 1 second timer
    var timer = setInterval(countItDown, 1000);

    // Decrement the displayed timer value on each 'tick'
    function countItDown(){
        startTime -= 1
        $el.text(startTime);
        textfit('#hostWord');

        if( startTime <= 0 ){
            // console.log('Countdown Finished.');

            // Stop the timer and do the callback.
            clearInterval(timer);
            callback();
            return;
        }
    }

};
