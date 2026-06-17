import React from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakInput } from '../../../../components/atomic/Inputs/SarakInput';

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
            <SarakButton variant="secondary" size="sm" leftIcon={<SarakIcon name="Shield" size={14} className="text-[var(--theme-primary)] opacity-70" />}>
              SECURE
            </SarakButton>
            <SarakButton variant="secondary" size="sm" leftIcon={<SarakIcon name="Zap" size={14} className="text-[var(--theme-primary)] opacity-70" />}>
              NEURAL
            </SarakButton>
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
              <SarakInput 
                  type="email" 
                  leftIcon={<SarakIcon name="User" size={16} />}
                  placeholder="eu@email.com" 
                  fullWidth
              />
            </div>

            {/* Input Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[var(--theme-title)] uppercase tracking-widest opacity-80">Senha</label>
              <SarakInput 
                  type="password" 
                  leftIcon={<SarakIcon name="Lock" size={16} />}
                  rightIcon={<SarakIcon name="Eye" size={16} className="cursor-pointer hover:text-white" />}
                  placeholder="••••••••" 
                  fullWidth
              />
            </div>

            {/* Botão Acessar */}
            <div className="mt-2">
                <SarakButton 
                    variant="primary"
                    rightIcon={<SarakIcon name="ChevronRight" size={14} />}
                    style={{ width: '100%' }}
                >
                    Acessar Sistema
                </SarakButton>
            </div>

            {/* Divisor */}
            <div className="flex items-center gap-3 my-2 opacity-70">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Ou continue com</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Social Logins */}
            <SarakButton 
                variant="secondary"
                leftIcon={<SarakIcon name="Chrome" size={14} />}
                style={{ width: '100%' }}
            >
              Continue com Google
            </SarakButton>
            
            <SarakButton 
                variant="secondary"
                leftIcon={<SarakIcon name="Github" size={14} />}
                style={{ width: '100%' }}
            >
              Acessar com Github
            </SarakButton>

            {/* Master Login */}
            <div className="mt-2">
                <SarakButton 
                    variant="ghost"
                    style={{ width: '100%' }}
                >
                  Entrar como Master
                </SarakButton>
            </div>

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
