---
name: ui-auditoria-modulo
description: Audita a integridade estrutural do Sarak-Lib-UI-Core. Varre o módulo em busca de quebras de Clean Code, falhas de cobertura (Coverage), dependências circulares, tipagens inseguras (any), hardcoded e paridade de Design Tokens. Use APENAS quando pedirem para auditar a base ou validar um PR. NÃO acione proativamente.
---

# Skill: ui-auditoria-modulo

Auditor Mestre que garante a estrita integridade estrutural e cumprimento das regras de negócios estabelecidas para o módulo **Sarak-Lib-UI-Core**. A auditoria não é analítica e sim determinística: ela roda um conjunto de **8 scripts estáticos** (Node.js/AST) contra a base de código e acusa violações diretas:
> `auditor_hardcoded` (Tailwind estrutural + valor px/rem/em, com baldes de dedução), `auditor_ghostvars` (variáveis CSS consumidas que a engine não emite — `var(--x)` que não resolve), `auditor_typescript` (zero `any`), `auditor_coverage`, `auditor_arquitetura`, `auditor_cleancode`, `auditor_paridade` (1:1:1:1:1) e `auditor_manifesto`.

> **Dependência:** Esta skill audita as regras definidas na `padrao-escrita` e nas regras arquiteturais descritas no manifesto de engenharia do módulo (ex: Clean Code, Test Coverage obrigatório, 3-Layer Architecture e Paridade 1:1:1:1:1).

## Quando usar
- O usuário pediu explicitamente para "auditar as regras", "verificar a integridade do módulo" ou "validar o manifesto".
- Ao revisar um *Pull Request* (PR) denso para este repositório.
- Use APENAS sob demanda. NÃO acione proativamente.

## Workflow de Auditoria

Ao ser acionado, você DEVE rodar exatamente esta sequência inquebrável:

1. **Rodar Auditoria Completa:**
   **Ferramenta:** `run_command`
   **Ação:** Execute `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` na raiz do projeto.
   **Critério:** O script agregará a execução das 8 varreduras estáticas e cuspirá um report de falhas (stdout) no terminal ou um arquivo JSON.

2. **Ler Laudo (Se houver falhas):**
   - Analise os *warnings* ou *erros* apontados no stdout da execução.
   - Os erros estarão divididos por sub-auditor (`Hardcoded`, `GhostVars`, `Typescript`, `Coverage`, `Architecture`, `CleanCode`, `Parity`, `Manifesto`).
   - **GhostVars:** `var(--x)` consumido que não é emitido pela engine. Corrija **migrando para a variável real + fallback** (`var(--sarak-…, <valor>)`); **nunca** afrouxe a allowlist do auditor para mascarar um fantasma real.

3. **Plano de Correção (HITL):**
   - Pare e apresente as falhas apontadas pelo auditor ao usuário.
   - Explique por que elas quebram o Manifesto da Sarak-Lib-UI-Core.
   - Pergunte explicitamente: "⚠️ O laudo apontou X falhas arquiteturais. Confirma o início da Auto-Correção dos arquivos?"

4. **Auto-Correção (Refactoring em Massa):**
   - Usando as ferramentas de substituição e criação de arquivos (`replace_file_content`, `write_to_file`), vá corrigindo as falhas sequencialmente.
   - Exemplo: se faltam arquivos `.test.tsx`, crie os arquivos de teste; se houver tipagem `any`, descubra as props corretas e aplique-as.

## Regras
- **NUNCA** analise o código visualmente para achar erros. É fisicamente impossível auditar a paridade de dezenas de chaves e o Clean Code de um sistema inteiro sem rodar o script `run_audit.mjs`.
- **NÃO** altere um arquivo detectado pelo auditor sem antes passar pelo fluxo HITL (Apresentação de Laudo e Aceite).
- **NUNCA** afrouxe os scripts de auditoria (ex: ignorar pastas `src/features/` para diminuir a quantidade de falhas detectadas).

## Checklist "Auditoria Plena"
- [ ] Rodou o script `run_audit.mjs`?
- [ ] Leu o *stdout* e classificou as quebras de arquitetura?
- [ ] Fez o alerta (HITL) ao usuário pedindo permissão para o Auto-Refactoring?
- [ ] Aplicou os fix/refactors e rodou novamente para zerar a lista?
