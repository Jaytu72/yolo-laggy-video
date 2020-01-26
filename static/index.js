import yolo, { downloadModel } from './yolo.js';

const VID_SRC = 'fatrabbit.mp4';

const W = 416;
const H = 416;
const W_RATIO = 2;
const H_RATIO = 1.5;

const BOX_COLORS = ['red', 'blue', 'green', 'orange', 'purple'];

// Callback function for asynchronous yolo function.
function setResult(r) {
    result = r;
}

function draw(v, c, canvas, w, h) {
    if(v.paused || v.ended) return false;

    // Preprocess video frame for prediction.
    let tensor = tf.fromPixels(v)
    .resizeNearestNeighbor([416,416])
    .toFloat()
    .expandDims();

    // Function imported from @MikeShi42 (https://github.com/ModelDepot/tfjs-yolo-tiny).
    yolo(tensor, model, { classProbThreshold: 0.8, maxBoxes: 5}).then(r => setResult(r));

    // Clean up canvas before
    c.clearRect(0, 0, w, h);
    c.drawImage(v, 0, 0, w, h);

    // If predictions are returned, draw boxes on canvas.
    try {
        for(let i = 0; i < 5; i++) {

            // Get box coordinates. 
            let left = result[i].left;
            let right = result[i].right;
            let top = result[i].top;
            let bottom = result[i].bottom;

            // Draw boxes with predicted classes.
            c.fillStyle = BOX_COLORS[i];
            c.strokeStyle = BOX_COLORS[i];
            c.lineWidth = 5;
            c.strokeRect(left * W_RATIO, top * H_RATIO, (right - left) * W_RATIO, (bottom - top) * H_RATIO);
            c.font = '15pt Courier New ';
            c.fillRect(left * W_RATIO, top * H_RATIO, result[i].className.length * 15, 35);
            c.fillStyle = 'black';
            c.fillText(result[i].className, left * W_RATIO + 5, top * H_RATIO + 20);
        }
    }
    catch(e) {
        console.log('No prediction');
    }

    // Draw function is called repeatedly.
    setTimeout(draw, 30, v, c, canvas, w, h);
}

function startVideo() {
    // Get canvas element and its context.
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');

    // Create video element to play in the background.
    let vid = document.createElement('video');

    // Set background video properties.
    vid.width = W;
    vid.height = H;
    vid.muted = true;
    vid.preload = true;
    vid.loop = true;
    vid.src = VID_SRC;

    let cw = Math.floor(canvas.clientWidth);
    let ch = Math.floor(canvas.clientHeight);
    canvas.width = cw;
    canvas.height = ch;

    // Add event listener to trigger draw function 
    // when video begins playing.
    vid.addEventListener('play', function() {
        draw(this, context, canvas, cw, ch);
    }, false);

    // Play the autolooped video once everything is ready.
    vid.play();
}

var model;
var result;
(async function() {
    // Function imported from @MikeShi42 (https://github.com/ModelDepot/tfjs-yolo-tiny).
    model = await downloadModel();

    // Start video when model is loaded.
    startVideo();
    $('.spinner-border').hide();
    $('.btn-primary').css('visibility', 'visible');
})();