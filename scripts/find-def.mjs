import fs from 'fs';
import path from 'path';

function searchFiles(dir, pattern, results) {
    if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('dist')) return;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            searchFiles(filePath, pattern, results);
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.css') || filePath.endsWith('.json') || filePath.endsWith('.html')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content.includes(pattern)) {
                results.push(filePath);
            }
        }
    }
}

const results = [];
searchFiles('.', '--sx-spacing', results);
console.log("Files containing --sx-spacing:");
results.forEach(f => console.log(f));
