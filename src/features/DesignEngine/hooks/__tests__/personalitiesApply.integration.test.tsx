/**
 * As dez Personalidades aplicam pelo painel: o rascunho recebe os tokens de cada uma e o "Aplicar" fica habilitado
 * (`isDirty`). Pelo caminho real: o Provider, o rascunho (`useDesignDraft`) e a aplicação de preset parcial do painel.
 */
import React from 'react';
import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { PERSONALITIES } from '../../../../core/Design/presets/components/personalities';
import { getLoadedThemePreset } from '../../../../core/Design/presets/themes/registry';
import { useApplyPreset } from '../../Canvas/hooks/useDesignOperations';
import { personalityPatch } from '../../Main/utils/personalityDraft';
import { useDesignDraft } from '../useDesignDraft';
import type { SarakDesignState } from '../../../../core/Provider/types';

type Rec = Record<string, unknown>;
let snapshot: { draft: Rec; isDirty: boolean } = { draft: {}, isDirty: false };

const Harness = ({ personalityId }: { personalityId: string }): React.ReactElement => {
    const sarak = useSarakUI();
    const { draft, isDirty, updateDraft } = useDesignDraft(sarak);
    const apply = useApplyPreset((key, value) => updateDraft(key, value));
    snapshot = { draft: draft as unknown as Rec, isDirty };
    const personality = PERSONALITIES.find((entry) => entry.id === personalityId)!;
    return <button data-testid="apply-personality" onClick={() => apply(personalityPatch(personality) as Partial<SarakDesignState>, true)}>Aplicar</button>;
};

describe('as Personalidades aplicam pelo painel', () => {
    afterEach(() => { cleanup(); localStorage.clear(); });

    it.each(PERSONALITIES.map((personality) => personality.id))('%s: o rascunho recebe os tokens dela e o Aplicar habilita', async (personalityId) => {
        render(<SarakUIProvider initialTheme="sarak-sovereign"><Harness personalityId={personalityId} /></SarakUIProvider>);
        await waitFor(() => expect(getLoadedThemePreset('sarak-sovereign')).toBeDefined());
        await act(async () => { await Promise.resolve(); });
        fireEvent.click(screen.getByTestId('apply-personality'));
        const personality = PERSONALITIES.find((entry) => entry.id === personalityId)!;
        await waitFor(() => {
            Object.entries(personality.design).forEach(([tokenId, value]) => expect(snapshot.draft[tokenId], tokenId).toEqual(value));
        });
        expect(snapshot.isDirty).toBe(true);
    });
});
