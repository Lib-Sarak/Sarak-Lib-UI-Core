import React, { useEffect } from 'react';
import { BEZIER_CURVES } from '../constants';
import { useDesignVariables } from '../../Design/hooks/useDesignVariables';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/**
 * DesignInjector (v11.1) - Industrial Edition
 * 
 * Sincroniza o estado de design com o DOM global (root/body).
 * Agora utiliza o useDesignVariables para garantir paridade total com as previews.
 */
export const DesignInjector: React.FC<{ design: any }> = ({ design: s }) => {
    const { variables, attributes } = useDesignVariables(s);
    const prevDesignRef = React.useRef<any>(null);

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
        const root = document.documentElement;
        const body = document.body;

        // 1. Injetar Variáveis do Mapa Mestre
        Object.entries(variables).forEach(([k, v]) => {
            root.style.setProperty(k, v);
            body.style.setProperty(k, v);
        });

        // 2. Injetar Atributos de Estado
        Object.entries(attributes).forEach(([k, v]) => {
            root.setAttribute(k, v);
            body.setAttribute(k, v);
        });

        // 3. Curvas de Animação (Bezier)
        if (!prevDesignRef.current) {
            Object.entries(BEZIER_CURVES).forEach(([k, v]) => root.style.setProperty(k, v));
        }

        // 4. Classes de Modo (Dark/Light)
        const mode = s.mode || 'dark';
        body.classList.remove('light', 'dark');
        body.classList.add(mode);

        prevDesignRef.current = { ...s };
    }, [s, variables, attributes]);

    return null;
};
