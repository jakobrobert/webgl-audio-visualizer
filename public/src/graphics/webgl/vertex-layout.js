class VertexLayout {
    constructor(gl) {
        this.gl = gl;
        this.attributes = [];
        this.vertexSizeInBytes = 0;
    }

    addAttribute(location, componentCount) {
        const attribute = {
            location: location,
            componentCount: componentCount,
            offsetInBytes: this.vertexSizeInBytes
        };
        this.attributes.push(attribute);
        this.vertexSizeInBytes += componentCount * Float32Array.BYTES_PER_ELEMENT;
    }

    enableAttributes() {
        for (const attribute of this.attributes) {
            this.gl.enableVertexAttribArray(attribute.location);
            this.gl.vertexAttribPointer(attribute.location, attribute.componentCount, this.gl.FLOAT, false,
                this.vertexSizeInBytes, attribute.offsetInBytes);
        }
    }

    disableAttributes() {
        for (const attribute of this.attributes) {
            this.gl.disableVertexAttribArray(attribute.location);
        }
    }
}
