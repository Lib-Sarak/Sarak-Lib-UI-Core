import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { validateDesign } from '../validation';
import { getAllDesignTokens } from '../../../Design/master-map';
import { useDesignVariables } from '../../../Design/hooks/useDesignVariables';

/**
 * CORPUS CONGELADO de payloads de tema NO FORMATO DO CONSUMIDOR — plan-24 §2.6
 * peça 2, `master-map.test.ts` generalizado para a fronteira Provider (payload
 * → `validateDesign` → CSS Variable).
 *
 * A distinção que faz este teste conviver com a recriação dos 18 temas
 * (`plan-24-1`): a FIXTURE é um payload de CONSUMIDOR (pequeno, parcial, como
 * alguém escreveria à mão ou exportaria do painel) — nunca um dos 18 temas
 * shippados pela lib. Cor é conteúdo e pode mudar; a CHAVE que o consumidor
 * escreveu, e a variável CSS que ela produz, são CONTRATO. Se uma chave sair
 * do domínio (`MASTER_DESIGN_MAP`/`PAYLOAD_EXTRA_KEYS`), `validateDesign` a
 * descarta (R6) e a variável correspondente para de ser emitida — é
 * exatamente o que faltou detectar quando a `plan-21` encolheu
 * `ALLOWED_EXTRA_KEYS` de 122 para 95 em silêncio (achado 34).
 */

interface Fixture {
    nome: string;
    payload: Record<string, unknown>;
    /** tokenId de token do catálogo cujas CSS vars este payload precisa continuar emitindo. */
    tokensDeCatalogo: string[];
    /** chave de `PAYLOAD_EXTRA_KEYS` que precisa sobreviver a `validateDesign` (não emite CSS var). */
    chavesExtras?: string[];
}

const FIXTURES: Fixture[] = [
    {
        nome: 'cores-minimas',
        payload: { mode: 'dark', primaryColor: '#ff6600', textColorMaster: '#eeeeee', colorBgBody: '#101010' },
        tokensDeCatalogo: ['primaryColor', 'textColorMaster', 'colorBgBody'],
    },
    {
        nome: 'token-responsivo-mais-marca',
        payload: {
            mode: 'light',
            sidebarWidth: { mob: 0, tab: 220, desk: 280 },
            systemName: 'ACME Corp',
            logoUrl: 'https://acme.example/logo.png',
        },
        tokensDeCatalogo: ['sidebarWidth'],
        chavesExtras: ['systemName', 'logoUrl'],
    },
    {
        nome: 'botao-e-card',
        payload: { mode: 'dark', btnPrimaryBg: '#00c2ff', btnPrimaryText: '#001018', cardBackgroundColor: 'rgba(10,15,25,0.7)' },
        tokensDeCatalogo: ['btnPrimaryBg', 'btnPrimaryText', 'cardBackgroundColor'],
    },
];

/** As CSS vars que ESTE tokenId é responsável por emitir: o auto-var + os aliases declarados. */
const cssVarsDoToken = (tokenId: string): string[] => {
    const token = getAllDesignTokens().find((t) => t.id === tokenId);
    if (!token) throw new Error(`Fixture referencia token inexistente: "${tokenId}"`);
    const autoVar = `--sarak-${tokenId.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`)}`;
    return [autoVar, ...(token.cssVars ?? [])];
};

describe('Corpus congelado — payload de consumidor → CSS Variable (R6, achado 34)', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it.each(FIXTURES)('fixture "$nome": nenhuma chave do payload é descartada por validateDesign', ({ payload, tokensDeCatalogo, chavesExtras }) => {
        const validated = validateDesign(payload) as unknown as Record<string, unknown>;

        for (const tokenId of tokensDeCatalogo) {
            expect(validated, `token "${tokenId}" sumiu de validateDesign`).toHaveProperty(tokenId);
        }
        for (const chave of chavesExtras ?? []) {
            expect(validated, `chave extra "${chave}" sumiu de validateDesign`).toHaveProperty(chave);
        }

        // R6: chave conhecida não pode ser descartada com "chave desconhecida" nem
        // "valor fora do contrato" — se sumiu, o warn abaixo teria disparado.
        const avisos = warnSpy.mock.calls.map((call: unknown[]) => String(call[0]));
        expect(avisos.filter((a: string) => a.includes('descartad'))).toEqual([]);
    });

    it.each(FIXTURES)('fixture "$nome": as CSS Variables dos tokens do payload continuam sendo emitidas', ({ nome, payload, tokensDeCatalogo }) => {
        const validated = validateDesign(payload);
        const { result } = renderHook(() => useDesignVariables(validated as unknown as Record<string, unknown>));
        const { variables, responsiveCSS } = result.current;

        // Token responsivo (ex. `sidebarWidth: {mob,tab,desk}`) não injeta em
        // `variables` — a var só existe dentro do `responsiveCSS` (comentário
        // "CRÍTICO" em `useDesignVariables.ts`). Para esse caso, capturamos SE a
        // var aparece no CSS gerado, não um valor escalar.
        const capturado: Record<string, unknown> = {};
        for (const tokenId of tokensDeCatalogo) {
            for (const cssVar of cssVarsDoToken(tokenId)) {
                capturado[cssVar] = cssVar in variables ? variables[cssVar] : responsiveCSS.includes(`${cssVar}:`) ? 'emitida-no-responsiveCSS' : undefined;
            }
        }

        // Nenhuma das vars capturadas pode estar ausente — sumir é exatamente o
        // sintoma do achado 34 (chave saiu do domínio em silêncio).
        for (const cssVar of Object.keys(capturado)) {
            expect(capturado[cssVar], `"${cssVar}" (fixture "${nome}") não foi emitida`).not.toBeUndefined();
        }

        expect(capturado).toMatchSnapshot();
    });
});
