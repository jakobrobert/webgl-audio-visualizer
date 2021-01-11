const MIN_DECIBELS = -70.0;
const MAX_DECIBELS = -20.0;
const WINDOW_SIZE = 256;

const FOV = 45.0;
const NEAR = 0.1;
const FAR = 100.0;

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
let camera;
let shader2D;
let shader3D;
let spectrumVisualization;

// TODO only for testing, remove when 3d visualization is integrated
let testCuboid;

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
    // enable depth testing so back faces do not overdraw front faces
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    // enable face culling so back faces are discarded for efficiency
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW); // front faces are in counter-clockwise order

    const aspectRatio = canvas.width / canvas.height;
    camera = new PerspectiveCamera(FOV, aspectRatio, NEAR, FAR);

    shader2D = new Shader(gl, "assets/shaders/vertex-color-2d", () => {
        spectrumVisualization = new SpectrumVisualization2D(GREEN, RED);
        spectrumVisualization.init(gl, shader2D);
    });
}

function createTestCuboid() {
    shader3D = new Shader(gl, "assets/shaders/vertex-color-3d", () => {
        testCuboid = new Cuboid(GREEN, RED);
        testCuboid.init(gl, shader3D);
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
    if (spectrumVisualization) {
        spectrumVisualization.update(frequencyDomainData);
    }
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
    // clear color buffer with specified background color and clear depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (spectrumVisualization) {
        spectrumVisualization.draw(camera.getViewProjectionMatrix());
    }
    if (testCuboid) {
        // small hack to let cuboid rotate
        const viewProjectionMatrix = camera.getViewProjectionMatrix();
        const matrix = glMatrix.mat4.create();
        glMatrix.mat4.rotateY(matrix, viewProjectionMatrix, performance.now() / 1000.0);
        testCuboid.draw(matrix);
    }
}

function getTimeString(time) {
    const date = new Date(0);
    date.setSeconds(time);
    return date.toISOString().substr(14, 5);
}
