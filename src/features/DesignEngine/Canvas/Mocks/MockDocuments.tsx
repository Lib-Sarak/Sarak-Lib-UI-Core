import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakIconButton } from '../../../../components/atomic/Buttons/SarakIconButton';
import { SarakInput } from '../../../../components/atomic/Inputs/SarakInput';

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
                    <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">Faça o upload e gerencie os artefatos do sistema.</p>
                </div>
                <div className="flex items-center gap-3">
                    <SarakInput 
                        type="text" 
                        placeholder="Buscar documentos..."
                        leftIcon={<SarakIcon name="Search" size={16} />}
                        style={{ minWidth: '250px' }}
                    />
                </div>
            </div>

            {/* Upload Area (Drag and Drop) */}
            <div 
                className={`sarak-card flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed transition-all duration-[var(--sarak-motion-dur-normal,0.3s)] relative overflow-hidden bg-[var(--theme-card)]`}
                style={{ 
                    borderRadius: 'var(--sarak-card-radius)',
                    borderColor: isDragging ? 'var(--theme-primary)' : 'var(--theme-border)'
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            >
                {isDragging && <div className="absolute inset-0 bg-[var(--theme-primary)]/5 pointer-events-none" />}
                <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-[var(--theme-primary)] text-theme-on-primary' : 'bg-[var(--theme-body)] text-[var(--theme-primary)]'}`}>
                    <SarakIcon name="UploadCloud" size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-[var(--theme-title)] font-bold text-lg">Arraste e solte seus arquivos aqui</h3>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">Ou clique para procurar (PDF, JPG, PNG, DOCX até 50MB)</p>
                </div>
                <SarakButton variant="primary" className="mt-2">
                    Selecionar Arquivos
                </SarakButton>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 @md:grid-cols-3 gap-6">
                
                {/* PDF Document Card */}
                <div className="sarak-card rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-4 flex flex-col gap-4 relative group" style={{ borderRadius: 'var(--sarak-card-radius)' }}>
                    <div className="absolute top-4 right-4 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <SarakIconButton variant="ghost" size="sm" icon={<SarakIcon name="Download" size={16} />} />
                        <SarakIconButton variant="ghost" size="sm" icon={<SarakIcon name="MoreVertical" size={16} />} />
                    </div>
                    
                    <div className="w-full h-32 bg-[var(--theme-body)] rounded-lg flex items-center justify-center border border-[var(--theme-border)]/50 relative overflow-hidden" style={{ borderRadius: 'var(--sarak-input-border-radius)' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--theme-card)]/50 pointer-events-none" />
                        <SarakIcon name="FileText" size={40} className="text-[var(--sarak-status-error-color,#ef4444)]/80" />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[var(--sarak-status-error-color,#ef4444)]/20 text-[var(--sarak-status-error-color,#ef4444)] text-[10px] font-bold rounded">PDF</div>
                    </div>
                    
                    <div>
                        <h4 className="text-[var(--theme-title)] font-bold text-sm truncate pr-12">Relatório_Financeiro_Q3.pdf</h4>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-[var(--text-secondary)]">Adicionado há 2 horas</span>
                            <span className="text-xs font-bold text-[var(--text-secondary)]">2.4 MB</span>
                        </div>
                    </div>
                </div>

                {/* Image Document Card */}
                <div className="sarak-card rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-4 flex flex-col gap-4 relative group" style={{ borderRadius: 'var(--sarak-card-radius)' }}>
                    <div className="absolute top-4 right-4 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <SarakIconButton variant="ghost" size="sm" icon={<SarakIcon name="Download" size={16} />} />
                        <SarakIconButton variant="ghost" size="sm" icon={<SarakIcon name="MoreVertical" size={16} />} />
                    </div>
                    
                    <div className="w-full h-32 bg-[var(--theme-body)] rounded-lg flex items-center justify-center border border-[var(--theme-border)]/50 relative overflow-hidden" style={{ borderRadius: 'var(--sarak-input-border-radius)' }}>
                        {/* Fake image preview with grid pattern */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, var(--color-theme-title,#f2f6fb) 25%, transparent 25%), linear-gradient(-45deg, var(--color-theme-title,#f2f6fb) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color-theme-title,#f2f6fb) 75%), linear-gradient(-45deg, transparent 75%, var(--color-theme-title,#f2f6fb) 75%)', backgroundSize: '10px 10px' }} />
                        <SarakIcon name="Image" size={40} className="text-[var(--sarak-status-success-color,#10b981)]/80 relative z-10" />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[var(--sarak-status-success-color,#10b981)]/20 text-[var(--sarak-status-success-color,#10b981)] text-[10px] font-bold rounded z-10">PNG</div>
                    </div>
                    
                    <div>
                        <h4 className="text-[var(--theme-title)] font-bold text-sm truncate pr-12">Diagrama_Arquitetura_v2.png</h4>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-[var(--text-secondary)]">Adicionado ontem</span>
                            <span className="text-xs font-bold text-[var(--text-secondary)]">4.1 MB</span>
                        </div>
                    </div>
                </div>

                {/* Uploading Status Card */}
                <div className="sarak-card rounded-2xl border border-[var(--theme-primary)]/50 bg-[var(--theme-primary)]/5 p-4 flex flex-col gap-4" style={{ borderRadius: 'var(--sarak-card-radius)' }}>
                    <div className="w-full h-32 bg-[var(--theme-body)] rounded-lg flex items-center justify-center border border-[var(--theme-border)]/50 relative overflow-hidden" style={{ borderRadius: 'var(--sarak-input-border-radius)' }}>
                        <SarakIcon name="File" size={40} className="text-[var(--theme-primary)]/50" />
                        
                        {/* Loading Overlay */}
                        <div className="absolute inset-0 bg-theme-body/40 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-1 bg-[var(--theme-border)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--theme-primary)] w-[65%] rounded-full animate-pulse" />
                            </div>
                            <span className="text-xs font-bold text-theme-text">Fazendo upload (65%)</span>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between">
                            <h4 className="text-[var(--theme-title)] font-bold text-sm truncate">Contrato_Servicos.docx</h4>
                            <SarakIconButton variant="danger" size="sm" icon={<SarakIcon name="X" size={14} />} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] uppercase font-bold text-[var(--theme-primary)] animate-pulse">Sincronizando...</span>
                            <span className="text-xs font-bold text-[var(--text-secondary)]">12.5 MB</span>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
