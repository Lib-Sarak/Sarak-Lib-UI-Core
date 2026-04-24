import React from 'react';
import { MessageSquare, Zap, User } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface ChatSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="chat-bubbles" icon={MessageSquare} title="Balões de Mensagem" activeSection={activeSection} onToggle={setActiveSection}>
                <SelectControl label="Estilo do Balão" options={[{id: 'modern', label: 'Moderno (Borda Suave)'}, {id: 'glass', label: 'Vidro (Transparente)'}, {id: 'minimal', label: 'Minimalista (Apenas Texto)'}, {id: 'neon', label: 'Neon (Glow)'}]} value={draft.chatBubbleStyle} onChange={(v: any) => updateDraft('chatBubbleStyle', v)} />
            </Section>

            <Section id="chat-dynamics" icon={Zap} title="Dinâmica do Chat" activeSection={activeSection} onToggle={setActiveSection}>
                <SliderControl label="Velocidade de Digitação" value={draft.chatAnimationSpeed || 0.4} min={0.1} max={1.5} step={0.1} onChange={(v: any) => updateDraft('chatAnimationSpeed', v)} suffix="s" />
            </Section>
        </>
    );
};

