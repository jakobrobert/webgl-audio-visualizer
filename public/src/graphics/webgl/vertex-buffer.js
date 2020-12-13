class VertexBuffer {
    constructor(gl, data) {
        this.gl = gl;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    delete() {
        this.gl.deleteBuffer(this.buffer);
        this.buffer = null;
    }

    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }

    unbind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
}
