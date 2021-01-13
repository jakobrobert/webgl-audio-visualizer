class PerspectiveCamera {
    constructor(eyePosition, fovInDegrees, aspectRatio, near, far) {
        this.viewMatrix = glMatrix.mat4.create();
        this.projectionMatrix = glMatrix.mat4.create();
        this.viewProjectionMatrix = glMatrix.mat4.create();

        this.updateViewMatrix(eyePosition)

        // calculate projection matrix
        const fov = glMatrix.glMatrix.toRadian(fovInDegrees);
        glMatrix.mat4.perspective(this.projectionMatrix, fov, aspectRatio, near, far);

        this.updateViewProjectionMatrix();
    }

    getViewProjectionMatrix() {
        return this.viewProjectionMatrix;
    }

    updateEyePosition(eyePosition) {
        this.updateViewMatrix(eyePosition);
        this.updateViewProjectionMatrix();
    }

    updateViewMatrix(eyePosition) {
        const eye = glMatrix.vec3.fromValues(eyePosition[0], eyePosition[1], eyePosition[2]);
        const center = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
        const up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
        glMatrix.mat4.lookAt(this.viewMatrix, eye, center, up);
    }

    updateViewProjectionMatrix() {
        // multiplication in reverse order: view matrix is applied first
        glMatrix.mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    }
}
