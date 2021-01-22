class SpectrumVisualization3DExtended {
    constructor(position, depth, bottomColor, topColor, camera) {
        this.position = position;
        this.depth = depth;
        this.bottomColor = bottomColor;
        this.topColor = topColor;
        this.camera = camera;

        this.cuboids = [];
        this.depthOffset = 0.0;

        this.camera.setPosition([2.0, 2.0, 3.0]);
        this.camera.setYaw(30.0);
        this.camera.setPitch(-30.0);

        // calculate move vector => used to move the camera in each update

        /*const cameraMoveMatrix = glMatrix.mat4.create();
        // calculate rotation matrix for yaw = rotation about y-axis
        const yaw = glMatrix.glMatrix.toRadian(-this.camera.getYaw());
        glMatrix.mat4.rotateY(cameraMoveMatrix, cameraMoveMatrix, yaw);*/

        // initial, without any transform: move along positive z-axis (out of screen, backwards)
        // use same increment for each update as the visualization, so it is in-sync
        this.cameraMoveVector = glMatrix.vec3.fromValues(0.0, 0.0, this.depth);
    }

    init(gl, shader) {
        this.gl = gl;
        this.shader = shader;
    }

    destroy() {
        for (const cuboid of this.cuboids) {
            cuboid.destroy();
        }
        this.cuboids = [];
    }

    draw() {
        for (const cuboid of this.cuboids) {
            cuboid.draw(this.camera.getViewProjectionMatrix());
        }
    }

    update(frequencyDomainData) {
        // width of each cuboid
        // one cuboid for each frequency bin
        // in normalized coords, whole viewport has a size of 2 x 2
        const width = 2.0 / frequencyDomainData.length;

        let x = this.position[0];
        const y = this.position[1];
        const z = this.position[2] + this.depthOffset;

        for (const value of frequencyDomainData) {
            const normalizedValue = value / 255.0;
            const height = 2.0 * normalizedValue;
            const position = [x, y, z];
            const size = [width, height, this.depth];
            const interpolatedColor = GraphicsUtils.interpolateColor(this.bottomColor, this.topColor, normalizedValue);
            const cuboid = new Cuboid(position, size, this.bottomColor, interpolatedColor);
            cuboid.init(this.gl, this.shader);
            this.cuboids.push(cuboid);
            x += width;
        }

        // increase depth offset for each update, so the visualizations for each update are stacked onto each other
        this.depthOffset += this.depth;

        // update camera position so the visualization stays inside the viewport
        // TODO: simplify code
        const cameraPosition = this.camera.getPosition();
        const newCameraPosition = glMatrix.vec3.fromValues(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
        glMatrix.vec3.add(newCameraPosition, newCameraPosition, this.cameraMoveVector);
        this.camera.setPosition(newCameraPosition);
    }
}
