/**
 * Sarak Matrix UI Types (v5.5 - Sovereign)
 */
import React from 'react';

export interface ISarakAuthEngine {
    login: (identification: string, password?: string) => Promise<{ success: boolean; error?: string; token?: string; user?: Record<string, unknown> }>;
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    fetchMe: (token: string) => Promise<Record<string, unknown>>;
    logout?: () => void;
}

export interface ISarakTranslatorEngine {
    setLanguage: (lang: string) => void;
    getLanguage: () => string;
    onLanguageChange?: (callback: (lang: string) => void) => void;
}

export interface ISarakThemeEngine {
    saveTheme: (theme: Record<string, unknown>) => Promise<void>;
    getThemes: () => Promise<Record<string, unknown>[]>;
    deleteTheme: (id: string) => Promise<void>;
}

export interface ISarakEngines {
    auth?: ISarakAuthEngine;
    translator?: ISarakTranslatorEngine;
    theme?: ISarakThemeEngine;
}

export interface SarakModule {
    id: string;
    label: string;
    icon?: string;
    category?: string;
    priority?: number;
    badge?: string;
    isTool?: boolean;
    description?: string;
    subItems?: Array<{ 
        id: string; 
        label: string; 
        icon?: string;
        component?: React.ReactNode | React.ComponentType;
    }>;
    component?: React.ReactNode | React.ComponentType;
}
