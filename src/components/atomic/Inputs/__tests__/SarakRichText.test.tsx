import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakRichText, sanitizeRichText } from '../SarakRichText';

describe('Spec 11 (Onda 10) — SarakRichText: saída blindada', () => {
    it('neutraliza script/style/handlers/javascript: preservando marcação semântica', () => {
        expect(sanitizeRichText('<b>oi</b><script>alert(1)</script>')).not.toMatch(/script|alert/i);
        expect(sanitizeRichText('<b>oi</b><script>x</script>')).toContain('<b>oi</b>');
        expect(sanitizeRichText('<img src=x onerror=alert(1)>')).not.toMatch(/onerror|alert/i);
        expect(sanitizeRichText('<a href="javascript:alert(1)">x</a>')).not.toMatch(/javascript:/i);
        expect(sanitizeRichText('<style>body{color:red}</style>texto')).not.toMatch(/<style/i);
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
