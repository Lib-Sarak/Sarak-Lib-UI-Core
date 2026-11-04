import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Cada opção desenha componentes reais (botão em 4 estados, campo, cartão): a lista inteira em jsdom passa dos 5 s padrão sob carga.
vi.setConfig({ testTimeout: 30000 });
import { CardsCatalog } from '../CardsCatalog';
import { ButtonsCatalog } from '../ButtonsCatalog';
import { InputsCatalog } from '../InputsCatalog';
import { AtmosphereCatalog } from '../AtmosphereCatalog';
import { TypographyCatalog } from '../TypographyCatalog';
import { SAMPLE_BUTTON_STATES, SAMPLE_TEXTURE_OPACITY } from '../SampleParts';
import { getPresetGroup } from '../../../../../core/Design/presets/components/registry';
import { TYPOGRAPHY_PRESETS } from '../../../../../core/Design/presets/components/typography';

/**
 * Cada grupo de opções é montado SOZINHO, sem a galeria (`PresetsCatalog`) em volta: é o que deixa a coluna única
 * da plan seguinte usá-los sem reescrevê-los.
 */
const GROUPS = [
    ['CardsCatalog', CardsCatalog],
    ['ButtonsCatalog', ButtonsCatalog],
    ['InputsCatalog', InputsCatalog],
    ['AtmosphereCatalog', AtmosphereCatalog],
    ['TypographyCatalog', TypographyCatalog],
] as const;

// Cada teste monta o grupo inteiro duas vezes, com componentes reais: sob a suíte em paralelo passa dos 5 s padrão.
const HEAVY_RENDER_TIMEOUT_MS = 30000;

const GROUPS_WITH_SCOPE = GROUPS.filter(([name]) => name !== 'TypographyCatalog');

describe('grupos de opções do painel', () => {
    it.each(GROUPS)('%s monta sozinho, fora da galeria', (_name, Group) => {
        const { container } = render(<Group onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(container.querySelector('h3')).toBeInTheDocument();
    });

    it.each(GROUPS)('%s não desenha barra cinza no lugar de conteúdo', (_name, Group) => {
        const { container } = render(<Group onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(container.querySelector('[class*="bg-theme-text/10"], [class*="bg-theme-text/20"], [class*="bg-theme-text/40"]')).toBeNull();
    });

    it.each(GROUPS_WITH_SCOPE)('%s: trocar o modo do rascunho muda a amostra', (_name, Group) => {
        const dark = render(<Group onApplyPreset={vi.fn()} currentMode="dark" />);
        const darkScope = dark.container.querySelector('.sarak-design-scope') as HTMLElement;
        const light = render(<Group onApplyPreset={vi.fn()} currentMode="light" />);
        const lightScope = light.container.querySelector('.sarak-design-scope') as HTMLElement;

        expect(darkScope).toHaveClass('dark');
        expect(lightScope).toHaveClass('light');
        expect(lightScope).not.toHaveClass('dark');
    }, HEAVY_RENDER_TIMEOUT_MS);

    it('os cartões usam o átomo real: título, valor e botão', () => {
        const { container } = render(<CardsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        const card = container.querySelector('.sarak-card') as HTMLElement;
        expect(card.querySelector('[data-testid="sample-card-title"]')).toBeInTheDocument();
        expect(card.querySelector('[data-testid="sample-card-value"]')).toBeInTheDocument();
        expect(card.querySelector('button')).toBeInTheDocument();
    });

    it('os botões aparecem nos quatro estados, lado a lado, com o botão real', () => {
        const { container } = render(<ButtonsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        const first = container.querySelector('.sarak-design-scope') as HTMLElement;
        const states = Array.from(first.querySelectorAll('[data-sample-state]')).map((node) => node.getAttribute('data-sample-state'));
        expect(states).toEqual([...SAMPLE_BUTTON_STATES]);
        expect(first.querySelector('[data-sample-state="disabled"] button')).toBeDisabled();
        expect(first.querySelector('[data-sample-state="focus"] button')!.getAttribute('style')).toContain('var(--sarak-focus-width');
    });

    it('os campos aparecem em repouso e com foco, com o campo real', () => {
        const { container } = render(<InputsCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        const first = container.querySelector('.sarak-design-scope') as HTMLElement;
        expect(first.querySelector('[data-sample-state="rest"] input')).toBeInTheDocument();
        expect(first.querySelector('[data-sample-state="focus"] input')).toBeInTheDocument();
    });

    it('a atmosfera ocupa o tile inteiro, sem cartão no centro, com uma mini peça no canto', () => {
        const { container } = render(<AtmosphereCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        expect(container.querySelector('.sarak-card')).toBeNull();
        const corner = container.querySelector('.absolute.bottom-3.right-3') as HTMLElement;
        expect(corner.querySelector('button')).toBeInTheDocument();
        expect(container.querySelector('.sarak-design-scope')!.parentElement).toHaveClass('absolute', 'inset-0');
    });

    it('a textura de atmosfera aparece com a opacidade da amostra e o clique aplica o valor do preset', () => {
        const onApplyPreset = vi.fn();
        const { container, getByRole } = render(<AtmosphereCatalog onApplyPreset={onApplyPreset} currentMode="dark" initialTab="textures" />);
        const scope = container.querySelector('.sarak-design-scope[data-sx-texture]') as HTMLElement;
        expect(scope.style.getPropertyValue('--sarak-bg-pattern-opacity')).toBe(String(SAMPLE_TEXTURE_OPACITY));
        expect(scope).toHaveClass('texture-active');

        // Só a primeira opção destacada importa aqui: a lista inteira não precisa ser desenhada para conferir o clique.
        const group = getPresetGroup('textures')!;
        const preset = group.presets.find((candidate) => candidate.id === group.featured[0])!;
        fireEvent.click(getByRole('button', { name: 'Grade técnica' }));
        expect(onApplyPreset).toHaveBeenCalledWith(preset.design, true);
        expect(JSON.stringify(onApplyPreset.mock.calls[0][0])).not.toContain(String(SAMPLE_TEXTURE_OPACITY));
    }, HEAVY_RENDER_TIMEOUT_MS);

    it('a textura de cartão aparece no próprio cartão, com opacidade visível, e o clique aplica o valor do preset', () => {
        const onApplyPreset = vi.fn();
        const { container, getByRole } = render(<CardsCatalog onApplyPreset={onApplyPreset} currentMode="dark" initialTab="textures" />);
        const scope = container.querySelector('.sarak-design-scope[data-sx-card-texture-type]') as HTMLElement;
        expect(scope.style.getPropertyValue('--sarak-card-texture-opacity')).toBe(String(SAMPLE_TEXTURE_OPACITY));
        const card = scope.querySelector('.sarak-card') as HTMLElement;
        expect(card).toHaveClass('min-h-40');
        expect(card.querySelector('[data-sample-texture]')!.getAttribute('data-sx-texture')).toBe(scope.getAttribute('data-sx-card-texture-type'));

        const group = getPresetGroup('cardTextures')!;
        const preset = group.presets.find((candidate) => candidate.id === group.featured[0])!;
        fireEvent.click(getByRole('button', { name: 'Grade técnica' }));
        expect(onApplyPreset).toHaveBeenCalledWith(preset.design, true);
    }, HEAVY_RENDER_TIMEOUT_MS);

    it('a tipografia mostra um Aa grande e a linha de letras que distinguem, na fonte do preset, e a frase em português', () => {
        const { container } = render(<TypographyCatalog onApplyPreset={vi.fn()} currentMode="dark" />);
        const first = TYPOGRAPHY_PRESETS[0].design;
        const specimen = container.querySelector('[data-testid="font-sample-specimen"]') as HTMLElement;
        expect(specimen).toHaveTextContent('Aa');
        expect(specimen.style.fontFamily).toContain(String(first.headingFont).replace(/['"]/g, '').split(',')[0]);
        expect(container.querySelector('[data-testid="font-sample-glyphs"]')).toHaveTextContent('Gg Qq Rr 0123');
        expect(container.querySelector('[data-testid="font-sample-body"]')).toHaveTextContent('A atenção aos detalhes faz a diferença.');
    });

    it('espiar uma opção não aplica nada; só o clique aplica', () => {
        const onApplyPreset = vi.fn();
        const { getAllByRole } = render(<CardsCatalog onApplyPreset={onApplyPreset} currentMode="dark" onPeek={vi.fn()} />);
        const option = getAllByRole('button').find((button) => button.getAttribute('aria-label') === 'Vidro mínimo')!;
        fireEvent.mouseEnter(option.parentElement!);
        fireEvent.focus(option);
        expect(onApplyPreset).not.toHaveBeenCalled();

        fireEvent.click(option);
        expect(onApplyPreset).toHaveBeenCalledTimes(1);
    }, HEAVY_RENDER_TIMEOUT_MS);
});
