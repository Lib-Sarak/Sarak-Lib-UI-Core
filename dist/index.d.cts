import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode } from 'react';

declare const THEME_FONTS: {
    id: string;
    name: string;
    value: string;
    category: string;
    description: string;
    weights: number[];
}[];

declare const ICON_PACKS: {
    none: {
        id: string;
        name: string;
        description: string;
        icons: {
            dashboard: react_jsx_runtime.JSX.Element;
            data: react_jsx_runtime.JSX.Element;
            analysis: react_jsx_runtime.JSX.Element;
            audit: react_jsx_runtime.JSX.Element;
            settings: react_jsx_runtime.JSX.Element;
            profile: react_jsx_runtime.JSX.Element;
        };
    };
    minimal: {
        id: string;
        name: string;
        description: string;
        icons: {
            dashboard: string;
            data: string;
            analysis: string;
            audit: string;
            settings: string;
            profile: string;
        };
    };
    cyber: {
        id: string;
        name: string;
        description: string;
        icons: {
            dashboard: react_jsx_runtime.JSX.Element;
            data: react_jsx_runtime.JSX.Element;
            analysis: react_jsx_runtime.JSX.Element;
            audit: react_jsx_runtime.JSX.Element;
            settings: react_jsx_runtime.JSX.Element;
            profile: react_jsx_runtime.JSX.Element;
        };
    };
    nature: {
        id: string;
        name: string;
        description: string;
        icons: {
            dashboard: react_jsx_runtime.JSX.Element;
            data: react_jsx_runtime.JSX.Element;
            analysis: react_jsx_runtime.JSX.Element;
            audit: react_jsx_runtime.JSX.Element;
            settings: react_jsx_runtime.JSX.Element;
            profile: react_jsx_runtime.JSX.Element;
        };
    };
    cosmic: {
        id: string;
        name: string;
        description: string;
        icons: {
            dashboard: react_jsx_runtime.JSX.Element;
            data: react_jsx_runtime.JSX.Element;
            analysis: react_jsx_runtime.JSX.Element;
            audit: react_jsx_runtime.JSX.Element;
            settings: react_jsx_runtime.JSX.Element;
            profile: react_jsx_runtime.JSX.Element;
        };
    };
    security: {
        id: string;
        name: string;
        description: string;
        icons: {
            dashboard: react_jsx_runtime.JSX.Element;
            data: react_jsx_runtime.JSX.Element;
            analysis: react_jsx_runtime.JSX.Element;
            audit: react_jsx_runtime.JSX.Element;
            settings: react_jsx_runtime.JSX.Element;
            profile: react_jsx_runtime.JSX.Element;
        };
    };
    gamer: {
        id: string;
        name: string;
        description: string;
        icons: {
            dashboard: react_jsx_runtime.JSX.Element;
            data: react_jsx_runtime.JSX.Element;
            analysis: react_jsx_runtime.JSX.Element;
            audit: react_jsx_runtime.JSX.Element;
            settings: react_jsx_runtime.JSX.Element;
            profile: react_jsx_runtime.JSX.Element;
        };
    };
    finance: {
        id: string;
        name: string;
        description: string;
        icons: {
            dashboard: react_jsx_runtime.JSX.Element;
            data: react_jsx_runtime.JSX.Element;
            analysis: react_jsx_runtime.JSX.Element;
            audit: react_jsx_runtime.JSX.Element;
            settings: react_jsx_runtime.JSX.Element;
            profile: react_jsx_runtime.JSX.Element;
        };
    };
    intelligence: {
        id: string;
        name: string;
        description: string;
        icons: {
            dashboard: react_jsx_runtime.JSX.Element;
            data: react_jsx_runtime.JSX.Element;
            analysis: react_jsx_runtime.JSX.Element;
            audit: react_jsx_runtime.JSX.Element;
            settings: react_jsx_runtime.JSX.Element;
            profile: react_jsx_runtime.JSX.Element;
        };
    };
};
declare const EMOJI_SETS: any;

declare const THEME_EFFECTS: {
    page: {
        none: {
            name: string;
            description: string;
            page: {
                initial: {
                    opacity: number;
                };
                animate: {
                    opacity: number;
                };
                exit: {
                    opacity: number;
                };
                transition: {
                    duration: number;
                };
            };
            card: {
                initial: {
                    opacity: number;
                };
                animate: {
                    opacity: number;
                };
                transition: {
                    duration: number;
                };
            };
        };
        fade: {
            name: string;
            description: string;
            page: {
                initial: {
                    opacity: number;
                };
                animate: {
                    opacity: number;
                };
                exit: {
                    opacity: number;
                };
                transition: {
                    duration: number;
                };
            };
            card: {
                initial: {
                    opacity: number;
                };
                animate: {
                    opacity: number;
                };
                transition: {
                    duration: number;
                    delay: number;
                };
            };
        };
        slideUp: {
            name: string;
            description: string;
            page: {
                initial: {
                    opacity: number;
                    y: number;
                };
                animate: {
                    opacity: number;
                    y: number;
                };
                exit: {
                    opacity: number;
                    y: number;
                };
                transition: {
                    duration: number;
                };
            };
            card: {
                initial: {
                    opacity: number;
                    y: number;
                };
                animate: {
                    opacity: number;
                    y: number;
                };
                transition: {
                    duration: number;
                    delay: number;
                };
            };
        };
        slideLeft: {
            name: string;
            description: string;
            page: {
                initial: {
                    opacity: number;
                    x: number;
                };
                animate: {
                    opacity: number;
                    x: number;
                };
                exit: {
                    opacity: number;
                    x: number;
                };
                transition: {
                    duration: number;
                };
            };
            card: {
                initial: {
                    opacity: number;
                    x: number;
                };
                animate: {
                    opacity: number;
                    x: number;
                };
                transition: {
                    duration: number;
                    delay: number;
                };
            };
        };
        scale: {
            name: string;
            description: string;
            page: {
                initial: {
                    opacity: number;
                    scale: number;
                };
                animate: {
                    opacity: number;
                    scale: number;
                };
                exit: {
                    opacity: number;
                    scale: number;
                };
                transition: {
                    duration: number;
                };
            };
            card: {
                initial: {
                    opacity: number;
                    scale: number;
                };
                animate: {
                    opacity: number;
                    scale: number;
                };
                transition: {
                    duration: number;
                    delay: number;
                };
            };
        };
        blur: {
            name: string;
            description: string;
            page: {
                initial: {
                    opacity: number;
                    filter: string;
                };
                animate: {
                    opacity: number;
                    filter: string;
                };
                exit: {
                    opacity: number;
                    filter: string;
                };
                transition: {
                    duration: number;
                };
            };
            card: {
                initial: {
                    opacity: number;
                    filter: string;
                };
                animate: {
                    opacity: number;
                    filter: string;
                };
                transition: {
                    duration: number;
                    delay: number;
                };
            };
        };
        perspective: {
            name: string;
            description: string;
            page: {
                initial: {
                    opacity: number;
                    rotateX: number;
                    scale: number;
                    y: number;
                };
                animate: {
                    opacity: number;
                    rotateX: number;
                    scale: number;
                    y: number;
                };
                exit: {
                    opacity: number;
                    rotateX: number;
                    scale: number;
                    y: number;
                };
                transition: {
                    duration: number;
                };
            };
            card: {
                initial: {
                    opacity: number;
                    rotateX: number;
                    y: number;
                };
                animate: {
                    opacity: number;
                    rotateX: number;
                    y: number;
                };
                transition: {
                    duration: number;
                    delay: number;
                };
            };
        };
        flip: {
            name: string;
            description: string;
            page: {
                initial: {
                    opacity: number;
                    rotateY: number;
                };
                animate: {
                    opacity: number;
                    rotateY: number;
                };
                exit: {
                    opacity: number;
                    rotateY: number;
                };
                transition: {
                    duration: number;
                };
            };
            card: {
                initial: {
                    opacity: number;
                    rotateY: number;
                };
                animate: {
                    opacity: number;
                    rotateY: number;
                };
                transition: {
                    duration: number;
                    delay: number;
                };
            };
        };
        slideDown: {
            name: string;
            description: string;
            page: {
                initial: {
                    opacity: number;
                    y: number;
                };
                animate: {
                    opacity: number;
                    y: number;
                };
                exit: {
                    opacity: number;
                    y: number;
                };
                transition: {
                    duration: number;
                };
            };
            card: {
                initial: {
                    opacity: number;
                    y: number;
                };
                animate: {
                    opacity: number;
                    y: number;
                };
                transition: {
                    duration: number;
                    delay: number;
                };
            };
        };
        elastic: {
            name: string;
            description: string;
            page: {
                initial: {
                    opacity: number;
                    scale: number;
                };
                animate: {
                    opacity: number;
                    scale: number;
                };
                exit: {
                    opacity: number;
                    scale: number;
                };
                transition: {
                    type: string;
                    damping: number;
                    stiffness: number;
                };
            };
            card: {
                initial: {
                    opacity: number;
                    scale: number;
                };
                animate: {
                    opacity: number;
                    scale: number;
                };
                transition: {
                    type: string;
                    damping: number;
                    stiffness: number;
                    delay: number;
                };
            };
        };
    };
    hover: {
        none: {};
        lift: {
            whileHover: {
                y: number;
                scale: number;
            };
            whileTap: {
                scale: number;
            };
        };
        glow: {
            whileHover: {
                boxShadow: string;
                scale: number;
            };
        };
        glass: {
            whileHover: {
                backgroundColor: string;
                backdropFilter: string;
            };
        };
        outline: {
            whileHover: {
                outline: string;
                outlineOffset: string;
            };
        };
    };
};
declare const ANIMATION_VARIANTS: {
    none: {
        name: string;
        description: string;
        page: {
            initial: {
                opacity: number;
            };
            animate: {
                opacity: number;
            };
            exit: {
                opacity: number;
            };
            transition: {
                duration: number;
            };
        };
        card: {
            initial: {
                opacity: number;
            };
            animate: {
                opacity: number;
            };
            transition: {
                duration: number;
            };
        };
    };
    fade: {
        name: string;
        description: string;
        page: {
            initial: {
                opacity: number;
            };
            animate: {
                opacity: number;
            };
            exit: {
                opacity: number;
            };
            transition: {
                duration: number;
            };
        };
        card: {
            initial: {
                opacity: number;
            };
            animate: {
                opacity: number;
            };
            transition: {
                duration: number;
                delay: number;
            };
        };
    };
    slideUp: {
        name: string;
        description: string;
        page: {
            initial: {
                opacity: number;
                y: number;
            };
            animate: {
                opacity: number;
                y: number;
            };
            exit: {
                opacity: number;
                y: number;
            };
            transition: {
                duration: number;
            };
        };
        card: {
            initial: {
                opacity: number;
                y: number;
            };
            animate: {
                opacity: number;
                y: number;
            };
            transition: {
                duration: number;
                delay: number;
            };
        };
    };
    slideLeft: {
        name: string;
        description: string;
        page: {
            initial: {
                opacity: number;
                x: number;
            };
            animate: {
                opacity: number;
                x: number;
            };
            exit: {
                opacity: number;
                x: number;
            };
            transition: {
                duration: number;
            };
        };
        card: {
            initial: {
                opacity: number;
                x: number;
            };
            animate: {
                opacity: number;
                x: number;
            };
            transition: {
                duration: number;
                delay: number;
            };
        };
    };
    scale: {
        name: string;
        description: string;
        page: {
            initial: {
                opacity: number;
                scale: number;
            };
            animate: {
                opacity: number;
                scale: number;
            };
            exit: {
                opacity: number;
                scale: number;
            };
            transition: {
                duration: number;
            };
        };
        card: {
            initial: {
                opacity: number;
                scale: number;
            };
            animate: {
                opacity: number;
                scale: number;
            };
            transition: {
                duration: number;
                delay: number;
            };
        };
    };
    blur: {
        name: string;
        description: string;
        page: {
            initial: {
                opacity: number;
                filter: string;
            };
            animate: {
                opacity: number;
                filter: string;
            };
            exit: {
                opacity: number;
                filter: string;
            };
            transition: {
                duration: number;
            };
        };
        card: {
            initial: {
                opacity: number;
                filter: string;
            };
            animate: {
                opacity: number;
                filter: string;
            };
            transition: {
                duration: number;
                delay: number;
            };
        };
    };
    perspective: {
        name: string;
        description: string;
        page: {
            initial: {
                opacity: number;
                rotateX: number;
                scale: number;
                y: number;
            };
            animate: {
                opacity: number;
                rotateX: number;
                scale: number;
                y: number;
            };
            exit: {
                opacity: number;
                rotateX: number;
                scale: number;
                y: number;
            };
            transition: {
                duration: number;
            };
        };
        card: {
            initial: {
                opacity: number;
                rotateX: number;
                y: number;
            };
            animate: {
                opacity: number;
                rotateX: number;
                y: number;
            };
            transition: {
                duration: number;
                delay: number;
            };
        };
    };
    flip: {
        name: string;
        description: string;
        page: {
            initial: {
                opacity: number;
                rotateY: number;
            };
            animate: {
                opacity: number;
                rotateY: number;
            };
            exit: {
                opacity: number;
                rotateY: number;
            };
            transition: {
                duration: number;
            };
        };
        card: {
            initial: {
                opacity: number;
                rotateY: number;
            };
            animate: {
                opacity: number;
                rotateY: number;
            };
            transition: {
                duration: number;
                delay: number;
            };
        };
    };
    slideDown: {
        name: string;
        description: string;
        page: {
            initial: {
                opacity: number;
                y: number;
            };
            animate: {
                opacity: number;
                y: number;
            };
            exit: {
                opacity: number;
                y: number;
            };
            transition: {
                duration: number;
            };
        };
        card: {
            initial: {
                opacity: number;
                y: number;
            };
            animate: {
                opacity: number;
                y: number;
            };
            transition: {
                duration: number;
                delay: number;
            };
        };
    };
    elastic: {
        name: string;
        description: string;
        page: {
            initial: {
                opacity: number;
                scale: number;
            };
            animate: {
                opacity: number;
                scale: number;
            };
            exit: {
                opacity: number;
                scale: number;
            };
            transition: {
                type: string;
                damping: number;
                stiffness: number;
            };
        };
        card: {
            initial: {
                opacity: number;
                scale: number;
            };
            animate: {
                opacity: number;
                scale: number;
            };
            transition: {
                type: string;
                damping: number;
                stiffness: number;
                delay: number;
            };
        };
    };
};

declare const TEXTURE_LIBRARY: {
    id: string;
    name: string;
    className: string;
    description: string;
}[];

declare const BASE_PRESETS: {
    brutalist: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    organic: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
        '--bg-body': string;
        '--bg-card': string;
    };
    cyberpunk_v1: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    editorial_v1: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    playful: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    neumorphic: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    terminal_v1: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    ethereal: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    industrial: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    retro: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    mainframe: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
        '--bg-body': string;
        '--bg-card': string;
    };
    modern_organic: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    editorial_v2: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    brutal: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    cyberpunk_v2: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    compact: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    elevated: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    helvetica: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    nebula: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    blueprint: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    glass: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    corporate: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    minimal: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    technical: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    prestige: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    atmospheric: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    neon_circuit: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--text-transform-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    ai_neural: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--text-transform-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    editorial: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--text-transform-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
    main: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
        '--theme-body': string;
        '--theme-card': string;
        '--theme-sidebar': string;
    };
    cyberpunk: {
        '--radius-theme': string;
        '--font-main': string;
        '--font-heading': string;
        '--theme-padding': string;
        '--theme-gap': string;
        '--glass-blur': string;
        '--glass-opacity': string;
        '--font-weight-heading': string;
        '--letter-spacing-heading': string;
        '--text-transform-heading': string;
        '--border-width': string;
        '--shadow-intensity': string;
        '--card-style': string;
        '--bg-texture': string;
    };
};

/**
 * Sarak UI Core — Entry Point Unificado
 *
 * Exporta o Design System completo: presets de tema, tokens de tipografia,
 * efeitos visuais, texturas e o Theme Engine de inicialização.
 *
 * Uso:
 *   import { BASE_PRESETS, initSarakTheme } from '@sarak/lib-ui-core';
 *   import '@sarak/lib-ui-core/style.css';
 */

/**
 * Injeta o tema Sarak no documento.
 *
 * Aplica o atributo data-sarak-theme no <html> para ativação de variáveis CSS
 * e garante que o link de estilo base não seja duplicado em re-renders.
 *
 * Deve ser chamada uma única vez no bootstrap da aplicação,
 * após importar o CSS via: `import '@sarak/lib-ui-core/style.css'`
 *
 * @param preset - Chave do preset de tema (key do BASE_PRESETS). Padrão: 'glass'
 */
declare function initSarakTheme(preset?: string): void;
/**
 * SarakUIProvider — Provedor Visual Core
 *
 * Gerencia a inicialização do Design System e disponibiliza
 * o wrapper de interface necessário para o Sarak OS.
 *
 * @param preset - Tema inicial. Padrão: 'glass'
 */
declare const SarakUIProvider: React.FC<{
    children: ReactNode;
    theme?: string;
}>;

export { ANIMATION_VARIANTS, BASE_PRESETS, EMOJI_SETS, ICON_PACKS, SarakUIProvider, TEXTURE_LIBRARY, THEME_EFFECTS, THEME_FONTS, initSarakTheme };
