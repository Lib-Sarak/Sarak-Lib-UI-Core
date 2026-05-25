import fs from 'fs';
import path from 'path';

// Helper function to resolve paths reliably
const resolvePath = (relativePath: string) => path.join(process.cwd(), relativePath);

async function runParityCheck() {
    console.log("Iniciando Verificação de Paridade 1:1:1:1...");
    
    // 1. Carregar o MASTER_DESIGN_MAP
    let masterMap;
    try {
        const moduleUrl = 'file:///' + resolvePath('src/core/Design/master-map.ts').replace(/\\/g, '/');
        const { MASTER_DESIGN_MAP } = await import(moduleUrl);
        masterMap = MASTER_DESIGN_MAP;
    } catch (e) {
        console.error("❌ ERRO: Não foi possível importar o MASTER_DESIGN_MAP. Certifique-se de rodar este script a partir da raiz do projeto Sarak-Lib-UI-Core.");
        process.exit(1);
    }

    // 2. Carregar o Theme Table Mapping (JSON)
    const mappingPath = resolvePath('src/core/Design/schema/theme_table_mapping.json');
    if (!fs.existsSync(mappingPath)) {
        console.error("❌ ERRO: O arquivo 'theme_table_mapping.json' não foi encontrado. Rode o gerador primeiro.");
        process.exit(1);
    }
    const themeMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

    // 3. Extrair todos os tokens mapeados no JSON para uma lista plana
    const dbTokens = new Set<string>();
    Object.values(themeMapping).forEach((tokensArray) => {
        if (Array.isArray(tokensArray)) {
            tokensArray.forEach((token) => dbTokens.add(token));
        }
    });

    let hasError = false;
    let totalTokensChecked = 0;

    // 4. Validar se CADA token do Schema existe no JSON
    masterMap.components.forEach((schema: any) => {
        schema.tokens.forEach((token: any) => {
            totalTokensChecked++;
            if (!dbTokens.has(token.id)) {
                console.error(`❌ ERRO DE PARIDADE: O token '${token.id}' existe no schema '${schema.id}', mas não está no mapeamento do banco de dados (theme_table_mapping.json). Rode o script 'generate-db-mapping.ts' para atualizar!`);
                hasError = true;
            }
        });
    });

    // 5. Validar a via de mão dupla: todos os tokens do JSON existem no schema?
    const allSchemaTokens = new Set<string>();
    masterMap.components.forEach((schema: any) => {
        schema.tokens.forEach((token: any) => allSchemaTokens.add(token.id));
    });

    dbTokens.forEach(dbToken => {
        if (!allSchemaTokens.has(dbToken)) {
            console.error(`❌ ERRO DE PARIDADE INVERSA: O token '${dbToken}' está no mapeamento do banco de dados (theme_table_mapping.json), mas não existe mais no MASTER_DESIGN_MAP! Lembre-se que é proibido deletar tokens (Regra #1).`);
            hasError = true;
        }
    });

    if (hasError) {
        console.error("\n❌ Teste de Paridade Falhou. O commit/adição do componente foi bloqueado.");
        process.exit(1);
    } else {
        console.log(`\n✅ SUCESSO ABSOLUTO: Paridade 1:1:1:1 garantida! ${totalTokensChecked} tokens validados em ambas as vias (Schema <-> Database JSON).`);
        process.exit(0);
    }
}

runParityCheck();
