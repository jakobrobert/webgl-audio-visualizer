class Rectangle {
    // TODO add params position and size
    constructor(bottomColor, topColor) {
        // note: counter-clockwise order always refers to the perspective that the face points towards the camera
        // define vertices in counter-clockwise order
        this.vertices = [
            //      position                         color
            // front face
            0.0,    0.0,    1.0,    bottomColor[0], bottomColor[1], bottomColor[2], // left bottom
            1.0,    0.0,    1.0,    bottomColor[0], bottomColor[1], bottomColor[2], // right bottom
            1.0,    1.0,    1.0,    topColor[0],    topColor[1],    topColor[2],    // right top
            0.0,    1.0,    1.0,    topColor[0],    topColor[1],    topColor[2],    // left top
            // back face
            1.0,    0.0,    0.0,    bottomColor[0], bottomColor[1], bottomColor[2], // left bottom
            0.0,    0.0,    0.0,    bottomColor[0], bottomColor[1], bottomColor[2], // right bottom
            0.0,    1.0,    0.0,    topColor[0],    topColor[1],    topColor[2],    // right top
            1.0,    1.0,    0.0,    topColor[0],    topColor[1],    topColor[2],    // left top
        ];
        // define indices for the different faces in counter-clockwise order
        // each face is a quad, so it consists of two triangles
        this.indices = [
            0, 1, 2, 2, 3, 0,   // front
            1, 4, 7, 7, 2, 1,   // right
            4, 5, 6, 6, 7, 4,   // back
            5, 0, 3, 3, 6, 5,   // left
            3, 2, 7, 7, 6, 3,   // top
            5, 4, 1, 1, 0, 5    // bottom
        ];
    }

    init(gl, shader) {
        this.gl = gl;
        this.shader = shader;
        this.viewProjectionMatrixLocation = this.shader.getUniformLocation("u_viewProjectionMatrix");

        this.vertexBuffer = new VertexBuffer(gl, this.vertices);
        this.indexBuffer = new IndexBuffer(gl, this.indices);

        this.vertexLayout = new VertexLayout(gl);
        this.vertexLayout.addAttribute(this.shader.getAttributeLocation("a_position"), 3);
        this.vertexLayout.addAttribute(this.shader.getAttributeLocation("a_color"), 3);
    }

    destroy() {
        this.vertexBuffer.delete();
        this.indexBuffer.delete();
    }

    draw(viewProjectionMatrix) {
        this.shader.bind();
        this.vertexBuffer.bind();
        this.indexBuffer.bind();
        this.vertexLayout.enableAttributes();

        this.gl.uniformMatrix4fv(this.viewProjectionMatrixLocation, false, viewProjectionMatrix);
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);

        this.shader.unbind();
        this.vertexBuffer.unbind();
        this.indexBuffer.unbind();
        this.vertexLayout.disableAttributes();
    }
}
