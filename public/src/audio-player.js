class AudioPlayer {
    constructor(ctx, buffer, destinationNode) {
        this.ctx = ctx;
        this.buffer = buffer;
        this.source = null;
        this.destinationNode = destinationNode;
        this.startTime = 0;
    }

    setCallbacks(onStart, onPause, onResume, onStop) {
        this.onStart = onStart;
        this.onPause = onPause;
        this.onResume = onResume;
        this.onStop = onStop;
    }

    getCurrentTime() {
        return this.ctx.currentTime - this.startTime;
    }

    async playOrPause() {
        if (!this.source) {
            // player has not been started yet or has just been stopped
            // needs to be re-started
            this.start();
        } else {
            // player is not stopped, so it is either playing or paused
            if (this.ctx.state === "running") {
                // playing => pause
                await this.pause();
            } else if (this.ctx.state === "suspended") {
                // paused => resume
                await this.resume();
            }
        }
    }

    async stop() {
        if (!this.source) {
            // player has not been start yet or is already stopped
            return;
        }
        if (this.ctx.state === "suspended") {
            // if ctx is suspended (paused), first need to resume
            // might seem paradox, but is correct because not the source is suspended, but the ctx
            await this.ctx.resume();
        }
        this.source.stop();
    }

    start() {
        // to re-start a player, need to re-create the source
        this.source = this.ctx.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.destinationNode);
        this.source.onended = () => {
            // this is called if playback has finished naturally or forcefully by stop() call on the source
            this.handleStop();
        };
        this.startTime = this.ctx.currentTime;
        this.source.start();
        this.onStart();
    }

    async pause() {
        await this.ctx.suspend();
        this.onPause();
    }

    async resume() {
        await this.ctx.resume();
        this.onResume();
    }

    handleStop() {
        this.source.disconnect();
        this.source = null;
        this.onStop();
    }
}
