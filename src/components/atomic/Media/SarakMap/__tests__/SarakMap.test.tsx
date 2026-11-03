import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SarakMap } from '../SarakMap';

describe('SarakMap (fronteira lazy)', () => {
    it('mostra o carregamento e depois o mapa', async () => {
        render(<SarakMap attribution="© teste" center={{ lat: 0, lng: 0 }} zoom={2} tileUrl="https://tiles.example/{z}/{x}/{y}.png" />);
        expect(screen.getByRole('status').textContent).toContain('Carregando');
        await waitFor(() => expect(screen.getByRole('group', { name: 'Mapa' })).toBeTruthy());
    });
});
