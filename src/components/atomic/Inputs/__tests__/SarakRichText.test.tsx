import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakRichText, sarakSanitizeRichText } from '../SarakRichText';

describe('Spec 11 (Onda 10) — SarakRichText: saída blindada', () => {
    it('neutraliza script/style/handlers/javascript: preservando marcação semântica', () => {
        expect(sarakSanitizeRichText('<b>oi</b><script>alert(1)</script>')).not.toMatch(/script|alert/i);
        expect(sarakSanitizeRichText('<b>oi</b><script>x</script>')).toContain('<b>oi</b>');
        expect(sarakSanitizeRichText('<img src=x onerror=alert(1)>')).not.toMatch(/onerror|alert/i);
        expect(sarakSanitizeRichText('<a href="javascript:alert(1)">x</a>')).not.toMatch(/javascript:/i);
        expect(sarakSanitizeRichText('<style>body{color:red}</style>texto')).not.toMatch(/<style/i);
    });

    it('emite o HTML JÁ sanitizado no onChange (digitação)', () => {
        const onChange = vi.fn();
        render(<SarakRichText onChange={onChange} placeholder="Escreva…" />);
        const editor = screen.getByRole('textbox');

        editor.innerHTML = '<b>seguro</b><script>alert(1)</script>';
        fireEvent.input(editor);

        expect(onChange).toHaveBeenCalled();
        const emitted = onChange.mock.calls.at(-1)![0] as string;
        expect(emitted).toContain('<b>seguro</b>');
        expect(emitted).not.toMatch(/script|alert/i);
    });

    it('semeia o conteúdo inicial sanitizado a partir de value', () => {
        render(<SarakRichText value="<b>inicial</b><script>x</script>" />);
        const editor = screen.getByRole('textbox');
        expect(editor.innerHTML).toContain('<b>inicial</b>');
        expect(editor.innerHTML).not.toMatch(/script/i);
    });
});

describe('Erro de campo pelo SarakFieldError', () => {
    it('com `error`, há um role="alert" com o texto e o controle o referencia', () => {
        render(<SarakRichText error="Campo obrigatório" />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Campo obrigatório');
        expect(alert.querySelector('svg')).not.toBeNull();
        expect(alert.id).toMatch(/-error$/);
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', alert.id);
    });

    it('sem `error`, nada é renderizado', () => {
        render(<SarakRichText />);
        expect(screen.queryByRole('alert')).toBeNull();
    });
});
