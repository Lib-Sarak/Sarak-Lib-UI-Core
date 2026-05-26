import fs from 'fs';
import path from 'path';
import { MASTER_DESIGN_MAP } from '../../../../src/core/Design/master-map.js';

const resolvePath = (relativePath: string) => path.join(process.cwd(), relativePath);

function runParityCheck() {
    console.log("Iniciando Verificação de Paridade 1:1:1:1:1...\n");

    // 1. Carregar o Theme Table Mapping (JSON)
    const mappingPath = resolvePath('src/core/Design/catalog/theme_table_mapping.json');
    if (!fs.existsSync(mappingPath)) {
        console.error("❌ ERRO: O arquivo 'theme_table_mapping.json' não foi encontrado em catalog/.");
        process.exit(1);
    }
    const themeMapping: Record<string, string[]> = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

    // 2. Carregar TODAS as Partições do Catálogo
    const partitionsDir = resolvePath('src/core/Design/catalog/partitions');
    if (!fs.existsSync(partitionsDir)) {
        console.error("❌ ERRO: A pasta 'partitions' do catálogo não foi encontrada.");
        process.exit(1);
    }

    const partitionFiles = fs.readdirSync(partitionsDir).filter(f => f.endsWith('.json'));
    const catalogTokens = new Set<string>();

    partitionFiles.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(partitionsDir, file), 'utf-8'));
        content.forEach((token: any) => catalogTokens.add(token.tokenId));
    });

    // 3. Extrair todos os tokens do DB mapping para uma lista plana
    const dbTokens = new Set<string>();
    Object.values(themeMapping).forEach((tokensArray) => {
        if (Array.isArray(tokensArray)) {
            tokensArray.forEach((token) => dbTokens.add(token));
        }
    });

    // 4. Extrair todos os tokens do Schema (MASTER_DESIGN_MAP)
    const allSchemaTokens = new Set<string>();
    MASTER_DESIGN_MAP.components.forEach((schema) => {
        schema.tokens.forEach((token) => allSchemaTokens.add(token.id));
    });

    let hasError = false;
    let totalTokensChecked = 0;

    console.log(`  📐 Schema (MASTER_DESIGN_MAP): ${allSchemaTokens.size} tokens`);
    console.log(`  🗄️  Banco de Dados (theme_table_mapping): ${dbTokens.size} tokens`);
    console.log(`  📦 Catálogo JSON (partitions/): ${catalogTokens.size} tokens em ${partitionFiles.length} arquivos\n`);

    // 5. Validação: Schema → DB e Schema → Catálogo
    MASTER_DESIGN_MAP.components.forEach((schema) => {
        schema.tokens.forEach((token) => {
            totalTokensChecked++;

            if (!dbTokens.has(token.id)) {
                console.error(`❌ PARIDADE Schema→DB: Token '${token.id}' (Schema '${schema.id}') não está no mapeamento do Banco de Dados.`);
                hasError = true;
            }

            if (!catalogTokens.has(token.id)) {
                console.error(`❌ PARIDADE Schema→Catálogo: Token '${token.id}' (Schema '${schema.id}') não está em nenhuma partição JSON.`);
                hasError = true;
            }
        });
    });

    // 6. Validação inversa: DB → Schema
    dbTokens.forEach(dbToken => {
        if (!allSchemaTokens.has(dbToken)) {
            console.error(`❌ PARIDADE INVERSA DB→Schema: Token '${dbToken}' está no mapeamento DB, mas não existe no MASTER_DESIGN_MAP!`);
            hasError = true;
        }
    });

    // 7. Validação inversa: Catálogo → Schema
    catalogTokens.forEach(catToken => {
        if (!allSchemaTokens.has(catToken)) {
            console.error(`❌ PARIDADE INVERSA Catálogo→Schema: Token '${catToken}' está no Catálogo JSON, mas não existe no MASTER_DESIGN_MAP!`);
            hasError = true;
        }
    });

    if (hasError) {
        console.error("\n❌ Teste de Paridade Falhou. O commit/adição do componente foi bloqueado.");
        process.exit(1);
    } else {
        console.log(`\n✅ SUCESSO ABSOLUTO: Paridade 1:1:1:1:1 garantida! ${totalTokensChecked} tokens validados nas 3 fontes da verdade (Schema ↔ Banco de Dados ↔ Catálogo JSON).`);
        process.exit(0);
    }
}

runParityCheck();
