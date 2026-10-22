import React, { useEffect } from 'react';
import { BEZIER_CURVES } from '../constants';
import { useDesignVariables } from '../../Design/hooks/useDesignVariables';
import { SARAK_SCOPE_CLASS } from '../scope';
import { SarakDesignState, SarakUIMode } from '../types';
import {
    releaseInjectedWrites,
    syncInjectedWrites,
    writeInjectedAttribute,
    writeInjectedClass,
    writeInjectedStyleElement,
    writeInjectedStyleProperty,
} from '../utils/injectedWrites';
import { SarakStyle, useSarakStyleNonce } from './SarakStyle';

/** A família que a injeção ancora no `body` (ou na ilha): a limpeza só a tira se ainda for esta. */
const INJECTED_FONT_MAIN = 'var(--font-main, var(--sarak-font-b, "Inter", sans-serif))';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/** Valores de token que poderiam escapar do contexto de declaração CSS. */
const isCssSafeValue = (value: string): boolean => !/[<>{};]/.test(value);

/**
 * Serializa os tokens como uma REGRA `.sarak-scope { ... }` (Modo Embarcado).
 *
 * Escrever as vars só no container inline não basta: os PORTAIS (toast, drawer,
 * tooltip) vivem em `document.body`, fora da ilha, e não herdariam nenhum token —
 * renderizariam com os fallbacks. Publicando por CLASSE, ilha e portais recebem
 * exatamente os mesmos valores.
 */
const buildScopeVariablesCss = (variables: Record<string, string>, scopeClass: string): string => {
    const declarations = Object.entries(variables)
        .filter(([, value]) => isCssSafeValue(String(value)))
        .map(([key, value]) => `${key}:${value}`)
        .join(';');
    return declarations ? `.${scopeClass}{${declarations}}` : '';
};

interface DesignInjectorProps {
    design: SarakDesignState | null;
    isDrafting: boolean;
    /** Modo de consumo (Spec 24). Default `'app'` — grava no documento global. */
    mode?: SarakUIMode;
    /**
     * Container da ilha no Modo Embarcado; é ele quem recebe vars e `data-*`.
     * Vem por CALLBACK REF com estado (não por `useRef`): refs de pai só são
     * anexadas depois dos layout effects dos filhos, então um `RefObject` estaria
     * `null` na primeira passada e a ilha nasceria sem tokens.
     */
    scopeElement?: HTMLElement | null;
}

/**
 * DesignInjector (v12.0)
 *
 * Sincroniza o estado de design com o DOM.
 *
 * - **Modo App:** escreve no documento global (`documentElement` + `body`).
 * - **Modo Embarcado (Spec 24):** escreve TUDO no container da ilha e nunca toca em
 *   `documentElement`, `body` nem no título/ícone da aba do host. É o mesmo mecanismo
 *   que o `DesignScope` já usa para a diretiva `theme`.
 *
 * O `document.title` NÃO é escrito aqui (Spec 47): a identidade da aba tem fonte
 * única no `useSarakUIEffects`.
 */
export const DesignInjector: React.FC<DesignInjectorProps> = ({ design: s, mode = 'app', scopeElement = null }) => {
    const styleNonce = useSarakStyleNonce();
    const isEmbedded = mode === 'embedded';
    const ownerRef = React.useRef<object>({});

    // No Modo Embarcado o CSS responsivo é gerado mirando a ilha, não o `:root`.
    const { variables, attributes, responsiveCSS } = useDesignVariables(
        s as unknown as Record<string, unknown> | null,
        isEmbedded ? `.${SARAK_SCOPE_CLASS}` : ':root',
    );
    const prevDesignRef = React.useRef<string | null>(null);
    // O que a injeção tocou, para a limpeza ao desmontar (o host não fica com o tema depois de o Provider sair).
    const injectedRef = React.useRef<{ targets: HTMLElement[]; fontScope: HTMLElement | null; classTarget: HTMLElement } | null>(null);

    // Mouse Tracking: no Modo App é uma coordenada global; no Embarcado fica no container.
    useEffect(() => {
        let rafId: number;
        const handleMouseMove = (e: MouseEvent) => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const target = isEmbedded ? scopeElement : document.documentElement;
                if (!target) return;
                const x = (e.clientX / window.innerWidth) * 100;
                const y = (e.clientY / window.innerHeight) * 100;
                writeInjectedStyleProperty(target, '--mouse-x', `${x}%`, ownerRef.current);
                writeInjectedStyleProperty(target, '--mouse-y', `${y}%`, ownerRef.current);
                // `shadowOrientation: dynamic`: a luz é o oposto do ponteiro (-1 a 1). Só é
                // escrita quando a opção está ativa — a variável herda por toda a árvore.
                if (target.getAttribute('data-sx-shadow-orientation') === 'dynamic') {
                    writeInjectedStyleProperty(target, '--sarak-light-x', String((50 - x) / 50), ownerRef.current);
                    writeInjectedStyleProperty(target, '--sarak-light-y', String((50 - y) / 50), ownerRef.current);
                }
            });
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            // Um quadro pendente escreveria `--mouse-x` no host depois de o Provider sair.
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isEmbedded, scopeElement]);

    // Título da aba: NÃO é mais responsabilidade deste componente (Spec 47). O
    // `useSarakUIEffects` é a fonte única de `document.title` — recebe o `systemName`
    // do Provider e aplica a precedência `branding.tabName > systemName`. Manter um
    // segundo `useEffect` aqui era o que fazia dois caminhos disputarem o mesmo
    // `document.title`.

    // Injeção de Variáveis e Atributos
    useIsomorphicLayoutEffect(() => {
        if (typeof document === 'undefined' || !s) return;

        // Verificação de Mudança Real (Deep Sync Guard): string estável do design.
        const currentDesignKey = JSON.stringify(s);
        if (prevDesignRef.current === currentDesignKey) return;

        // Alvos da escrita: o container da ilha (Embarcado) ou o documento (App).
        if (isEmbedded && !scopeElement) return; // container ainda não montou; o setState do callback ref reagenda.
        const targets: HTMLElement[] = isEmbedded && scopeElement ? [scopeElement] : [document.documentElement, document.body];
        const [primary] = targets;

        // 1. Variáveis do Mapa Mestre e 2. Atributos de Estado. Só grava o que mudou (economiza reflow) e tira
        // o que o tema anterior escreveu e este não escreve: a variável inline que ficasse venceria o
        // `<style>` responsivo e o valor do tema novo.
        targets.forEach((el) => syncInjectedWrites(el, variables, attributes, ownerRef.current));

        // 3. Curvas de Animação (Bezier)
        if (!prevDesignRef.current) {
            Object.entries(BEZIER_CURVES).forEach(([name, value]) =>
                writeInjectedStyleProperty(primary, name, value, ownerRef.current),
            );
        }

        // 3.5 FONTE DO TEMA APLICA SOZINHA (Spec 40.1 — L5). As vars `--font-main`/
        // `--font-heading` já são emitidas pelos tokens de tipografia e o CSS da lib
        // (`_base.css`/`_typography.css`) liga `body`/títulos a elas. Mas um consumidor
        // plug-and-play quase sempre traz um `body { font-family }` de reset no scaffold
        // (ex.: o `index.css` padrão do Vite), cuja cascata pode vencer a regra de
        // elemento da lib. Ancorar a família INLINE no escopo do Provider — body (Modo
        // App, dono da página) ou container da ilha (Embarcado) — garante que a fonte do
        // tema vença SEM o consumidor escrever uma linha de CSS. Referencia a var, então
        // repinta ao vivo quando o tema muda (custom properties resolvem no computed-value).
        const fontScope = isEmbedded ? scopeElement : document.body;
        if (fontScope) {
            writeInjectedStyleProperty(fontScope, 'font-family', INJECTED_FONT_MAIN, ownerRef.current);
        }

        // 4. Classes de Modo (Dark/Light) — no `body` (App) ou no container (Embarcado)
        const modeClass = s.mode || 'dark';
        const classTarget = isEmbedded && scopeElement ? scopeElement : document.body;
        writeInjectedClass(classTarget, 'light', false, ownerRef.current);
        writeInjectedClass(classTarget, 'dark', false, ownerRef.current);
        writeInjectedClass(classTarget, modeClass, true, ownerRef.current);

        // 5. Atributo da Mídia de Fundo
        writeInjectedAttribute(classTarget, 'data-sarak-has-media', s.globalBackgroundImageUrl ? 'true' : null, ownerRef.current);

        // 6. CSS Responsivo (Media Queries Dinâmicas) — no Modo Embarcado o `<style>` é
        // renderizado pelo próprio componente (abaixo), sem tag global no `<head>`.
        if (responsiveCSS && !isEmbedded) {
            writeInjectedStyleElement(document.head, 'sarak-responsive-vars', responsiveCSS, styleNonce, ownerRef.current);
        }

        injectedRef.current = { targets, fontScope, classTarget };
        prevDesignRef.current = currentDesignKey;
    }, [s, variables, attributes, responsiveCSS, isEmbedded, scopeElement, styleNonce]);

    // Ao desmontar, cada instância devolve apenas as escritas que ainda lhe pertencem.
    useEffect(() => () => {
        const written = injectedRef.current;
        const targets = written?.targets ?? [document.documentElement, document.body];
        const hosts = new Set<HTMLElement>([
            ...targets,
            ...(written?.fontScope ? [written.fontScope] : []),
            document.head,
        ]);
        hosts.forEach((host) => releaseInjectedWrites(host, ownerRef.current));
        injectedRef.current = null;
        prevDesignRef.current = null;
    }, []);

    // O CSS do Modo Embarcado vive na árvore React: some junto com a ilha no unmount,
    // em vez de deixar resíduo no `<head>` do host. Ambas as regras são ancoradas em
    // `.sarak-scope`, então não alcançam nenhum elemento do host.
    if (isEmbedded) {
        const scopeCss = `${buildScopeVariablesCss(variables, SARAK_SCOPE_CLASS)}${responsiveCSS || ''}`;
        return scopeCss ? <SarakStyle dangerouslySetInnerHTML={{ __html: scopeCss }} /> : null;
    }

    return null;
};
