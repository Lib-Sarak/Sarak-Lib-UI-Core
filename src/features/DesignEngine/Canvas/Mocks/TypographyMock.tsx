import React from 'react';

export const MockTypography: React.FC<any> = ({ tokens }) => {
    return (
        <div className="space-y-8 max-w-2xl">
            <header>
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-primary)] mb-2">Typography Engine</div>
                <h1 style={{ fontSize: 'calc(var(--theme-font-size-base) * 2.5)', fontWeight: 'var(--heading-weight)', letterSpacing: 'var(--heading-spacing)', fontFamily: 'var(--font-heading)' }} className="text-[var(--theme-title)]">The quick brown fox</h1>
            </header>

            <div className="space-y-6">
                <section>
                    <h2 style={{ fontSize: 'calc(var(--theme-font-size-base) * 1.8)', fontWeight: 'var(--heading-weight)', fontFamily: 'var(--font-heading)' }} className="text-[var(--theme-title)] mb-3">Heading Scale 02</h2>
                    <p style={{ fontSize: 'var(--theme-font-size-base)', fontFamily: 'var(--font-main)' }} className="text-[var(--theme-main)] leading-relaxed">
                        Soberania visual não é apenas sobre cores, é sobre a harmonia entre geometria e tipografia. 
                        Este parágrafo demonstra a legibilidade da fonte principal sob a escala <span className="text-[var(--theme-primary)] font-bold">{tokens.fontScale || 'm'}</span>.
                    </p>
                </section>

                <section className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 style={{ fontSize: 'calc(var(--theme-font-size-base) * 1.2)', fontWeight: 'var(--heading-weight)', fontFamily: 'var(--font-subtitle, var(--font-heading))' }} className="text-[var(--theme-title)] mb-2">Subtitle Font</h3>
                        <p className="text-[var(--theme-muted)] text-[11px]">Utilizada em labels, sub-cabeçalhos e metadados auxiliares.</p>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 'calc(var(--theme-font-size-base) * 1.2)', fontWeight: 'var(--heading-weight)', fontFamily: 'var(--font-tab, var(--font-heading))' }} className="text-[var(--theme-title)] mb-2">Tab Font</h3>
                        <p className="text-[var(--theme-muted)] text-[11px]">Otimizada para navegação e elementos de interface interativos.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};
