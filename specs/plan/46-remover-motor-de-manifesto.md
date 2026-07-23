---
tipo: "spec"
titulo: "Remover o renderizador de páginas por manifesto (#2) — preservando o modelo de módulos (#1)"
dominio: "Arquitetura / Remoção / Redução de escopo"
status: "🔴 Planejada (remoção grande; SÓ depois do Teste Real provar o modelo de módulos)"
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
- [ ] `src/core/Manifest/` removido; grep-zero de `SarakManifestRenderer`/manifesto-de-página vivo.
- [ ] `core/Shell/`, `core/Discovery/`, `core/Provider/`, `core/Design/`, `components/atomic/` intactos; `SarakShell`/`registerSarakModule`/`registerLocalComponent` seguem exportados; **MyService intacto**.
- [ ] `src/index.ts` exporta só a base (Provider, Shell, registro de módulos/componentes, atômicos, Design Engine); nada de renderizador de páginas.
- [ ] Catálogo/gates do #2 removidos ou substituídos; paridade de tokens de design segue verde.
- [ ] Skills do #2 removidas (Spec 45); deps que só o #2 usava removidas; `npm pack` menor; bundle re-medido (base nova p/ Spec 41).
- [ ] `npm run build` verde; suíte restante verde.
- [ ] Nota de descontinuação no `00-progresso.md`.

# 7. Plano de Testes
- [ ] Após cada fatia: `npm run build` + suíte + `run_audit.mjs` verdes.
- [ ] Bundle antes/depois da saída do Registry ansioso (número no progresso — alimenta a Spec 41).
- [ ] Confirmar Design Engine, Provider, Shell (#1) e componentes funcionando sem o #2; MyService intacto.
