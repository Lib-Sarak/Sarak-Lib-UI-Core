---
tipo: "spec"
titulo: "Limpeza dos Testes Práticos (remoção completa do módulo UI do ERP)"
dominio: "Operação em consumidor de teste / Preparação do Selo da Onda"
status: "🟢 Concluída"
prioridade: "Alta"
tags: ["spec", "limpeza", "teste-pratico", "erp", "selo-da-onda"]
relacionados: ["21-scaffolder-init", "22-skills-de-consumo-golden-path", "08-consumo-externo-e-integracao"]
---

# 1. Visão Geral e Objetivo

O sistema `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP` foi usado como **consumidor de teste** da instalação da Sarak-Lib-UI-Core ANTES da onda "Renderizador Genérico" (specs 16-24) — a instalação falhou e gerou os 2 relatórios de erro que motivaram a onda. Aquela tentativa deixou artefatos: frontend improvisado, adapter manual de Supabase (com POST "dummy"), SQL avulso e skill copiada.

**Objetivo desta spec:** remover COMPLETAMENTE o módulo UI e todos os seus resíduos do ERP, deixando o repositório limpo para o **Selo da Onda** — a reinstalação do zero por um agente externo (prompt P10 em `00-prompts-execucao.md`), que medirá se o plug-and-play agora funciona sem nenhuma intervenção.

**Regra de ouro:** esta spec REMOVE, não conserta. Nada do negócio do ERP pode ser tocado.

# 2. Inventário Exato (verificado no repositório em 2026-07-19)

## 2.1 REMOVER (artefatos da tentativa de instalação da UI)
| Item | Path (relativo à raiz do ERP) |
|---|---|
| Pasta inteira do frontend improvisado | `frontend/` — contém: `package.json`/`package-lock.json` (deps `@sarak/lib-ui-core` + peers), `node_modules/`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `.env.example`, `setup_ui_database.sql`, `src/{App.tsx, index.css, main.tsx, server.ts, supabaseAdapter.ts, manifests/app.manifest.json, Sarak-Engine/index.ts}` |
| Skill copiada da lib | `.agents/skills/ui-integra-escrever-manifesto/` |
| Espelho `.claude/skills` da skill acima, se existir | `.claude/skills/ui-integra-escrever-manifesto/` (verificar) |

## 2.2 PRESERVAR (negócio do ERP — proibido tocar)
`Modulos/` (Contratos/Propostas/Projetos), `specs/` (ADRs/arquitetura/specs do ERP), `.githooks/`, `CLAUDE.md`, `extract_drawings.py`, `extract_layout.py`, `supabase_contratos.sql`, `supabase_propostas.sql`, `Template_Contrato_Iarendel_Template.pdf`, `.env` (ver 2.3), `.agents/` exceto a skill listada em 2.1 (as skills de negócio `contrato-*`, `erp-regras`, `projeto-*`, `proposta-*`, `meta-create-skill` e `gerar_indice.py` ficam), `.gitignore`, `.git`.

## 2.3 Casos com decisão (HITL — perguntar antes de agir)
1. **`.env` da raiz:** contém credenciais do Supabase usadas pelo NEGÓCIO do ERP. Se houver variáveis exclusivas da UI (ex.: `DATABASE_URL` adicionada só para `setupUIDatabase`), remover SÓ essas linhas — na dúvida, listar e perguntar. Nunca deletar o arquivo.
2. **Banco Supabase remoto:** a tentativa anterior pode ter criado o schema `ui_core` (tabelas `custom_themes`/`system_branding`) no banco do ERP. A limpeza do banco é OPCIONAL e exige confirmação explícita do usuário (é infraestrutura remota dele). Se autorizada: `DROP SCHEMA ui_core CASCADE;` (ou drop das tabelas prefixadas). Se não autorizada: registrar que o schema antigo permanece e que a reinstalação pode reaproveitá-lo ou recriá-lo.
3. **Commit da limpeza:** perguntar se o usuário quer o commit feito pelo agente ou se ele mesmo commita (padrão do repositório: usuário commita).

# 3. Procedimento

1. **Inventário vivo primeiro:** antes de deletar, rode `Get-ChildItem -Recurse` + grep por `sarak` (case-insensitive) na raiz do ERP (fora de `node_modules`) e compare com a tabela 2.1 — se aparecer QUALQUER item UI não listado (ex.: script de patch, config residual), adicione ao inventário e registre no relatório de limpeza. Não confie cegamente nesta spec: o repositório pode ter mudado desde 2026-07-19.
2. Resolver os 3 itens HITL da seção 2.3 com o usuário.
3. Remover os itens de 2.1 (e o que o inventário vivo acrescentar).
4. **Verificação de integridade do ERP:** `git status` mostrando só as remoções esperadas; grep final por `sarak|@sarak|SarakUI|manifest-catalog` (case-insensitive, fora de `.git`) → as únicas ocorrências restantes devem ser menções HISTÓRICAS em `specs/` do ERP (se houver, listar — não apagar specs do ERP); os scripts Python do negócio continuam existindo; `.env` preservado.
5. Registrar no `00-progresso.md` da LIB (este repositório) a entrada da limpeza: o que foi removido, decisões HITL tomadas, e que o ERP está pronto para o Selo da Onda (prompt P10).

# 4. Critérios de Aceite
- [x] `frontend/` não existe mais no ERP; grep por `@sarak` na raiz (fora de `.git`) → 0 código vivo (grep restrito a `@sarak/lib-ui-core|SarakManifestRenderer|SarakUIProvider|manifest-catalog` → zero; ocorrências genéricas de "Sarak" remanescentes são o nome do ecossistema/empresa, não da lib UI).
- [x] Skills de negócio do ERP intactas; APENAS `ui-integra-escrever-manifesto` removida de `.agents/skills` (`.claude/skills` não existia no ERP — nada a remover ali).
- [x] Nenhum arquivo da lista 2.2 modificado (git status limpo fora das remoções + o achado extra do inventário vivo, `node_modules/` da raiz, HITL-aprovado).
- [x] 3 decisões HITL registradas (env: remover só `DATABASE_URL` / banco remoto: não dropar agora / commit: usuário commita) com a escolha do usuário.
- [x] Entrada no `00-progresso.md` da lib + este frontmatter atualizado para 🟢.

# 5. Plano de Testes (Quality Gate)
- [x] `git status` do ERP contém somente deleções dos paths de 2.1 (+ a linha `DATABASE_URL` do `.env`, autorizada).
- [x] Grep de resíduo (passo 3.4) documentado no relatório com saída literal (ver `00-progresso.md`, entrada 2026-07-20).
- [x] Scripts de negócio sobrevivem: `python extract_layout.py` executou sem quebrar por ausência de nada removido.
