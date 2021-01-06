const MIN_DECIBELS = -70.0;
const MAX_DECIBELS = -20.0;
const WINDOW_SIZE = 256;

const GREEN = [0.0, 1.0, 0.0];
const RED = [1.0, 0.0, 0.0];

const FOV = 45.0;
const NEAR = 0.1;
const FAR = 100.0;

let audioCtx;
let analyzer;
let audioBuffer;
let audioPlayer;
let playing;

let frequencyDomainData;

let windowSizeInMs;

let timer;

let gl;
let shader;
let rendererReady = false;
let rectangles = [];
let camera;

function init() {
    initAudio();
    initRenderer();
    runRenderLoop();
}

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // webkit for legacy browsers

    analyzer = audioCtx.createAnalyser();
    analyzer.minDecibels = MIN_DECIBELS;
    analyzer.maxDecibels = MAX_DECIBELS;
    analyzer.fftSize = WINDOW_SIZE;
    analyzer.connect(audioCtx.destination);

    frequencyDomainData = new Uint8Array(analyzer.frequencyBinCount);
    const windowSizeInSeconds = WINDOW_SIZE / audioCtx.sampleRate;
    windowSizeInMs = windowSizeInSeconds * 1000;
}

function initRenderer() {
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

    const aspectRatio = canvas.width / canvas.height;
    camera = new PerspectiveCamera(FOV, aspectRatio, NEAR, FAR);

    shader = new Shader(gl, "assets/shaders/vertex-color", () => {
        // TODO: run renderer loop here
        rendererReady = true;
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
    updateSpectrumChart();
}

function updateTime() {
    const currTime = audioPlayer.getCurrentTime();
    document.getElementById("time").textContent = getTimeString(currTime);
    document.getElementById("duration").textContent = getTimeString(audioBuffer.duration);
}

function updateSpectrumChart() {
    if (!rendererReady) {
        return;
    }

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
        const normalizedValue = value / 255.0;
        const height = 2.0 * normalizedValue;
        const topColor = interpolateColor(GREEN, RED, normalizedValue);
        const rectangle = new Rectangle([x, y], [width, height], GREEN, topColor);
        rectangle.init(gl, shader);
        rectangles.push(rectangle);
        x += width;
    }
}

function interpolateColor(startColor, endColor, alpha) {
    const result = [];
    result[0] = (1.0 - alpha) * startColor[0] + alpha * endColor[0];
    result[1] = (1.0 - alpha) * startColor[1] + alpha * endColor[1];
    result[2] = (1.0 - alpha) * startColor[2] + alpha * endColor[2];
    return result;
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

    for (const rectangle of rectangles) {
        rectangle.draw(camera.getViewProjectionMatrix());
    }
}

function getTimeString(time) {
    const date = new Date(0);
    date.setSeconds(time);
    return date.toISOString().substr(14, 5);
}
