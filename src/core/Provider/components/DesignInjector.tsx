import React, { useEffect } from 'react';
import { BEZIER_CURVES } from '../constants';
import { useDesignVariables } from '../../Design/hooks/useDesignVariables';
import { SARAK_SCOPE_CLASS } from '../scope';
import { SarakDesignState, SarakUIMode } from '../types';

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
 * - **Modo App:** escreve no documento global (`documentElement` + `body`) e mantém o
 *   `document.title` em dia com o `systemName` — o sistema é dono da página.
 * - **Modo Embarcado (Spec 24):** escreve TUDO no container da ilha e nunca toca em
 *   `documentElement`, `body` nem no título/ícone da aba do host. É o mesmo mecanismo
 *   que o `DesignScope` já usa para a diretiva `theme`.
 */
export const DesignInjector: React.FC<DesignInjectorProps> = ({ design: s, mode = 'app', scopeElement = null }) => {
    const isEmbedded = mode === 'embedded';

    // No Modo Embarcado o CSS responsivo é gerado mirando a ilha, não o `:root`.
    const { variables, attributes, responsiveCSS } = useDesignVariables(
        s as unknown as Record<string, unknown> | null,
        isEmbedded ? `.${SARAK_SCOPE_CLASS}` : ':root',
    );
    const prevDesignRef = React.useRef<string | null>(null);

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
                target.style.setProperty('--mouse-x', `${x}%`);
                target.style.setProperty('--mouse-y', `${y}%`);
            });
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isEmbedded, scopeElement]);

    // Tab Title Sync — exclusivo do Modo App: o título da aba é do host no Embarcado.
    useEffect(() => {
        if (isEmbedded) return;
        if (s?.systemName && typeof document !== 'undefined') {
            document.title = s.systemName;
        }
    }, [s?.systemName, isEmbedded]);

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

        // 1. Variáveis do Mapa Mestre (só grava o que mudou — economiza reflow)
        Object.entries(variables).forEach(([k, v]) => {
            targets.forEach((el) => {
                if (el.style.getPropertyValue(k) !== v) el.style.setProperty(k, v);
            });
        });

        // 2. Atributos de Estado
        Object.entries(attributes).forEach(([k, v]) => {
            targets.forEach((el) => {
                if (el.getAttribute(k) !== v) el.setAttribute(k, v);
            });
        });

        // 3. Curvas de Animação (Bezier)
        if (!prevDesignRef.current) {
            Object.entries(BEZIER_CURVES).forEach(([k, v]) => primary.style.setProperty(k, v));
        }

        // 4. Classes de Modo (Dark/Light) — no `body` (App) ou no container (Embarcado)
        const modeClass = s.mode || 'dark';
        const classTarget = isEmbedded && scopeElement ? scopeElement : document.body;
        if (!classTarget.classList.contains(modeClass)) {
            classTarget.classList.remove('light', 'dark');
            classTarget.classList.add(modeClass);
        }

        // 5. Atributo da Mídia de Fundo
        if (s.globalBackgroundImageUrl) {
            classTarget.setAttribute('data-sarak-has-media', 'true');
        } else {
            classTarget.removeAttribute('data-sarak-has-media');
        }

        // 6. CSS Responsivo (Media Queries Dinâmicas) — no Modo Embarcado o `<style>` é
        // renderizado pelo próprio componente (abaixo), sem tag global no `<head>`.
        if (responsiveCSS && !isEmbedded) {
            let styleTag = document.getElementById('sarak-responsive-vars') as HTMLStyleElement;
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'sarak-responsive-vars';
                document.head.appendChild(styleTag);
            }
            if (styleTag.innerHTML !== responsiveCSS) {
                styleTag.innerHTML = responsiveCSS;
            }
        }

        prevDesignRef.current = currentDesignKey;
    }, [s, variables, attributes, responsiveCSS, isEmbedded, scopeElement]);

    // O CSS do Modo Embarcado vive na árvore React: some junto com a ilha no unmount,
    // em vez de deixar resíduo no `<head>` do host. Ambas as regras são ancoradas em
    // `.sarak-scope`, então não alcançam nenhum elemento do host.
    if (isEmbedded) {
        const scopeCss = `${buildScopeVariablesCss(variables, SARAK_SCOPE_CLASS)}${responsiveCSS || ''}`;
        return scopeCss ? <style dangerouslySetInnerHTML={{ __html: scopeCss }} /> : null;
    }

    return null;
};
