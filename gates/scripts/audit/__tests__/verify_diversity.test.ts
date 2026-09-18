// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
    hueFamily,
    bucket3,
    hueDistance,
    measureTheme,
    aggregate,
    evaluateDistanceCriteria,
    type ThemeDiversityRow,
} from '../verify_diversity.ts';
import { GLOBAL_THEMES, type ThemePreset } from '../../../../src/core/Design/presets/themes/index.ts';

describe('hueFamily', () => {
    it('classifica ciano', () => expect(hueFamily(183, 100)).toBe('ciano'));
    it('classifica verde', () => expect(hueFamily(135, 100)).toBe('verde'));
    it('classifica magenta', () => expect(hueFamily(300, 100)).toBe('magenta'));
    it('classifica vermelho cruzando o zero (H=350)', () => expect(hueFamily(350, 100)).toBe('vermelho'));
    it('classifica vermelho perto do zero (H=5)', () => expect(hueFamily(5, 100)).toBe('vermelho'));

    it('vira "neutro" abaixo do limiar de saturação mesmo com matiz cromático', () => {
        // O caso real: neumorphic-mobile, H=201 (seria "azul"), S=11 — a lib
        // classifica como neutro porque a cor está quase acromática.
        expect(hueFamily(201, 11)).toBe('neutro');
    });

    it('não confunde saturação alta com neutro', () => {
        expect(hueFamily(221, 39)).toBe('azul');
    });

    it('devolve "indeterminado" quando a cor não resolve (hsl()/var())', () => {
        expect(hueFamily(null, null)).toBe('indeterminado');
    });
});

describe('bucket3', () => {
    it('divide [0,120] em terços — baixo/médio/alto', () => {
        expect(bucket3(0, 0, 120)).toBe('baixo');
        expect(bucket3(39, 0, 120)).toBe('baixo');
        expect(bucket3(40, 0, 120)).toBe('médio');
        expect(bucket3(79, 0, 120)).toBe('médio');
        expect(bucket3(80, 0, 120)).toBe('alto');
        expect(bucket3(120, 0, 120)).toBe('alto');
    });

    it('devolve null para valor null', () => {
        expect(bucket3(null, 0, 120)).toBeNull();
    });
});

describe('hueDistance', () => {
    it('mede a distância circular curta, não a linear', () => {
        expect(hueDistance(350, 10)).toBeCloseTo(20, 5);
    });

    it('é simétrica', () => {
        expect(hueDistance(10, 350)).toBeCloseTo(hueDistance(350, 10), 10);
    });

    it('devolve 0 para o mesmo matiz', () => {
        expect(hueDistance(180, 180)).toBe(0);
    });
});

describe('measureTheme', () => {
    it('mede um tema sintético mesclado com os defaults', () => {
        const tema = {
            id: 'sarak-sovereign',
            name: 'x',
            description: 'x',
            design: {
                mode: 'light',
                navigationStyle: 'topbar',
                primaryColor: '#ff0000',
                colorBgBody: '#808080',
                cardBorderRadius: 16,
                cardBorderWidth: 2,
                cardBackdropBlur: 8,
                layoutDensity: 'compact',
            },
        } as unknown as ThemePreset;

        const row = measureTheme(tema);
        expect(row.mode).toBe('light');
        expect(row.navigationStyle).toBe('topbar');
        expect(row.hue).toBe(0);
        expect(row.saturation).toBe(100);
        expect(row.familia).toBe('vermelho');
        expect(row.fundoL).toBe(50);
        expect(row.cardBorderRadius).toBe(16);
        expect(row.cardBorderWidth).toBe(2);
        expect(row.cardBackdropBlur).toBe(8);
        expect(row.layoutDensity).toBe('compact');
    });

    it('lê raio responsivo (objeto mob/tab/desk) pelo valor de desk', () => {
        const tema = {
            id: 'sarak-sovereign',
            name: 'x',
            description: 'x',
            design: { cardBorderRadius: { mob: 8, tab: 12, desk: 20 } },
        } as unknown as ThemePreset;
        expect(measureTheme(tema).cardBorderRadius).toBe(20);
    });
});

// Fixture sintética, reutilizada por `aggregate` e por `evaluateDistanceCriteria`
// abaixo — não depende do catálogo shippado, então o teste não fica frágil a
// cada tema que entra ou sai de `GLOBAL_THEMES`.
function linha(parcial: Partial<ThemeDiversityRow>): ThemeDiversityRow {
    return {
        id: 'x',
        mode: 'dark',
        navigationStyle: 'sidebar',
        hue: 180,
        saturation: 50,
        familia: 'ciano',
        fundoL: 5,
        cardBorderRadius: 8,
        cardBorderWidth: 1,
        cardBackdropBlur: 8,
        layoutDensity: 'comfortable',
        ...parcial,
    };
}

describe('aggregate', () => {
    const rowsSinteticas: ThemeDiversityRow[] = [
        linha({ id: 'a', mode: 'dark', familia: 'ciano', hue: 183, saturation: 100, fundoL: 5 }),
        linha({ id: 'b', mode: 'dark', familia: 'magenta', hue: 300, saturation: 100, fundoL: 5 }),
        linha({ id: 'c', mode: 'light', familia: 'laranja', hue: 30, saturation: 70, fundoL: 50 }),
    ];

    it('conta modo escuro, saturação 100, família ciano/magenta, claro-saturado e fundo médio', () => {
        const a = aggregate(rowsSinteticas);
        expect(a.total).toBe(3);
        expect(a.modeDark).toBe(2);
        expect(a.saturacao100).toBe(2);
        expect(a.cianoOuMagenta).toBe(2);
        expect(a.claroSaturado).toBe(1);
        expect(a.fundoMedio).toBe(1);
    });

    it('classifica neumorphic-mobile (real, GLOBAL_THEMES) como "neutro" — H cromático com S abaixo do limiar', () => {
        const tema = GLOBAL_THEMES.find((t) => t.id === 'neumorphic-mobile')!;
        const row = measureTheme(tema);
        expect(row.familia).toBe('neutro');
    });
});

describe('evaluateDistanceCriteria', () => {
    const existentesSinteticos: ThemeDiversityRow[] = [
        linha({ id: 'atual-ciano-dark', mode: 'dark', familia: 'ciano', hue: 183, saturation: 100 }),
        linha({ id: 'atual-magenta-dark', mode: 'dark', familia: 'magenta', hue: 300, saturation: 100 }),
    ];

    it('critério 1 falha com menos de 2 claros', () => {
        const novos = [linha({ id: 'a', mode: 'light', saturation: 70, familia: 'laranja', hue: 30 })];
        const r = evaluateDistanceCriteria(existentesSinteticos, novos).find((c) => c.criterio === 1);
        expect(r?.ok).toBe(false);
    });

    it('critério 1 passa com 2 claros e ao menos 1 com S≥60', () => {
        const novos = [
            linha({ id: 'a', mode: 'light', saturation: 70, familia: 'laranja', hue: 30 }),
            linha({ id: 'b', mode: 'light', saturation: 30, familia: 'verde', hue: 100 }),
        ];
        const r = evaluateDistanceCriteria(existentesSinteticos, novos).find((c) => c.criterio === 1);
        expect(r?.ok).toBe(true);
    });

    it('critério 2 exige ao menos 1 fundo de luminosidade média', () => {
        const semMedio = [linha({ id: 'a', fundoL: 5 })];
        const comMedio = [linha({ id: 'a', fundoL: 50 })];
        expect(evaluateDistanceCriteria(existentesSinteticos, semMedio).find((c) => c.criterio === 2)?.ok).toBe(false);
        expect(evaluateDistanceCriteria(existentesSinteticos, comMedio).find((c) => c.criterio === 2)?.ok).toBe(true);
    });

    it('critério 4 reprova quando mais de 1 tema tem S≥90', () => {
        const novos = [
            linha({ id: 'a', saturation: 95, familia: 'laranja', hue: 30 }),
            linha({ id: 'b', saturation: 95, familia: 'verde', hue: 100 }),
        ];
        const r = evaluateDistanceCriteria(existentesSinteticos, novos).find((c) => c.criterio === 4);
        expect(r?.ok).toBe(false);
    });

    it('critério 5 reprova qualquer novo em ciano ou magenta', () => {
        const novos = [linha({ id: 'a', familia: 'ciano', hue: 190, saturation: 80 })];
        const r = evaluateDistanceCriteria(existentesSinteticos, novos).find((c) => c.criterio === 5);
        expect(r?.ok).toBe(false);
    });

    it('critério 6 reprova matiz a menos de 25° de um existente na MESMA família e MESMO modo', () => {
        const perto = [linha({ id: 'a', mode: 'dark', familia: 'ciano', hue: 190, saturation: 80 })]; // 190 vs 183 = 7°
        const longe = [linha({ id: 'a', mode: 'dark', familia: 'ciano', hue: 260, saturation: 80 })];
        expect(evaluateDistanceCriteria(existentesSinteticos, perto).find((c) => c.criterio === 6)?.ok).toBe(false);
        expect(evaluateDistanceCriteria(existentesSinteticos, longe).find((c) => c.criterio === 6)?.ok).toBe(true);
    });

    it('critério 6 ignora conflito de família/modo diferentes', () => {
        // mesmo matiz do existente ciano/dark, mas o novo é light — não conflita.
        const novos = [linha({ id: 'a', mode: 'light', familia: 'ciano', hue: 183, saturation: 80 })];
        const r = evaluateDistanceCriteria(existentesSinteticos, novos).find((c) => c.criterio === 6);
        expect(r?.ok).toBe(true);
    });

    it('critério 7 reprova dois novos com mesma família E mesmo modo', () => {
        const novos = [
            linha({ id: 'a', mode: 'dark', familia: 'verde', hue: 100 }),
            linha({ id: 'b', mode: 'dark', familia: 'verde', hue: 110 }),
        ];
        const r = evaluateDistanceCriteria(existentesSinteticos, novos).find((c) => c.criterio === 7);
        expect(r?.ok).toBe(false);
    });

    it('critério 8 exige sidebar E topbar entre os novos', () => {
        const soSidebar = [linha({ id: 'a', navigationStyle: 'sidebar' }), linha({ id: 'b', navigationStyle: 'sidebar' })];
        const ambos = [linha({ id: 'a', navigationStyle: 'sidebar' }), linha({ id: 'b', navigationStyle: 'topbar' })];
        expect(evaluateDistanceCriteria(existentesSinteticos, soSidebar).find((c) => c.criterio === 8)?.ok).toBe(false);
        expect(evaluateDistanceCriteria(existentesSinteticos, ambos).find((c) => c.criterio === 8)?.ok).toBe(true);
    });

    it('critério 9 reprova quando raio, borda, blur E densidade ficam todos na mesma faixa', () => {
        const novos = [
            linha({ id: 'a', cardBorderRadius: 8, cardBorderWidth: 1, cardBackdropBlur: 8, layoutDensity: 'comfortable' }),
            linha({ id: 'b', cardBorderRadius: 8, cardBorderWidth: 1, cardBackdropBlur: 8, layoutDensity: 'comfortable' }),
        ];
        const r = evaluateDistanceCriteria(existentesSinteticos, novos).find((c) => c.criterio === 9);
        expect(r?.ok).toBe(false);
    });

    it('critério 9 passa quando ao menos uma das 4 propriedades varia de faixa', () => {
        const novos = [
            linha({ id: 'a', cardBorderRadius: 0, cardBorderWidth: 1, cardBackdropBlur: 8, layoutDensity: 'comfortable' }),
            linha({ id: 'b', cardBorderRadius: 100, cardBorderWidth: 1, cardBackdropBlur: 8, layoutDensity: 'comfortable' }),
        ];
        const r = evaluateDistanceCriteria(existentesSinteticos, novos).find((c) => c.criterio === 9);
        expect(r?.ok).toBe(true);
    });

    it('critério 9 reprova 5 novos estruturalmente idênticos entre si (raio, borda, blur E densidade iguais)', () => {
        const cincoIdenticos = Array.from({ length: 5 }, (_, i) =>
            linha({ id: `identico-${i}`, cardBorderRadius: 8, cardBorderWidth: 1, cardBackdropBlur: 8, layoutDensity: 'comfortable' }),
        );
        const r = evaluateDistanceCriteria(existentesSinteticos, cincoIdenticos).find((c) => c.criterio === 9);
        expect(r?.ok).toBe(false);
    });

    // Recalibragem (achado do revisor, específico do histórico desta métrica): os
    // limites antigos e hardcoded do bucket3 (0-120/0-20/0-100 — o
    // `constraints.min..max` do schema) eram tão mais largos que o uso real que
    // nenhum tema jamais escapava da faixa "baixo". Um conjunto de 5 novos cujo
    // `cardBorderRadius` cobre uma faixa bem maior que a do catálogo shippado
    // é genuinamente diverso — mas com os limites antigos, colapsava inteiro em
    // "baixo" (0 faixas distintas detectadas) e, com borda/blur/densidade
    // mantidos constantes, o critério 9 REPROVARIA essa dispersão real por
    // engano. Com os limites novos — derivados dos `existentes` (o catálogo
    // shippado de verdade, nunca dos `novos`) — a mesma dispersão é
    // corretamente detectada.
    it('recalibragem: raio que cobre uma faixa bem maior que a do catálogo escapava de "baixo" com os limites antigos e agora é detectado', () => {
        const existentesReais = GLOBAL_THEMES.map(measureTheme);
        const novos = [0, 8, 16, 24, 32].map((radius, i) =>
            linha({ id: `novo-${i}`, cardBorderRadius: radius, cardBorderWidth: 1, cardBackdropBlur: 0, layoutDensity: 'comfortable' }),
        );

        // Reprodução do bug: com os limites antigos (0-120), essa dispersão
        // real e completa colapsa inteira em "baixo" — 0 faixas distintas.
        const faixasComLimiteAntigo = new Set(novos.map((n) => bucket3(n.cardBorderRadius, 0, 120)));
        expect(faixasComLimiteAntigo.size).toBe(1);

        // Com a recalibragem (limites derivados do catálogo shippado real), o
        // critério 9 passa a enxergar essa mesma dispersão corretamente.
        const r = evaluateDistanceCriteria(existentesReais, novos).find((c) => c.criterio === 9);
        expect(r?.ok).toBe(true);
    });

    it('devolve os 9 critérios, sempre', () => {
        const r = evaluateDistanceCriteria(existentesSinteticos, [linha({ id: 'a' })]);
        expect(r.length).toBe(9);
        expect(r.map((c) => c.criterio)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
});
