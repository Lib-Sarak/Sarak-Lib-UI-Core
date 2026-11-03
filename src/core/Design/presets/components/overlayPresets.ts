import type { ComponentPreset } from './cards';

/** Janela modal: cabeçalho, alinhamento das ações, desfoque do fundo e cantos. */
export const MODAL_PRESETS: ComponentPreset[] = [
    {
        id: 'modal-classic',
        name: 'Clássica',
        description: 'Título na linha de cima, ações à direita e o fundo levemente desfocado.',
        keywords: ['classica', 'classic', 'padrao', 'dialogo'],
        design: { modalHeaderStyle: 'inline', modalActionAlignment: 'right', modalOverlayBlur: 8, modalBorderRadius: 16 },
    },
    {
        id: 'modal-stacked-center',
        name: 'Centralizada',
        description: 'Título empilhado, ações no centro e cantos bem redondos: tom de confirmação.',
        keywords: ['centro', 'center', 'confirmacao', 'empilhada'],
        design: { modalHeaderStyle: 'stacked', modalActionAlignment: 'center', modalOverlayBlur: 14, modalBorderRadius: 28 },
    },
    {
        id: 'modal-floating-sharp',
        name: 'Flutuante e reta',
        description: 'Título solto sobre a janela, botões esticados e cantos retos, sem desfoque.',
        keywords: ['flutuante', 'floating', 'reta', 'tecnica'],
        design: { modalHeaderStyle: 'floating', modalActionAlignment: 'stretch', modalOverlayBlur: 0, modalBorderRadius: 4 },
    },
    {
        id: 'modal-frosted-backdrop',
        name: 'Fundo de vidro',
        description: 'Desfoque forte atrás da janela, que isola o foco do resto da tela.',
        keywords: ['vidro', 'blur', 'desfoque', 'foco'],
        design: { modalHeaderStyle: 'inline', modalActionAlignment: 'left', modalOverlayBlur: 32, modalBorderRadius: 20 },
    },
];

/** Dicas e avisos: canto da dica e largura da faixa de destaque do aviso. */
export const NOTICE_PRESETS: ComponentPreset[] = [
    {
        id: 'notice-sharp',
        name: 'Reta e sem faixa',
        description: 'Dica de cantos retos e aviso sem faixa de destaque.',
        keywords: ['reta', 'sharp', 'quadrada', 'sem faixa'],
        design: { tooltipRadius: 0, toastAccentWidth: 0 },
    },
    {
        id: 'notice-soft',
        name: 'Suave',
        description: 'Dica de cantos médios e aviso com faixa fina.',
        keywords: ['suave', 'soft', 'padrao', 'faixa'],
        design: { tooltipRadius: 6, toastAccentWidth: 4 },
    },
    {
        id: 'notice-round',
        name: 'Redonda e marcada',
        description: 'Dica arredondada e aviso com faixa grossa de destaque.',
        keywords: ['redonda', 'round', 'marcada', 'faixa grossa'],
        design: { tooltipRadius: 12, toastAccentWidth: 10 },
    },
];

/** Interruptor: uma opção de `switchStyleType` por preset (o de vidro leva também o desfoque). */
export const SWITCH_PRESETS: ComponentPreset[] = [
    { id: 'switch-tactile', name: 'Tátil', description: 'Interruptor com relevo, como uma chave física.', keywords: ['tatil', 'tactile', 'relevo', 'fisico'], design: { switchStyleType: 'tactile' } },
    { id: 'switch-asymmetric', name: 'Assimétrico', description: 'Trilho e botão com formas diferentes entre si.', keywords: ['assimetrico', 'asymmetric', 'diferente'], design: { switchStyleType: 'asymmetric' } },
    { id: 'switch-pulsing', name: 'Pulsante', description: 'Um pulso suave marca quando está ligado.', keywords: ['pulsante', 'pulsing', 'pulso', 'animado'], design: { switchStyleType: 'pulsing' } },
    { id: 'switch-glass', name: 'Vidro', description: 'Trilho translúcido com desfoque por trás.', keywords: ['vidro', 'glass', 'translucido'], design: { switchStyleType: 'glass', switchBackdropBlur: 12 } },
];
