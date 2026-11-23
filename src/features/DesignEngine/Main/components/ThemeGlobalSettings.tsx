import React from 'react';
import { InputControl, MediaUploaderControl } from '../../components/DesignControls';
import { CollapsibleSection } from './CollapsibleSection';
import { DecisionTokenList, type ColumnTokenProps } from './DecisionTokenList';
import { PreferencesSchema } from '../../../../core/Design/schema/preferences';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakUIContextType } from '../../../../core/Provider/types';
import type { ComponentSchema } from '../../../../core/Design/types';

interface ThemeGlobalSettingsProps extends ColumnTokenProps {
    globalComponent: ComponentSchema | undefined;
    sarak: SarakUIContextType;
    /** Tokens que a decisão já mostra por pergunta; saem daqui para o controle não aparecer duas vezes. */
    omitTokenIds?: ReadonlySet<string>;
}

/** Identidade da empresa: grava direto na porta de marca do Provider, como sempre gravou. */
const BrandingFields: React.FC<{ sarak: SarakUIContextType }> = ({ sarak }) => {
    const text = useLibraryText();
    const update = (partial: Parameters<NonNullable<SarakUIContextType['updateBranding']>>[0]) => { void sarak.updateBranding?.(partial); };
    return (
        <CollapsibleSection title={text('globalSettingsBrandTitle')} toggleId="branding">
            <InputControl label={text('globalSettingsCompanyName')} type="text" value={sarak.branding?.companyName || ''} onChange={(val: string | number) => update({ companyName: String(val) })} />
            <InputControl label={text('globalSettingsLoginName')} type="text" value={sarak.branding?.loginName || ''} onChange={(val: string | number) => update({ loginName: String(val) })} />
            <InputControl label={text('globalSettingsTabName')} value={sarak.branding?.tabName || ''} onChange={(val: string | number) => update({ tabName: String(val) })} />
            <MediaUploaderControl label={text('globalSettingsLogo')} value={sarak.branding?.logoBase64 || null} onChange={(val: string | null) => update({ logoBase64: val })} />
        </CollapsibleSection>
    );
};

/** O bloco global da decisão Layout: preferências globais, barra de preferências do usuário e identidade da empresa. */
export const ThemeGlobalSettings: React.FC<ThemeGlobalSettingsProps> = ({ globalComponent, sarak, omitTokenIds, ...tokenProps }) => {
    const text = useLibraryText();
    const keep = (tokens: ComponentSchema['tokens']): ComponentSchema['tokens'] => tokens.filter((token) => !omitTokenIds?.has(token.id));
    const globalTokens = globalComponent ? keep(globalComponent.tokens) : [];
    const preferenceTokens = keep(PreferencesSchema.tokens);
    return (
    <div className="flex flex-col gap-5" data-testid="global-block">
        {globalComponent && (globalTokens.length > 0 || !omitTokenIds) && (
            <CollapsibleSection title={text('globalSettingsPreferences')} toggleId="global-preferences">
                <DecisionTokenList tokens={globalTokens} {...tokenProps} />
            </CollapsibleSection>
        )}
        {/* Barra de preferências do usuário (Spec 05 §2.2.1): para cada uma das preferências, a posição que o
            usuário final vê — não oferecida, no menu ⚙, ou fixa na barra. A prévia reflete a escolha porque
            renderiza o mesmo `SidebarNav`/`TopbarNav` do consumidor. */}
        {(preferenceTokens.length > 0 || !omitTokenIds) && (
            <CollapsibleSection title={text('globalSettingsUserBar')} toggleId="user-preferences">
                <DecisionTokenList tokens={preferenceTokens} {...tokenProps} />
            </CollapsibleSection>
        )}
        {sarak.branding && sarak.updateBranding && <BrandingFields sarak={sarak} />}
    </div>
    );
};
