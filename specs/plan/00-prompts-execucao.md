# Prompts de Execução — PENDENTES

Cada bloco abaixo é um prompt COMPLETO para iniciar a execução de uma spec **numa conversa nova** (agente sem contexto anterior). Copie e cole o bloco inteiro. A numeração (`P21`…) corresponde ao item no Roteiro de Execução do `00-indice.md`. Prompts de itens concluídos são removidos (P18/Spec 43 — concluída 2026-07-23; P20/Spec 45 — concluída 2026-07-24, executada fora de ordem antes da 44 a pedido do mantenedor; P19/Spec 44 — concluída 2026-07-24).

Regras comuns já embutidas: acionar `ui-contexto-repositorio` primeiro; ler `00-indice.md`, `00-progresso.md` e a spec inteira; ao terminar, atualizar status/checkbox/progresso; gates (`catalog:check`, `npm run build`, testes por pasta, `run_audit.mjs` — comparar com o baseline conhecido, não esperar 0; `RegistryParity` é do #2 e vale até a Spec 46).

> ⚠️ **VIRADA (2026-07-22), premissa corrigida:** a lib tem 3 arquiteturas — **#1 módulos-plugin** (`Shell`+`Discovery`, o que o `Sarak-MyService` USA), **#2 renderizador de páginas por manifesto** (`Manifest`, FALHOU/ninguém usa), **#3 componentes atômicos+Provider+Design Engine**. Modelo oficial = **#1 (módulos-plugin do MyService)**: o importador registra seus módulos na base; o **Design Engine é a central de layout que aplica ao sistema inteiro**; atômicos são os blocos. **Remove só o #2 e o backend.** Um erro anterior dizia que "o MyService rodava componentes atômicos" — falso, ele roda #1. Ver `00-indice.md` (Fase 6).

## Ordem de execução

| Prompt | Spec | Item | Observação |
|---|---|---|---|
| **P21** | 40 — Teste Real (ERP como módulos) | 21 | Gate empírico. Libera a remoção do #2. Depende da 45 (✅ concluída) e da 44 (✅ concluída) para o starter + Design Engine sem backend. |
| **P22** | 46 — Remover o renderizador de páginas (#2) | 22 | ⚠️ SÓ depois do Teste Real. Mantém o #1. |
| **P23** | 41 — Piso de Bundle | 23 | Depois da 46 (muda a base) e antes da 42. |
| **P24** | 42 — Generalizar CardGrid | 24 | Depois da 41. |

---

## P21 — Spec 40: Teste Real (o ERP como módulos-plugin — GATE EMPÍRICO)

```
Execute a spec `specs/plan/40-teste-real.md` da Sarak-Lib-UI-Core. Implementar as features REAIS do ERP Earendel (`...\Code\Earendel\ERP`) — Propostas, Contratos, Projetos — como MÓDULOS-PLUGIN registrados na base Sarak (padrão MyService), com dados REAIS (Supabase), tematizados pela central (Design Engine). É o gate empírico que libera a remoção do #2 (Spec 46).

Preparação: (1) acione `ui-contexto-repositorio`; (2) leia `00-indice.md`, `00-progresso.md` e a spec 40 INTEIRA; (3) leia a `ui-integra-consumidor` reescrita (Spec 45) e o `Sarak-MyService/src/main.tsx`. CONFIRMAÇÃO ANTES: Specs 43/44/45 executadas; ERP com a build atual (`npm run sarak:check` na raiz do ERP → "Atualizado"; senão `sarak:update`). Parta do STARTER do `init` (Spec 45).

REGRA DE OURO: o importador REGISTRA seus módulos na base; a base dá Shell + tema. Cada feature do ERP vira um módulo React (`registerSarakModule`) usando componentes Sarak + tokens. Falta componente → React próprio com TOKENS (`var(--sarak-*)`) — opção A — ou demanda na lib. Bug/lacuna REAL de componente → corrige NA LIB (fix + gates + `sarak:update`), não hackeia no ERP. O layout global é alterado SÓ pela central, e a troca atinge todas as telas.

Construa por módulo: listagem real (componente Sarak sobre dado real), detalhe exibindo os campos que quebraram no manifesto (JSONB `dados_extras` em JS, link clicável, moeda do próprio registro), formulário real que grava de verdade, ≥1 composição densa. E prove o R5: o Design Engine (`/design`) altera tema/template e TODAS as telas do ERP (módulos incluídos) respondem; tema persiste (localStorage).

Entregue: `RELATORIO-TESTE-REAL.md` na raiz do ERP + na conversa: features reais por módulo (dado real + persistência via curl); as 4 PAREDES cada uma resolvida em React; a prova de que a central tematiza todas as telas (R5); bugs/lacunas de componente corrigidos NA LIB; fricções da ergonomia de tokens; matriz R1-R8; veredito. `npm run build` do ERP verde. Progresso. NÃO commite sem autorização.
```

---

## P22 — Spec 46: Remover o renderizador de páginas (#2) — ⚠️ SÓ depois do Teste Real

```
Execute a spec `specs/plan/46-remover-motor-de-manifesto.md` da Sarak-Lib-UI-Core. Remove APENAS o #2 — o renderizador de PÁGINAS por manifesto (`src/core/Manifest/`, que falhou e ninguém usa). MANTÉM o #1 (`src/core/Shell/` + `src/core/Discovery/` — o modelo de módulos oficial) e o #3.

PRÉ-CONDIÇÃO INEGOCIÁVEL: o Teste Real (Spec 40) precisa estar CONCLUÍDO E VERDE — o modelo de módulos provado no ERP. Não se remove antes. Se o teste revelou que a camada declarativa é necessária, PARE e reavalie. Confirme também: persistência de tema já migrada para o Provider (Spec 44); API/skills/starter no lugar (43/45).

Preparação: (1) acione `ui-contexto-repositorio`; (2) leia `00-indice.md`, `00-progresso.md` e a spec 46 INTEIRA (a tabela das 3 arquiteturas — o que sai e o que FICA); (3) confirme por grep o escopo real. Skills: `sarak:padrao-typescript`, `ui-refatorar-componente`, `sarak:code-limpeza-projeto`.

Entregue (seções 3/5), em FATIAS com gate verde a cada uma: parar de exportar o renderer/tipos do #2 → remover templates/skills/catálogo do #2 → remover `src/core/Manifest/` → remover gates do #2 (`RegistryParity` etc.; a paridade de tokens de DESIGN fica) → limpar deps que só o #2 usava. Grep-zero de `SarakManifestRenderer`/manifesto-de-página. CONFIRMAR que `SarakShell`/`registerSarakModule`/`registerLocalComponent`/Design Engine/componentes seguem intactos e exportados; MyService intacto. MEDIR o bundle antes/depois (a saída do Registry ansioso muda a base da Spec 41). Nota de descontinuação no progresso.

Ao terminar: `npm run build` verde; suíte restante verde; `npm pack` menor; números de bundle no progresso; frontmatter + checkbox (item 22). NÃO commite sem autorização.
```

---

## P23 — Spec 41: Piso de Bundle / barris de ícone (depois da 46, antes da 42)

```
Execute a spec `specs/plan/41-piso-de-bundle-barris-de-icone.md` da Sarak-Lib-UI-Core.

Preparação, nesta ordem: (1) acione `ui-contexto-repositorio`; (2) leia `00-indice.md`, `00-progresso.md` (incl. os números de bundle que a Spec 46 registrou — a linha de base MUDOU com a saída do Registry ansioso do #2) e a spec 41 INTEIRA; (3) leia a `specs/plan/42-generalizar-cardgrid-corecard.md` (vem depois, toca 2 dos mesmos arquivos — não invada). Skills: `sarak:otimizacao-nivel-1` (medir antes/depois — o coração) e `sarak:padrao-typescript`.

Contexto: 6 arquivos fazem `import * as LucideIcons from 'lucide-react'` com acesso por índice DINÂMICO (`LucideIcons[nome]`), impedindo tree-shaking (~1500 ícones). Os 5 cards burlam o átomo `SarakIcon`/`IconMap` curado. `lucide-react` é peerDep+external (incha o bundle do consumidor); `@phosphor-icons/react`/`@tabler/icons-react` são deps não-external (podem estar inteiras no `dist/` — verificar). Com o #2 REMOVIDO (Spec 46), re-meça: a base é outra.

REGRA DURA: meça ANTES de refatorar; se o ganho for irrelevante, feche com a conclusão negativa documentada. Entregue os itens 2.1-2.4 (medição; zero `import * as *Icons` dinâmico; `IconMap` estendido + warn em nome desconhecido; nomes de ícone no catálogo). Ao terminar: gates verdes; `run_audit.mjs` sem regressão; suítes de Cards/Templates/Icon verdes (snapshots dos 5 cards mudam — revise); checkbox (item 23) + progresso com os NÚMEROS.
```

---

## P24 — Spec 42: Generalizar SarakCoreCard / SarakCardGrid (depois da 41)

```
Execute a spec `specs/plan/42-generalizar-cardgrid-corecard.md` da Sarak-Lib-UI-Core.

Preparação, nesta ordem: (1) acione `ui-contexto-repositorio`; (2) leia `00-indice.md` e `00-progresso.md`; (3) leia a spec 42 inteira e a relacionada `specs/plan/30-fechamento-achados-pos-selo.md` (precedente — mesma solução no `SarakActionCard`). Skills: `sarak:padrao-typescript`, `ui-refatorar-componente` (o tipo público `SarakCardGridProps.mapping` perde campos — quebra de contrato).

Contexto: `SarakCoreCard` (variante `"classic"`, DEFAULT de `SarakCardGrid`) tem o mesmo domínio LLM que o `SarakActionCard` tinha (painel "Custo In/Out (1M)", "Janela de Contexto" com aritmética, "Tokenizer", subtitle default 'Modelo'); `SarakCardGridProps.mapping` declara `price_in?`/`price_out?`/`context?` no TIPO (breaking change ao remover).

Ordem obrigatória: (1) `SarakCoreCard.test.tsx` de caracterização (snapshot) ANTES de tocar; (2) generalizar o painel para `mapping.details` (pares `{label,value}` pré-formatados, sem aritmética de domínio); (3) remover `price_in`/`price_out`/`context` do tipo; (4) nota de migração + remover a nota temporária que a Spec 30 deixou no catálogo/skill. Pré-req: Spec 41 (P23) rodou antes — arquivos em comum; se não, preserve a troca de ícone dela (use `SarakIcon`, nunca barril dinâmico). Ao terminar: gates verdes; `run_audit.mjs` sem regressão; suíte de Templates verde; checkbox (item 24) + progresso.
```
