import { useState, useEffect } from 'react';

// Fallback nativo
const calculateLuminanceSync = (data: Uint8ClampedArray) => {
    let r = 0, g = 0, b = 0;
    const l = data.length;
    for (let i = 0; i < l; i += 4) {
        r += data[i];
        g += data[i+1];
        b += data[i+2];
    }
    const pixelCount = l / 4;
    r = r / pixelCount;
    g = g / pixelCount;
    b = b / pixelCount;
    
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5 ? 'light' : 'dark';
};

export const useMediaLuminance = (url: string | undefined, isVideo: boolean) => {
    const [luminance, setLuminance] = useState<'light' | 'dark' | 'unknown'>('unknown');

    useEffect(() => {
        if (!url || isVideo) {
            setLuminance('unknown');
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous'; // CORS fix for CDNs
        
        // Timeout cleanup
        let timeoutId: any = null;
        let worker: Worker | null = null;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) return;
                
                canvas.width = 50;
                canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);
                
                const imageData = ctx.getImageData(0, 0, 50, 50);
                
                // Try using Web Worker first
                if (window.Worker) {
                    try {
                        // Tentar criar o worker usando URL
                        worker = new Worker(new URL('../workers/luminance.worker.ts', import.meta.url), { type: 'module' });
                        
                        // Fallback em caso de timeout
                        timeoutId = setTimeout(() => {
                            if (worker) {
                                worker.terminate();
                                worker = null;
                            }
                            setLuminance(calculateLuminanceSync(imageData.data));
                        }, 500); // 500ms max

                        worker.onmessage = (e) => {
                            clearTimeout(timeoutId);
                            setLuminance(e.data.luminance);
                            worker?.terminate();
                        };

                        worker.onerror = () => {
                            clearTimeout(timeoutId);
                            worker?.terminate();
                            setLuminance(calculateLuminanceSync(imageData.data));
                        };

                        // Enviar buffer
                        // Usamos array.buffer para ser transferível
                        worker.postMessage({ 
                            imageData: imageData.data.buffer, 
                            width: 50, 
                            height: 50 
                        }, [imageData.data.buffer]);

                    } catch (workerErr) {
                        setLuminance(calculateLuminanceSync(imageData.data));
                    }
                } else {
                    // Sync fallback for environments without Worker
                    setLuminance(calculateLuminanceSync(imageData.data));
                }
            } catch (e) {
                // CORS block fallback
                setLuminance('unknown');
            }
        };

        img.onerror = () => {
            setLuminance('unknown');
        };

        img.src = url;

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (worker) worker.terminate();
            img.onload = null;
            img.onerror = null;
        };
    }, [url, isVideo]);

    return luminance;
};
