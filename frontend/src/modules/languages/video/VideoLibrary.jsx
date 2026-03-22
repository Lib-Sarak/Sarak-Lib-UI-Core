import React from 'react';
import { motion } from 'framer-motion';
import { Play, Trash2, Calendar, Globe } from 'lucide-react';

const VideoLibrary = ({ videos = [], onSelect, onDelete }) => {
    if (!Array.isArray(videos) || videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 rounded-3xl bg-theme-card/30 border border-dashed border-theme-border/50">
                <Globe className="w-12 h-12 text-theme-muted mb-4 opacity-20" />
                <p className="text-theme-muted text-sm font-medium">Nenhum vídeo traduzido ainda.</p>
                <p className="text-[10px] text-theme-muted uppercase tracking-widest mt-1">Traduza seu primeiro vídeo para vê-lo aqui.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {videos.map((video, idx) => (
                <motion.div
                    key={video.translation_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group relative flex flex-col p-3 rounded-2xl bg-theme-card/40 border border-theme-border/50 hover:bg-theme-card hover:border-theme-primary/30 transition-all hover:shadow-xl hover:shadow-theme-primary/5 shadow-md shadow-black/10"
                >
                    {/* Thumbnail Mock / Video Header */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-2 bg-black/40 border border-white/5">
                        <img
                            src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <button
                                onClick={() => onSelect(video)}
                                className="w-12 h-12 rounded-full bg-theme-primary text-white flex items-center justify-center shadow-xl shadow-theme-primary/40 transform scale-90 group-hover:scale-100 transition-transform"
                            >
                                <Play className="w-6 h-6 fill-current" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <h4 className="text-xs font-bold text-theme-title line-clamp-2 min-h-[30px]">
                            {video.title}
                        </h4>

                        <div className="flex items-center justify-between text-[10px] text-theme-muted uppercase font-black tracking-widest">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-theme-primary/10 border border-theme-primary/20 text-theme-primary">
                                    {video.source_language}
                                </span>
                                <span>→</span>
                                <span className="px-2 py-0.5 rounded-md bg-theme-primary/10 border border-theme-primary/20 text-theme-primary">
                                    {video.target_language}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-60">
                                <Calendar className="w-3 h-3" />
                                {new Date(video.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Actions Overlay */}
                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={() => onSelect(video)}
                            className="flex-1 px-4 py-1.5 rounded-xl bg-theme-primary/10 border border-theme-primary/20 text-theme-primary text-[10px] font-black uppercase tracking-widest hover:bg-theme-primary hover:text-white transition-all shadow-sm"
                        >
                            Assistir
                        </button>
                        <button
                            onClick={() => onDelete(video)}
                            className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default VideoLibrary;
