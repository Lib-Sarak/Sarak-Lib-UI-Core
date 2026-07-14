import { useState, useEffect } from 'react';

/**
 * Worker de luminância INLINE (Blob) — Spec arquitetura 02 (processamento híbrido).
 * O padrão `new Worker(new URL('./arquivo.ts', import.meta.url))` é resolvido
 * ESTATICAMENTE pelo bundler do CONSUMIDOR (Vite/rolldown tenta empacotar o arquivo,
 * que não existe no `dist/` publicado) e quebrava o `vite build` de quem importa a
 * lib. O Blob URL não tem arquivo para resolver: funciona em qualquer bundler e o
 * cálculo continua fora da UI thread. Se o ambiente bloquear Blob workers (CSP), o
 * try/catch abaixo cai no fallback síncrono.
 */
const LUMINANCE_WORKER_SOURCE = `
self.onmessage = function (e) {
    var data = new Uint8ClampedArray(e.data.imageData);
    var r = 0, g = 0, b = 0;
    for (var i = 0, l = data.length; i < l; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }
    var pixelCount = data.length / 4;
    r = r / pixelCount;
    g = g / pixelCount;
    b = b / pixelCount;
    var hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    self.postMessage({ luminance: hsp > 127.5 ? 'light' : 'dark' });
};
`;

const createLuminanceWorker = (): Worker => {
    const blob = new Blob([LUMINANCE_WORKER_SOURCE], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    try {
        return new Worker(blobUrl);
    } finally {
        // O worker já foi instanciado a partir do Blob; a URL pode ser liberada.
        URL.revokeObjectURL(blobUrl);
    }
};

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
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
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
                        // Worker inline via Blob (ver LUMINANCE_WORKER_SOURCE acima).
                        worker = createLuminanceWorker();
                        
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
