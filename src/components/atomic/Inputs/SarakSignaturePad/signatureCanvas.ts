/**
 * Desenho e exportação do campo de assinatura: só a parte que fala com o `<canvas>`, sem React.
 * No jsdom o canvas não tem contexto; todas as funções aceitam isso e devolvem vazio.
 */

/** Ponto de um traço, em px do canvas. */
export interface SarakSignaturePoint {
    x: number;
    y: number;
}

/** Um traço: do toque do ponteiro até soltá-lo. */
export type SarakSignatureStroke = SarakSignaturePoint[];

export const SIGNATURE_LINE_WIDTH = 2.5;
const TYPED_FONT_SIZE_RATIO = 0.4;
const TYPED_FONT_FAMILY = 'cursive, serif';

/**
 * Tinta do PNG devolvido: sempre escura. A imagem vai para um documento de fundo claro; a tinta do tema, que em
 * tema escuro é clara, sairia invisível no papel. A tela continua usando a cor do tema.
 */
export const SIGNATURE_EXPORT_INK = 'rgb(0, 0, 0)';

/** Cor do traço na tela: a `color` do próprio canvas, que herda do tema; `ink` a substitui. */
const strokeColor = (canvas: HTMLCanvasElement, ink?: string): string => ink ?? (getComputedStyle(canvas).color || 'currentColor');

/** Limpa o canvas e redesenha os traços, ligando os pontos com linhas arredondadas (um ponto só vira um toque). */
export function paintStrokes(canvas: HTMLCanvasElement, strokes: readonly SarakSignatureStroke[], ink?: string): void {
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = strokeColor(canvas, ink);
    context.fillStyle = context.strokeStyle;
    context.lineWidth = SIGNATURE_LINE_WIDTH;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    strokes.forEach((stroke) => {
        if (stroke.length === 0) return;
        if (stroke.length === 1) {
            context.beginPath();
            context.arc(stroke[0].x, stroke[0].y, SIGNATURE_LINE_WIDTH / 2, 0, Math.PI * 2);
            context.fill();
            return;
        }
        context.beginPath();
        context.moveTo(stroke[0].x, stroke[0].y);
        stroke.slice(1).forEach((point) => context.lineTo(point.x, point.y));
        context.stroke();
    });
}

/** Escreve o nome digitado no canvas, centrado, para que a alternativa acessível também devolva imagem. */
export function paintTypedName(canvas: HTMLCanvasElement, name: string, ink?: string): void {
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!name) return;
    context.fillStyle = strokeColor(canvas, ink);
    context.font = `${Math.round(canvas.height * TYPED_FONT_SIZE_RATIO)}px ${TYPED_FONT_FAMILY}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, canvas.width / 2, canvas.height / 2, canvas.width);
}

/** PNG da assinatura, desenhada de novo numa tela à parte com a tinta escura; vazio quando o ambiente não desenha. */
export function exportSignaturePng(source: HTMLCanvasElement, paint: (target: HTMLCanvasElement, ink: string) => void): string {
    const target = document.createElement('canvas');
    target.width = source.width;
    target.height = source.height;
    paint(target, SIGNATURE_EXPORT_INK);
    return canvasToPng(target);
}

/** PNG (data URL) do canvas; vazio quando o ambiente não desenha. */
export function canvasToPng(canvas: HTMLCanvasElement): string {
    try {
        return canvas.toDataURL('image/png') || '';
    } catch {
        return '';
    }
}

/** Ponto do evento em px do canvas, corrigindo a escala entre o tamanho na tela e o do desenho. */
export function pointFromEvent(canvas: HTMLCanvasElement, clientX: number, clientY: number): SarakSignaturePoint {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}
