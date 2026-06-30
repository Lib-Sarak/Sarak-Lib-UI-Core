import fs from 'fs';
import path from 'path';

function searchFiles(dir, pattern, results) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            searchFiles(filePath, pattern, results);
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.css') || filePath.endsWith('.json')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content.includes(pattern)) {
                results.push({ file: filePath, lines: content.split('\n').filter(l => l.includes(pattern)) });
            }
        }
    }
}

const results = [];
searchFiles('./src', '--sx-spacing-md', results);
results.forEach(r => {
    console.log(`\nFile: ${r.file}`);
    r.lines.forEach(l => console.log(`  ${l.trim()}`));
});
