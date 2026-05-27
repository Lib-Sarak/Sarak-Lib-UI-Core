// EXEMPLO DE EXECUÇÃO PERFEITA DA SKILL (Paridade Mantida)
import { ThemePreset } from './index';

export const techOceanTheme: ThemePreset = {
    id: 'tech-ocean',
    name: 'Tech Ocean',
    description: 'Tema limpo com variações de azul marítimo e estilo glass.',
    design: {
        mode: 'dark',
        navigationStyle: 'sidebar',
        // ... (Todas as chaves perfeitamente baseadas no template gerado)
        primaryColor: '#0ea5e9',
        surfaceColor: '#0f172a',
        borderRadius: 16,
        cardBackdropBlur: 20,
        btnStyleType: 'glass',
        animEnabled: true
        // Nenhum token inventado aqui.
    }
};
