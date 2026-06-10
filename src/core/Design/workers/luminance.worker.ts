self.onmessage = function (e: MessageEvent) {
    const { imageData, width, height } = e.data;
    const data = new Uint8ClampedArray(imageData); // Convert to typed array for faster access
    let r = 0, g = 0, b = 0;
    
    for (let i = 0, l = data.length; i < l; i += 4) {
        r += data[i];
        g += data[i+1];
        b += data[i+2];
    }
    
    const pixelCount = data.length / 4;
    r = r / pixelCount;
    g = g / pixelCount;
    b = b / pixelCount;
    
    // Equação HSP (Highly Sensitive Perceived luminance)
    const hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );
    
    // 127.5 é o ponto de equilíbrio matemático entre claro e escuro
    const luminance = hsp > 127.5 ? 'light' : 'dark';
    
    self.postMessage({ luminance });
};
