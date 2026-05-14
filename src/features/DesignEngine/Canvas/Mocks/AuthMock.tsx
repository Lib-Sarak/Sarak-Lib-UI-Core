import React from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface AuthMockProps {
  tokens: any;
}

/**
 * MockAuth - Sarak Sovereign Design System (v12.0)
 * Preview especializado para configurações de Soberania e Autenticação.
 */
export const MockAuth: React.FC<AuthMockProps> = ({ tokens }) => {
  // Mapeamento de densidade para padding real
  const densityPadding = {
    compact: '1.5rem',
    standard: '2.5rem',
    spacious: '4rem'
  }[tokens.authDensity as 'compact' | 'standard' | 'spacious'] || '2.5rem';

  const showNoise = tokens.authNoiseEnabled !== false;
  return (
    <div className="sarak-auth-mock-container" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Camada de Ruído (Noise) Controlada por Token */}
      {showNoise && (
        <div 
          className="sarak-auth-noise"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 'calc(var(--sarak-noise-opacity, 5) / 100)',
            backgroundImage: 'var(--sarak-auth-noise-url)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      {/* Card de Autenticação com Densidade Dinâmica */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sarak-card"
        style={{
          width: 'min(400px, 90%)',
          padding: densityPadding, // Mapeado para o token de densidade
          borderRadius: 'var(--sarak-security-radius, 16px)',
          border: '1px solid var(--sarak-border-color)',
          boxShadow: 'var(--sarak-shadow-lg)',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--sarak-primary-10)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'var(--sarak-primary-color)',
            boxShadow: '0 0 var(--sarak-security-glow, 15px) var(--sarak-primary-color)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ color: 'var(--sarak-text-primary)', margin: 0, fontSize: '1.5rem' }}>Sovereign Access</h2>
          <p style={{ color: 'var(--sarak-text-secondary)', fontSize: '0.875rem' }}>Confirme sua identidade para continuar</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="sarak-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--sarak-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sarak-text-tertiary)' }} />
              <input 
                readOnly
                placeholder="admin@sarak.sovereign" 
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'var(--sarak-surface-3)',
                  border: '1px solid var(--sarak-border-color)',
                  borderRadius: '8px',
                  color: 'var(--sarak-text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div className="sarak-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--sarak-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sarak-text-tertiary)' }} />
              <input 
                type="password"
                readOnly
                placeholder="••••••••••••" 
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'var(--sarak-surface-3)',
                  border: '1px solid var(--sarak-border-color)',
                  borderRadius: '8px',
                  color: 'var(--sarak-text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>
        </div>

        <button style={{
          width: '100%',
          padding: '14px',
          background: 'var(--sarak-primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          cursor: 'not-allowed'
        }}>
          Entrar no Sistema <ArrowRight size={18} />
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--sarak-text-tertiary)' }}>
          Protegido por Sarak Multi-Factor Sovereignty
        </div>
      </motion.div>
    </div>
  );
};
