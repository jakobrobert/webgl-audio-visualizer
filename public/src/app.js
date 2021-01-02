const MIN_DECIBELS = -90;
const WINDOW_SIZE = 512;

let audioCtx;
let analyzer;
let audioBuffer;
let audioPlayer;
let playing;

let frequencyDomainData;

let windowSizeInMs;

let timer;

let gl;
let rectangle;

const POSITION = [-1.0, -1.0]; // bottom left corner of viewport
const SIZE = [0.5, 1.5];
const BOTTOM_COLOR = [0.0, 1.0, 0.0]; // green
const TOP_COLOR = [1.0, 0.0, 0.0]; // red

function init() {
    initAudio();
    initWebGL();
    runRenderLoop();
    createRectangle();
}

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // webkit for legacy browsers

    analyzer = audioCtx.createAnalyser();
    analyzer.minDecibels = MIN_DECIBELS;
    analyzer.maxDecibels = 0;
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

function createRectangle() {
    const shaderBaseUrl = "assets/shaders/vertex-color";
    const shader = new Shader(gl, shaderBaseUrl + ".vert", shaderBaseUrl + ".frag",
        () => {
            rectangle = new Rectangle(POSITION, SIZE, BOTTOM_COLOR, TOP_COLOR);
            rectangle.init(gl, shader);
        });
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
    console.log(frequencyDomainData);
}

function updateTime() {
    const currTime = audioPlayer.getCurrentTime();
    document.getElementById("time").textContent = getTimeString(currTime);
    document.getElementById("duration").textContent = getTimeString(audioBuffer.duration);
}

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

    if (rectangle) {
        rectangle.draw();
    }
}

function getTimeString(time) {
    const date = new Date(0);
    date.setSeconds(time);
    return date.toISOString().substr(14, 5);
}
