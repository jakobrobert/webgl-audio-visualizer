class Cuboid {
    constructor(position, size, bottomColor, topColor) {
        // calculate vertex positions
        // position refers to left bottom front
        const left = position[0];
        const bottom = position[1];
        const front = position[2];
        const right = left + size[0];
        const top = bottom + size[1];
        const back = front - size[2]; // subtract because left-handed coord system, positive z is towards camera

        // note: counter-clockwise order always refers to the perspective that the face points towards the camera
        // this is why the back face is mirrored

        // define vertices in counter-clockwise order
        this.vertices = [
            //      position                         color
            // front face
            left,   bottom, front,  bottomColor[0], bottomColor[1], bottomColor[2], // left bottom
            right,  bottom, front,  bottomColor[0], bottomColor[1], bottomColor[2], // right bottom
            right,  top,    front,  topColor[0],    topColor[1],    topColor[2],    // right top
            left,   top,    front,  topColor[0],    topColor[1],    topColor[2],    // left top
            // back face
            right,  bottom, back,   bottomColor[0], bottomColor[1], bottomColor[2], // left bottom
            left,   bottom, back,   bottomColor[0], bottomColor[1], bottomColor[2], // right bottom
            left,   top,    back,   topColor[0],    topColor[1],    topColor[2],    // right top
            right,  top,    back,   topColor[0],    topColor[1],    topColor[2],    // left top
        ];
        // define indices for the different faces in counter-clockwise order
        // each face is a quad, so it consists of 2 triangles = 6 indices
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
        this.shader.use();
        this.vertexBuffer.bind();
        this.indexBuffer.bind();
        this.vertexLayout.enableAttributes();

        this.gl.uniformMatrix4fv(this.viewProjectionMatrixLocation, false, viewProjectionMatrix);
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);

        this.shader.unuse();
        this.vertexBuffer.unbind();
        this.indexBuffer.unbind();
        this.vertexLayout.disableAttributes();
    }
}
