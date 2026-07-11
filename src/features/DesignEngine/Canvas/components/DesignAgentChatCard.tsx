import React from 'react';
import { Send, Sparkles, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { SarakDesignState, DesignAgentComponentPreset } from '../../../../core/Provider/types';
import { SarakInput } from '../../../../components/atomic/Inputs';
import { SarakIconButton } from '../../../../components/atomic/Buttons';
import { useDesignAgentChat } from '../hooks/useDesignAgentChat';

interface DesignAgentChatCardProps {
    draftTokens: Partial<SarakDesignState>;
    onApplyFullTheme: (design: Partial<SarakDesignState>) => void;
    onAgentTheme?: (design: Partial<SarakDesignState>, label: string) => void;
    onAgentComponentPresets?: (presets: DesignAgentComponentPreset[], label: string) => void;
}

export const DesignAgentChatCard: React.FC<DesignAgentChatCardProps> = ({
    draftTokens,
    onApplyFullTheme,
    onAgentTheme,
    onAgentComponentPresets,
}) => {
    const { messages, inputValue, setInputValue, isLoading, isConfigured, sendMessage } = useDesignAgentChat({
        draftTokens,
        onApplyFullTheme,
        onAgentTheme,
        onAgentComponentPresets,
    });

    return (
        <div className="w-full h-full flex flex-col bg-[var(--theme-card)] border border-[var(--theme-border)] shadow-theme rounded-[var(--sarak-device-frame-radius,2rem)] overflow-hidden">

            {/* Header */}
            <div className="flex items-center px-4 py-3 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]/50 shrink-0">
                <div className="p-1.5 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] mr-3">
                    <Sparkles size={16} />
                </div>
                <h3 className="font-semibold text-sm text-[var(--theme-text-primary)]">Sarak Design Agent</h3>
                <div className="ml-auto flex gap-2 items-center">
                    <span className={`flex h-2 w-2 rounded-full ${isConfigured ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs text-[var(--theme-text-muted)]">{isConfigured ? 'Online' : 'Não configurado'}</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === 'user' ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]' :
                            msg.role === 'system' ? 'bg-red-500/10 text-red-500' : 'bg-black/20 text-[var(--theme-text-muted)] border border-[var(--theme-border)]'
                        }`}>
                            {msg.role === 'user' ? <User size={14} /> : msg.role === 'system' ? <AlertCircle size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${
                            msg.role === 'user' ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] rounded-tr-sm border border-[var(--theme-primary)]/20' :
                            msg.role === 'system' ? 'bg-red-500/5 text-red-400 border border-red-500/10' : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] rounded-tl-sm'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 max-w-[85%]">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-black/20 text-[var(--theme-text-muted)] border border-[var(--theme-border)] flex items-center justify-center">
                            <Bot size={14} />
                        </div>
                        <div className="p-3 rounded-2xl text-sm bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] rounded-tl-sm flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" /> Processando design...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-[var(--theme-border)] bg-[var(--theme-surface)]/30 shrink-0 flex items-center gap-2">
                <SarakInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                    placeholder="Ex: Crie um tema sombrio com bordas quadradas e tipografia serifada..."
                    disabled={isLoading}
                    fullWidth
                />
                <SarakIconButton
                    icon={<Send size={14} />}
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    disabled={!inputValue.trim() || isLoading}
                    onClick={() => sendMessage(inputValue)}
                    aria-label="Enviar mensagem ao Design Agent"
                />
            </div>
        </div>
    );
};
