import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';

export const MockForms: React.FC<{ tokens: any, config: any, animationVariants: any, animationStyle: string }> = ({ tokens, animationVariants }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    return (
        <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col gap-6 p-4 overflow-y-auto custom-scrollbar"
        >
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-[var(--theme-title)] flex items-center gap-2">
                    <SarakIcon name="List" className="text-[var(--theme-primary)]" size={28} />
                    Componentes de Formulário
                </h2>
                <p className="text-sm text-[var(--theme-text-sec)] mt-1 font-medium">Demonstração de diferentes topologias de entrada de dados.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 w-full">
                
                {/* Coluna Principal: Formulário de Aba Inteira (Full Form) */}
                <div className="flex-[2] sarak-card rounded-2xl border border-[var(--theme-border)] shadow-xl bg-[var(--theme-card)] backdrop-blur-md p-8 flex flex-col gap-6" style={{ borderRadius: 'calc(var(--sarak-radius) * 1.5)' }}>
                    <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
                        <h3 className="text-lg font-bold text-[var(--theme-title)] flex items-center gap-2">
                            <SarakIcon name="Shield" size={20} className="text-[var(--theme-primary)]" />
                            Registro Completo (Full Form)
                        </h3>
                        <div className="text-xs font-bold text-[var(--theme-text-sec)] bg-[var(--theme-body)] px-3 py-1 rounded-full border border-[var(--theme-border)]">Step 1 de 3</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input 1 */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-[var(--theme-title)] uppercase tracking-widest opacity-80">Nome da Empresa</label>
                            <input 
                                type="text" 
                                placeholder="Sarak Enterprise"
                                className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] text-[var(--theme-title)] text-sm px-4 py-3 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] transition-all font-medium"
                                style={{ borderRadius: 'var(--sarak-radius-sm)' }}
                            />
                        </div>
                        {/* Input 2 */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-[var(--theme-title)] uppercase tracking-widest opacity-80 flex items-center gap-2">
                                <SarakIcon name="Hash" size={14} /> CNPJ / ID
                            </label>
                            <input 
                                type="text" 
                                placeholder="00.000.000/0001-00"
                                className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] text-[var(--theme-title)] text-sm px-4 py-3 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] transition-all font-mono"
                                style={{ borderRadius: 'var(--sarak-radius-sm)' }}
                            />
                        </div>
                        {/* Input 3 (Success) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                <SarakIcon name="Mail" size={14} /> Email Oficial <SarakIcon name="CheckCircle2" size={12} />
                            </label>
                            <input 
                                type="email" 
                                defaultValue="contato@sarak.io"
                                className="w-full bg-emerald-500/5 border border-emerald-500/50 text-emerald-500 text-sm px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                style={{ borderRadius: 'var(--sarak-radius-sm)' }}
                            />
                        </div>
                        {/* Input 4 (Select) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-[var(--theme-title)] uppercase tracking-widest opacity-80">Setor</label>
                            <select 
                                className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] text-[var(--theme-title)] text-sm px-4 py-3 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] transition-all font-medium appearance-none"
                                style={{ borderRadius: 'var(--sarak-radius-sm)' }}
                            >
                                <option>Tecnologia da Informação</option>
                                <option>Saúde</option>
                                <option>Finanças</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <label className="text-xs font-bold text-[var(--theme-title)] uppercase tracking-widest opacity-80">Descrição Detalhada</label>
                        <textarea 
                            rows={4}
                            placeholder="Descreva o principal objetivo do sistema..."
                            className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] text-[var(--theme-title)] text-sm px-4 py-3 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] transition-all font-medium resize-none custom-scrollbar"
                            style={{ borderRadius: 'var(--sarak-radius-sm)' }}
                        />
                    </div>

                    <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-[var(--theme-border)]">
                        <button 
                            className="sarak-preview-btn bg-transparent text-[var(--theme-title)] hover:bg-[var(--theme-body)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50 py-2.5 px-6 transition-all font-bold text-xs"
                            style={{ borderRadius: 'var(--sarak-radius-btn, var(--sarak-radius))' }}
                        >
                            CANCELAR
                        </button>
                        <button 
                            onClick={() => setIsLoading(!isLoading)}
                            className="sarak-preview-btn bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary)]/90 py-2.5 px-8 shadow-[0_10px_20px_-5px_rgba(var(--theme-primary-rgb),0.3)] transition-all font-bold text-xs flex items-center justify-center gap-2 group"
                            style={{ borderRadius: 'var(--sarak-radius-btn, var(--sarak-radius))' }}
                        >
                            {isLoading ? <SarakIcon name="Loader2" size={16} className="animate-spin" /> : <SarakIcon name="Save" size={16} className="group-hover:scale-110 transition-transform" />}
                            {isLoading ? 'SALVANDO...' : 'SALVAR E CONTINUAR'}
                        </button>
                    </div>
                </div>

                {/* Coluna Secundária: Micro-Formulários e Caixas de Pergunta */}
                <div className="flex-1 flex flex-col gap-6">
                    
                    {/* Caixa de Pergunta (Survey Style) */}
                    <div className="sarak-card rounded-2xl border border-[var(--theme-border)] shadow-xl bg-[var(--theme-card)] backdrop-blur-md p-6 flex flex-col gap-4" style={{ borderRadius: 'var(--sarak-radius)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center">
                                <SarakIcon name="MessageSquare" size={20} />
                            </div>
                            <h3 className="text-md font-bold text-[var(--theme-title)]">Avaliação de Risco</h3>
                        </div>
                        <p className="text-sm text-[var(--theme-text-sec)]">Qual o impacto estimado se o sistema ficar indisponível?</p>
                        
                        <div className="flex flex-col gap-2 mt-2">
                            {['Baixo (Rotineiro)', 'Médio (Atrasos)', 'Alto (Crítico)'].map((opt, i) => (
                                <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--theme-border)] hover:border-[var(--theme-primary)] bg-[var(--theme-body)] cursor-pointer transition-all group">
                                    <input type="radio" name="risk" className="hidden" />
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${i === 2 ? 'border-rose-500' : 'border-[var(--theme-text-sec)] group-hover:border-[var(--theme-primary)]'}`}>
                                        {i === 2 && <div className="w-2 h-2 bg-rose-500 rounded-full" />}
                                    </div>
                                    <span className={`text-sm font-medium ${i === 2 ? 'text-[var(--theme-title)]' : 'text-[var(--theme-text-sec)]'}`}>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Formulário Dinâmico Adicionável (Dynamic Fields) */}
                    <div className="sarak-card rounded-2xl border border-[var(--theme-border)] shadow-xl bg-[var(--theme-card)] backdrop-blur-md p-6 flex flex-col gap-4" style={{ borderRadius: 'var(--sarak-radius)' }}>
                        <h3 className="text-md font-bold text-[var(--theme-title)] border-b border-[var(--theme-border)] pb-3">Datas e Marcos</h3>
                        
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <SarakIcon name="Calendar" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-sec)]" />
                                    <input type="text" defaultValue="12/05/2026" className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] text-[var(--theme-title)] text-xs px-9 py-2 focus:outline-none focus:border-[var(--theme-primary)] transition-all font-mono rounded-md" />
                                </div>
                                <button className="p-2 bg-[var(--theme-body)] border border-[var(--theme-border)] text-rose-500 hover:bg-rose-500 hover:text-white rounded-md transition-colors">
                                    <SarakIcon name="Trash2" size={14} />
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <SarakIcon name="Calendar" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-sec)]" />
                                    <input type="text" placeholder="Adicionar data..." className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] text-[var(--theme-title)] text-xs px-9 py-2 focus:outline-none focus:border-[var(--theme-primary)] transition-all font-mono rounded-md" />
                                </div>
                                <button className="p-2 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-white rounded-md transition-colors">
                                    <SarakIcon name="Plus" size={14} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-2 p-3 rounded-lg bg-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/20 flex items-start gap-3">
                            <SarakIcon name="AlertCircle" size={16} className="text-[var(--theme-primary)] mt-0.5 shrink-0" />
                            <p className="text-[11px] text-[var(--theme-title)]/80 leading-relaxed">
                                Formulários dinâmicos permitem ao usuário gerar <strong>campos infinitos</strong> adaptados ao fluxo, ideais para arrays estruturados.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};
