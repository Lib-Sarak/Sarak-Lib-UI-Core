import React from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakInput } from '../../../../components/atomic/Inputs/SarakInput';

interface TextMockProps {
    tokens: any;
    config: any;
    animationVariants: any;
    animationStyle: string;
}

export const MockText: React.FC<TextMockProps> = ({ tokens, animationVariants, animationStyle }) => {
    const [reportText, setReportText] = React.useState(
        `RELATÓRIO DE PERFORMANCE OPERACIONAL // SISTEMA SARAK UI\n` +
        `-----------------------------------------------------\n` +
        `Data de Auditoria: 2026-05-19T02:00:00Z\n` +
        `Servidor de Origem: Node-04-PR (Core Principal)\n` +
        `Status do Cluster: Otimizado / Sem Gargalos Detectados\n\n` +
        `1. COMPORTAMENTO DO GÊMEO DIGITAL\n` +
        `O motor de design atômico Sarak foi inicializado com sucesso nas subcamadas do sistema. ` +
        `Todos os espécimes visuais mapeados em tempo de execução renderizaram de forma reativa a partir das variáveis CSS declaradas. ` +
        `Não foram observados picos de CPU ou vazamento de memória durante a troca dinâmica de paletas ou escalas de arredondamento de borda.\n\n` +
        `2. MÉTRICAS DE INTERAÇÃO DO USUÁRIO\n` +
        `- Latência Média de Renderização: 14ms (Estável)\n` +
        `- Taxa de Sucesso na Gravação de Presets: 100%\n` +
        `- Tempo de Resposta da Interface sob Carga: 22ms\n\n` +
        `3. RECOMENDAÇÕES PARA PRÓXIMAS ATUALIZAÇÕES\n` +
        `Recomenda-se manter a paridade atômica 1:1 entre a folha de especificações (DESIGN.md) e as variáveis compiladas, ` +
        `evitando acoplamentos estáticos de layout. O design modular garante a portabilidade futura para microserviços.`
    );

    const [copied, setCopied] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(reportText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col gap-6"
        >
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <SarakIcon name="FileText" className="text-[var(--theme-primary)]" size={20} />
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest text-left">Text Workspace & Reports</h2>
                    </div>
                    <p className="text-sm text-white/40 uppercase tracking-tighter text-left">Editor de Relatórios Extensos e Caixas de Texto com Controle Tipográfico</p>
                </div>

                <div className="flex gap-3">
                    <SarakButton 
                        variant="secondary"
                        onClick={handleCopy}
                        leftIcon={copied ? <SarakIcon name="Check" size={12} className="text-emerald-400" /> : <SarakIcon name="Copy" size={12} />}
                    >
                        {copied ? 'Copiado!' : 'Copiar Texto'}
                    </SarakButton>
                    <SarakButton 
                        variant="primary"
                        onClick={handleSave}
                        isLoading={isSaving}
                        leftIcon={!isSaving && <SarakIcon name="Save" size={12} />}
                    >
                        {isSaving ? 'Gravando...' : 'Gravar Relatório'}
                    </SarakButton>
                </div>
            </div>

            {/* ÁREA PRINCIPAL DO EDITOR */}
            <div className="grid grid-cols-1 @lg:grid-cols-12 gap-6 flex-1 items-stretch">
                
                {/* COLUNA ESQUERDA: EDITOR E INPUTS GRANDES */}
                <div className="@lg:col-span-7 flex flex-col gap-4">
                    <div 
                        className="flex-1 flex flex-col relative rounded-2xl border border-white/5 overflow-hidden"
                        style={{
                            backgroundColor: 'var(--sarak-input-bg, rgba(255, 255, 255, 0.02))',
                            borderRadius: 'calc(var(--sarak-input-border-radius, 8) * 1px)'
                        }}
                    >
                        <div className="px-6 py-3 border-b border-white/5 bg-black/40 flex items-center justify-between text-2xs text-white/50 font-mono">
                            <span className="flex items-center gap-2 uppercase tracking-wider"><SarakIcon name="Edit3" size={12} /> Caixa de Texto Grande</span>
                            <span className="uppercase">{reportText.length} Caracteres</span>
                        </div>
                        <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            className="flex-1 w-full p-6 bg-transparent border-0 resize-none font-mono text-xs text-white leading-relaxed focus:outline-none focus:ring-0 custom-scrollbar"
                            style={{
                                fontFamily: 'var(--font-mono, monospace)'
                            }}
                            placeholder="Escreva seu relatório ou texto extenso aqui..."
                        />
                    </div>

                    {/* DADOS ADICIONAIS DO DOCUMENTO */}
                    <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                        <div 
                            className="p-5 border border-white/5 bg-black/20"
                            style={{ borderRadius: 'calc(var(--sarak-input-border-radius, 8) * 1px)' }}
                        >
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-left">Classificação de Sigilo</label>
                            <select 
                                className="w-full px-4 py-2 border border-white/10 rounded-lg text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[var(--theme-primary)] transition-colors"
                                style={{
                                    backgroundColor: 'var(--sarak-input-bg, rgba(255,255,255,0.03))',
                                    borderRadius: 'calc(var(--sarak-input-border-radius, 8) * 1px)'
                                }}
                            >
                                <option className="bg-slate-900">MÁXIMO SIGILO // LOCAL ONLY</option>
                                <option className="bg-slate-900">USO INTERNO // RESTRITO</option>
                                <option className="bg-slate-900">PÚBLICO // DOCUMENTAÇÃO</option>
                            </select>
                        </div>
                        <div 
                            className="p-5 border border-white/5 bg-black/20"
                            style={{ borderRadius: 'calc(var(--sarak-input-border-radius, 8) * 1px)' }}
                        >
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-left">Meta-Tag do Relatório</label>
                            <SarakInput 
                                type="text"
                                defaultValue="#relatorio-perf-v13"
                                fullWidth
                            />
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: PREVIEW PREMIUM DO TEXTO (EXIBIÇÃO TIPO DOCUMENTO) */}
                <div className="@lg:col-span-5 flex flex-col gap-4">
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-6 relative overflow-y-auto custom-scrollbar max-h-[480px]">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <SarakIcon name="AlignLeft" className="text-[var(--theme-primary)]" size={16} />
                                <span className="text-[10px] font-black uppercase text-white tracking-widest">Preview de Renderização</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded uppercase tracking-tighter">Pronto</span>
                        </div>

                        {/* PREVIEW DO TEXTO RENDERIZADO */}
                        <div className="flex-1 flex flex-col gap-4">
                            {reportText.split('\n\n').map((paragraph, index) => {
                                const isTitle = paragraph.startsWith('1.') || paragraph.startsWith('2.') || paragraph.startsWith('3.') || paragraph.startsWith('RELATÓRIO');
                                if (isTitle) {
                                    return (
                                        <h3 
                                            key={index} 
                                            className="text-xs font-black text-white uppercase tracking-wider italic border-l-2 border-[var(--theme-primary)] pl-3 my-2 text-left"
                                            style={{
                                                fontFamily: 'var(--font-tab, var(--font-heading))'
                                            }}
                                        >
                                            {paragraph}
                                        </h3>
                                    );
                                }
                                return (
                                    <p 
                                        key={index} 
                                        className="text-xs text-slate-300 leading-relaxed text-justify"
                                        style={{
                                            fontFamily: 'var(--font-body, inherit)'
                                        }}
                                    >
                                        {paragraph}
                                    </p>
                                );
                            })}
                        </div>

                        {/* ASSINATURA DA AUDITORIA */}
                        <div className="mt-8 pt-4 border-t border-white/5 flex flex-col gap-2 font-mono text-[9px] text-white/30 uppercase text-left">
                            <div className="flex items-center gap-2">
                                <SarakIcon name="CornerDownRight" size={10} />
                                <span>Verificado por: Igor Sarak // Lead Architect</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <SarakIcon name="CornerDownRight" size={10} />
                                <span>Assinatura Criptográfica: SX-SIGN-88741-B</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
