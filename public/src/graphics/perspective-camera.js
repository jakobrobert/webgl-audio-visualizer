class PerspectiveCamera {
    constructor() {
        this.projectionMatrix = glMatrix.mat4.create();
        this.viewMatrix = glMatrix.mat4.create();
        this.viewProjectionMatrix = glMatrix.mat4.create();
    }

    getViewProjectionMatrix() {
        return this.viewProjectionMatrix;
    }
}
