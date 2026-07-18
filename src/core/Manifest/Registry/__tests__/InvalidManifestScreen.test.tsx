import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
    SarakMissingManifestScreen,
    SarakInvalidManifestScreen,
} from '../InvalidManifestScreen';
import type { ManifestValidationError } from '../../validateNode';

describe('Telas DX da raiz (Spec 17, §2.2)', () => {
    it('tela de manifesto ausente instrui a passar `payload` + template', () => {
        const { container } = render(<SarakMissingManifestScreen />);
        expect(screen.getByText('Manifesto não fornecido')).toBeInTheDocument();
        expect(container.textContent).toContain('payload');
        expect(container.textContent).toContain('templates/app-starter.manifest.json');
        expect(container.querySelector('[data-sarak-missing-manifest="true"]')).not.toBeNull();
    });

    it('tela de manifesto inválido lista TODOS os erros com path', () => {
        const errors: ManifestValidationError[] = [
            { path: 'root', code: 'unsupported_schema_version', message: 'schemaVersion incompatível' },
            { path: 'root.children[1]', nodeId: 'btn', code: 'unknown_key', message: 'Chave desconhecida "acton"' },
        ];
        const { container } = render(<SarakInvalidManifestScreen errors={errors} />);

        expect(screen.getByText('Manifesto inválido')).toBeInTheDocument();
        const items = container.querySelectorAll('li');
        expect(items).toHaveLength(2);
        expect(container.textContent).toContain('root.children[1]');
        expect(container.textContent).toContain('schemaVersion incompatível');
        expect(container.textContent).toContain('Chave desconhecida "acton"');
        // Não reusa a semântica de "componente desconhecido".
        expect(screen.queryByText(/Componente desconhecido/)).not.toBeInTheDocument();
    });
});
