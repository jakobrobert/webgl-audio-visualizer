class SpectrumVisualization3DExtended {
    constructor(position, depth, bottomColor, topColor, camera) {
        this.position = position;
        this.depth = depth;
        this.bottomColor = bottomColor;
        this.topColor = topColor;
        this.camera = camera;

        this.cuboids = [];
        this.depthOffset = 0.0;

        this.cameraStartPosition = [2.0, 2.0, 3.0];
        this.camera.setPosition(this.cameraStartPosition);
        this.camera.setYaw(30.0);
        this.camera.setPitch(-30.0);
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
        const newCuboids = this.createCuboids(frequencyDomainData);
        this.initCuboids(newCuboids);
        this.cuboids.push(...newCuboids);
        this.updateCamera();
    }

    createCuboids(frequencyDomainData) {
        const cuboids = [];

        const startTime = performance.now();

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
            cuboids.push(cuboid);
            x += width;
        }

        // increase depth offset for each update, so the visualizations for each update are stacked onto each other
        this.depthOffset += this.depth;

        const elapsedTime = performance.now() - startTime;
        console.log("Create " + cuboids.length + " cuboids in " + elapsedTime + " ms");

        return cuboids;
    }

    initCuboids(cuboids) {
        const startTime = performance.now();
        for (const cuboid of cuboids) {
            cuboid.init(this.gl, this.shader);
        }
        const elapsedTime = performance.now() - startTime;
        console.log("Init " + cuboids.length + " cuboids in " + elapsedTime + " ms");
    }

    updateCamera() {
        // update camera position so the visualization stays inside the viewport
        // move it along the positive z-axis just as the visualization
        const cameraX = this.cameraStartPosition[0];
        const cameraY = this.cameraStartPosition[1];
        const cameraZ = this.cameraStartPosition[2] + this.depthOffset;
        this.camera.setPosition([cameraX, cameraY, cameraZ]);
    }
}
