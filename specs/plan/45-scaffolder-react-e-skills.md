---
tipo: "spec"
titulo: "Scaffolder — starter padrão (modelo MyService) + skills do modelo módulos-plugin"
dominio: "Scaffolder (init) / Skills de Consumo / DX"
status: "🔴 Planejada (parte da virada; antes do Teste Real — o teste USA o starter gerado)"
prioridade: "Alta"
tags: ["spec", "virada", "design-system", "scaffolder", "skills", "modulos-plugin", "dx"]
relacionados: ["43-design-system-primeiro", "44-temas-json-e-persistencia", "40-teste-real", "21-scaffolder-init", "22-skills-de-consumo-golden-path"]
---

> **Contexto:** realiza o pedido do mantenedor: *"ao iniciar um novo projeto eu importo o módulo UI e o frontend é criado mantendo padrão"*. O starter gerado é o **esqueleto do modelo MyService** (Provider + Shell + Design Engine + módulo de exemplo). Sequenciada ANTES do Teste Real de propósito — o teste do ERP **usa** este starter, fechando o ciclo.

# 1. Visão Geral e Descrição do Problema

Hoje o `init` (Spec 21) gera um app **manifesto-only** (`main.tsx` renderizando `SarakManifestRenderer` sobre `app.manifest.json`) e as skills (Spec 22) ensinam a montar tudo via JSON, tratando React no consumidor como "defeito". No modelo oficial (Spec 43 — módulos-plugin) isso está invertido: o importador **registra módulos React** na base.

# 2. Regras de Negócio (Solução)

## 2.1 `init` gera o starter padrão (modelo MyService)
- O scaffolder passa a gerar um esqueleto **no padrão MyService**: `main.tsx` com `SarakUIProvider` (recebendo `options`/manifest do sistema + `customThemes`/`defaultTheme`) envolvendo `SarakShell`; um **módulo de exemplo** registrado via `registerSarakModule` (uma feature com uma tela) e um `registerLocalComponent` de exemplo; o Design Engine acessível (módulo nativo "personalization"). Espelhar o `safeRegister`/`registerSarakModuleSafe` do MyService `main.tsx` como o padrão de registro.
- **Sem backend** (Spec 44): sem `serverTs.mjs`, sem storage servidor; tema via localStorage/JSON.
- `npm run dev`/`build` do starter verdes; a tela inicial renderiza com o Design Engine funcionando.

## 2.2 Reescrever `ui-integra-consumidor` (modelo módulos-plugin)
- De "monte 100% via manifesto, React é defeito" para **"importe a base, registre seus módulos, altere o layout pela central (Design Engine)"**. Cobrir: instalar/atualizar (Spec 39), montar `SarakUIProvider`+`SarakShell`, `registerSarakModule` para features, `registerLocalComponent` para overrides, usar componentes/tokens (para o módulo ser temável — Spec 43 §3.3), temas em JSON (Spec 44).
- Incorporar os aprendizados REAIS do Teste Real (Spec 40) quando ele rodar — se a 45 fechar antes do teste, reabrir a skill para os ajustes finais depois (nota).

## 2.3 `ui-integra-escrever-manifesto` / `ui-auditoria-manifesto` — dependem da Spec 46
- A Spec 46 remove o renderizador de páginas por manifesto (#2). Estas skills são desse modelo → **removê-las** quando a 46 rodar, deixando nota de que o caminho é registrar módulos. Registrar a dependência (fecham na 46).

## 2.4 Espelhos e catálogo
- Espelhar `.agents` → `.claude` (symlink — conferir). Alinhar o catálogo à API pública real do modelo (Provider/Shell/registro de módulos/componentes/tokens), conforme a Spec 43/46 definirem.

# 3. Critérios de Aceite
- [ ] `init` gera starter no padrão MyService (Provider + Shell + Design Engine + módulo de exemplo registrado), sem backend; `npm run dev`/`build` verdes.
- [ ] `ui-integra-consumidor` reescrita para o modelo módulos-plugin; espelho `.claude` com hash igual.
- [ ] Skills do manifesto (#2) marcadas para remoção na Spec 46.
- [ ] Catálogo coerente com a API pública real.
- [ ] Gates verdes; smoke do `init` (novo starter) verde.

# 4. Plano de Testes
- [ ] Smoke: `init` em tmp → `npm install` → `npm run build` do starter verde, sem backend; o módulo de exemplo renderiza no Shell.
- [ ] Dry-run de autoria: um agente limpo, seguindo a skill reescrita, registra um módulo novo e o vê no Shell tematizado — sem tratar React como defeito.
