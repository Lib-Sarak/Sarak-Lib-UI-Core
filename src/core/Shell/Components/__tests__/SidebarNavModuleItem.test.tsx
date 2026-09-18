import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SidebarNavModuleItem } from '../SidebarNavModuleItem';
import { useLibraryText } from '../../../i18n/useLibraryText';
import { LIBRARY_TEXT_CATALOG, type SarakLibraryLanguage } from '../../../i18n/catalog';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';
import type { DiscoveredModule } from '../../../Discovery/types';

const makeT = (language: SarakLibraryLanguage = 'pt') =>
    ((key: keyof typeof LIBRARY_TEXT_CATALOG, vars?: Record<string, string>) => {
        const template = LIBRARY_TEXT_CATALOG[key][language];
        return vars ? Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), template) : template;
    }) as ReturnType<typeof useLibraryText>;

const mod: DiscoveredModule = { id: 'm1', label: 'Módulo 1', icon: 'Home', status: 'online' } as DiscoveredModule;

// `IconRenderer` → `SarakIcon` exige `useSarakUI()` (lança sem Provider).
const renderItem = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('SidebarNavModuleItem', () => {
    it('renderiza o rótulo e aciona onSelect ao clicar (módulo online)', () => {
        const onSelect = vi.fn();
        renderItem(<SidebarNavModuleItem mod={mod} isActive={false} effectiveIsNavHidden={false} onSelect={onSelect} t={makeT()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Módulo 1' }));
        expect(onSelect).toHaveBeenCalledWith('m1');
    });

    it('módulo offline: mostra o badge, o título traduzido e não dispara onSelect', () => {
        const onSelect = vi.fn();
        const offlineMod: DiscoveredModule = { ...mod, status: 'offline', error: 'timeout' } as DiscoveredModule;
        renderItem(<SidebarNavModuleItem mod={offlineMod} isActive={false} effectiveIsNavHidden={false} onSelect={onSelect} t={makeT()} />);
        expect(screen.getByText('Módulo offline')).toBeInTheDocument();
        const button = screen.getByTitle('Módulo offline: timeout');
        expect(button).toBeInTheDocument();
        fireEvent.click(button);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('módulo offline sem `error`: cai no erro genérico traduzido', () => {
        const offlineMod: DiscoveredModule = { ...mod, status: 'offline' } as DiscoveredModule;
        renderItem(<SidebarNavModuleItem mod={offlineMod} isActive={false} effectiveIsNavHidden={false} onSelect={vi.fn()} t={makeT('en')} />);
        expect(screen.getByTitle('Offline module: Connection error')).toBeInTheDocument();
    });

    it('colapsado: o badge offline some, o resto continua', () => {
        const offlineMod: DiscoveredModule = { ...mod, status: 'offline' } as DiscoveredModule;
        renderItem(<SidebarNavModuleItem mod={offlineMod} isActive={false} effectiveIsNavHidden onSelect={vi.fn()} t={makeT()} />);
        expect(screen.queryByText('Módulo offline')).not.toBeInTheDocument();
    });
});
