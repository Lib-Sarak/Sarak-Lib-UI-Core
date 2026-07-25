---
tipo: "spec"
titulo: "Remover o renderizador de páginas por manifesto (#2) — preservando o modelo de módulos (#1)"
dominio: "Arquitetura / Remoção / Redução de escopo"
status: "🟢 Concluída (2026-07-25) — #2 removido em 6 fatias (0-5), gates verdes em cada uma; #1/#3 intactos; bundle re-medido"
prioridade: "Alta"
tags: ["spec", "virada", "remocao", "manifesto"]
relacionados: ["43-design-system-primeiro", "40-teste-real", "44-temas-json-e-persistencia", "45-scaffolder-react-e-skills"]
---

> **Precisão de escopo (2026-07-22):** a lib tem TRÊS arquiteturas em `src/core/`. Esta spec remove **APENAS o #2** — o renderizador de PÁGINAS por manifesto (`src/core/Manifest/`, `SarakManifestRenderer`). **NÃO toca no #1** (`src/core/Shell/` + `src/core/Discovery/` — o modelo de módulos-plugin do MyService, que passa a ser o oficial) nem no #3 (`components/atomic/` + `Provider/` + `Design/`). Um erro de planejamento anterior confundiu #1 com o modelo alvo — corrigido: o #1 se MANTÉM e se des-deprecia.

# 1. As três arquiteturas e o que sai
| # | Arquitetura | Pasta(s) | Nesta spec |
|---|---|---|---|
| 1 | Módulos-plugin (Discovery + Shell, Spec 04) — modelo OFICIAL (MyService) | `core/Discovery/`, `core/Shell/` | **MANTÉM** (des-depreciado na Spec 43) |
| 2 | Renderizador de PÁGINAS por manifesto (SarakManifestRenderer) | `core/Manifest/` | **REMOVE** |
| 3 | Componentes atômicos + Provider + Design Engine | `components/atomic/`, `core/Provider/`, `core/Design/` | **MANTÉM** |

# 2. Visão Geral e gate de segurança

Remover a camada de renderização de páginas por manifesto (#2) — a que falhou no Teste Real e não tem consumidor. É a maior deleção da virada e tem **gate empírico**: só executa **depois de o Teste Real (Spec 40) provar, no ERP real, que o modelo de módulos-plugin sustenta produção**. Não se remove um caminho antes de o modelo oficial estar provado no campo. Se o Teste Real revelar que a camada declarativa é necessária, PARAR e reavaliar.

# 3. Escopo da remoção (o executor confirma por grep antes de deletar)
- **Motor #2:** `src/core/Manifest/` inteiro — `SarakManifestRenderer`, Dispatcher, DataSource, Form, Binding, Conditional, RenderFor, o Storage-do-manifesto, `nodes/` (LeafNode, ShellRouterNode — o shell declarativo da Spec 18/33, que é do #2, NÃO a Shell legada do #1), Registry/NATIVE_COMPONENTS do manifesto, sanitizeDirectives.
- **Exports públicos** do #2 em `src/index.ts` (renderer, tipos de manifesto de página). Avaliar `registerComponent` do manifesto (se existir separado do `registerLocalComponent` do #1).
- **Catálogo de manifesto:** `scripts/generate-manifest-catalog.mjs` + `docs/manifest-catalog.*` (o catálogo de `type`s/diretivas/pipes/ações do #2). Se o catálogo passar a documentar a API de módulos/componentes/tokens do modelo oficial, redefinir conforme Spec 43/45.
- **Gates do #2:** `RegistryParity.test.tsx` (paridade do registry de `type`s do manifesto) e o `catalog:check` do manifesto. A paridade de **tokens de design** (schema/mastermap/catálogo de tema) do Design Engine **permanece**.
- **Skills do #2:** `ui-integra-escrever-manifesto`, `ui-auditoria-manifesto` (coordenar com a Spec 45 — removidas).
- **Testes** de `src/core/Manifest/__tests__` e **templates** manifesto-only (`templates/app-starter.manifest.json`).
- **NÃO remover:** `core/Shell/` (SarakShell legado = modelo oficial agora), `core/Discovery/` (registro de módulos), `core/Provider/`, `core/Design/`, `components/atomic/`.

## 3.1 Desacoplamento OBRIGATÓRIO antes de deletar (achado do ciclo 40.x — 2026-07-25)
O ciclo 40.x construiu **ferramental do modelo oficial (#3) EM CIMA do Registry do #2** (`nativeComponents.ts`). Removê-lo sem re-apontar esses consumidores **quebra o #3**. Portanto, ANTES de deletar `src/core/Manifest/`:
- **Gate de paridade de barril** (`scripts/check-barrel-parity.mjs`, Spec 40.1) — hoje cruza `nativeComponents.ts` contra `src/index.ts`. Re-apontar para a fonte que sobrevive (AST dos componentes públicos e/ou o próprio barril), sem depender do Registry do #2.
- **Gerador de catálogo** (`npm run catalog` / `generate-manifest-catalog.mjs`) — hoje gera do Registry do #2. O #3 **e a Spec 50** (o kit do consumidor, que reusa o `catalog`) precisam de um catálogo da **API pública**; re-apontar para o barril/AST.
- **Gerador do kit do consumidor** (Spec 50, `npm run guide`) — reusa o `catalog`; garantir que o catálogo que ela consome **não** dependa do #2 (a 50 roda por último, mas sua fonte não pode ter sido removida).
- **Componentes registrados no #2 durante o ciclo** (`SarakLink`, os 6 inputs da 40.1) — sair do `nativeComponents.ts` **não pode des-exportá-los do barril**; eles já estão em `src/index.ts` (é o que vale para o consumidor).
- **Regra:** cada ferramenta acima passa a ler o barril/AST **antes** de o `nativeComponents.ts` ser deletado; `barrel:check` e `catalog:check` seguem **verdes** em toda fatia. Se algo do #3 ficar órfão do Registry, **PARE** — o desacoplamento vem primeiro. Isto é o que muda o tamanho desta spec: não é só "deletar o #2", é "mudar a fonte do ferramental do #3 e então deletar o #2".

# 4. Pré-condições (trava de sequência)
- **Spec 40 (Teste Real) concluída e verde** — modelo de módulos provado no ERP.
- **Spec 44 concluída** — persistência de tema já na camada Provider/Design (não em `core/Manifest/Storage`).
- **Specs 43/45 concluídas** — modelo oficial documentado, skills e starter no lugar.

# 5. Regras de Negócio
- Remoção em FATIAS, cada fatia com gate verde (nunca um commit gigante): (1) parar de exportar o renderer/tipos do #2; (2) remover templates/skills/catálogo do #2; (3) remover `src/core/Manifest/`; (4) remover os gates específicos do #2; (5) limpar deps que só o #2 usava.
- **Grep-zero** ao final: nenhuma referência viva a `SarakManifestRenderer`/manifesto-de-página em `src/`, `docs/`, `bin/`, `templates/`. Confirmar que `SarakShell`/`registerSarakModule`/`registerLocalComponent`/`Design Engine` seguem intactos e exportados.
- **Benefício colateral a medir:** o Registry ansioso do #2 (que exigia todo componente não-lazy em runtime — a causa estrutural do piso de bundle da Spec 30/41) sai → **melhora o bundle**. Re-medir; muda a linha de base da Spec 41 (que roda DEPOIS desta).
- Nota de descontinuação no `00-progresso.md`: o #2 existiu (specs 11-42), foi validado para telas simples (Selo 9,3), removido na virada por não ter uso no modelo de módulos. Histórico no git.

# 6. Critérios de Aceite
- [x] `src/core/Manifest/` removido (81 arquivos); grep-zero de `SarakManifestRenderer`/manifesto-de-página vivo (só sobram asserções negativas/notas históricas em `bin/scaffold`).
- [x] `core/Shell/`, `core/Discovery/`, `core/Provider/`, `core/Design/`, `components/atomic/` intactos; `SarakShell`/`registerSarakModule`/`registerLocalComponent` seguem exportados; **MyService intacto** (nenhum arquivo do ERP tocado nesta execução).
- [x] `src/index.ts` exporta só a base (Provider, Shell, registro de módulos/componentes, atômicos, Design Engine); nada de renderizador de páginas (`export * from './core/Manifest'` removido).
- [x] Catálogo/gates do #2 removidos ou substituídos; paridade de tokens de design segue verde (`verify_parity.ts` 409/409/409, sem regressão).
- [x] Skills do #2 removidas (`ui-integra-escrever-manifesto`, `ui-auditoria-manifesto`); nenhuma dependência era exclusiva do #2 (verificado por grep de uso — todas seguem em uso pelo #1/#3; `react-grid-layout` já estava morta ANTES desta spec, fora de escopo); `npm pack` 60→55 arquivos; bundle re-medido (§ abaixo).
- [x] `npm run build` verde; suíte restante verde (**269 arq / 763 testes**, era 307/996 — a diferença são os **41 arquivos de teste / ~233 testes** do próprio #2 removidos; contagem reconciliada e verificada na revisão de 2026-07-25).
- [x] Nota de descontinuação no `00-progresso.md`.

# 7. Plano de Testes
- [x] Após cada fatia (0 a 5): `npm run build` + `package:check` + suíte completa + `run_audit.mjs` verdes (auditoria caiu de 3→2 falhas pré-existentes — sumiu o órfão de manifesto; hardcode+ghostvars são baseline anterior, não desta spec).
- [x] Bundle antes/depois da saída do Registry ansioso (número no progresso — alimenta a Spec 41): `dist/` 3.5M→3.2M, `index.cjs` 1305KB→1257KB, `index.d.ts` 161.7KB→107KB (-33%), `npm pack` 60→55 arquivos.
- [x] Confirmado Design Engine, Provider, Shell (#1) e componentes funcionando sem o #2; MyService intacto (não tocado).
