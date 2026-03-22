import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Type } from 'lucide-react';

const VideoPlayer = ({ videoId, segments, sourceLanguage, targetLanguage }) => {
    const playerRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeSegment, setActiveSegment] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current && isPlaying) {
                const time = playerRef.current.getCurrentTime();
                setCurrentTime(time);

                const currentSegment = segments.find(
                    s => time >= s.start && time <= s.start + s.duration
                );
                setActiveSegment(currentSegment);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [segments, isPlaying]);

    const onReady = (event) => {
        playerRef.current = event.target;
    };

    const togglePlay = () => {
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    const seekTo = (seconds) => {
        playerRef.current.seekTo(seconds);
        playerRef.current.playVideo();
        setIsPlaying(true);
    };

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
        },
    };

    return (
        <div className="space-y-6">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-theme-border/50 bg-black shadow-2xl">
                <YouTube
                    videoId={videoId}
                    opts={opts}
                    onReady={onReady}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full"
                />

                {/* Subtitles Overlay */}
                <AnimatePresence>
                    {activeSegment && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-12 left-0 right-0 p-4 text-center pointer-events-none"
                        >
                            <div className="inline-block px-6 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 shadow-xl">
                                <p className="text-white text-lg font-medium mb-1">{activeSegment.translated}</p>
                                <p className="text-white/60 text-sm italic">{activeSegment.original}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transcription / Segments List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-theme-title flex items-center gap-2">
                            <Type className="w-5 h-5 text-theme-primary" />
                            Transcrição e Tradução
                        </h3>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-theme-primary/10 border border-theme-primary/20 text-[10px] font-bold uppercase text-theme-primary">
                                {sourceLanguage}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-theme-primary/10 border border-theme-primary/20 text-[10px] font-bold uppercase text-theme-primary">
                                {targetLanguage}
                            </span>
                        </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {segments.map((segment, idx) => (
                            <motion.div
                                key={idx}
                                onClick={() => seekTo(segment.start)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${activeSegment === segment
                                        ? 'bg-theme-primary/10 border-theme-primary/30 shadow-sm shadow-theme-primary/10'
                                        : 'bg-theme-card/30 border-theme-border/50 hover:bg-theme-card hover:border-theme-primary/20'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <span className="text-[10px] font-mono font-bold text-theme-primary opacity-60 pt-1">
                                        {Math.floor(segment.start / 60)}:{(segment.start % 60).toFixed(0).padStart(2, '0')}
                                    </span>
                                    <div className="flex-1 space-y-1">
                                        <p className={`text-sm font-semibold ${activeSegment === segment ? 'text-theme-title' : 'text-theme-title/80'}`}>
                                            {segment.translated}
                                        </p>
                                        <p className="text-xs text-theme-muted italic">
                                            {segment.original}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Info Column */}
                <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-theme-card/50 border border-theme-border/50 backdrop-blur-sm">
                        <h4 className="text-sm font-black uppercase tracking-widest text-theme-title mb-4">Como estudar</h4>
                        <ul className="space-y-3 text-xs text-theme-muted">
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-theme-primary/20 flex items-center justify-center text-[10px] font-bold text-theme-primary shrink-0">1</span>
                                Assista ao vídeo e tente identificar os termos destacados.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-theme-primary/20 flex items-center justify-center text-[10px] font-bold text-theme-primary shrink-0">2</span>
                                Clique em qualquer legenda para repetir a frase específica.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-theme-primary/20 flex items-center justify-center text-[10px] font-bold text-theme-primary shrink-0">3</span>
                                Use o módulo de Prática para memorizar o vocabulário.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
