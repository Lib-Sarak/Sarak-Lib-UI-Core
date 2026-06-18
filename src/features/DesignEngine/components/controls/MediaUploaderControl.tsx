import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { HelpTooltip } from './HelpTooltip';

export const MediaUploaderControl: React.FC<any> = ({ label, description, value, onChange }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { onMediaUpload } = useSarakUI();
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Se houver Injeção de Dependência via Context, delegamos o upload para o host
        if (onMediaUpload) {
            try {
                setIsUploading(true);
                const publicUrl = await onMediaUpload(file);
                onChange(publicUrl);
            } catch (error) {
                console.error('Falha no upload de mídia externo:', error);
                alert('Erro ao enviar o arquivo.');
            } finally {
                setIsUploading(false);
            }
            return;
        }

        // Fallback: Conversão em Base64 apenas para arquivos pequenos (Limite ~2MB de segurança)
        if (file.size > 2 * 1024 * 1024) {
            alert('Sem um Storage em nuvem configurado, o arquivo não pode exceder 2MB. Configure o onMediaUpload no SarakUIProvider.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            onChange(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    // Sanitiza o valor caso venha do formato antigo de texto CSS (ex: url("..."))
    const rawValue = typeof value === 'string' ? value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') : value;
    const isVideo = rawValue?.includes('video') || rawValue?.endsWith('.webm') || rawValue?.endsWith('.mp4');

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5">
                    {label}
                    <HelpTooltip label={label} description={description} />
                </span>
            </div>
            <div className="flex items-center gap-3">
                <div 
                    onClick={() => !isUploading && inputRef.current?.click()}
                    className={`w-12 h-12 rounded-lg border border-dashed border-[var(--theme-border)] hover:border-[var(--theme-primary)] flex items-center justify-center bg-[var(--theme-layer)] cursor-pointer transition-all hover:bg-[var(--theme-border)] overflow-hidden shrink-0 relative ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    {isUploading ? (
                        <Loader2 className="w-5 h-5 text-[var(--theme-primary)] animate-spin" />
                    ) : rawValue ? (
                        isVideo ? (
                            <video src={rawValue} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <img src={rawValue} alt="Preview" className="w-full h-full object-contain p-1" />
                        )
                    ) : (
                        <div className="text-[20px] font-light text-[var(--theme-muted)]">+</div>
                    )}
                </div>
                <div className="flex-1 flex items-center gap-2">
                    <button 
                        onClick={() => !isUploading && inputRef.current?.click()}
                        disabled={isUploading}
                        className={`text-[9px] font-bold uppercase tracking-wider px-3 py-2 bg-[var(--theme-layer)] hover:bg-[var(--theme-border)] rounded-md text-[var(--theme-text)] transition-all border border-[var(--theme-border)] shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUploading ? 'Enviando...' : 'Fazer Upload'}
                    </button>
                    {rawValue && !isUploading && (
                        <button 
                            onClick={() => onChange(null)}
                            className="text-[9px] font-bold uppercase tracking-wider px-3 py-2 hover:bg-amber-500/10 hover:text-amber-500 rounded-md text-[var(--theme-muted)] transition-all"
                        >
                            Remover
                        </button>
                    )}
                </div>
            </div>
            <input 
                type="file" 
                ref={inputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,video/webm,video/mp4" 
            />
        </div>
    );
};
