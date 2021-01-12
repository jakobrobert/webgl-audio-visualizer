class GraphicsUtils {
    static interpolateColor(startColor, endColor, alpha) {
        const result = [];
        result[0] = (1.0 - alpha) * startColor[0] + alpha * endColor[0];
        result[1] = (1.0 - alpha) * startColor[1] + alpha * endColor[1];
        result[2] = (1.0 - alpha) * startColor[2] + alpha * endColor[2];
        return result;
    }
}
