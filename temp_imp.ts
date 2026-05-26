import { TokenCatalog } from './src/core/Design/catalog/index.js';
const dist: any = {};
TokenCatalog.forEach(t => {
    const imp = t.importance || 0;
    dist[imp] = (dist[imp] || 0) + 1;
});
console.log('Distribuicao de Importancia:');
Object.keys(dist).sort((a: any, b: any) => b - a).forEach(k => {
    console.log(`Importancia ${k}: ${dist[k]} tokens`);
});
