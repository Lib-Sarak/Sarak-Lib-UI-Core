# Regras e Limites: Sarak Logic Decoupling

Proibições e diretrizes para garantir a independência de código v5.5:

1. **NUNCA use `shared` no `package.json`**: A presença de qualquer referência ao `@sarak/lib-shared` no manifesto de dependências é uma violação gravíssima.
2. **PROIBIDO Imports Relativos Cross-Folder**: Não tente importar arquivos de pastas irmãs fora da raiz do próprio módulo (ex: `import ../Sarak-Lib-Outro`). A comunicação deve ser estritamente via API.
3. **NÃO compartilhe Lógica de Banco**: Se dois módulos precisam da mesma regra de validação complexa, um deve expor uma API de validação para o outro, ou a regra deve ser duplicada se for puramente estrutural.
4. **LIMITE de Duplicação**: O princípio DRY (Don't Repeat Yourself) é secundário ao princípio de **Independência**. Prefira duplicar um formatador simples do que criar uma dependência de código compartilhada.
5. **NÃO use Monorepo "Rigid"**: Embora os diretórios estejam juntos, trate cada um como se estivesse em um servidor diferente do outro lado do mundo.
