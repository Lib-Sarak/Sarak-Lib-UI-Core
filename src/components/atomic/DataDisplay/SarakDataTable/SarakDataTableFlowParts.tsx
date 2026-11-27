import type { CSSProperties, ReactElement, ReactNode } from 'react';

/**
 * Tabela no fluxo (relatório e impressão): a folha e suas partes são elementos nativos de tabela porque o
 * Chromium só repete o cabeçalho no topo de cada folha impressa para um `<thead>` de verdade, e só não parte
 * a linha entre duas folhas numa linha de tabela. Na tela eles se comportam como blocos, sem o estilo do
 * navegador para tabela; o `_print.css` devolve o comportamento de tabela apenas no papel.
 */
const PART: CSSProperties = { display: 'block', padding: 0, border: 0, font: 'inherit', textAlign: 'inherit', fontWeight: 'inherit' };

/** A folha da tabela: `<table>` no fluxo, `<div>` na janela virtual. O papel de tabela é do elemento de fora; as partes nativas são apresentacionais, e as linhas e células de verdade são as `role` de dentro. */
export const SarakDataTableSheet = ({ flow, style, children }: { flow: boolean; style: CSSProperties; children: ReactNode }): ReactElement =>
    flow ? <table role="presentation" style={{ ...PART, ...style }}>{children}</table> : <div style={style}>{children}</div>;

/** O cabeçalho que o papel repete em cada folha. */
export const SarakDataTableFlowHead = ({ children }: { children: ReactNode }): ReactElement => (
    <thead role="presentation" data-sarak-table-head="true" style={PART}><tr role="presentation" style={PART}><td role="presentation" style={PART}>{children}</td></tr></thead>
);

/** O corpo da tabela no fluxo: linhas e rodapé. */
export const SarakDataTableFlowBody = ({ children }: { children: ReactNode }): ReactElement => <tbody role="presentation" style={PART}>{children}</tbody>;

/** Uma linha (ou o rodapé) no fluxo: linha de tabela que o papel não parte entre duas folhas. */
export const SarakDataTableFlowRow = ({ children }: { children: ReactNode }): ReactElement => (
    <tr role="presentation" data-sarak-print-row="true" style={PART}><td role="presentation" style={PART}>{children}</td></tr>
);
