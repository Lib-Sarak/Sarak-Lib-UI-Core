import { execSync } from 'child_process';
import path from 'path';

console.log("--- Auditor de Conferência Funcional do Manifesto (Spec 34) ---");
console.log("Invocando o verificador determinístico (verify_manifest_contract.ts)...\n");

const verifyScript = path.resolve('.agents/skills/ui-auditoria-modulo/scripts/verify_manifest_contract.ts');

try {
  execSync(`npx tsx "${verifyScript}"`, { stdio: 'inherit' });
  process.exit(0);
} catch (error) {
  process.exit(error.status || 1);
}
