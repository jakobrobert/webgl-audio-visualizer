class SpectrumVisualization2D {
    constructor(position, bottomColor, topColor, camera) {
        this.position = position;
        this.bottomColor = bottomColor;
        this.topColor = topColor;
        this.camera = camera;

        this.rectangles = [];

        this.camera.setPosition([2.0, 2.0, 3.0]);
        this.camera.setYaw(30.0);
        this.camera.setPitch(-30.0);
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

    draw() {
        for (const rectangle of this.rectangles) {
            rectangle.draw(this.camera.getViewProjectionMatrix());
        }
    }

    update(frequencyDomainData) {
        this.destroy();

        // width of each rectangle
        // one rectangle for each frequency bin
        // in normalized coords, whole viewport has a size of 2 x 2
        const width = 2.0 / frequencyDomainData.length;

        let x = this.position[0];
        const y = this.position[1];

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
