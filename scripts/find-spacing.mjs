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
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(m => results.add(m));
            }
        }
    }
}

const results = new Set();
searchFiles('./src', /--sx-spacing-[a-zA-Z0-9-0-9]*/g, results);
console.log(Array.from(results).sort().join('\n'));
