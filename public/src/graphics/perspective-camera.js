class PerspectiveCamera {
    constructor(fovInDegrees, aspectRatio, near, far) {
        this.viewMatrix = glMatrix.mat4.create();
        this.projectionMatrix = glMatrix.mat4.create();
        this.viewProjectionMatrix = glMatrix.mat4.create();
        this.position = [0.0, 0.0, 0.0];
        this.pitchInDegrees = 0.0;
        this.yawInDegrees = 0.0;

        this.updateViewMatrix();

        // calculate projection matrix
        const fov = glMatrix.glMatrix.toRadian(fovInDegrees);
        glMatrix.mat4.perspective(this.projectionMatrix, fov, aspectRatio, near, far);

        this.updateViewProjectionMatrix();
    }

    getViewProjectionMatrix() {
        return this.viewProjectionMatrix;
    }

    setPosition(position) {
        this.position = position;
        this.updateViewMatrix();
        this.updateViewProjectionMatrix();
    }

    setPitch(pitchInDegrees) {
        this.pitchInDegrees = pitchInDegrees;
        this.updateViewMatrix();
        this.updateViewProjectionMatrix();
    }

    setYaw(yawInDegrees) {
        this.yawInDegrees = yawInDegrees;
        this.updateViewMatrix();
        this.updateViewProjectionMatrix();
    }

    updateViewMatrix() {
        // for camera, translation and rotation is inverted
        // instead of moving the camera, the world moves in reverse
        // the coordinates are transformed from world space to view / camera space

        // calculate translation matrix
        const translation = glMatrix.vec3.fromValues(-this.position[0], -this.position[1], -this.position[2]);
        const translationMatrix = glMatrix.mat4.create();
        glMatrix.mat4.translate(translationMatrix, translationMatrix, translation);

        // calculate rotation matrix for pitch = rotation about x-axis
        const pitch = glMatrix.glMatrix.toRadian(-this.pitchInDegrees);
        const rotationXMatrix = glMatrix.mat4.create();
        glMatrix.mat4.rotateX(rotationXMatrix, rotationXMatrix, pitch);

        // calculate rotation matrix for yaw = rotation about y-axis
        const yaw = glMatrix.glMatrix.toRadian(-this.yawInDegrees);
        const rotationYMatrix = glMatrix.mat4.create();
        glMatrix.mat4.rotateY(rotationYMatrix, rotationYMatrix, yaw);

        // multiplication in reverse order: translation is applied first, then y rotation, then x rotation
        // translate first so rotation is about camera origin, not about world origin
        glMatrix.mat4.multiply(this.viewMatrix, rotationXMatrix, rotationYMatrix);
        glMatrix.mat4.multiply(this.viewMatrix, this.viewMatrix, translationMatrix);
    }

    updateViewProjectionMatrix() {
        // multiplication in reverse order: view matrix is applied first
        glMatrix.mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    }
}
