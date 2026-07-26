/**
 * TEMPLATE — um componente SEU, temável pela central.
 *
 * A regra única: estilize por `var(--sarak-*)`, sempre com fallback. É isso — e só
 * isso — que faz o Design Engine alcançar um componente que a biblioteca não conhece.
 *
 * Marcação com valor cru (`#3b82f6`, `16px`) funciona hoje e fica FORA da central
 * para sempre: a tela vira órfã do tema em silêncio, e ninguém descobre até alguém
 * trocar o tema.
 *
 * Os nomes REAIS de token estão em `sarak-ui/catalog.json` → `tokens.cssVars`. Nome
 * fora dessa lista não existe: a var não resolve e o fallback fica valendo eternamente.
 */
import React from 'react';

export interface MeuPainelProps {
    titulo: string;
    /** Realce opcional: reaponta o fundo para OUTRO token do tema — continua temável. */
    destacado?: boolean;
    children: React.ReactNode;
}

export function MeuPainel({ titulo, destacado = false, children }: MeuPainelProps) {
    return (
        <section
            style={{
                // Cor, raio, espaçamento e fonte: todos por token. Trocar o tema
                // (ou o "template" compacto/espaçoso) repinta este componente junto.
                background: destacado ? 'var(--sarak-accent-color, transparent)' : 'var(--sarak-card-bg, transparent)',
                border: 'var(--sarak-card-border, none)',
                borderRadius: 'var(--sarak-card-radius, 8px)',
                padding: 'var(--sarak-card-padding-md, 16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sarak-layout-gap-sm, 8px)',
            }}
        >
            <h2
                style={{
                    color: 'var(--sarak-title-color, inherit)',
                    fontFamily: 'var(--sarak-heading-font, inherit)',
                }}
            >
                {titulo}
            </h2>
            {/* Texto comum HERDA a cor do escopo pintado pelo Provider — não force. */}
            {children}
        </section>
    );
}

/**
 * PERSONALIZAÇÃO PONTUAL, sem tocar no componente — a escada do GUIA-FRONTEND.md §3.3.
 * Sobrescrever o TOKEN localmente é o degrau 2: o elemento passa a seguir OUTRO token
 * do tema, em vez de sair do tema.
 *
 *   <div style={{ ['--sarak-card-bg' as string]: 'var(--sarak-surface-color)' }}>
 *     <MeuPainel titulo="Só este fica diferente">…</MeuPainel>
 *   </div>
 *
 * Régua: UM lugar = sobrescrita local, sem culpa. O MESMO override repetido em muitos
 * lugares = variação faltando → vire uma prop (como `destacado` acima) ou abra demanda.
 *
 * COMPONENTE PESADO (gráfico, editor, visualizador)? Coloque-o atrás de `React.lazy` +
 * `import()`, como a biblioteca faz com os dela — é o que mantém o carregamento inicial
 * pequeno para quem nem abre essa tela.
 */
