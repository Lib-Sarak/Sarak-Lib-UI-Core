import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';

export const MockDocuments: React.FC<{ tokens: any, config: any, animationVariants: any, animationStyle: string }> = ({ tokens, animationVariants }) => {
    const [isDragging, setIsDragging] = useState(false);
    
    return (
        <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col gap-6 p-4 overflow-y-auto custom-scrollbar"
        >
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-[var(--theme-title)] flex items-center gap-2">
                        <SarakIcon name="FileText" className="text-[var(--theme-primary)]" size={28} />
                        Repositório de Documentos
                    </h2>
                    <p className="text-sm text-[var(--theme-text-sec)] mt-1 font-medium">Faça o upload e gerencie os artefatos do sistema.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <SarakIcon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-sec)]" />
                        <input 
                            type="text" 
                            placeholder="Buscar documentos..."
                            className="bg-[var(--theme-body)] border border-[var(--theme-border)] text-[var(--theme-title)] text-sm px-10 py-2 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] transition-all"
                            style={{ borderRadius: 'var(--sarak-radius-sm, 8px)' }}
                        />
                    </div>
                </div>
            </div>

            {/* Upload Area (Drag and Drop) */}
            <div 
                className={`sarak-card flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed transition-all duration-300 relative overflow-hidden bg-[var(--theme-card)]`}
                style={{ 
                    borderRadius: 'var(--sarak-radius)',
                    borderColor: isDragging ? 'var(--theme-primary)' : 'var(--theme-border)'
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            >
                {isDragging && <div className="absolute inset-0 bg-[var(--theme-primary)]/5 pointer-events-none" />}
                <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-[var(--theme-primary)] text-white' : 'bg-[var(--theme-body)] text-[var(--theme-primary)]'}`}>
                    <SarakIcon name="UploadCloud" size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-[var(--theme-title)] font-bold text-lg">Arraste e solte seus arquivos aqui</h3>
                    <p className="text-[var(--theme-text-sec)] text-sm mt-1">Ou clique para procurar (PDF, JPG, PNG, DOCX até 50MB)</p>
                </div>
                <button 
                    className="mt-2 bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary)]/90 py-2.5 px-6 shadow-lg transition-all font-bold text-sm uppercase tracking-wide"
                    style={{ borderRadius: 'var(--sarak-radius-btn, var(--sarak-radius))' }}
                >
                    Selecionar Arquivos
                </button>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 @md:grid-cols-3 gap-6">
                
                {/* PDF Document Card */}
                <div className="sarak-card rounded-2xl border border-[var(--theme-border)] shadow-xl bg-[var(--theme-card)] backdrop-blur-md p-4 flex flex-col gap-4 relative group" style={{ borderRadius: 'var(--sarak-radius)' }}>
                    <div className="absolute top-4 right-4 text-[var(--theme-text-sec)] opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="hover:text-[var(--theme-primary)] transition-colors"><SarakIcon name="Download" size={16} /></button>
                        <button className="hover:text-[var(--theme-title)] transition-colors"><SarakIcon name="MoreVertical" size={16} /></button>
                    </div>
                    
                    <div className="w-full h-32 bg-[var(--theme-body)] rounded-lg flex items-center justify-center border border-[var(--theme-border)]/50 relative overflow-hidden" style={{ borderRadius: 'var(--sarak-radius-sm)' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--theme-card)]/50 pointer-events-none" />
                        <SarakIcon name="FileText" size={40} className="text-rose-500/80" />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-rose-500/20 text-rose-500 text-[10px] font-bold rounded">PDF</div>
                    </div>
                    
                    <div>
                        <h4 className="text-[var(--theme-title)] font-bold text-sm truncate pr-12">Relatório_Financeiro_Q3.pdf</h4>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-[var(--theme-text-sec)]">Adicionado há 2 horas</span>
                            <span className="text-xs font-bold text-[var(--theme-text-sec)]">2.4 MB</span>
                        </div>
                    </div>
                </div>

                {/* Image Document Card */}
                <div className="sarak-card rounded-2xl border border-[var(--theme-border)] shadow-xl bg-[var(--theme-card)] backdrop-blur-md p-4 flex flex-col gap-4 relative group" style={{ borderRadius: 'var(--sarak-radius)' }}>
                    <div className="absolute top-4 right-4 text-[var(--theme-text-sec)] opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="hover:text-[var(--theme-primary)] transition-colors"><SarakIcon name="Download" size={16} /></button>
                        <button className="hover:text-[var(--theme-title)] transition-colors"><SarakIcon name="MoreVertical" size={16} /></button>
                    </div>
                    
                    <div className="w-full h-32 bg-[var(--theme-body)] rounded-lg flex items-center justify-center border border-[var(--theme-border)]/50 relative overflow-hidden" style={{ borderRadius: 'var(--sarak-radius-sm)' }}>
                        {/* Fake image preview with grid pattern */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)', backgroundSize: '10px 10px' }} />
                        <SarakIcon name="Image" size={40} className="text-emerald-500/80 relative z-10" />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded z-10">PNG</div>
                    </div>
                    
                    <div>
                        <h4 className="text-[var(--theme-title)] font-bold text-sm truncate pr-12">Diagrama_Arquitetura_v2.png</h4>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-[var(--theme-text-sec)]">Adicionado ontem</span>
                            <span className="text-xs font-bold text-[var(--theme-text-sec)]">4.1 MB</span>
                        </div>
                    </div>
                </div>

                {/* Uploading Status Card */}
                <div className="sarak-card rounded-2xl border border-[var(--theme-primary)]/50 shadow-xl bg-[var(--theme-primary)]/5 backdrop-blur-md p-4 flex flex-col gap-4" style={{ borderRadius: 'var(--sarak-radius)' }}>
                    <div className="w-full h-32 bg-[var(--theme-body)] rounded-lg flex items-center justify-center border border-[var(--theme-border)]/50 relative overflow-hidden" style={{ borderRadius: 'var(--sarak-radius-sm)' }}>
                        <SarakIcon name="File" size={40} className="text-[var(--theme-primary)]/50" />
                        
                        {/* Loading Overlay */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-1 bg-[var(--theme-border)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--theme-primary)] w-[65%] rounded-full animate-pulse" />
                            </div>
                            <span className="text-xs font-bold text-white">Fazendo upload (65%)</span>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between">
                            <h4 className="text-[var(--theme-title)] font-bold text-sm truncate">Contrato_Servicos.docx</h4>
                            <button className="text-[var(--theme-text-sec)] hover:text-rose-500 transition-colors"><SarakIcon name="X" size={14} /></button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] uppercase font-bold text-[var(--theme-primary)] animate-pulse">Sincronizando...</span>
                            <span className="text-xs font-bold text-[var(--theme-text-sec)]">12.5 MB</span>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
