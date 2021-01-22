class SpectrumVisualization3DSimple {
    constructor(position, depth, bottomColor, topColor, camera) {
        this.position = position;
        this.depth = depth;
        this.bottomColor = bottomColor;
        this.topColor = topColor;
        this.camera = camera;

        this.cuboids = [];

        this.camera.setPosition([2.0, 2.0, 3.0]);
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
        // remove the old visualization
        this.destroy();

        // width of each cuboid
        // one cuboid for each frequency bin
        // in normalized coords, whole viewport has a size of 2 x 2
        const width = 2.0 / frequencyDomainData.length;

        let x = this.position[0];
        const y = this.position[1];
        const z = this.position[2];

        const newCuboids = [];

        for (const value of frequencyDomainData) {
            const normalizedValue = value / 255.0;
            const height = 2.0 * normalizedValue;
            const position = [x, y, z];
            const size = [width, height, this.depth];
            const interpolatedColor = GraphicsUtils.interpolateColor(this.bottomColor, this.topColor, normalizedValue);
            const cuboid = new Cuboid(position, size, this.bottomColor, interpolatedColor);
            this.cuboids.push(cuboid);
            newCuboids.push(cuboid);
            x += width;
        }

        for (const cuboid of newCuboids) {
            cuboid.init(this.gl, this.shader);
        }
    }
}
