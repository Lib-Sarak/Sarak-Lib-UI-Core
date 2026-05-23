import fs from 'fs';
import path from 'path';

const mocksDir = path.join(process.cwd(), 'src/features/DesignEngine/Canvas/Mocks');

function processFile(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find lucide-react import
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/;
    const match = content.match(importRegex);

    if (!match) return; // No lucide-react import

    const importedIconsStr = match[1];
    const importedIcons = importedIconsStr.split(',').map(s => {
        const parts = s.trim().split(/\s+as\s+/);
        return {
            original: parts[0],
            alias: parts.length > 1 ? parts[1] : parts[0]
        };
    }).filter(i => i.original);

    // Replace the import statement with SarakIcon import
    content = content.replace(importRegex, `import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';`);

    // Replace each icon usage
    // For each icon, find <IconName ... /> or <IconName> and replace with <SarakIcon name="OriginalName" ... />
    importedIcons.forEach(icon => {
        // Regex to match <IconName ... />
        const tagRegex = new RegExp(`<${icon.alias}(\\s|\\/|>)`, 'g');
        content = content.replace(tagRegex, (match, p1) => {
            if (p1 === '>') return `<SarakIcon name="${icon.original}">`;
            if (p1 === '/') return `<SarakIcon name="${icon.original}" /`;
            return `<SarakIcon name="${icon.original}"${p1}`;
        });
        
        // Match closing tags just in case
        const closeTagRegex = new RegExp(`<\\/${icon.alias}>`, 'g');
        content = content.replace(closeTagRegex, `</SarakIcon>`);
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${path.basename(filePath)}`);
}

function run() {
    const files = fs.readdirSync(mocksDir);
    for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(path.join(mocksDir, file));
        }
    }
}

run();
