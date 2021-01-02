const MIN_DECIBELS = -90.0;
const WINDOW_SIZE = 512;

const GREEN = [0.0, 1.0, 0.0];
const RED = [1.0, 0.0, 0.0];

let audioCtx;
let analyzer;
let audioBuffer;
let audioPlayer;
let playing;

let frequencyDomainData;

let windowSizeInMs;

let timer;

let gl;
let rectangles = [];

function init() {
    initAudio();
    initWebGL();
    runRenderLoop();
}

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // webkit for legacy browsers

    analyzer = audioCtx.createAnalyser();
    analyzer.minDecibels = MIN_DECIBELS;
    analyzer.maxDecibels = 0.0;
    analyzer.fftSize = WINDOW_SIZE;
    analyzer.connect(audioCtx.destination);

    frequencyDomainData = new Uint8Array(analyzer.frequencyBinCount);
    const windowSizeInSeconds = WINDOW_SIZE / audioCtx.sampleRate;
    windowSizeInMs = windowSizeInSeconds * 1000;
}

function initWebGL() {
    // get webgl context
    const canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
        const message = "Failed to initialize WebGL!";
        alert(message);
        throw new Error(message);
    }
    // set background color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
}

function loadAudioFile(file) {
    const statusLabel = document.getElementById("status");
    statusLabel.textContent = "Loading...";

    const reader = new FileReader();
    reader.onload = async () => {
        if (audioPlayer) {
            await audioPlayer.stop();
        }
        const data = reader.result;
        audioBuffer = await audioCtx.decodeAudioData(data);
        audioPlayer = new AudioPlayer(audioCtx, audioBuffer, analyzer);
        audioPlayer.setCallbacks(onStart, onPause, onResume, onStop);
        statusLabel.textContent = "Ready";
    };
    reader.readAsArrayBuffer(file);
}

async function playOrPause() {
    if (!audioPlayer) {
        return;
    }
    await audioPlayer.playOrPause();
}

async function stop() {
    if (!audioPlayer) {
        return;
    }
    await audioPlayer.stop();
}

function onStart() {
    if (timer) {
        clearInterval(timer);
    }
    timer = setInterval(() => {
        update();
    }, windowSizeInMs);

    playing = true;
    document.getElementById("btn-play-pause").value = "Pause";
    document.getElementById("time").textContent = "00:00";
    document.getElementById("duration").textContent = getTimeString(audioBuffer.duration);
}

function onPause() {
    document.getElementById("btn-play-pause").value = "Play";
}

function onResume() {
    document.getElementById("btn-play-pause").value = "Pause";
}

function onStop() {
    if (timer) {
        clearInterval(timer);
    }

    playing = false;
    document.getElementById("btn-play-pause").value = "Play";
    document.getElementById("time").textContent = "00:00";
}

function update() {
    if (!audioPlayer || !playing) {
        return;
    }
    updateTime();
    analyzer.getByteFrequencyData(frequencyDomainData);
    updateSpectrumChart();
}

function updateTime() {
    const currTime = audioPlayer.getCurrentTime();
    document.getElementById("time").textContent = getTimeString(currTime);
    document.getElementById("duration").textContent = getTimeString(audioBuffer.duration);
}

// TODO: Extract into class
function updateSpectrumChart() {
    // remove old rectangles
    for (const rectangle of rectangles) {
        rectangle.destroy();
    }
    rectangles = [];

    // width of each segment (in normalized coords, whole viewport has a size of 2 x 2)
    const width = 2.0 / frequencyDomainData.length;
    // start with bottom left corner of viewport
    let x = -1.0;
    const y = -1.0;

    for (const value of frequencyDomainData) {
        console.log(x);
        const normalizedValue = value / 255.0;
        const height = 2.0 * normalizedValue;
        // TODO interpolate top color dependent on normalized value
        const rectangle = new Rectangle([x, y], [width, height], GREEN, RED);
        // TODO init, need shader
        rectangles.push(rectangle);
        x += width;
    }
}

// TODO Remove
/*function createRectangle() {
    const shaderBaseUrl = "assets/shaders/vertex-color";
    const shader = new Shader(gl, shaderBaseUrl + ".vert", shaderBaseUrl + ".frag",
        () => {
            rectangle = new Rectangle(POSITION, SIZE, BOTTOM_COLOR, TOP_COLOR);
            rectangle.init(gl, shader);
        });
}*/

function runRenderLoop() {
    const loop = () => {
        render();
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

function render() {
    // clear color buffer with specified background color
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const rectangle of rectangles) {
        rectangle.draw();
    }
}

function getTimeString(time) {
    const date = new Date(0);
    date.setSeconds(time);
    return date.toISOString().substr(14, 5);
}
