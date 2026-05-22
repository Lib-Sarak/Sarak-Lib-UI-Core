import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Key, Save, Loader2, AlertCircle, CheckCircle2, SlidersHorizontal, Bell, Lock } from 'lucide-react';

export const MockForms: React.FC<{ tokens: any, config: any, animationVariants: any, animationStyle: string }> = ({ tokens, animationVariants }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [switches, setSwitches] = useState({ notif: true, '2fa': false, dark: true });

    return (
        <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col xl:flex-row gap-6 p-4 overflow-y-auto custom-scrollbar"
        >
            {/* Coluna Esquerda: Formulário Clássico de Perfil */}
            <div className="flex-1 sarak-card rounded-2xl border border-[var(--theme-border)] shadow-xl bg-[var(--theme-card)] backdrop-blur-md p-6 flex flex-col gap-6" style={{ borderRadius: 'calc(var(--sarak-radius) * 1.5)' }}>
                <div>
                    <h2 className="text-xl font-black text-[var(--theme-title)] flex items-center gap-2">
                        <Shield className="text-[var(--theme-primary)]" size={24} />
                        Segurança & Perfil
                    </h2>
                    <p className="text-sm text-[var(--theme-text-sec)] mt-1 font-medium">Configurações e dados essenciais de acesso.</p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Input Normal */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[var(--theme-title)] uppercase tracking-widest opacity-80">E-mail Corporativo</label>
                        <input 
                            type="text" 
                            defaultValue="admin@sarak.io"
                            className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] text-[var(--theme-title)] text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] transition-all font-medium"
                            style={{ borderRadius: 'var(--sarak-radius-sm)' }}
                        />
                    </div>

                    {/* Select Field */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[var(--theme-title)] uppercase tracking-widest opacity-80">Departamento</label>
                        <select 
                            className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] text-[var(--theme-title)] text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] transition-all font-medium appearance-none"
                            style={{ borderRadius: 'var(--sarak-radius-sm)' }}
                            defaultValue="eng"
                        >
                            <option value="eng">Engenharia Core</option>
                            <option value="design">Design Systems</option>
                            <option value="ops">Operações AI</option>
                        </select>
                    </div>

                    {/* Input Error State */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                            Chave de Acesso <AlertCircle size={12} />
                        </label>
                        <div className="relative">
                            <input 
                                type="password" 
                                defaultValue="senha123"
                                className="w-full bg-rose-500/5 border border-rose-500/50 text-rose-500 text-sm rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                                style={{ borderRadius: 'var(--sarak-radius-sm)' }}
                            />
                            <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500/70" />
                        </div>
                        <span className="text-[10px] font-bold text-rose-500 mt-0.5">A senha deve conter caracteres alfanuméricos complexos.</span>
                    </div>

                    {/* Textarea Success State */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                            Bio do Sistema <CheckCircle2 size={12} />
                        </label>
                        <textarea 
                            rows={3}
                            defaultValue="Administrador principal do ecossistema Sarak UI."
                            className="w-full bg-emerald-500/5 border border-emerald-500/50 text-[var(--theme-title)] text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium resize-none custom-scrollbar"
                            style={{ borderRadius: 'var(--sarak-radius-sm)' }}
                        />
                        <span className="text-[10px] font-bold text-emerald-500 mt-0.5">Validação aprovada. Texto segue as diretrizes.</span>
                    </div>
                </div>
            </div>

            {/* Coluna Direita: Controles e Botões */}
            <div className="w-full xl:w-80 flex flex-col gap-6">
                
                {/* Painel de Controles (Toggles, Sliders) */}
                <div className="sarak-card rounded-2xl border border-[var(--theme-border)] shadow-xl bg-[var(--theme-card)] backdrop-blur-md p-6 flex flex-col gap-6" style={{ borderRadius: 'calc(var(--sarak-radius) * 1.5)' }}>
                    <div className="flex items-center gap-2 text-[var(--theme-title)] font-black text-lg">
                        <SlidersHorizontal size={20} className="text-[var(--theme-primary)]" />
                        Preferências
                    </div>

                    <div className="flex flex-col gap-5">
                        {/* Toggle 1 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] rounded-lg">
                                    <Bell size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[var(--theme-title)]">Notificações Push</span>
                                    <span className="text-[10px] text-[var(--theme-text-sec)]">Alertas de build.</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSwitches(s => ({...s, notif: !s.notif}))}
                                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${switches.notif ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${switches.notif ? 'left-5.5' : 'left-0.5'}`} style={{ transform: switches.notif ? 'translateX(100%)' : 'translateX(0)' }} />
                            </button>
                        </div>

                        {/* Toggle 2 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] rounded-lg">
                                    <Lock size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[var(--theme-title)]">2FA Restrito</span>
                                    <span className="text-[10px] text-[var(--theme-text-sec)]">Exigir hardware key.</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSwitches(s => ({...s, '2fa': !s['2fa']}))}
                                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${switches['2fa'] ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${switches['2fa'] ? 'left-5.5' : 'left-0.5'}`} style={{ transform: switches['2fa'] ? 'translateX(100%)' : 'translateX(0)' }} />
                            </button>
                        </div>

                        {/* Radio Group Simulation */}
                        <div className="flex flex-col gap-3 mt-2 pt-5 border-t border-[var(--theme-border)]">
                            <label className="text-xs font-bold text-[var(--theme-title)] uppercase tracking-widest opacity-80">Nível de Log</label>
                            <div className="flex flex-col gap-2">
                                {['Error Only', 'Warning & Error', 'Verbose (All)'].map((opt, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${i === 1 ? 'border-[var(--theme-primary)]' : 'border-[var(--theme-border)] group-hover:border-[var(--theme-primary)]/50'}`}>
                                            {i === 1 && <div className="w-2 h-2 bg-[var(--theme-primary)] rounded-full animate-in zoom-in" />}
                                        </div>
                                        <span className={`text-xs font-medium transition-colors ${i === 1 ? 'text-[var(--theme-title)]' : 'text-[var(--theme-text-sec)] group-hover:text-[var(--theme-title)]'}`}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Painel de Botões */}
                <div className="sarak-card rounded-2xl border border-[var(--theme-border)] shadow-xl bg-[var(--theme-card)] backdrop-blur-md p-6 flex flex-col gap-4" style={{ borderRadius: 'calc(var(--sarak-radius) * 1.5)' }}>
                    <div className="text-[var(--theme-title)] font-black text-xs uppercase tracking-widest opacity-80 mb-2">
                        Ações Primárias
                    </div>
                    
                    <button 
                        onClick={() => setIsLoading(!isLoading)}
                        className="sarak-preview-btn w-full bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary)]/90 py-3 px-4 shadow-[0_10px_20px_-5px_rgba(var(--theme-primary-rgb),0.3)] transition-all font-bold text-xs flex items-center justify-center gap-2 group"
                        style={{ borderRadius: 'var(--sarak-radius-btn, var(--sarak-radius))' }}
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
                        {isLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                    </button>

                    <button 
                        className="sarak-preview-btn w-full bg-transparent text-[var(--theme-title)] hover:bg-[var(--theme-body)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50 py-3 px-4 transition-all font-bold text-xs flex items-center justify-center gap-2"
                        style={{ borderRadius: 'var(--sarak-radius-btn, var(--sarak-radius))' }}
                    >
                        CANCELAR E REVERTER
                    </button>
                    
                    <button 
                        className="sarak-preview-btn w-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20 py-3 px-4 transition-all font-bold text-xs flex items-center justify-center gap-2"
                        style={{ borderRadius: 'var(--sarak-radius-btn, var(--sarak-radius))' }}
                    >
                        AÇÃO SECUNDÁRIA GHOST
                    </button>

                    <button 
                        disabled
                        className="w-full bg-[var(--theme-border)] text-[var(--theme-text-sec)] py-3 px-4 transition-all font-bold text-xs flex items-center justify-center cursor-not-allowed opacity-50"
                        style={{ borderRadius: 'var(--sarak-radius-btn, var(--sarak-radius))' }}
                    >
                        BOTÃO DESABILITADO
                    </button>
                </div>

            </div>
        </motion.div>
    );
};
