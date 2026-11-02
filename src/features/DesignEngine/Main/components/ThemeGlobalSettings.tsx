import React from 'react';
import { InputControl, MediaUploaderControl } from '../../components/DesignControls';
import { DecisionTokenList, type ColumnTokenProps } from './DecisionTokenList';
import { PreferencesSchema } from '../../../../core/Design/schema/preferences';
import type { SarakUIContextType } from '../../../../core/Provider/types';
import type { ComponentSchema } from '../../../../core/Design/types';

interface ThemeGlobalSettingsProps extends ColumnTokenProps {
    globalComponent: ComponentSchema | undefined;
    sarak: SarakUIContextType;
    /** Tokens que a decisão já mostra por pergunta; saem daqui para o controle não aparecer duas vezes. */
    omitTokenIds?: ReadonlySet<string>;
}

const GroupTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="text-xs font-semibold text-[var(--theme-muted)]">{children}</h4>
);

/** Identidade da empresa: grava direto na porta de marca do Provider, como sempre gravou. */
const BrandingFields: React.FC<{ sarak: SarakUIContextType }> = ({ sarak }) => {
    const update = (partial: Parameters<NonNullable<SarakUIContextType['updateBranding']>>[0]) => { void sarak.updateBranding?.(partial); };
    return (
        <section aria-label="Identidade da Empresa" className="flex flex-col gap-3">
            <GroupTitle>Identidade da Empresa</GroupTitle>
            <InputControl label="Nome da Empresa (Topo/Sidebar)" type="text" value={sarak.branding?.companyName || ''} onChange={(val: string | number) => update({ companyName: String(val) })} />
            <InputControl label="Nome no Login" type="text" value={sarak.branding?.loginName || ''} onChange={(val: string | number) => update({ loginName: String(val) })} />
            <InputControl label="Aba do Navegador" value={sarak.branding?.tabName || ''} onChange={(val: string | number) => update({ tabName: String(val) })} />
            <MediaUploaderControl label="Logotipo (Mídia Híbrida)" value={sarak.branding?.logoBase64 || null} onChange={(val: string | null) => update({ logoBase64: val })} />
        </section>
    );
};

/** O bloco global da decisão Layout: preferências globais, barra de preferências do usuário e identidade da empresa. */
export const ThemeGlobalSettings: React.FC<ThemeGlobalSettingsProps> = ({ globalComponent, sarak, omitTokenIds, ...tokenProps }) => {
    const keep = (tokens: ComponentSchema['tokens']): ComponentSchema['tokens'] => tokens.filter((token) => !omitTokenIds?.has(token.id));
    const globalTokens = globalComponent ? keep(globalComponent.tokens) : [];
    const preferenceTokens = keep(PreferencesSchema.tokens);
    return (
    <div className="flex flex-col gap-5" data-testid="global-block">
        {globalComponent && (globalTokens.length > 0 || !omitTokenIds) && (
            <section aria-label="Preferências Globais" className="flex flex-col gap-3">
                <GroupTitle>Preferências Globais</GroupTitle>
                <DecisionTokenList tokens={globalTokens} {...tokenProps} />
            </section>
        )}
        {/* Barra de preferências do usuário (Spec 05 §2.2.1): para cada uma das preferências, a posição que o
            usuário final vê — não oferecida, no menu ⚙, ou fixa na barra. A prévia reflete a escolha porque
            renderiza o mesmo `SidebarNav`/`TopbarNav` do consumidor. */}
        {(preferenceTokens.length > 0 || !omitTokenIds) && (
            <section aria-label="Barra de Preferências do Usuário" className="flex flex-col gap-3">
                <GroupTitle>Barra de Preferências do Usuário</GroupTitle>
                <DecisionTokenList tokens={preferenceTokens} {...tokenProps} />
            </section>
        )}
        {sarak.branding && sarak.updateBranding && <BrandingFields sarak={sarak} />}
    </div>
    );
};
