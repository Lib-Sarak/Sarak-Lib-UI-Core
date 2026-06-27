import React, { useEffect } from 'react';
import { BEZIER_CURVES } from '../constants';
import { useDesignVariables } from '../../Design/hooks/useDesignVariables';
import { SarakDesignState } from '../types';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/**
 * DesignInjector (v11.1) - Industrial Edition
 * 
 * Sincroniza o estado de design com o DOM global (root/body).
 * Agora utiliza o useDesignVariables para garantir paridade total com as previews.
 */
export const DesignInjector: React.FC<{ design: SarakDesignState | null; isDrafting: boolean }> = ({ design: s, isDrafting }) => {
    // Seam (Spec 65): o estado tipado é entregue ao motor genérico de variáveis CSS.
    const { variables, attributes, responsiveCSS } = useDesignVariables(s as unknown as Record<string, unknown> | null);
    const prevDesignRef = React.useRef<string | null>(null);

    // Mouse Tracking (Global)
    useEffect(() => {
        let rafId: number;
        const handleMouseMove = (e: MouseEvent) => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth) * 100;
                const y = (e.clientY / window.innerHeight) * 100;
                document.documentElement.style.setProperty('--mouse-x', `${x}%`);
                document.documentElement.style.setProperty('--mouse-y', `${y}%`);
            });
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Tab Title Sync
    useEffect(() => {
        if (s?.systemName && typeof document !== 'undefined') {
            document.title = s.systemName;
        }
    }, [s?.systemName]);

    // Global CSS Variables & Attributes Injection
    useIsomorphicLayoutEffect(() => {
        if (typeof document === 'undefined' || !s) return;

        // 1. Verificação de Mudança Real (Audit Level 12.8 - Deep Sync Guard)
        // Usamos uma string estável para comparar o conteúdo real do design
        const currentDesignKey = JSON.stringify(s);
        if (prevDesignRef.current === currentDesignKey) return;

        const root = document.documentElement;
        const body = document.body;

        // 1. Injetar Variáveis do Mapa Mestre
        // Fazemos o update apenas se o valor for diferente do atual para economizar ciclos de reflow
        Object.entries(variables).forEach(([k, v]) => {
            if (root.style.getPropertyValue(k) !== v) {
                root.style.setProperty(k, v);
                body.style.setProperty(k, v);
            }
        });

        // 2. Injetar Atributos de Estado
        Object.entries(attributes).forEach(([k, v]) => {
            if (root.getAttribute(k) !== v) {
                root.setAttribute(k, v);
                body.setAttribute(k, v);
            }
        });

        // 3. Curvas de Animação (Bezier)
        if (!prevDesignRef.current) {
            Object.entries(BEZIER_CURVES).forEach(([k, v]) => root.style.setProperty(k, v));
        }

        // 4. Classes de Modo (Dark/Light)
        const mode = s.mode || 'dark';
        if (!body.classList.contains(mode)) {
            body.classList.remove('light', 'dark');
            body.classList.add(mode);
        }

        // 5. Gestão de Atributos da Mídia de Fundo
        if (s.globalBackgroundImageUrl) {
            body.setAttribute('data-sarak-has-media', 'true');
        } else {
            body.removeAttribute('data-sarak-has-media');
        }

        // 6. Injeção de CSS Responsivo (Media Queries Dinâmicas)
        if (responsiveCSS) {
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

        // Armazenamos a string para a próxima comparação
        prevDesignRef.current = currentDesignKey;
    }, [s, variables, attributes, responsiveCSS]);

    return null;
};
