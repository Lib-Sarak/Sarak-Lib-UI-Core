/**
 * SarakMarkdownRenderer (Spec 15, Regra 1) — implementação pesada (lazy).
 *
 * Ingere Markdown cru e o renderiza como elementos estilizados pelos tokens Sarak
 * (`[--sarak-*]`), com highlight de código atrelado ao modo (dark/light) do tema.
 * Segurança (Spec 40): NÃO usa `dangerouslySetInnerHTML` nem `rehype-raw` — HTML cru
 * no Markdown é tratado como texto literal (não executado); URLs passam por uma
 * allowlist de esquemas seguros (`javascript:`/`data:` viram href vazio).
 *
 * A dependência pesada (`react-markdown` + `react-syntax-highlighter`) vive AQUI; o
 * `index.ts` exporta isto via `React.lazy`, mantendo-a fora do entry de quem não a usa.
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';

export interface SarakMarkdownRendererProps {
    /** String de Markdown cru a renderizar. */
    content: string;
    className?: string;
}

/** Allowlist de esquemas de URL seguros (Spec 40): bloqueia `javascript:`/`data:`. */
const SAFE_URL = /^(https?:|mailto:|tel:|#|\/)/i;
const safeUrl = (url: string): string => (SAFE_URL.test(url) ? url : '');

/** Props que o react-markdown passa a um renderer: atributos da tag + `node` (descartado). */
type MdProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & { node?: unknown };

type MarkdownComponents = React.ComponentProps<typeof ReactMarkdown>['components'];

const SarakMarkdownRendererImpl: React.FC<SarakMarkdownRendererProps> = ({ content, className = '' }) => {
    const { design } = useSarakUI();
    const isDark = (design?.mode ?? 'dark') !== 'light';
    const codeStyle = isDark ? oneDark : oneLight;

    const mb3 = { marginBottom: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)' };
    const mb2 = { marginBottom: 'var(--sarak-layout-gap-sm, 8px)' };
    const cellPad = { paddingInline: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)', paddingBlock: 'var(--sarak-layout-gap-sm, 8px)' };

    const components: MarkdownComponents = {
        h1: ({ node: _n, ...p }: MdProps<'h1'>) => <h1 className="text-2xl font-bold text-[var(--sarak-text-main,#ffffff)]" style={mb3} {...p} />,
        h2: ({ node: _n, ...p }: MdProps<'h2'>) => <h2 className="text-xl font-bold text-[var(--sarak-text-main,#ffffff)]" style={mb2} {...p} />,
        h3: ({ node: _n, ...p }: MdProps<'h3'>) => <h3 className="text-lg font-semibold text-[var(--sarak-text-main,#ffffff)]" style={mb2} {...p} />,
        p: ({ node: _n, ...p }: MdProps<'p'>) => <p className="leading-relaxed text-[var(--text-muted,#94a3b8)]" style={mb3} {...p} />,
        a: ({ node: _n, ...p }: MdProps<'a'>) => <a className="text-[var(--sarak-primary-color,#3b82f6)] underline" {...p} />,
        ul: ({ node: _n, ...p }: MdProps<'ul'>) => <ul className="list-disc text-[var(--text-muted,#94a3b8)]" style={{ ...mb3, paddingLeft: 'var(--sarak-layout-gap-lg, 24px)' }} {...p} />,
        ol: ({ node: _n, ...p }: MdProps<'ol'>) => <ol className="list-decimal text-[var(--text-muted,#94a3b8)]" style={{ ...mb3, paddingLeft: 'var(--sarak-layout-gap-lg, 24px)' }} {...p} />,
        blockquote: ({ node: _n, ...p }: MdProps<'blockquote'>) => (
            <blockquote className="border-l-2 border-[var(--sarak-primary-color,#3b82f6)] italic text-[var(--text-muted,#94a3b8)]" style={{ ...mb3, paddingLeft: 'var(--sarak-layout-gap-md, 16px)' }} {...p} />
        ),
        table: ({ node: _n, ...p }: MdProps<'table'>) => (
            <div className="overflow-x-auto" style={mb3}>
                <table className="w-full border-collapse text-sm text-[var(--text-muted,#94a3b8)]" {...p} />
            </div>
        ),
        th: ({ node: _n, ...p }: MdProps<'th'>) => <th className="border border-[var(--border-color,#334155)] text-left font-semibold" style={cellPad} {...p} />,
        td: ({ node: _n, ...p }: MdProps<'td'>) => <td className="border border-[var(--border-color,#334155)]" style={cellPad} {...p} />,
        // Imagem larga nunca deforma o layout (Critério E2E: max-width 100%).
        img: ({ node: _n, alt, ...p }: MdProps<'img'>) => <img className="max-w-full h-auto rounded-md" alt={alt ?? ''} {...p} />,
        // `<pre>` vira fragmento para o highlighter (PreTag="div") não aninhar em `<pre>`.
        pre: ({ children }: MdProps<'pre'>) => <>{children}</>,
        code: ({ node: _n, className: cls, children }: MdProps<'code'>) => {
            const match = /language-(\w+)/.exec(cls ?? '');
            const text = String(children).replace(/\n$/, '');
            if (match) {
                return (
                    <SyntaxHighlighter language={match[1]} style={codeStyle} customStyle={mb3} PreTag="div" className="rounded-md text-sm">
                        {text}
                    </SyntaxHighlighter>
                );
            }
            return (
                <code
                    className="rounded bg-[var(--color-theme-card,#1e293b)] text-[var(--sarak-primary-color,#3b82f6)] text-sm"
                    style={{ paddingInline: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)', paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.125)' }}
                >
                    {children}
                </code>
            );
        },
    };

    return (
        <div className={`sarak-markdown ${className}`} data-mode={isDark ? 'dark' : 'light'}>
            <ReactMarkdown urlTransform={safeUrl} components={components}>
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default SarakMarkdownRendererImpl;
