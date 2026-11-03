/**
 * SarakSignaturePad — campo de assinatura em canvas próprio, sem dependência. Mouse, toque e caneta
 * entram pelos eventos de ponteiro; limpar e desfazer o último traço; devolve o PNG e os traços.
 * Alternativa acessível: digitar o nome (o nome também vira PNG). Estilo só por token.
 *
 * ⚠️ Não tem validade jurídica por si: a peça entrega imagem e traços, e quem registra data, autor,
 * origem e prova da assinatura é o sistema do consumidor.
 */

import React, { useRef, useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakInput } from '../SarakInput';
import {
    exportSignaturePng,
    paintStrokes,
    paintTypedName,
    pointFromEvent,
    type SarakSignatureStroke,
} from './signatureCanvas';
import { useCanvasSync } from './useCanvasSync';

const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 180;
const GAP_SM = 'var(--sarak-layout-gap-sm, 8px)';

export interface SarakSignatureValue {
    /** Imagem PNG (data URL) da assinatura. Vazio se o ambiente não desenha. */
    png: string;
    /** Traços desenhados; vazio quando a assinatura foi digitada. */
    strokes: SarakSignatureStroke[];
    /** Nome digitado, quando a alternativa acessível foi usada. */
    typedName?: string;
}

export interface SarakSignaturePadProps {
    /** Chamado a cada mudança com a assinatura, ou `null` quando ficou vazia. */
    onChange: (value: SarakSignatureValue | null) => void;
    /** Largura do desenho em px. Omitido, `480`. */
    width?: number;
    /** Altura do desenho em px. Omitido, `180`. */
    height?: number;
    /** Nome acessível da área de assinatura. */
    label?: string;
    disabled?: boolean;
    className?: string;
}

export function SarakSignaturePad({ onChange, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, label, disabled = false, className }: SarakSignaturePadProps): React.ReactElement {
    const text = useLibraryText();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const active = useRef(false);
    const strokesRef = useRef<SarakSignatureStroke[]>([]);
    const [strokes, setStrokes] = useState<SarakSignatureStroke[]>([]);
    const [typing, setTyping] = useState(false);
    const [typedName, setTypedName] = useState('');

    useCanvasSync(canvasRef, strokes, typing, typedName);

    const report = (nextStrokes: SarakSignatureStroke[], name: string, isTyping: boolean): void => {
        const canvas = canvasRef.current;
        const empty = isTyping ? name.trim() === '' : nextStrokes.length === 0;
        if (empty || !canvas) { onChange(null); return; }
        // O PNG sai de uma tela à parte, sempre com tinta escura: o canvas visível usa a cor do tema.
        const png = exportSignaturePng(canvas, (target, ink) => (isTyping ? paintTypedName(target, name, ink) : paintStrokes(target, nextStrokes, ink)));
        onChange(isTyping ? { png, strokes: [], typedName: name } : { png, strokes: nextStrokes });
    };

    // O ref guarda os traços do gesto em andamento: o relatório ao soltar lê o valor mais novo, sem efeito dentro de `setState`.
    const store = (next: SarakSignatureStroke[]): void => { strokesRef.current = next; setStrokes(next); };
    const update = (next: SarakSignatureStroke[]): void => { store(next); report(next, '', false); };

    const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>): void => {
        if (disabled) return;
        active.current = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        const start = pointFromEvent(event.currentTarget, event.clientX, event.clientY);
        store([...strokesRef.current, [start]]);
    };
    const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>): void => {
        if (!active.current) return;
        const point = pointFromEvent(event.currentTarget, event.clientX, event.clientY);
        store([...strokesRef.current.slice(0, -1), [...(strokesRef.current.at(-1) ?? []), point]]);
    };
    const onPointerEnd = (): void => {
        if (!active.current) return;
        active.current = false;
        report(strokesRef.current, '', false);
    };

    const toggleTyping = (): void => {
        const next = !typing;
        setTyping(next);
        report(strokes, typedName, next);
    };

    return (
        <div className={className} data-sarak-signature-pad="true" style={{ display: 'flex', flexDirection: 'column', gap: GAP_SM, maxWidth: '100%' }}>
            {typing && (
                <SarakInput
                    aria-label={text('signatureTypedLabel')}
                    placeholder={text('signatureTypedLabel')}
                    value={typedName}
                    disabled={disabled}
                    fullWidth
                    onChange={(event) => { setTypedName(event.target.value); report(strokes, event.target.value, true); }}
                />
            )}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                role="img"
                aria-label={label ?? text('signatureAriaLabel')}
                onPointerDown={typing ? undefined : onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                style={{ width: '100%', maxWidth: width, height: 'auto', aspectRatio: `${width} / ${height}`, touchAction: 'none', cursor: disabled || typing ? 'default' : 'crosshair', color: 'var(--sarak-text-main, currentColor)', background: 'var(--color-theme-card, transparent)', border: 'var(--sarak-border-width, 1px) solid var(--border-color, currentColor)', borderRadius: 'var(--sarak-card-radius, 10px)' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: GAP_SM }}>
                <SarakButton type="button" disabled={disabled || typing || strokes.length === 0} onClick={() => update(strokes.slice(0, -1))}>{text('signatureUndo')}</SarakButton>
                <SarakButton type="button" disabled={disabled || (typing ? typedName === '' : strokes.length === 0)} onClick={() => { if (typing) { setTypedName(''); report(strokes, '', true); } else update([]); }}>{text('signatureClear')}</SarakButton>
                <SarakButton type="button" disabled={disabled} onClick={toggleTyping}>{typing ? text('signatureDrawInstead') : text('signatureTypeInstead')}</SarakButton>
            </div>
        </div>
    );
}

export default SarakSignaturePad;
