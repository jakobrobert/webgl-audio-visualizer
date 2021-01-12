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
let rendererInitialized = false;

let shader2D;
let shader3D;

let visualization;

// TODO only for testing, remove when 3d visualization is integrated
let testCuboid;

function init() {
    initAudio();
    initRenderer();
    runRenderLoop();
}

function onVisualizationTypeChanged(visualizationType) {
    if (visualizationType === "2d") {
        createSpectrumVisualization2D();
    } else if (visualizationType === "3d") {
        createSpectrumVisualization3D();
    } else {
        // error should never happen, must be programming error
        throw new Error("Invalid visualization type!");
    }
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
        shader3D = new Shader(gl, "assets/shaders/vertex-color-3d", () => {
            rendererInitialized = true;
        });
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

function createSpectrumVisualization2D() {
    if (!rendererInitialized) {
        alert("Renderer is not initialized yet!");
    }
    // destroy old visualization to avoid memory leaks
    if (visualization) {
        visualization.destroy();
    }
    visualization = new SpectrumVisualization2D(GREEN, RED);
    visualization.init(gl, shader2D);
}

function createSpectrumVisualization3D() {
    if (!rendererInitialized) {
        alert("Renderer is not initialized yet!");
    }
    // TODO cuboid is a dummy, replace by proper visualization
    // destroy old visualization to avoid memory leaks
    if (visualization) {
        visualization.destroy();
    }
    const position = [0.0, 0.0, 0.0];
    const size = [1.5, 1.0, 0.5];
    visualization = new Cuboid(position, size, GREEN, RED);
    visualization.init(gl, shader3D);
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
    if (visualization) {
        visualization.update(frequencyDomainData);
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

    if (visualization) {
        visualization.draw(camera.getViewProjectionMatrix());
    }
}

function getTimeString(time) {
    const date = new Date(0);
    date.setSeconds(time);
    return date.toISOString().substr(14, 5);
}
