import fs from 'fs';
import path from 'path';

// Define the schema dir using process.cwd() since we run from project root
const schemaDir = path.join(process.cwd(), 'src/core/Design/schema');
const targetDir = path.join(process.cwd(), 'src/core/Design/presets/themes');

/**
 * Achado 39: tokens responsivos (`defaultValue: { mob, tab, desk }`) não são um valor
 * escalar — interpolá-los crus produz `[object Object]` e o gabarito não faz parse.
 * Achata para o eixo `desk`, a convenção que os temas embarcados já usam
 * (ex.: `sarak-sovereign.ts` grava `sidebarWidth: 240`, não o objeto responsivo).
 */
function flattenResponsiveValue(value: unknown): unknown {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const responsive = value as Record<string, unknown>;
        return 'desk' in responsive ? responsive.desk : Object.values(responsive)[0];
    }
    return value;
}

async function generateTemplate() {
    if (!fs.existsSync(schemaDir)) {
        console.error(`❌ Erro: Diretório de Schema não encontrado em ${schemaDir}`);
        process.exit(1);
    }

    // Extract the theme ID from arguments
    const themeId = process.argv[2] || 'novo-tema-gerado';
    const camelCaseName = themeId.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const targetFile = path.join(targetDir, `${themeId}.ts`);

    if (fs.existsSync(targetFile)) {
        console.error(`❌ Erro: O arquivo ${targetFile} já existe. Escolha outro ID ou exclua-o manualmente.`);
        process.exit(1);
    }

    try {
        const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));
        
        // We will build a complete object string
        const properties: Record<string, any> = {};
        
        for (const file of files) {
            const filePath = path.join(schemaDir, file);
            
            // Import the module dynamically
            // Note: tsx will handle the .ts extension on the fly
            const module = await import(`file://${filePath}`);
            
            // Find the exported ComponentSchema object
            for (const key of Object.keys(module)) {
                const schemaObj = module[key];
                if (schemaObj && schemaObj.id && Array.isArray(schemaObj.tokens)) {
                    // Extract all tokens
                    for (const token of schemaObj.tokens) {
                        if (token.id && token.defaultValue !== undefined) {
                            properties[token.id] = flattenResponsiveValue(token.defaultValue);
                        }
                    }
                }
            }
        }
        
        let designProps = '';
        
        if (Object.keys(properties).length > 0) {
            for (const [key, value] of Object.entries(properties)) {
                // If it's a string, wrap in quotes. Otherwise just stringify.
                if (typeof value === 'string') {
                    designProps += `        ${key}: '${value.replace(/'/g, "\\'")}',\n`;
                } else {
                    designProps += `        ${key}: ${value},\n`;
                }
            }
        } else {
            // Fallback warning if extraction fails
            designProps = `        // ⚠️ O script não conseguiu extrair as propriedades do schema automaticamente.
        mode: 'dark',
        navigationStyle: 'sidebar',
        primaryColor: '#00f2ff',\n`;
        }

        const templateContent = `import { ThemePreset } from './index';

/**
 * Tema Gerado Automaticamente pela Skill Sarak-UI-criar-tema
 * 
 * Siga as instruções do workflow para preencher as variáveis abaixo.
 * NUNCA adicione propriedades que não estejam mapeadas no schema oficial.
 */
export const ${camelCaseName}Theme: ThemePreset = {
    id: '${themeId}',
    name: 'Nome do Seu Tema',
    description: 'Descrição detalhada do propósito e vibração visual deste tema.',
    design: {
${designProps.replace(/,\n$/, '\n')}    }
};
`;

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(targetFile, templateContent);
        console.log(`✅ Sucesso! Template gerado em: ${targetFile}`);
        console.log(`Foram extraídos ${Object.keys(properties).length} tokens com sucesso.`);
        console.log(`Abra o arquivo e substitua os valores padrão para corresponder à sua nova identidade.`);
        
    } catch (error) {
        console.error(`❌ Erro fatal durante a geração do template:`, error);
        process.exit(1);
    }
}

generateTemplate();
