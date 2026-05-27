// EXEMPLO DE EXECUÇÃO RUIM DA SKILL (Quebra de Paridade)
import { ThemePreset } from './index';

export const techOceanTheme: ThemePreset = {
    id: 'tech-ocean',
    name: 'Tech Ocean',
    description: 'Tema limpo com variações de azul marítimo e estilo glass.',
    design: {
        mode: 'dark',
        navigationStyle: 'sidebar',
        // ... (Agente não usou o script gerador e inventou chaves)
        
        primaryColor: '#0ea5e9',
        
        // ⚠️ VIOLAÇÃO: Essa chave não existe no Schema Sarak!
        meuBotaoLindo: true, 
        
        // ⚠️ VIOLAÇÃO: Tipagem incorreta ('16px' ao invés de number)
        borderRadius: '16px', 
        
        // ⚠️ VIOLAÇÃO: Faltaram 140 propriedades obrigatórias do ThemePreset
        // O TS não vai compilar e o Sarak UI vai quebrar.
    }
};

// POR QUE É RUIM:
// 1. A criação de `meuBotaoLindo` quebra a regra de paridade 1:1:1:1:1. Um tema não inventa tokens, só consome.
// 2. Erros de tipagem (`'16px'` em vez de `16`) quebrarão a compilação.
// 3. Omissão massiva de propriedades vai gerar `undefined` no Contexto do React, causando tela branca.
