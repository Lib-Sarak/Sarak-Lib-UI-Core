---
tipo: "indice"
titulo: "Índice e Ordem de Build do Plano de Expansão"
dominio: "Sarak-Lib-UI-Core (Plano)"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["indice", "plano", "roadmap", "dependencias"]
relacionados: ["01-plano-mestre-expansao-generica", "02-plano-mestre-expansao-logica-e-dados"]
---

# 0. Como Executar (Entrypoint do Agente)
> Este índice é o **único arquivo que precisa ser enviado** para iniciar a execução. Ele aponta para as regras, define o fluxo e os comandos de verificação; o **detalhe de cada spec vive no próprio arquivo `NN-*.md`**, puxado sob demanda.

## 0.1 Onboarding obrigatório (LEIA ANTES DE CODIFICAR)
1. Acione a skill **`ui-contexto-repositorio`** e leia **`.agents/index.md`** + **`CLAUDE.md`** — inclui a **Regra de Ouro**: iniciar o time-tracking via MCP **antes** de qualquer tarefa de spec/código.
2. Leia as specs-fundação em **`specs/specs/`** (as leis do módulo):
   - `00-manifesto-arquitetural` — as **3 camadas** (`core/` · `components/atomic/` · `features/`).
   - `03-padrao-e-taxonomia` — **Zero Hardcode** (só `var(--sx-*)`).
   - `09-expansao-vs-configuracao` — quando é **Configuração** (dado) vs **Expansão** (engenharia).
   - `05-cobertura-de-testes`.
3. **Leis absolutas e inegociáveis:** 3 camadas · **Zero Hardcode** · **Zero Any** · **Paridade 1:1:1:1:1** (tokens) · **contratos TS tipados** (engines).

## 0.2 Workflow — uma spec por vez
1. Pegue o próximo item não marcado na **§3.1 (ordem de ondas)**.
2. Abra `specs/plan/NN-*.md` e siga as **Regras de Negócio** dela (o índice é o mapa; o conteúdo está na spec).
3. Classifique o tipo — **token / funcional / híbrido** — e escolha a skill (§0.4).
4. Implemente.
5. Rode o **Ciclo de Verificação** (§0.3).
6. Só marque `[x]` ao atingir o **Definition of Done** (§0.5). **Não encadeie** specs sem verificar a anterior.

## 0.3 Ciclo de Verificação (comandos)
- **Auditor:** `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs`
- **Tipos:** `npx tsc --noEmit` (alvo: 0 erros)
- **Testes:** `npx vitest run` (alvo: verde; qualquer falha nova é regressão sua)
- **Specs de token** (16 + visuais): após editar as 5 camadas, rode `npx tsx scripts/generate-token-types.ts` e confirme a **Paridade (302 + N)** no auditor.
- **Specs funcionais (20–34):** o sub-auditor da Conferência (Spec 34) **ainda não existe** → verifique manualmente os contratos TS (sem `any`) + os testes da spec até a 34 ser implementada.

## 0.4 Skill por tipo de mudança
- **Token / componente atômico novo** → `ui-novo-componente` (executa a paridade nas 5 camadas).
- **Deletar / alterar assinatura de token** → `ui-refatorar-componente`.
- **Auditar a base** → `ui-auditoria-modulo`.
- **Tema / preset** → `ui-criar-tema` / `ui-criar-preset`.
- **Engines funcionais (20–34)** → sem skill própria; siga a spec + o gate de contratos TS + a Conferência (34).

## 0.5 Definition of Done (por spec)
Marque `[x]` **só quando TODOS**:
- [ ] Todos os Critérios de Aceite da spec atendidos.
- [ ] Auditor sem **regressão nova** (única reprovação tolerada: `any`, ver §0.6).
- [ ] `tsc --noEmit` = 0 erros.
- [ ] `vitest run` sem falha nova.
- [ ] Se token: **Paridade = 302 + N** (Schema ↔ DB ↔ Catálogo).

## 0.6 Caveats do ambiente
- **ESLint não instalado** → o hook de padrão-escrita só **avisa** (modo warn), não bloqueia.
- **`any` (492 ocorrências)** é dívida pré-existente (baseline travado) — **não** conta como regressão. **Limpeza oportunista (obrigatória):** ao **tocar** um arquivo que contém `any` durante uma spec, **limpe aquele arquivo** como parte do trabalho (baixando o baseline). O resíduo não tocado fica para a **Spec 50** (Finalização).
- **Conferência (Spec 34)** é spec, ainda **não** é auditor; automatizá-la é tarefa de código futura.

# 1. Propósito
Mapa de navegação do diretório `specs/plan/`. O plano transforma a Sarak-Lib-UI-Core num **Motor UI agnóstico** (Design as Data) e divide-se em **dois blocos por faixa numérica**, cada um com seu Mestre. Este índice fixa a **ordem de build** e o **grafo de dependências** para evitar construção fora de ordem.

# 2. Estrutura por Faixa Numérica

## Mestres (01–02)
- `01-plano-mestre-expansao-generica.md` — Mestre do **Bloco Visual**.
- `02-plano-mestre-expansao-logica-e-dados.md` — Mestre do **Bloco Funcional** (inclui o Gate de Qualidade Funcional — ver §4).

## Bloco Visual (10–19) — os "blocos de Lego" da UI
| Nº | Spec | Categoria do Mestre 01 |
|---|---|---|
| 10 | micro-layout | 1. Estrutura Base |
| 11 | formulários | 2. Entrada de Dados |
| 12 | data-grids-vis | 3. Densidade/Visualização |
| 13 | feedback-interacoes | 4. Feedback/Status |
| 14 | navegação | 5. Navegação |
| 15 | mídia-renderizadores | 6. Mídia |
| 16 | responsividade-como-dado | Híbrida (breakpoints + diretiva `responsive`) |
| 17–19 | *(reservado para crescimento)* | — |

## Bloco Funcional (20–39) — o "cérebro" (Manifest Renderer)
| Nº | Spec | Papel |
|---|---|---|
| 20 | manifest-schema-e-gramatica-no | **Fundação:** contrato do nó JSON |
| 21 | datastore-estado-reativo | **Fundação:** estado reativo |
| 22 | component-registry-resolver | **Fundação:** type → componente |
| 23 | motor-de-repeticao-renderfor | Engine: listas/loops |
| 24 | motor-de-data-binding-pipes | Engine: interpolação + pipes |
| 25 | dispatcher-central-de-eventos | Engine: ações/eventos |
| 26 | motor-avaliacao-condicional | Engine: renderIf/disabledIf |
| 27 | error-boundaries-e-fallbacks | Engine: isolamento de falhas |
| 28 | persistencia-estado-local | Engine: LocalStorage |
| 29 | validacao-schema-formularios | Engine: validação |
| 30 | contrato-importador-renderer | **Composição final:** `<SarakManifestRenderer />` |
| 31 | fonte-de-dados-declarativa | Engine: carregamento assíncrono + ciclo de vida |
| 32 | binding-bidirecional-de-formulario | Engine: two-way + ciclo de formulário |
| 33 | composicao-pagina-rota-shell | App-shell + roteamento como dado |
| 34 | conferencia-funcional-do-manifesto | **Gate:** Paridade Funcional (7º auditor) |

## Transversais (40–49)
| Nº | Spec | Papel |
|---|---|---|
| 40 | modelo-de-seguranca-e-fronteira-de-confianca | Segurança consolidada / fronteira de confiança |
| 41 | contrato-de-acessibilidade | a11y transversal |
| 42 | ponte-tema-designscope | Tema por região (bridge Visual ↔ Funcional) |

## Finalização (50–59)
| Nº | Spec | Papel |
|---|---|---|
| 50 | finalizacao-adequacao-e-entrega | `any` residual → 0, documentação, guia do importador, entrega |

# 3. Ordem de Build e Grafo de Dependências
A construção segue dependências reais (não a ordem numérica cega):

1. **Visual primeiro (10–15):** os átomos precisam existir para serem resolvidos/renderizados.
2. **Fundação funcional (20 → 21 → 22):** gramática do nó, depois o estado reativo, depois o resolver. Nada do bloco funcional compila sem estas três.
3. **Engines (23–29):** dependem da fundação. Atenção às dependências cruzadas:
   - `23 renderFor` → consome **21** (escopo) e delega virtualização à **12** (DataGrid).
   - `24 pipes` → consome **21** (leitura de estado) e **15** (sanitização de HTML).
   - `25 dispatcher` → consome **24** (interpolação de URL/body) e abre **13** (Drawer/Modal).
   - `26 condicional` → consome **21** e **24**.
   - `29 validação` → consome **11** (inputs) e bloqueia ações da **25**.
4. **Composição (30):** o `SarakManifestRenderer` orquestra tudo e fecha o contrato com o importador (atualiza a Spec 08 em `specs/specs/`).
5. **Fluxo de dados completo (31, 32, 33):** a **31** (fonte-de-dados) popula o estado que a **23** (renderFor) itera — fecha o "tabelas não buscam dados"; a **32** (binding) fecha a malha Inputs↔Validação↔Submit; a **33** (shell/rotas) eleva o manifesto de tela única para app multi-página.
6. **Gate e Transversais:** a **34** (Conferência Funcional) é o verificador determinístico do contrato → **7º sub-auditor da `ui-auditoria-modulo`**. Segurança (**40**), a11y (**41**) e ponte de tema (**42**) atravessam todas as engines.

> **Inversão de prioridade a vigiar:** a `23` (Crítica) depende da `12` (Média). Antecipar ao menos a virtualização base da `12` antes de fechar a `23`.

## 3.1 Ordem de Execução (Ondas — Checklist)
> **Princípio:** o **número da spec é um ID estável** (identidade + categoria por dezena), **não** a ordem de execução. A sequência de build vive **aqui** — reordenável sem renomear arquivos nem quebrar referências (assim como a ordem dos tokens no `theme_table_mapping` não dita ordem de uso). Marque `[x]` ao concluir cada item.

Cada **onda** é um conjunto construível em conjunto; a ordem **entre** ondas é a dependência real. Specs visuais (10–16) são **puxadas sob demanda** pela engine que as consome.

- **Onda 0 — Fundação do contrato** *(nada funcional compila sem ela; a Conferência guarda o crescimento desde já)*
  - [x] 20 manifest-schema  · [x] 21 datastore  · [x] 22 registry  · [x] 34 conferência-funcional
  - [x] 10 micro-layout *(visual base — verificado/conformado e registrado no Component Registry)*
- **Onda 1 — Motor de dados vivo**
  - [x] 23 renderFor  · [x] 24 data-binding-pipes  · [x] 31 fonte-de-dados
  - [x] 12 data-grids *(BASE: virtualização que a 23 delega — `SarakDataGrid` headless via `@tanstack/react-virtual`; Kanban/Charts/TreeView ficam para a Spec 12 completa)*
- **Onda 2 — Interação e regras**
  - [ ] 25 dispatcher  · [ ] 26 avaliação-condicional
  - [ ] 13 feedback *(toasts/modais que a 25 abre)*
- **Onda 3 — Formulários**
  - [ ] 29 validação  · [ ] 32 binding-bidirecional
  - [ ] 11 formulários *(inputs consumidos pela 29/32)*
- **Onda 4 — Resiliência e estado**
  - [ ] 27 error-boundaries  · [ ] 28 persistência
- **Onda 5 — Aplicação real**
  - [ ] 33 shell/rotas  · [ ] 16 responsividade  · [ ] 30 contrato-renderer *(composição final)*
  - [ ] 14 navegação
- **Onda 6 — Transversais e mídia**
  - [ ] 40 segurança  · [ ] 41 a11y  · [ ] 42 ponte-tema
  - [ ] 15 mídia *(sob demanda)*
- **Onda 7 — Finalização** *(após 0–6, ou em paralelo em baixa prioridade)*
  - [ ] 50 finalização *(`any` residual → 0, docs, guia do importador, entrega)*

> O **30 (Renderer)** existe em versão **mínima** já na Onda 0 (harness para testar a fundação) e só é **finalizado** na Onda 5, quando o contrato completo (`payload`, `dataStore`, `routes`, interceptors) está pronto.

# 4. Gate de Qualidade (e Auditoria)
- **Bloco Visual:** gate = **Paridade 1:1:1:1:1** (tokens novos nas 5 camadas) + plano de testes da spec.
- **Bloco Funcional:** a paridade de tokens **não se aplica** (engines não são design tokens). O gate é definido na §5 do Mestre Funcional (`02-...`): **contratos TypeScript tipados (zero `any`) + cobertura de testes por engine**, e operacionalizado pela **Conferência Funcional (Spec 34)** — o verificador determinístico que **deve ser incorporado à `ui-auditoria-modulo`** como 7º sub-auditor (a implementação do auditor é tarefa de código, fora do escopo "apenas specs").
