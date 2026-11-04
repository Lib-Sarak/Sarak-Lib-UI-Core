import React, { useMemo } from 'react';
import QRCode from 'qrcode';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakOptionalPeerFallback } from '../../Feedback/SarakOptionalPeerFallback';

export interface SarakQRCodeProps {
    /** Texto codificado no QR (um endereço, um segredo de MFA). */
    value: string;
    /** Lado do desenho (número em px ou comprimento CSS); omitido, 12 vezes o espaçamento médio do tema. */
    size?: number | string;
    /** Redundância contra sujeira e corte: de `L` (menor QR) a `H` (mais robusto). Omitido, `M`. */
    errorCorrection?: 'L' | 'M' | 'Q' | 'H';
    /** Cor dos módulos; omitida, preto. Escâner lê escuro sobre claro, por isso o par não segue o tema. */
    foreground?: string;
    /** Cor do fundo e da margem; omitida, branco. */
    background?: string;
    /** Nome acessível; omitido, usa o catálogo no idioma ativo. */
    ariaLabel?: string;
    className?: string;
}

const OPTIONAL_QR_PEER = ['qrcode'] as const;
const QUIET_ZONE_MODULES = 4;
const SIZE_MULTIPLIER = 12;
// sarak-allow-fixed-color: par escuro/claro do QR, independente do tema, para o escâner ler.
// sarak-allow-hardcode: o QR é lido por escâner, que exige escuro sobre claro em qualquer tema — par funcional, não identidade.
const DEFAULT_FOREGROUND = '#000000';
// sarak-allow-fixed-color: ver DEFAULT_FOREGROUND.
// sarak-allow-hardcode: ver DEFAULT_FOREGROUND.
const DEFAULT_BACKGROUND = '#ffffff';

interface QrMatrix { size: number; data: ArrayLike<number> }

const hasQrPeer = (): boolean => typeof (QRCode as { create?: unknown } | undefined)?.create === 'function';

const buildMatrix = (value: string, level: string): QrMatrix | null => {
    try {
        return QRCode.create(value, { errorCorrectionLevel: level }).modules as QrMatrix;
    } catch {
        return null;
    }
};

const darkModulesPath = ({ size, data }: QrMatrix): string => {
    let path = '';
    for (let row = 0; row < size; row += 1) {
        for (let column = 0; column < size; column += 1) {
            if (data[row * size + column]) path += `M${column + QUIET_ZONE_MODULES} ${row + QUIET_ZONE_MODULES}h1v1h-1z`;
        }
    }
    return path;
};

function SarakQRCodeContent({
    value, size, errorCorrection = 'M', foreground = DEFAULT_FOREGROUND, background = DEFAULT_BACKGROUND, ariaLabel, className,
}: SarakQRCodeProps): React.ReactElement | null {
    const text = useLibraryText();
    const matrix = useMemo(() => buildMatrix(value, errorCorrection), [value, errorCorrection]);
    if (!matrix) return null;
    const side = size ?? `calc(var(--sarak-layout-gap-md, 16px) * ${SIZE_MULTIPLIER})`;
    const extent = matrix.size + 2 * QUIET_ZONE_MODULES;
    return (
        <svg
            role="img" aria-label={ariaLabel ?? text('qrCodeAriaLabel')} className={className} viewBox={`0 0 ${extent} ${extent}`}
            shapeRendering="crispEdges" style={{ inlineSize: side, blockSize: side }}
        >
            <rect width={extent} height={extent} fill={background} />
            <path d={darkModulesPath(matrix)} fill={foreground} />
        </svg>
    );
}

/** QR desenhado em SVG pelo peer opcional `qrcode`; sem o peer, mostra o aviso da lib no lugar. */
export default function SarakQRCode(props: SarakQRCodeProps): React.ReactElement | null {
    if (!hasQrPeer()) return <SarakOptionalPeerFallback component="SarakQRCode" packages={OPTIONAL_QR_PEER} />;
    return <SarakQRCodeContent {...props} />;
}
