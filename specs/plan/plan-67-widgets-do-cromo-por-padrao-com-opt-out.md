---
tipo: "plan"
titulo: "Montar os widgets do cromo por padrão, com opt-out"
objetivo: "O cromo do modo ui-kit nasce com busca, alternância de tema, usuário e colapso sem o consumidor escrever uma linha, e o consumidor desliga o que não quiser"
dominio: "Sarak-Lib-UI-Core / Layout / Cromo"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "cromo", "zero-config", "major", "adr"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[arquitetura/01-forma-do-produto-e-modos-de-consumo]]", "[[specs/03-versionamento-e-release]]"]
depende_de: "plan-66-cromo-do-modo-ui-kit-consome-os-tokens-de-cromo"
retida_por: ""
destino_sintese: "adr/NNN-cromo-do-modo-ui-kit-com-widgets-por-padrao.md · specs/05-cromo-e-slots.md"
---

# 1. Objetivo

Um consumidor que monta `SarakAppChrome` com marca e navegação recebe, sem escrever mais nada, um cromo com
busca (e o atalho de teclado), alternância de tema, widget de usuário e colapso da navegação — e pode
desligar cada um deles.

# 2. Contexto

**Esta é a plan que muda o que todo consumidor vê sem ele tocar numa linha, e é `major`.**

O dono comparou os dois sistemas e concluiu: *"o sistema atual recebeu evoluções funcionais e está muito
mais robusto, porém na prática a usabilidade e a experiência ficaram piores"*. A investigação mostrou que
o cromo do modo módulos-plugin entrega pronto o que o do modo ui-kit não entrega de forma alguma — e que
isso nunca foi uma decisão: [[05-cromo-e-slots]] §1 registra que o `SarakAppChrome` nasceu para fechar um
sintoma pontual (*"topbar e sidebar não aparecem"*), como o mínimo para o cromo existir. Ele virou o cromo
padrão do único consumidor vivo sem nunca ter sido comparado com o que substituía.

Os widgets já são públicos ([[arquitetura/03-superficie-publica]] §3.1) e a plan 66 torna os tokens de
cromo efetivos. Elas não respondem à pergunta que
sobra: **o que aparece por omissão?** Hoje, nada.

**A decisão do dono (2026-09-09) é: default com opt-out.** O argumento é de coerência com a própria base,
que já resolveu essa pergunta duas vezes no mesmo sentido:

- [[07-responsividade-e-multidispositivo]] §1 — *"Layout multidispositivo é POR PADRÃO. Zero-config"*, com
  o corolário de que exigir trabalho do consumidor para o comportamento correto é **bug da lib**.
- Os hosts de feedback (toast e overlay) *"já nascem montados — o consumidor não precisa (nem deve)
  montá-los à mão"*, e o `SarakUIProvider` os monta em `:231-236`.

O cromo era a única superfície da lib que exigia montagem manual.

**Alternativa real descartada:** opt-in, por uma prop que liga cada widget. Custo zero de quebra, e custo
permanente de uma linha de integração em todo consumidor, para sempre — o que contradiz as duas decisões
acima e mantém a lib entregando menos do que ela tem. **Custo da escolhida:** é `major`, e reverter seria
outro `major`. É por isso que ela vira ADR.

O momento é o mais barato possível: há **um** consumidor do modo ui-kit, e é ele quem está pedindo a
mudança. O custo cresce a cada consumidor novo.

**Fora do default, por recomendação aceita pelo dono:** seletor de idioma, redimensionamento por arraste e
auto-hide. Continuam disponíveis — por slot, por prop ou por token, conforme a plan 66 os deixou — mas não
aparecem por omissão. São refinamento, e cada um é superfície pública para sempre.

**Verificação que fecha um achado desta campanha:** o preview do painel renderiza o cromo do Shell
(`PreviewSystemRenderer.tsx:4-6`). Com esta plan, os dois cromos passam a exibir o mesmo conjunto de
elementos, e o preview deixa de mostrar um sistema que o consumidor não tem. Isso é **verificado** aqui,
item a item, não presumido: se sobrar divergência, ela é relatada.

# 3. Escopo

## 3.1 Dentro
- `src/components/Layout/SarakAppChrome.tsx` — montagem dos widgets por padrão e a prop de opt-out.
- `src/components/Layout/SarakAppChromeMobile.tsx` — onde cada widget cai no drawer e na barra, seguindo a
  regra de degradação da [[05-cromo-e-slots]] §2.3.
- `src/components/Layout/chrome/` — o que a montagem exigir de região.
- O atalho de teclado da busca — hoje só no Shell (`useSarakShellUI.ts:42`); passa a valer também no modo
  ui-kit, sem duplicar a implementação.
- Testes dos dois cromos, cobrindo default e cada opt-out.
- `browser-tests/` — se algum elemento novo entrar no conjunto nomeado medido.
- `docs/migracoes.md` — a nota **MAJOR**, com título citando a versão por extenso (o
  `migration-anchor:check` cobra isso).
- `sarak-ui/` e o kit do consumidor, pelos geradores — nunca à mão.

## 3.2 Fora
- `SarakShell` — não muda.
- A precedência dos slots: um slot preenchido pelo consumidor continua vencendo o default.
- Seletor de idioma, resize por arraste e auto-hide no default.
- Criar widget novo — os quatro já existem e já são públicos ([[arquitetura/03-superficie-publica]] §3.1).
- `PreviewSystemRenderer` — aqui ele é **verificado**, não alterado.
- Emitir a release. `npm version` é do dono ([[00-contexto]] §7).
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.2 (os slots e a precedência), §2.3 (a regra de degradação), §4 (as obrigações do drawer mobile) |
| Spec fixa | `arquitetura/01-forma-do-produto-e-modos-de-consumo.md` | §4 — os dois modos e o que cada um promete |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | §1 — o princípio zero-config que sustenta a decisão |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | as obrigações de foco e teclado que o atalho e o colapso tocam |
| Spec fixa | `specs/03-versionamento-e-release.md` | §5 — o que um `major` exige, e a nota de migração ancorada |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-refatorar-componente` | altera contrato público de componente |
| Código | `src/core/Shell/SarakShell.tsx` e `src/core/Shell/hooks/useSarakShellUI.ts:36-49` | o comportamento de referência, inclusive o atalho |
| Código | `src/core/Shell/Components/SidebarNav.tsx:131-200` · `TopbarNav.tsx:150-180` | onde cada widget cai em cada orientação |
| Código | `src/components/Layout/SarakAppChrome.tsx` · `SarakAppChromeMobile.tsx` | o cromo a mudar |
| Código | `src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx:127-225` | o que o preview exibe — a lista a conferir ao fim |

# 5. Instruções de execução

1. Ler as referências da §4. Listar, do cromo do Shell, cada elemento exibido por orientação — é a lista de
   paridade desta plan.
2. Definir a prop de opt-out: nome, forma e default. **Pronto quando** omitir a prop entrega o conjunto
   completo, e desligar um item remove só aquele.
3. Montar os quatro widgets no cromo, nas regiões corretas de cada orientação, respeitando a precedência
   dos slots: slot preenchido pelo consumidor **vence** o default.
4. Levar o atalho de teclado da busca ao modo ui-kit sem duplicar a implementação do Shell.
5. Resolver a degradação no celular pela regra da §2.3 — nada some; cada widget tem lugar na barra ou no
   drawer. Preservar as garantias de acessibilidade do drawer que a §4 daquela spec lista.
6. Testes: default completo; cada opt-out isolado; slot do consumidor vencendo o default; o atalho
   funcionando; a degradação no celular. **Pronto quando** cada teste falha se o comportamento
   correspondente for removido.
7. Escrever a nota **MAJOR** em `docs/migracoes.md`: o que muda na tela sem o consumidor mexer, e o exemplo
   de como voltar ao cromo vazio de antes.
8. Regenerar os kits pelos geradores e rodar `guide:check` e `dev-kit:check`.
9. **Conferir a paridade com o preview:** percorrer a lista do passo 1 e confirmar, item a item, que o
   `SarakAppChrome` passou a exibir o mesmo conjunto que o `PreviewSystemRenderer` mostra. Registrar no
   resumo o que ficou divergente, se algo ficar.
10. Rodar `npx vitest run`, `npm run cromo-css-real:check` e `npm run gates:full`.

# 6. Critérios de aceite

- [ ] `SarakAppChrome` sem prop de opt-out exibe busca, alternância de tema, widget de usuário e colapso.
- [ ] Cada item pode ser desligado isoladamente, e desligar um não afeta os outros.
- [ ] Slot preenchido pelo consumidor vence o default correspondente.
- [ ] O atalho de teclado da busca funciona no modo ui-kit, sem implementação duplicada.
- [ ] No celular nada some: cada widget tem lugar na barra ou no drawer, e as garantias de acessibilidade
      do drawer seguem intactas.
- [ ] Idioma, resize por arraste e auto-hide **não** entram no default.
- [ ] `docs/migracoes.md` tem a nota MAJOR, com a versão citada por extenso no título.
- [ ] Kits regenerados pelos geradores; `guide:check` e `dev-kit:check` verdes.
- [ ] A conferência de paridade com o preview está registrada, item a item, com as divergências nomeadas.
- [ ] `npx vitest run` verde; `cromo-css-real:check` verde; `gates:full` verde.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é comportamento observável **deste** componente (default e opt-out), com
dono no teste do módulo. O gate de paridade token ↔ consumidor é da plan 66, e a régua de `major` já é
cobrada por `migration-anchor:check` e `minor-no-removal:check`. Régua nova aqui seria a terceira sobre o
mesmo eixo.

- `git diff --stat` → só os arquivos de §3.1; nada em `src/core/Shell/`.
- `npx vitest run src/components/Layout` → verde, com os casos de default e de cada opt-out.
- `npm run cromo-css-real:check` → verde.
- `npm run guide:check` · `dev-kit:check` → verdes, e os kits vieram de gerador.
- Leitura de `docs/migracoes.md` → nota MAJOR com a versão por extenso.
- Leitura do resumo → a conferência de paridade com o preview foi feita item a item.
- `npm run gates:full` → verde.
- `npx vitest run` → verde.

# 8. Destino da síntese

**Destino:** `adr/NNN-cromo-do-modo-ui-kit-com-widgets-por-padrao.md` · `specs/05-cromo-e-slots.md`

**ADR — a régua da [[00-prompt-revisor]] §5.2 passa nas três:**

1. **Duas opções reais:** default com opt-out × opt-in por prop.
2. **A escolhida tem custo que a outra não tinha:** é `major` e muda a tela de todo consumidor existente
   sem ele tocar em nada. A opt-in não quebrava ninguém.
3. **Voltar atrás seria caro:** reverter é outro `major`, e depois de consumidores dependerem do default,
   mais caro ainda.

O `alternativas_consideradas` do ADR nomeia as duas e o custo de cada uma, incluindo o custo permanente da
opt-in: uma linha de integração em todo consumidor, para sempre.

Em `specs/05`, texto pronto para transporte, para a §2.2:

> O cromo nasce com o conjunto de widgets do modo host — busca com atalho, alternância de tema, widget de
> usuário e colapso da navegação — e o consumidor desliga o que não quiser. Slot preenchido pelo consumidor
> vence o default correspondente. Idioma, redimensionamento por arraste e auto-hide continuam disponíveis e
> fora do default. A regra de degradação da §2.3 vale igual para os widgets: no celular nada some.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
