class SpectrumVisualization3DExtended {
    constructor(depth, bottomColor, topColor) {
        this.depth = depth;
        this.bottomColor = bottomColor;
        this.topColor = topColor;
        this.cuboids = [];
        this.depthOffset = 0.0;
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

    draw(viewProjectionMatrix) {
        for (const cuboid of this.cuboids) {
            cuboid.draw(viewProjectionMatrix);
        }
    }

    update(frequencyDomainData) {
        // width of each cuboid
        // one cuboid for each frequency bin
        // in normalized coords, whole viewport has a size of 2 x 2
        const width = 2.0 / frequencyDomainData.length;
        // start with bottom left corner of viewport
        // TODO: pass 3D start position as param
        let x = -1.0;
        const y = -1.0;
        for (const value of frequencyDomainData) {
            const normalizedValue = value / 255.0;
            const height = 2.0 * normalizedValue;
            const position = [x, y, this.depthOffset];
            const size = [width, height, this.depth];
            const interpolatedColor = GraphicsUtils.interpolateColor(this.bottomColor, this.topColor, normalizedValue);
            const cuboid = new Cuboid(position, size, this.bottomColor, interpolatedColor);
            cuboid.init(this.gl, this.shader);
            this.cuboids.push(cuboid);
            x += width;
        }
        // increase depth offset for each update, so the visualizations for each update are stacked onto each other
        this.depthOffset += this.depth;
    }
}
