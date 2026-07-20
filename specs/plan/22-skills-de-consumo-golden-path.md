---
tipo: "spec"
titulo: "Skills de Consumo: Golden Path, Source e Linguagem de Portas"
dominio: "Skills / DX de Consumo"
status: "🟢 Concluída (2026-07-19)"
prioridade: "Alta"
tags: ["spec", "skills", "golden-path", "manifesto", "consumo"]
relacionados: ["08-consumo-externo-e-integracao", "11-engine-declarativa-e-manifestos"]
---

# 1. Visão Geral e Descrição do Problema

As 3 skills de consumo (`ui-integra-consumidor`, `ui-integra-escrever-manifesto`, `ui-auditoria-manifesto`) melhoraram muito, mas os testes reais revelaram lacunas que induziram agentes consumidores a erro:
1. **Infra por adivinhação**: sem Golden Path explícito, um agente inventou NPM Workspaces (quebra `concurrently` no Windows) e montou server/proxy no escuro (Relatório de Instalação 1).
2. **Telas vazias por autoria**: a skill de manifesto cita `source` numa linha só — o agente fez listas com "botão Carregar + renderIf" em vez de carga automática com estados loading/empty/error.
3. **Tokens inventados**: sem regra dura "só valores do catálogo", o agente criou `--sarak-color-border`, `spacing-xs`, `variant: h4` (inexistentes) — e a auditoria de manifesto não valida VALORES.
4. **Portas mal comunicadas**: persistência e autenticação são portas/contratos (specs plan/19 e plan/20), mas as skills ainda falam como se `connectionString` fosse o único caminho.

# 2. Regras de Negócio (Solução)

> Dependências: specs plan/16 (tokens no catálogo), plan/19 (porta de persistência), plan/20 (auth), plan/21 (init). Esta spec fecha a camada de instrução por cima delas. Espelhos `.agents/skills/` e `.claude/skills/` sempre sincronizados (hash igual).

## 2.1 `ui-integra-consumidor`
- Workflow reescrito em torno do scaffolder: entrevista mínima (stack/persistência) → `npx @sarak/lib-ui-core init` → validação (`npm run dev` sobe, template renderiza) → handoff.
- **Golden Path explícito**: "instalação é MONOLÍTICA (um único package.json); NÃO use NPM Workspaces" com o porquê (binários no Windows).
- Persistência apresentada como PORTA: 3 opções (referência sqlite/pg com `schema` configurável; contrato REST implementado pelo backend do consumidor em qualquer linguagem; `UIStorageAdapter` custom p/ providers como Supabase/Firebase — apontando os exemplos documentados).
- Autenticação apresentada como PORTA: a lib só renderiza login; token/sessão via interceptors (receita da spec plan/20).
- Manter: peerDeps explícitas, `typescript@^5`, CSS automático, template, etapa de skills (agora feita pelo init).

## 2.2 `ui-integra-escrever-manifesto`
- **Exemplo completo de lista auto-carregada** com `source` + `states` (loading/empty/error) + `renderFor` — como padrão OBRIGATÓRIO para telas de dados (o par "botão Carregar + renderIf" entra nos "erros comuns a evitar").
- **Regra dura de tokens**: "use SOMENTE valores da seção 'Tokens e valores permitidos' do catálogo; token inventado gera warn e não aplica" (depende da spec plan/16).
- Receita de login declarativo (resumo + link para a receita canônica da spec plan/20).
- Manter/reforçar: proibição de front fora do manifesto; faltou componente → demanda na lib via `ui-novo-componente`.

## 2.3 `ui-auditoria-manifesto`
- Passa a validar **valores**, não só chaves: tokens de spacing/variants contra a seção de tokens do catálogo; CSS vars citadas no JSON existem na lista de vars públicas; `source` sem `states` vira WARNING de UX.
- Adicionar checagem "lista de dados sem `source`" (padrão botão-carregar) como WARNING com sugestão.

## 2.4 Sincronismo e verificação
- Após editar: espelhar `.agents` → `.claude` e conferir hash; specs 08/11 recebem ponteiros para as novas seções (1 linha, sem duplicar conteúdo — regra da memória "specs sem avisos obsoletos").

# 3. Critérios de Aceite
- [x] `ui-integra-consumidor` conduz instalação nova SEM decisões de infra pelo agente (init faz tudo); menciona explicitamente o anti-workspace ("Golden Path" no topo do SKILL.md).
- [x] `ui-integra-escrever-manifesto` contém o exemplo completo de `source` com os 3 estados e a regra dura de tokens (item 2 e item 6 do workflow + 2 regras novas em "Regras de Ouro e Segurança").
- [x] `ui-auditoria-manifesto` aponta token inventado e lista-sem-source em um manifesto de teste (workflow itens 2 e 6, ver dry-run abaixo).
- [x] Espelhos `.agents`/`.claude` com hash idêntico nas 3 skills — `.claude/skills` é symlink físico de `.agents/skills` (mesmo inode), hash idêntico por construção; conferido via `sha256sum` nas 3 (ver `00-progresso.md`).

# 4. Plano de Testes (Quality Gate)
- [x] Revisão manual (HITL) das 3 skills contra o checklist do `meta-create-skill` — estrutura em 3 camadas preservada, `description` com gatilho+trava, dependências e regras com justificativa mantidas.
- [x] Dry-run: manifesto de teste com token inventado (`spacing-xxl`) + lista com `renderFor` sem `source` correspondente — a `ui-auditoria-manifesto` (workflow item 2 e item 6) reporta ambos como WARNING; manifesto corrigido seguindo o exemplo do item 6 da `ui-integra-escrever-manifesto` fica limpo.
- [x] Hash-check dos espelhos automatizado — `sha256sum .agents/skills/<skill>/SKILL.md .claude/skills/<skill>/SKILL.md` para as 3 skills, resultado idêntico (symlink garante isso estruturalmente, não é coincidência de conteúdo).
