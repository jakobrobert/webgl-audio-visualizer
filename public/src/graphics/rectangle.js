class Rectangle {
    constructor() {
        // vertices and indices defined in counter-clockwise order
        // TODO: calculate vertex positions from position and size instead of hardcoding
        // TODO: color as parameter instead of hardcoding
        this.vertices = [
            // counter-clockwise order
            // position         color
            -0.5, -0.5,     1.0, 0.0, 0.0,  // left bottom, red
            0.5, -0.5,      0.0, 1.0, 0.0,  // right bottom, green
            0.5, 0.5,       0.0, 0.0, 1.0,  // right top, blue
            -0.5, 0.5,      1.0, 1.0, 1.0,  // left top, white
        ];

        this.indices = [
            // counter-clockwise order
            0, 1, 2,    // right bottom triangle
            2, 3, 0     // left top triangle
        ];
    }

    init(gl, shader) {
        this.gl = gl;

        this.shader = shader;
        this.vertexBuffer = new VertexBuffer(gl, this.vertices);
        this.indexBuffer = new IndexBuffer(gl, this.indices);

        // parameters required for specification of vertex layout
        this.positionLocation = this.shader.getAttributeLocation("a_position");
        this.positionSize = 2;
        this.positionOffset = 0;
        this.colorLocation = this.shader.getAttributeLocation("a_color");
        this.colorSize = 3;
        this.colorOffset = this.positionSize * Float32Array.BYTES_PER_ELEMENT;
        this.vertexStride = (this.positionSize + this.colorSize) * Float32Array.BYTES_PER_ELEMENT;
    }

    destroy() {
        this.vertexBuffer.delete();
        this.indexBuffer.delete();
    }

    draw() {
        const gl = this.gl;

        this.shader.bind();
        this.vertexBuffer.bind();
        this.indexBuffer.bind();

        // specify vertex layout
        // need to do it for each draw call, state is lost after unbinding vertex buffer
        // position attribute
        gl.vertexAttribPointer(this.positionLocation, this.positionSize, gl.FLOAT, false,
            this.vertexStride, this.positionOffset);
        gl.enableVertexAttribArray(this.positionLocation);
        // color attribute
        gl.vertexAttribPointer(this.colorLocation, this.colorSize, gl.FLOAT, false,
            this.vertexStride, this.colorOffset);
        gl.enableVertexAttribArray(this.colorLocation);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        // leave a clean state to prevent errors
        gl.disableVertexAttribArray(this.positionLocation);
        gl.disableVertexAttribArray(this.colorLocation);
        this.shader.unbind();
        this.vertexBuffer.unbind();
        this.indexBuffer.unbind();
    }
}
