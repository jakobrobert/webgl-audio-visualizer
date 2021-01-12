class SpectrumVisualization3D {
    constructor(depth, bottomColor, topColor) {
        this.depth = depth;
        this.bottomColor = bottomColor;
        this.topColor = topColor;
        this.cuboids = [];
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
        this.destroy();

        // width of each cuboid
        // one cuboid for each frequency bin
        // in normalized coords, whole viewport has a size of 2 x 2
        const width = 2.0 / frequencyDomainData.length;
        // start with bottom left corner of viewport
        let x = -1.0;
        const y = -1.0;
        for (const value of frequencyDomainData) {
            const normalizedValue = value / 255.0;
            const height = 2.0 * normalizedValue;
            const position = [x, y, 0.0];
            const size = [width, height, this.depth];
            const interpolatedColor = this.interpolateColor(this.bottomColor, this.topColor, normalizedValue);
            const cuboid = new Cuboid(position, size, this.bottomColor, interpolatedColor);
            cuboid.init(this.gl, this.shader);
            this.cuboids.push(cuboid);
            x += width;
        }
    }

    // TODO Duplicated code
    interpolateColor(startColor, endColor, alpha) {
        const result = [];
        result[0] = (1.0 - alpha) * startColor[0] + alpha * endColor[0];
        result[1] = (1.0 - alpha) * startColor[1] + alpha * endColor[1];
        result[2] = (1.0 - alpha) * startColor[2] + alpha * endColor[2];
        return result;
    }
}
