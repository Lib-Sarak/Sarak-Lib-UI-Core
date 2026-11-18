import React from 'react';
import { SwitchControl } from '../../components/DesignControls';
import { PreferencesSchema } from '../../../../core/Design/schema/preferences';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakTokenValue } from '../../../../core/Design/types';

const TOKEN_ID = 'preferenceNavigationStylePosition';
type DraftWithPosition = { readonly [TOKEN_ID]?: unknown };

/** Onde a troca aparece quando o administrador a liga: o padrão do próprio token (o ⚙), não um valor escrito aqui. */
const DEFAULT_WHEN_ON = String(PreferencesSchema.tokens.find((token) => token.id === TOKEN_ID)?.defaultValue ?? 'menu');

interface NavigationSwitchControlProps {
    draft: DraftWithPosition;
    updateDraft: (id: string, value: SarakTokenValue) => void;
}

/**
 * "O usuário pode trocar entre lateral e topo": o interruptor da posição `off` do token `preferenceNavigationStylePosition`, junto
 * da orientação. Ligado mantém a posição de hoje (`menu` ou `pinned`, que a pergunta "O que aparece" escolhe); desligado tira a
 * escolha da barra e do ⚙, e a preferência que o usuário já gravou no navegador deixa de valer. Não cria token: grava o mesmo.
 */
export const NavigationSwitchControl: React.FC<NavigationSwitchControlProps> = ({ draft, updateDraft }) => {
    const text = useLibraryText();
    const current = draft[TOKEN_ID];
    return (
        <div data-testid="bar-switch" className="flex flex-col gap-1.5">
            <SwitchControl
                label={text('barSwitchLabel')}
                value={current !== 'off'}
                onChange={(on) => updateDraft(TOKEN_ID, on ? DEFAULT_WHEN_ON : 'off')}
            />
            <p className="text-[var(--sarak-type-scale-caption,12px)] text-[var(--theme-muted)]">{text('barSwitchHint')}</p>
        </div>
    );
};

export default NavigationSwitchControl;
