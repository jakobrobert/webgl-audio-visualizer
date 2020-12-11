class Shader {
    constructor(gl, vertexShaderUrl, fragmentShaderUrl, callback) {
        this.gl = gl;
        this.loadSource(vertexShaderUrl, vertexShaderSource => {
            this.loadSource(fragmentShaderUrl, fragmentShaderSource => {
                const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
                const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
                this.program = this.linkProgram(vertexShader, fragmentShader);
                callback();
            });
        });
    }

    bind() {
        this.gl.useProgram(this.program);
    }

    unbind() {
        this.gl.useProgram(null);
    }

    getAttributeLocation(name) {
        const location = this.gl.getAttribLocation(this.program, name);
        if (location === -1) {
            throw new Error("Failed to find attribute '" + name + "'!");
        }
        return location;
    }

    getUniformLocation(name) {
        const location = this.gl.getUniformLocation(this.program, name);
        if (location === -1) {
            throw new Error("Failed to find uniform '" + name + "'!");
        }
        return location;
    }

    loadSource(url, callback) {
        fetch(url)
            .then(response => response.text())
            .then(text => {
                callback(text);
            })
            .catch(error => {
                console.error(error);
                throw new Error("Failed to load shader source from '" + url + "'!");
            });
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        // check for compile error
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            const infoLog = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            const typeName = (type === gl.VERTEX_SHADER) ? "vertex" : "fragment";
            throw new Error("Failed to compile " + typeName + " shader!\n" + infoLog);
        }

        return shader;
    }

    linkProgram(vertexShader, fragmentShader) {
        const gl = this.gl;
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        // clean up, do not need temporary compile results
        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        // check link error
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            const infoLog = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error("Failed to link program!\n" + infoLog);
        }

        return program;
    }
}
