import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Shield } from 'lucide-react';
import { CategoryLabel, Section, InputControl, MediaUploaderControl } from '../../components/DesignControls';
import { TokenControl } from './TokenControl';
import type { SarakDesignState, SarakUIContextType } from '../../../../core/Provider/types';
import type { ComponentSchema, DesignToken, SarakTokenValue } from '../../../../core/Design/types';

interface ThemeGlobalSettingsProps {
    activePillarId: string | null;
    setActivePillarId: (id: string | null) => void;
    activeSectionId: string | null;
    setActiveSectionId: (id: string | null) => void;
    isDirty: boolean;
    onReset: () => void;
    onApply: () => void;
    globalComponent: ComponentSchema | undefined;
    catalogMap: Map<string, { name?: string; description?: string }>;
    draft: SarakDesignState;
    updateDraft: (id: string, val: SarakTokenValue) => void;
    previewDevice: string;
    sarak: SarakUIContextType;
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
                                        {globalComponent.tokens.map((token: DesignToken) => {
                                            const meta = catalogMap.get(token.id);
                                            const enhancedToken = { ...token, label: meta?.name || token.label, description: meta?.description || token.description };
                                            return (
                                                <TokenControl key={enhancedToken.id} token={enhancedToken as DesignToken} value={(draft as Record<string, SarakTokenValue>)[enhancedToken.id]} onChange={(val) => updateDraft(enhancedToken.id, val)} previewDevice={previewDevice} />
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
                                            value={sarak.branding?.companyName || ''}
                                            onChange={(val: string | number) => { if (sarak.updateBranding) sarak.updateBranding({ companyName: String(val) }); }}
                                        />
                                        <InputControl
                                            label="Nome no Login"
                                            type="text"
                                            value={sarak.branding?.loginName || ''}
                                            onChange={(val: string | number) => { if (sarak.updateBranding) sarak.updateBranding({ loginName: String(val) }); }}
                                        />
                                        <InputControl
                                            label="Aba do Navegador"
                                            value={sarak.branding?.tabName || ''}
                                            onChange={(val: string | number) => { if (sarak.updateBranding) sarak.updateBranding({ tabName: String(val) }); }}
                                        />
                                        <MediaUploaderControl
                                            label="Logotipo (Mídia Híbrida)"
                                            value={sarak.branding?.logoBase64 || null}
                                            onChange={(val: string | null) => { if (sarak.updateBranding) sarak.updateBranding({ logoBase64: val }); }}
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
