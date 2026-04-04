export * from '@sarak/lib-shared';
import React, { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

declare const ThemeToggle: React.FC;

interface ExpandableCardProps {
    title: string;
    iconContent?: React.ReactNode;
    helpButton?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    baseHeight?: number;
}
declare const ExpandableCard: React.FC<ExpandableCardProps>;

declare const LanguageSelector: () => react_jsx_runtime.JSX.Element;
declare const UserMenu: ({ user, onPasswordModal, onLogout }: {
    user: any;
    onPasswordModal: () => void;
    onLogout: () => void;
}) => react_jsx_runtime.JSX.Element;
declare const ModuleSelector: ({ currentModule, setCurrentModule, modules }: {
    currentModule: string;
    setCurrentModule: (id: string) => void;
    modules: any[];
}) => react_jsx_runtime.JSX.Element;

interface SarakShellProps {
    children?: ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
}
/**
 * Elite SarakShell (v5.2) — Motor de Interface Modular
 * Responsável por renderizar a navegação categorizada e injetar os tokens de design.
 */
declare const SarakShell: React.FC<SarakShellProps>;

/**
 * CustomizationPanel — Gerenciador de Estética do Sarak Matrix.
 * Fornece a interface para troca de temas, branding e customização de cores.
 */
declare const CustomizationPanel: React.FC;

export { CustomizationPanel, ExpandableCard, LanguageSelector, ModuleSelector, SarakShell, ThemeToggle, UserMenu };
