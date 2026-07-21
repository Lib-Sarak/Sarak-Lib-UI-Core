---
tipo: "spec"
titulo: "Limpeza da Rodada 2 (desinstalar a Sarak-UI do ERP antes do re-Selo)"
dominio: "Operação em consumidor de teste / Preparação do re-Selo"
status: "🟢 Concluída"
prioridade: "Alta"
tags: ["spec", "limpeza", "teste-pratico", "erp", "selo-da-onda", "rodada-2"]
relacionados: ["25-limpeza-testes-praticos", "26-instalacao-teste", "27-paridade-navigationstyle-shell", "28-gate-submit-validacao", "29-robustez-instalacao-pacote"]
---

# 1. Visão Geral e Objetivo

Antes do **re-Selo** (2ª execução da Spec 26), o consumidor de teste `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP` precisa voltar ao estado "sem nenhum vestígio da Sarak-UI" — senão o teste mede uma instalação por cima de outra, não um plug-and-play do zero.

**Por que não reusar a Spec 25:** a Spec 25 (🟢 Concluída) removeu os artefatos da tentativa **pré-onda**, cujo inventário (§2.1) aponta para uma pasta **`frontend/`**. Essa pasta **não existe mais**. A instalação da rodada 1 — feita pelo `npx @sarak/lib-ui-core init` — foi na **RAIZ do ERP**, com uma pegada completamente diferente. Rodar a Spec 25 como está deletaria uma pasta inexistente e deixaria a instalação inteira de pé. Esta spec é a limpeza da **rodada 2**; a 25 permanece intacta como registro histórico da rodada 1.

**Regra de ouro (herdada da 25):** esta spec REMOVE, não conserta. Nada do NEGÓCIO do ERP pode ser tocado.

**Nota de ciclo:** a cada rodada de Selo a pegada da instalação muda conforme as respostas da entrevista do `init` (stack/storage/modo). O inventário abaixo é da rodada 1 (`vite-express` + `sqlite`, Modo App), verificado em 2026-07-20. **Toda rodada futura deve refazer o inventário vivo** (§3 passo 1) em vez de confiar nesta tabela.

# 2. Inventário Exato (verificado na raiz do ERP em 2026-07-20)

## 2.1 REMOVER (artefatos da instalação da rodada 1 — todos na RAIZ)
| Item | Path (relativo à raiz do ERP) | Origem |
|---|---|---|
| Plumbing do contrato gerado pelo `init` | `src/main.tsx`, `src/Sarak-Engine/index.ts`, `src/server.ts`, `src/manifests/app.manifest.json` (a pasta `src/` inteira — conferir que não há código de negócio dentro) | Spec 21 (scaffolder) |
| Manifesto de dependências criado na rodada 1 | `package.json`, `package-lock.json` | ⚠️ HITL — ver 2.3.1 |
| Dependências instaladas | `node_modules/` | `npm install` |
| Build do frontend | `dist/` | `npm run build` |
| Config do Vite/TS gerada pelo `init` | `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.server.json` | Spec 21 |
| Storage de temas da UI (sqlite escolhido na entrevista) | `database.sqlite` | ⚠️ HITL — ver 2.3.2 |
| Skills de consumo copiadas pelo `init` | `.agents/skills/ui-integra-escrever-manifesto/`, `.agents/skills/ui-auditoria-manifesto/` | Spec 21 |
| Espelho `.claude` das skills acima | `.claude/skills/ui-integra-escrever-manifesto/`, `.claude/skills/ui-auditoria-manifesto/` (e o próprio `.claude/` se ficar vazio — **note: a Spec 25 dizia que `.claude` não existia no ERP; ele existe agora, criado pelo `init`**) | Spec 21 |
| Relatório da rodada 1 | `RELATORIO-INSTALACAO-UI.md` — **já arquivado nesta lib** em `specs/plan/RELATORIO-INSTALACAO-CONSOLIDADO.md (Anexo A)` (cópia verbatim, 2026-07-20). Pode remover do ERP; o re-Selo grava um novo. | Spec 26 |

## 2.2 PRESERVAR (negócio do ERP — proibido tocar)
`Modulos/` (Contratos/Propostas/Projetos), `specs/` (ADRs/specs do ERP), `.githooks/`, `CLAUDE.md`, `.env`, `.gitignore`, `.git`, `__pycache__/`, os scripts Python de negócio (`extract_drawings.py`, `extract_layout.py`, `generate_templates.py`, `gerador_contrato.py`), os SQLs de negócio (`supabase_contratos.sql`, `supabase_propostas.sql`), `Template_Contrato_Iarendel_Template.pdf`, e as **8 skills de negócio** em `.agents/skills/`: `contrato-gerador-iarendel`, `contrato-template-iarendel`, `erp-regras`, `meta-create-skill`, `projeto-editar-iarendel`, `projeto-gerador-iarendel`, `proposta-editar-iarendel`, `proposta-gerador-iarendel`.

## 2.3 Casos com decisão (HITL — perguntar antes de agir)
1. **`package.json` / `package-lock.json` (híbrido):** o ERP **não tinha** `package.json` antes da rodada 1 (foi exatamente isso que causou o achado 2 — o npm subiu a árvore). O arquivo atual nasceu na rodada 1, mas herdou identidade do ERP (`"name": "erp"`, `repository: ERP-Iarendel`) e, segundo o `00-progresso.md`, foi **varrido por commits de negócio** ("proposta xtreme") — está tracked no git. Opções: (a) remover ambos por completo, devolvendo o ERP ao estado "sem frontend" (fiel à rodada 1 e o que melhor testa o achado 2 de novo); (b) manter um `package.json` mínimo só com a identidade, sem scripts/deps da Sarak. **Recomendação: (a)** — o re-Selo precisa medir a instalação num diretório sem `package.json`, que é o caso real.
2. **`database.sqlite`:** é o storage de temas da UI (sqlite escolhido na entrevista) e contém os temas persistidos no teste M8. Recomendação: **remover** (é artefato da UI, não do negócio) — confirmar, já que é um arquivo de dados.
3. **Schema `ui_core` no Supabase remoto do ERP:** a rodada 1 decidiu **não dropar** (decisão HITL nº2 da Spec 25) e ele permanece. Confirmar se agora deve ser dropado (`DROP SCHEMA ui_core CASCADE;`) ou se segue reaproveitável — lembrando que a rodada 1 usou **sqlite**, não Postgres, então o schema remoto pode estar órfão desde a tentativa pré-onda.
4. **`.env`:** a rodada 1 removeu a linha `DATABASE_URL`. Conferir se a instalação re-adicionou variáveis da UI; remover só essas linhas, nunca o arquivo.
5. **Commit:** perguntar se o agente commita ou se o usuário commita (padrão do repositório: **usuário commita**).

# 3. Procedimento

1. **Inventário vivo primeiro (obrigatório):** antes de deletar, liste a raiz do ERP e faça grep por `sarak` (case-insensitive, fora de `node_modules`/`.git`); compare com a tabela 2.1. Se aparecer QUALQUER item da UI não listado, adicione ao inventário e registre. **Não confie cegamente nesta tabela** — a pegada muda conforme as respostas do `init`.
2. **Confirme o que está tracked:** `git status` + `git ls-files` na raiz, para separar o que precisa de `git rm --cached` do que é só disco (`node_modules/`, `dist/` provavelmente gitignored). O `package.json` está tracked e misturado a commits de negócio — trate com cuidado (2.3.1).
3. Resolver os 5 itens HITL da seção 2.3 com o usuário.
4. Remover os itens de 2.1 (+ o que o inventário vivo acrescentar), respeitando as decisões HITL.
5. **Verificação de integridade:** `git status` mostrando só as remoções esperadas; grep final por `@sarak/lib-ui-core|SarakManifestRenderer|SarakUIProvider|manifest-catalog` (fora de `.git`) → **zero** ocorrências de código vivo; os scripts Python do negócio continuam executando (`python extract_layout.py` sem quebrar); `.env` e as 8 skills de negócio preservados.
6. Registrar entrada no `00-progresso.md` desta lib: o que foi removido, decisões HITL tomadas, e que o ERP está pronto para o re-Selo.

# 4. Critérios de Aceite
- [x] Raiz do ERP sem nenhum artefato da instalação: `src/`, `node_modules/`, `dist/`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `database.sqlite` removidos; `package.json`/`package-lock.json` conforme a decisão 2.3.1 (removidos por completo).
- [x] `.agents/skills/` com **apenas as 8 skills de negócio**; `.claude/skills/` sem as skills de UI (`.claude/` removido inteiro — ficaria vazio).
- [x] Grep por `@sarak/lib-ui-core|SarakManifestRenderer|SarakUIProvider|manifest-catalog` (fora de `.git`) → zero código vivo. Menções históricas em `specs/` do ERP permanecem (listadas, não apagadas — `specs/README.md`, `specs/arquitetura/00-base-typescript.md`, genéricas ao ecossistema).
- [x] Nenhum item da lista 2.2 modificado; `python extract_layout.py` executa sem quebrar.
- [x] As 5 decisões HITL registradas com a escolha do usuário.
- [x] Relatório da rodada 1 preservado (já arquivado em `specs/plan/RELATORIO-INSTALACAO-CONSOLIDADO.md (Anexo A)` desta lib).
- [x] Entrada no `00-progresso.md` + este frontmatter 🟢.

# 5. Plano de Testes (Quality Gate)
- [x] `git status` do ERP contém somente as deleções esperadas (+ nenhuma linha do `.env` a remover — já estava limpo).
- [x] Grep de resíduo (§3 passo 5) documentado na entrada de progresso com a **saída literal**.
- [x] Scripts de negócio sobrevivem (execução real de `extract_layout.py`, exit 0).
- [x] **Gate de prontidão para o re-Selo:** o ERP não tem `package.json` (decisão 2.3.1 = remover por completo) — condição que o re-Selo precisa para medir o achado 2 de novo.
