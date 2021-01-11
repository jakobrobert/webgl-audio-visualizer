class Rectangle {
    constructor(position, size, bottomColor, topColor) {
        // calculate vertex positions
        // position refers to left bottom
        const left = position[0];
        const bottom = position[1];
        const right = left + size[0];
        const top = bottom + size[1];

        // define vertices in counter-clockwise order
        this.vertices = [
            // position         color
            left,   bottom,     bottomColor[0], bottomColor[1], bottomColor[2],
            right,  bottom,     bottomColor[0], bottomColor[1], bottomColor[2],
            right,  top,        topColor[0],    topColor[1],    topColor[2],
            left,   top,        topColor[0],    topColor[1],    topColor[2]
        ];
        // define indices in counter-clockwise order
        this.indices = [
            0, 1, 2,    // right bottom triangle
            2, 3, 0     // left top triangle
        ];
    }

    init(gl, shader) {
        this.gl = gl;
        this.shader = shader;
        this.viewProjectionMatrixLocation = this.shader.getUniformLocation("u_viewProjectionMatrix");

        this.vertexBuffer = new VertexBuffer(gl, this.vertices);
        this.indexBuffer = new IndexBuffer(gl, this.indices);

        this.vertexLayout = new VertexLayout(gl);
        this.vertexLayout.addAttribute(this.shader.getAttributeLocation("a_position"), 2);
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
