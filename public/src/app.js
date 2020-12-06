const AudioContext = window.AudioContext || window.webkitAudioContext; // webkit for legacy browsers

let audioCtx;
let audioBuffer;
let audioPlayer;

function init() {
    audioCtx = new AudioContext();
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
        audioPlayer = new AudioPlayer(audioCtx, audioBuffer, audioCtx.destination);
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
    document.getElementById("btn-play-pause").value = "Play";
    document.getElementById("time").textContent = "00:00";
}

function getTimeString(time) {
    const date = new Date(0);
    date.setSeconds(time);
    return date.toISOString().substr(14, 5);
}
