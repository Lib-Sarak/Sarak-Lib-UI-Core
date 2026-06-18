import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Shield } from 'lucide-react';
import { CategoryLabel, Section, InputControl, MediaUploaderControl } from '../../components/DesignControls';
import { TokenControl } from './TokenControl';

interface ThemeGlobalSettingsProps {
    activePillarId: string | null;
    setActivePillarId: (id: string | null) => void;
    activeSectionId: string | null;
    setActiveSectionId: (id: string | null) => void;
    isDirty: boolean;
    onReset: () => void;
    onApply: () => void;
    globalComponent: any;
    catalogMap: Map<string, any>;
    draft: any;
    updateDraft: (id: string, val: any) => void;
    previewDevice: string;
    sarak: any;
}

export const ThemeGlobalSettings: React.FC<ThemeGlobalSettingsProps> = ({
    activePillarId,
    setActivePillarId,
    activeSectionId,
    setActiveSectionId,
    isDirty,
    onReset,
    onApply,
    globalComponent,
    catalogMap,
    draft,
    updateDraft,
    previewDevice,
    sarak
}) => {
    return (
        <div key="global-pillar" className="border-b border-[var(--theme-border)] last:border-0">
            <CategoryLabel
                icon={Globe}
                title="0. Configurações Globais (2)"
                index={0}
                isOpen={activePillarId === 'global'}
                onToggle={() => setActivePillarId(activePillarId === 'global' ? null : 'global')}
                isDirty={isDirty}
                onReset={onReset}
                onApply={onApply}
            />
            <AnimatePresence>
                {activePillarId === 'global' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden bg-[var(--theme-surface)]"
                    >
                        <div className="px-2 py-2 flex flex-col gap-1">
                            {/* Preferências Globais */}
                            {globalComponent && (
                                <Section
                                    id="global-preferences"
                                    icon={Globe}
                                    title={`Preferências Globais (${globalComponent.tokens.length})`}
                                    activeSection={activeSectionId}
                                    onToggle={setActiveSectionId}
                                >
                                    <div className="flex flex-col gap-4">
                                        {globalComponent.tokens.map((token: any) => {
                                            const meta = catalogMap.get(token.id);
                                            const enhancedToken = { ...token, label: meta?.name || token.label, description: meta?.description || token.description };
                                            return (
                                                <TokenControl key={enhancedToken.id} token={enhancedToken} value={draft[enhancedToken.id]} onChange={(val) => updateDraft(enhancedToken.id, val)} previewDevice={previewDevice} />
                                            );
                                        })}
                                    </div>
                                </Section>
                            )}

                            {/* Identidade da Empresa */}
                            {sarak.branding && sarak.updateBranding && (
                                <Section
                                    id="global-branding"
                                    icon={Shield}
                                    title="Identidade da Empresa (4)"
                                    activeSection={activeSectionId}
                                    onToggle={setActiveSectionId}
                                >
                                    <div className="flex flex-col gap-4">
                                        <InputControl
                                            label="Nome da Empresa (Topo/Sidebar)"
                                            type="text"
                                            value={sarak.branding.companyName || ''}
                                            onChange={(val: string) => sarak.updateBranding!({ companyName: val })}
                                        />
                                        <InputControl
                                            label="Nome no Login"
                                            type="text"
                                            value={sarak.branding.loginName || ''}
                                            onChange={(val: string) => sarak.updateBranding!({ loginName: val })}
                                        />
                                        <InputControl
                                            label="Aba do Navegador"
                                            value={sarak.branding.tabName || ''}
                                            onChange={(val: string) => sarak.updateBranding!({ tabName: val })}
                                        />
                                        <MediaUploaderControl
                                            label="Logotipo (Mídia Híbrida)"
                                            value={sarak.branding.logoBase64 || null}
                                            onChange={(val: string | null) => sarak.updateBranding!({ logoBase64: val })}
                                        />
                                    </div>
                                </Section>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
