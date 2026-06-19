import fs from 'fs';
import path from 'path';
import { MASTER_DESIGN_MAP } from '../../../../../src/core/Design/master-map.js';

const resolvePath = (relativePath: string) => path.join(process.cwd(), relativePath);

async function runThemeParityCheck() {
    console.log("Iniciando Verificação de Paridade do Tema (Cápsula do Tempo)...\n");

    const themeId = process.argv[2];
    if (!themeId) {
        console.error("❌ ERRO: Você deve informar o ID do tema para validação (ex: npx tsx verify_theme_parity.ts meu-tema)");
        process.exit(1);
    }

    const themePath = resolvePath(`src/core/Design/presets/themes/${themeId}.ts`);
    if (!fs.existsSync(themePath)) {
        console.error(`❌ ERRO: O arquivo de tema não foi encontrado em ${themePath}`);
        process.exit(1);
    }

    try {
        // 1. Extrair todos os tokens do Schema (MASTER_DESIGN_MAP)
        const allSchemaTokens = new Set<string>();
        MASTER_DESIGN_MAP.components.forEach((schema) => {
            schema.tokens.forEach((token) => allSchemaTokens.add(token.id));
        });
        const totalSchemaTokens = allSchemaTokens.size;

        // 2. Importar o tema gerado dinamicamente
        const module = await import(`file://${themePath}`);
        
        // Localizar a exportação do tema
        let themeObject: any = null;
        for (const key of Object.keys(module)) {
            if (module[key] && module[key].design) {
                themeObject = module[key];
                break;
            }
        }

        if (!themeObject || !themeObject.design) {
            console.error("❌ ERRO: Não foi possível localizar a propriedade 'design' no tema exportado.");
            process.exit(1);
        }

        const themeTokens = Object.keys(themeObject.design);
        const totalThemeTokens = themeTokens.length;

        console.log(`  📐 Schema (MASTER_DESIGN_MAP): ${totalSchemaTokens} tokens ativos no sistema`);
        console.log(`  🎨 Tema Gerado (${themeId}.ts): ${totalThemeTokens} tokens preenchidos\n`);

        let hasError = false;

        // 3. Validar Paridade Integral
        if (totalThemeTokens < totalSchemaTokens) {
            console.error(`❌ PARIDADE QUEBRADA: O tema possui menos tokens (${totalThemeTokens}) do que o sistema exige (${totalSchemaTokens}).`);
            console.error("Isso significa que tokens foram deletados do template gerado, violando a regra de Cápsula do Tempo.");
            
            // Descobrir quais estão faltando para ajudar o dev
            const themeTokensSet = new Set(themeTokens);
            const missing = Array.from(allSchemaTokens).filter(x => !themeTokensSet.has(x));
            console.error(`Tokens ausentes: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '...' : ''}`);
            
            hasError = true;
        }

        // Validação inversa (não pode ter chaves inventadas)
        const schemaTokensSet = new Set(allSchemaTokens);
        const invalidTokens = themeTokens.filter(t => !schemaTokensSet.has(t) && !['mode', 'systemName', 'logoUrl'].includes(t)); // mode, systemName, logoUrl are structural
        
        if (invalidTokens.length > 0) {
            console.error(`❌ PARIDADE QUEBRADA: O tema contém propriedades que não existem no Schema: ${invalidTokens.join(', ')}`);
            hasError = true;
        }

        if (hasError) {
            console.error("\n❌ Teste de Paridade do Tema Falhou. Você deve corrigir o arquivo do tema antes de fazer o commit.");
            process.exit(1);
        } else {
            console.log(`\n✅ SUCESSO ABSOLUTO: O tema ${themeId} possui 100% de paridade com o MasterMap (${totalThemeTokens} tokens)! Cápsula do tempo validada.`);
            process.exit(0);
        }

    } catch (e) {
        console.error("Erro durante a validação:", e);
        process.exit(1);
    }
}

runThemeParityCheck();
