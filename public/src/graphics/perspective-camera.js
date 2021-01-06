class PerspectiveCamera {
    constructor(fovInDegrees, aspectRatio, near, far) {
        this.viewMatrix = glMatrix.mat4.create();
        this.projectionMatrix = glMatrix.mat4.create();
        this.viewProjectionMatrix = glMatrix.mat4.create();

        const eye = glMatrix.vec3.fromValues(0.0, 2.0, 2.0);
        const center = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
        const up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
        glMatrix.mat4.lookAt(this.viewMatrix, eye, center, up);

        const fov = glMatrix.glMatrix.toRadian(fovInDegrees);
        glMatrix.mat4.perspective(this.projectionMatrix, fov, aspectRatio, near, far);

        // multiplication in reverse order: view matrix is applied first
        glMatrix.mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    }

    getViewProjectionMatrix() {
        return this.viewProjectionMatrix;
    }
}
