const fs = require('fs');
const content = fs.readFileSync('src/styles/_atmosphere.css', 'utf8');
const regex = /\.texture-([a-z0-9-]+)::before,\s*\[data-sx-card-texture-type="[^"]+"\] \.sarak-card::after,\s*\.sarak-card\[data-sx-card-texture-type="[^"]+"\]::after\s*\{/g;
const newContent = content.replace(regex, '.texture-$1::before,\n[data-sx-texture="$1"]::before,\n[data-sx-card-texture-type="$1"] .sarak-card::after,\n.sarak-card[data-sx-card-texture-type="$1"]::after,\n[data-sx-card-texture-type="$1"] [class*="card"]::after,\n[class*="card"][data-sx-card-texture-type="$1"]::after {');

// We also need to fix the ones that don't have the card rules yet, like .texture-topo::before
const regex2 = /\.texture-([a-z0-9-]+)::before\s*\{/g;
const newContent2 = newContent.replace(regex2, '.texture-$1::before,\n[data-sx-texture="$1"]::before,\n[data-sx-card-texture-type="$1"] .sarak-card::after,\n.sarak-card[data-sx-card-texture-type="$1"]::after,\n[data-sx-card-texture-type="$1"] [class*="card"]::after,\n[class*="card"][data-sx-card-texture-type="$1"]::after {');

fs.writeFileSync('src/styles/_atmosphere.css', newContent2);
console.log('Replaced occurrences.');
