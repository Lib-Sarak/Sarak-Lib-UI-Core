import React from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';

export const MockAuth: React.FC<any> = ({ tokens, animationVariants }) => {
  return (
    <motion.div 
      variants={animationVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="w-full h-full flex rounded-2xl overflow-hidden border border-[var(--theme-border)]"
    >
      {/* Lado Esquerdo - Branding */}
      <div className="flex-1 flex flex-col items-center justify-center relative bg-[var(--theme-body)]">
        {/* Camada de Ruído / Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--theme-primary)] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(var(--theme-primary-rgb),0.3)]">
            <SarakIcon name="Cpu" size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-8">Sarak MyService</h1>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-text-sec)] text-xs font-bold uppercase tracking-widest hover:text-white hover:border-white/20 transition-colors">
              <SarakIcon name="Shield" size={14} className="text-[var(--theme-primary)] opacity-70" /> SECURE
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-text-sec)] text-xs font-bold uppercase tracking-widest hover:text-white hover:border-white/20 transition-colors">
              <SarakIcon name="Zap" size={14} className="text-[var(--theme-primary)] opacity-70" /> NEURAL
            </button>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="flex-1 bg-black/90 flex flex-col items-center justify-center p-8 relative">
        <div className="w-full max-w-sm flex flex-col gap-6 relative z-10">
          
          <div className="flex flex-col gap-1 mb-2">
            <h2 className="text-xl font-bold text-white">Login do Sistema</h2>
            <p className="text-sm text-[var(--theme-text-sec)]">Insira suas credenciais para continuar.</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Input Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[var(--theme-title)] uppercase tracking-widest opacity-80">E-mail de Acesso</label>
              <div className="relative">
                <SarakIcon name="User" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-sec)]" />
                <input 
                  type="email" 
                  className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--theme-primary)] transition-colors" 
                  placeholder="eu@email.com" 
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[var(--theme-title)] uppercase tracking-widest opacity-80">Senha</label>
              <div className="relative">
                <SarakIcon name="Lock" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-sec)]" />
                <input 
                  type="password" 
                  className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] rounded-lg py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-[var(--theme-primary)] transition-colors" 
                  placeholder="••••••••" 
                />
                <SarakIcon name="Eye" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-sec)] cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* Botão Acessar */}
            <button className="w-full bg-[#111] hover:bg-[#1a1a1a] border border-white/10 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg mt-2 transition-colors flex items-center justify-center gap-2 shadow-lg">
              Acessar Sistema <SarakIcon name="ChevronRight" size={14} />
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-3 my-2 opacity-70">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Ou continue com</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Social Logins */}
            <button className="w-full bg-[#111] border border-white/5 hover:border-white/20 text-white/80 font-bold text-[10px] uppercase tracking-widest py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <SarakIcon name="Chrome" size={14} /> Continue com Google
            </button>
            <button className="w-full bg-[#111] border border-white/5 hover:border-white/20 text-white/80 font-bold text-[10px] uppercase tracking-widest py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <SarakIcon name="Github" size={14} /> Acessar com Github
            </button>

            {/* Master Login */}
            <button className="w-full bg-[var(--theme-primary)]/5 hover:bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-[var(--theme-primary)] font-bold text-[10px] uppercase tracking-widest py-3 rounded-lg mt-2 transition-colors">
              Entrar como Master
            </button>

            {/* Rodapé */}
            <div className="text-center text-xs text-white/40 mt-4">
              Não tem uma conta? <span className="text-[var(--theme-primary)] font-bold cursor-pointer hover:underline">Primeiro Acesso</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
