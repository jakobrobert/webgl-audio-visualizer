class SpectrumVisualization2D {
    static GREEN = [0.0, 1.0, 0.0];
    static RED = [1.0, 0.0, 0.0];

    constructor() {
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
            const topColor = interpolateColor(SpectrumVisualization2D.GREEN, SpectrumVisualization2D.RED, normalizedValue);
            const rectangle = new Rectangle([x, y], [width, height], SpectrumVisualization2D.GREEN, topColor);
            rectangle.init(this.gl, this.shader);
            this.rectangles.push(rectangle);
            x += width;
        }
    }

    interpolateColor(startColor, endColor, alpha) {
        const result = [];
        result[0] = (1.0 - alpha) * startColor[0] + alpha * endColor[0];
        result[1] = (1.0 - alpha) * startColor[1] + alpha * endColor[1];
        result[2] = (1.0 - alpha) * startColor[2] + alpha * endColor[2];
        return result;
    }
}
