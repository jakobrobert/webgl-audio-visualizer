class PerspectiveCamera {
    constructor() {
        this.projectionMatrix = glMatrix.mat4.create();
        this.viewMatrix = glMatrix.mat4.create();
        this.viewProjectionMatrix = glMatrix.mat4.create();

        const eye = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);
        const center = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
        const up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);

        glMatrix.mat4.lookAt(this.viewMatrix, eye, center, up);

        // multiplication in reverse order: view matrix is applied first
        glMatrix.mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    }

    getViewProjectionMatrix() {
        return this.viewProjectionMatrix;
    }
}
