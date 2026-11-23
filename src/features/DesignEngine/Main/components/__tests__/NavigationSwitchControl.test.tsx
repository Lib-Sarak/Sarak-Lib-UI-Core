import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { NavigationSwitchControl } from '../NavigationSwitchControl';

const renderSwitch = (position: string | undefined) => {
    const updateDraft = vi.fn();
    render(
        <SarakUIProvider>
            <NavigationSwitchControl draft={{ preferenceNavigationStylePosition: position }} updateDraft={updateDraft} />
        </SarakUIProvider>,
    );
    return updateDraft;
};

describe('NavigationSwitchControl — o usuário pode trocar entre lateral e topo', () => {
    it.each(['menu', 'pinned'])('com a posição %s o interruptor está ligado, e desligar grava `off`', (position) => {
        const updateDraft = renderSwitch(position);
        const toggle = screen.getByRole('switch');
        expect(toggle).toBeChecked();
        fireEvent.click(toggle);
        expect(updateDraft).toHaveBeenCalledTimes(1);
        expect(updateDraft).toHaveBeenCalledWith('preferenceNavigationStylePosition', 'off');
    });

    it('com a posição `off` está desligado, e ligar grava o padrão do token (o menu ⚙)', () => {
        const updateDraft = renderSwitch('off');
        const toggle = screen.getByRole('switch');
        expect(toggle).not.toBeChecked();
        fireEvent.click(toggle);
        expect(updateDraft).toHaveBeenCalledWith('preferenceNavigationStylePosition', 'menu');
    });

    it('diz o que o desligado faz: a escolha some e a preferência gravada deixa de valer', () => {
        renderSwitch('menu');
        expect(screen.getByTestId('bar-switch')).toHaveTextContent('a escolha que o usuário já gravou no navegador deixa de valer');
    });
});
