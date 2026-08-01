import fs from 'fs';
import path from 'path';
import { MASTER_DESIGN_MAP } from '../../../../src/core/Design/master-map.ts';

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

        // 3. COMPLETUDE — informativa, NUNCA reprova.
        //    O tema NOVO nasce do gerador com 100% dos tokens; os temas que JÁ existem
        //    são parciais de propósito e continuam funcionando (as chaves ausentes caem
        //    no default do schema via `upgradeThemePayload`/`legacyValue`). Reprovar por
        //    ausência quebraria todo tema antigo a cada token novo — que é exatamente o
        //    que a spec `09-temas-e-presets.md` §"a lib não força completude" proíbe.
        if (totalThemeTokens < totalSchemaTokens) {
            const themeTokensSet = new Set(themeTokens);
            const missing = Array.from(allSchemaTokens).filter(x => !themeTokensSet.has(x));
            console.warn(`⚠️  COMPLETUDE PARCIAL (aviso, não falha): o tema preenche ${totalThemeTokens} de ${totalSchemaTokens} tokens.`);
            console.warn(`   Ausentes (${missing.length}) caem no default do schema: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '…' : ''}`);
            console.warn("   Se este tema é NOVO, gere-o com generate_theme_template.ts para nascer 100% preenchido.");
        }

        // Validação inversa (não pode ter chaves inventadas)
        const schemaTokensSet = new Set(allSchemaTokens);
        const invalidTokens = themeTokens.filter(t => !schemaTokensSet.has(t) && !['mode', 'systemName', 'logoUrl'].includes(t)); // mode, systemName, logoUrl are structural
        
        if (invalidTokens.length > 0) {
            console.error(`❌ PARIDADE QUEBRADA: O tema contém propriedades que não existem no Schema: ${invalidTokens.join(', ')}`);
            hasError = true;
        }

        if (hasError) {
            console.error("\n❌ Teste de Paridade do Tema Falhou: há chave que NÃO existe no dicionário. Corrija antes de commitar.");
            process.exit(1);
        } else if (totalThemeTokens < totalSchemaTokens) {
            console.log(`\n✅ O tema ${themeId} está VÁLIDO (${totalThemeTokens} tokens, zero chave inventada) — parcial, mas funcional.`);
            process.exit(0);
        } else {
            console.log(`\n✅ O tema ${themeId} está VÁLIDO e COMPLETO: ${totalThemeTokens} tokens, 100% do dicionário.`);
            process.exit(0);
        }

    } catch (e) {
        console.error("Erro durante a validação:", e);
        process.exit(1);
    }
}

runThemeParityCheck();
