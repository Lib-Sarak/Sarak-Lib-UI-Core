import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runScript(scriptName) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Executando ${scriptName}...`);
  console.log(`${'='.repeat(50)}`);
  
  const scriptPath = path.join(__dirname, scriptName);
  const result = spawnSync('node', [scriptPath], { encoding: 'utf8' });
  
  console.log(result.stdout);
  if (result.stderr) {
    console.error(result.stderr);
  }
  
  return result.status;
}

function main() {
  const scripts = [
    'auditor_hardcoded.mjs',
    'auditor_typescript.mjs',
    'auditor_coverage.mjs',
    'auditor_arquitetura.mjs',
    'auditor_cleancode.mjs',
    'auditor_paridade.mjs',
    'auditor_manifesto.mjs'
  ];
  
  let totalFailures = 0;
  
  for (const script of scripts) {
    const code = runScript(script);
    if (code !== 0) {
      totalFailures++;
    }
  }
  
  console.log(`\n${'#'.repeat(50)}`);
  if (totalFailures === 0) {
    console.log("AUDITORIA FINALIZADA COM SUCESSO: O Módulo Sarak UI Core está 100% íntegro.");
    process.exit(0);
  } else {
    console.log(`AUDITORIA FALHOU: O Módulo Sarak UI Core quebrou ${totalFailures} regras estruturais.`);
    process.exit(1);
  }
}

main();
