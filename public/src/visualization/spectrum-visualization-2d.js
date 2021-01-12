class SpectrumVisualization2D {
    constructor(bottomColor, topColor) {
        this.bottomColor = bottomColor;
        this.topColor = topColor;
        this.rectangles = [];
    }

    init(gl, shader) {
        this.gl = gl;
        this.shader = shader;
    }

    destroy() {
        for (const rectangle of this.rectangles) {
            rectangle.destroy();
        }
        this.rectangles = [];
    }

    draw(viewProjectionMatrix) {
        for (const rectangle of this.rectangles) {
            rectangle.draw(viewProjectionMatrix);
        }
    }

    update(frequencyDomainData) {
        this.destroy();

        // width of each rectangle
        // one rectangle for each frequency bin
        // in normalized coords, whole viewport has a size of 2 x 2
        const width = 2.0 / frequencyDomainData.length;
        // start with bottom left corner of viewport
        let x = -1.0;
        const y = -1.0;
        for (const value of frequencyDomainData) {
            const normalizedValue = value / 255.0;
            const height = 2.0 * normalizedValue;
            const position = [x, y];
            const size = [width, height];
            const interpolatedColor = GraphicsUtils.interpolateColor(this.bottomColor, this.topColor, normalizedValue);
            const rectangle = new Rectangle(position, size, this.bottomColor, interpolatedColor);
            rectangle.init(this.gl, this.shader);
            this.rectangles.push(rectangle);
            x += width;
        }
    }
}
