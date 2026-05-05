/**
 * Sarak Animation & Effects Presets (v12.0)
 * Contém THEME_EFFECTS (definições de movimento) e ANIMATION_PRESETS (presets curados para a galeria).
 */

export const SCALES = {
    PP: { id: 'pp', factor: '0.7', label: 'PP' },
    P: { id: 'p', factor: '0.85', label: 'P' },
    M: { id: 'm', factor: '1.0', label: 'M' },
    G: { id: 'g', factor: '1.25', label: 'G' },
    GG: { id: 'gg', factor: '1.5', label: 'GG' },
};

export const THEME_EFFECTS = {
    page: {
        none: { name: 'None', page: { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } } },
        fade: { name: 'Smooth Fade', page: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.4 } } },
        slideUp: { name: 'Slide Up', page: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -30 }, transition: { duration: 0.5 } } },
        slideLeft: { name: 'Slide Left', page: { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -50 }, transition: { duration: 0.5 } } },
        scale: { name: 'Zoom Bounce', page: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.05 }, transition: { duration: 0.4 } } },
        blur: { name: 'Atmospheric', page: { initial: { opacity: 0, filter: 'blur(10px)' }, animate: { opacity: 1, filter: 'blur(0px)' }, exit: { opacity: 0, filter: 'blur(10px)' }, transition: { duration: 0.6 } } },
        perspective: { name: '3D Perspective', page: { initial: { opacity: 0, rotateX: 20, scale: 0.9, y: 20 }, animate: { opacity: 1, rotateX: 0, scale: 1, y: 0 }, exit: { opacity: 0, rotateX: -20, scale: 1.1, y: -20 }, transition: { duration: 0.7 } } },
        flip: { name: '3D Flip', page: { initial: { opacity: 0, rotateY: 90 }, animate: { opacity: 1, rotateY: 0 }, exit: { opacity: 0, rotateY: -90 }, transition: { duration: 0.6 } } },
        slideDown: { name: 'Slide Down', page: { initial: { opacity: 0, y: -50 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 50 }, transition: { duration: 0.5 } } },
        elastic: { name: 'Elastic Tech', page: { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.5 }, transition: { type: 'spring', damping: 12, stiffness: 100 } } }
    },
    hover: {
        none: {},
        lift: { whileHover: { y: -5, scale: 1.02 }, whileTap: { scale: 0.98 } },
        glow: { whileHover: { boxShadow: "0 0 25px var(--primary-color)", scale: 1.05 } },
        glass: { whileHover: { backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" } },
        outline: { whileHover: { outline: "2px solid var(--primary-color)", outlineOffset: "4px" } }
    }
};

export interface AnimationPreset {
    id: string;
    name: string;
    design: { pageTransition: string };
}

// Presets curados para a galeria (gerados a partir do THEME_EFFECTS)
export const ANIMATION_PRESETS: AnimationPreset[] = Object.entries(THEME_EFFECTS.page).map(([id, effect]) => ({
    id,
    name: effect.name,
    design: {
        pageTransition: id
    }
}));

// Alias para compatibilidade
export const ANIMATION_STYLES = THEME_EFFECTS;
