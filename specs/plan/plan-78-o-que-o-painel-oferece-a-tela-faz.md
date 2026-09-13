---
tipo: "plan"
titulo: "Fazer todo token de cromo e toda ação do painel produzirem efeito, nos dois modos de consumo"
objetivo: "Fazer todo token de navegação oferecido no painel agir no SarakShell e no SarakAppChrome, e o painel só alterar o sistema quando o usuário aplica"
dominio: "Sarak-Lib-UI-Core / Cromo · Shell · Painel"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "cromo", "shell", "tokens", "painel", "paridade-de-modos"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/04-shell-e-discovery]]", "[[specs/06-painel-de-customizacao-e-preview]]", "[[specs/09-temas-e-presets]]", "[[arquitetura/04-contrato-de-tokens-e-paridade]]"]
depende_de: "plan-77-estilo-de-elemento-da-lib-cede-a-classe-utilitaria"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md · specs/04-shell-e-discovery.md · specs/06-painel-de-customizacao-e-preview.md · specs/07-responsividade-e-multidispositivo.md · arquitetura/04-contrato-de-tokens-e-paridade.md"
---

# 1. Objetivo

Cada token de navegação que o painel oferece muda a tela no `SarakShell` **e** no `SarakAppChrome`. O Shell
se comporta como o cromo apresentacional no que os dois têm em comum: auto-hide, cor do item ativo e busca
que navega. E o painel só altera o sistema quando o usuário **aplica** — nunca quando só pré-visualiza.

# 2. Contexto

A regra já está escrita: *"um token de cromo vale nos dois modos, ou não existe"* ([[05-cromo-e-slots]]
§2.4), e *"valor oferecido no schema é contrato com o usuário final"* ([[09-temas-e-presets]] §4.4.3). O
cabeçalho do próprio gate mede quantos tokens a violam hoje
(`gates/scripts/contrato/check-chrome-token-parity.mjs:18-31`): **14 tokens do schema `navigation` sem
consumidor em pelo menos um dos lados.** O gate cobre uma lista fechada de 14 outros, então esses ficam fora.

**Decisão do dono (2026-09-13): ligar, não remover.** Os 14:

| Token | Falta em |
| --- | --- |
| `sidebarNoiseOpacity` · `topbarNoiseOpacity` · `navActiveMarkerColor` · `navActiveMarkerGlow` · `sidebarBlur` · `sidebarShadow` · `searchDropdownGap` · `searchDropdownWidth` | **os dois** |
| `topbarTitleColor` | `SarakShell` |
| `sidebarLabelMaxWidth` · `sidebarMinWidth` · `sidebarMaxWidth` · `brandLogoSizeCollapsed` · `topbarLabelMaxWidth` | `SarakAppChrome` |

A descrição de cada token no schema (`src/core/Design/schema/navigation.ts`) diz o efeito que o usuário
espera do controle. **É contra ela que se liga.**

**Por que o Shell importa agora.** A [[04-shell-e-discovery]] §1 afirma que o modo módulos-plugin não tem
consumidor real. Isso deixou de ser verdade: o sistema de referência desta campanha
(`ZP/Automacao-relatorios/Novo`, `modules/painel-web/web/src/AppBootstrap.tsx:3,17`) monta o `SarakShell`,
hoje preso numa versão antiga da lib. Para ele migrar, o Shell precisa fazer o que o cromo apresentacional
já faz. Três divergências medidas pelo revisor em 2026-09-13:

- **Auto-hide não esconde a sidebar do Shell.** O sensor de borda existe (`SarakShell.tsx:92-107`), mas a
  `SidebarNav` é renderizada sem condição (`:110-124`) e não recebe o estado de visibilidade. Só o `DockNav`
  implementa o comportamento. O cromo apresentacional faz isso por `useChromeAutoHide`.
- **O item ativo da sidebar do Shell usa a cor de marca.** Texto, ícone e marcador pintam com
  `--theme-primary` (`SidebarNav.tsx:167,171,179`), e não com o token do papel. A `TopbarNav` e o
  `SarakAppChrome` já usam `--sarak-nav-active-color`.
- **A busca do Shell não leva a lugar nenhum.** `SarakShell.tsx:225` monta o `SarakSearch` sem `onSelect`:
  o palette lista os módulos e nenhum resultado é acionável. O palette já aceita o callback
  (`SarakSearch.tsx:27,62`).

**Uma opção oferecida que nunca age.** `globalBackgroundBlendMode` (`schema/media.ts`) aparece no painel com
cinco modos de mesclagem. `SarakBackgroundRenderer.tsx:40` fixa `'normal'` de propósito: o comentário ali
registra uma regra do dono, *"não devemos inverter cores da mídia base"*, porque qualquer modo diferente de
`normal` produz resultado oposto entre claro e escuro. A própria descrição do token admite que as outras
opções não têm efeito. **Recomendação do revisor, e o executor segue: remover o token do schema**, honrando
a regra do dono, em vez de ligar um efeito que ela proíbe.

**O painel.** Três achados:

- **Pré-visualizar vaza para o sistema pela porta lateral.** Escolher um tema no catálogo alimenta só o
  rascunho ([[06-painel-de-customizacao-e-preview]] §4). Mas `PresetsCatalog.tsx:104` anuncia o id no
  `resolvedThemeId`, que é estado do **Provider** (`useResolvedThemeId.ts:15`). O `ShellThemeToggle` lê esse
  id para aplicar o tema no sistema. Resultado: um tema só pré-visualizado entra no sistema no próximo
  clique do toggle do cromo. O JSDoc de `useResolvedThemeId.ts:8` já diz o comportamento certo — só quem
  **aplica** anuncia.
- **A mídia de fundo no Gêmeo Digital — a confirmar.** O registro diz que o preview não mostra a mídia
  global. Mas `DesignScope.tsx:57-63` já renderiza o `SarakBackgroundRenderer`, e o `PreviewSystemRenderer`
  usa o `DesignScope`. **Meça antes de mexer**: pode estar resolvido, ou o defeito pode estar no
  `LiveDraftPreviewFrame`.
- **Um rótulo que promete o que não entrega.** A aba do catálogo de atmosfera se chama *"Mídia Base"*
  (`AtmosphereCatalog.tsx:27`), mas não oferece mídia nenhuma. As opções são atmosferas geradas em CSS
  ([[09-temas-e-presets]] §5.1). O rótulo passa a ser **"Atmosferas"**.

# 3. Escopo

## 3.1 Dentro
- `src/core/Shell/**` — `SarakShell.tsx`, `Components/SidebarNav.tsx`, `TopbarNav.tsx` e o que o Shell precisar para consumir os tokens.
- `src/components/Layout/**` — o cromo apresentacional, para os tokens que faltam nele.
- `src/components/atomic/Navigation/SarakMenuItem.tsx` · `SarakShellNav.tsx` · `src/components/atomic/Inputs/SarakSearch.tsx` — onde o consumo compartilhado mora.
- `gates/scripts/contrato/check-chrome-token-parity.mjs` e seu teste — a lista deixa de ser fechada (§5 passo 5).
- `globalBackgroundBlendMode` — sai das três fontes, dos tipos gerados, dos temas shippados que o declaram,
  do `SarakBackgroundRenderer`, do `DesignScope`, do Provider, do `AtmosphereCatalog` e da lista de chaves
  extras, **pela skill `ui-refatorar-componente`**.
- `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx` · `AtmosphereCatalog.tsx` ·
  `LiveDraftPreviewFrame.tsx` · `PreviewSystemRenderer.tsx` · `src/features/DesignEngine/hooks/useDesignDraft.ts` ·
  `src/core/Provider/hooks/useResolvedThemeId.ts` — o anúncio do tema aplicado e o fundo do preview.
- Os testes de cada arquivo tocado.
- `docs/migracoes.md` — a remoção do token, sob a **7.0.0**.
- `dist/` · `sarak-ui/` · `docs/component-catalog.*` · `src/core/Provider/generated/` · `sarak-dev/` — **só pelos geradores**.

## 3.2 Fora
- **Default** de qualquer token de navegação. Ligar é fazer o valor agir, não trocar o valor.
- `DockNav` e o valor `dock` de `navigationStyle`. Não existe dock no cromo apresentacional, e esta plan não o cria.
- Tokens que não são de `schema/navigation.ts` (mais `isAutoHideEnabled`, que o gate já trata como cromo).
- O estilo global de elemento. É da plan anterior; se ele ainda interferir numa medição daqui, é achado.
- Textos da lib e idioma. É plan própria.
- Temas shippados, **exceto** tirar deles a chave `globalBackgroundBlendMode`.
- O consumidor (ERP e o sistema de referência).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | §2.4 — a regra dos dois modos e os papéis de cor do item; §2.4.1 — o gate; §2.3 — degradação no celular |
| Spec fixa | `specs/specs/04-shell-e-discovery.md` | §4 — o Shell e suas peças; §6 — o cromo do Shell consome o Design Engine |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | §4 — rascunho × sistema, e a porta única de aplicar; §6 — o Gêmeo Digital |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | §4.3 — `resolvedThemeId`; §4.4.3 — valor oferecido é contrato; §5.1 — atmosferas |
| Spec fixa | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` | a paridade das três fontes, para a remoção do token |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | §6.1 — tradução token → classe em mapa de literais, nunca string interpolada |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `padrao-typescript` · `ui-arquitetura-design` | sempre; consumo de token em átomo |
| Skill | `ui-refatorar-componente` | a remoção de `globalBackgroundBlendMode` sem quebrar a paridade |
| Skill | `test-unitario` | teste por comportamento ligado |
| Código | `src/core/Design/schema/navigation.ts` | a descrição de cada token é o contrato do efeito |
| Código | `src/components/Layout/chrome/useChromeDesignTokens.ts` · `useChromeAutoHide.ts` | como o cromo apresentacional já lê tokens e faz auto-hide — o Shell imita |
| Código | `src/core/Shell/hooks/useShellLayoutStyles.ts` | o hook controlador do Shell |
| Código | `src/core/Design/components/SarakBackgroundRenderer.tsx` · `DesignScope.tsx` | o fundo e o comentário da regra do dono |

# 5. Instruções de execução

1. **Ligar os 14 tokens**, cada um no lado em que falta, com o efeito que a descrição no schema promete.
   Onde o token é de um elemento que um dos cromos não tem, o efeito é no equivalente dele: o marcador do
   item ativo do cromo apresentacional; o painel do palette como *"dropdown de busca"*. Para esses, declare
   no resumo o que foi tomado como equivalente. **Parada obrigatória:** se um token não tiver equivalente
   possível num dos modos, **pare** e relate ao dono antes de decidir. Não remova nem invente.

2. **Paridade de comportamento do Shell.**
   - Com `isAutoHideEnabled`, a sidebar do Shell sai quando o ponteiro deixa a navegação e volta pelo
     sensor de borda, como no cromo apresentacional. O drawer do celular continua sem auto-hide.
   - Na `SidebarNav` do Shell, texto e ícone do item ativo usam `--sarak-nav-active-color`, e o marcador usa
     `--sarak-nav-marker-color` com o brilho de `navActiveMarkerGlow`. `--theme-primary` sai do item ativo.
   - O `SarakShell` passa `onSelect` ao `SarakSearch`: escolher um resultado, por clique ou teclado, ativa o
     módulo e fecha o palette.

3. **Remover `globalBackgroundBlendMode`**, seguindo a skill `ui-refatorar-componente`. O
   `SarakBackgroundRenderer` continua mesclando em `normal`, porque é a regra do dono. Um tema persistido
   que ainda traga a chave não pode encher o console: siga o precedente das chaves removidas em
   `src/core/Provider/utils/validation.ts` (aviso único, ou descarte silencioso, conforme o precedente) e
   prove com teste.

4. **O painel.**
   - Pré-visualizar um tema no catálogo não altera mais o `resolvedThemeId` do Provider. O id do tema
     escolhido acompanha o **rascunho**, e o sistema passa a anunciá-lo só quando o rascunho é aplicado. O
     JSDoc de `useResolvedThemeId.ts` continua verdadeiro.
   - **Mídia no preview:** meça antes. Aplique uma mídia global ao rascunho e verifique se ela aparece no
     Gêmeo Digital, pelo `PreviewSystemRenderer` e pelo `LiveDraftPreviewFrame`. Se aparecer, registre a
     evidência no resumo e **não toque código**. Se não aparecer, faça aparecer, com teste.
   - A aba *"Mídia Base"* passa a se chamar **"Atmosferas"**.

5. **O gate cobre o schema inteiro.** `check-chrome-token-parity.mjs` deixa de usar lista fechada: lê todos
   os tokens de `src/core/Design/schema/navigation.ts`, mais `isAutoHideEnabled`, e exige consumidor dos dois
   lados. O limite 1 do cabeçalho some. Declare os que restarem (R18). O self-test ganha:
   - um token novo no schema sem consumidor → **pega**;
   - com consumidor dos dois lados → **liberado**.

6. **Testes.** Um teste de comportamento por token ligado, no cromo onde ele foi ligado — o valor muda,
   a classe ou o estilo muda. Pelo menos um token prova **as duas direções** (valor A, valor B). Pelo menos
   um prova o caso **"não muda nada"** (default → sem efeito visual novo). Mais um teste para cada item dos
   passos 2 e 4.

7. Rode os geradores (`npm run catalog`, `npm run guide`, `npm run dev-kit`, os tipos de token), depois
   `npm run build`, `npm run chrome-token-parity:check`, `npm run cromo-css-real:check`, `npm run audit` (compare
   com o baseline) e a suíte inteira (`npx vitest run --maxWorkers=3`).

# 6. Critérios de aceite

- [ ] `chrome-token-parity:check` lê o schema inteiro e está verde; o cabeçalho não lista mais tokens órfãos.
- [ ] Os 14 tokens têm teste de comportamento no lado onde foram ligados; equivalências declaradas no resumo.
- [ ] Shell: auto-hide esconde e devolve a sidebar; o item ativo não usa mais `--theme-primary`; a busca navega
      por clique e teclado. Cada um com teste.
- [ ] `globalBackgroundBlendMode` não existe mais nas três fontes nem nos tipos; `auditor_paridade`
      converge; tema persistido com a chave não gera enxurrada de aviso (teste); nota em `docs/migracoes.md`.
- [ ] Pré-visualizar um tema não muda o `resolvedThemeId`; aplicar muda (teste nas duas direções).
- [ ] O fundo do preview está provado: evidência de que já funcionava, ou correção com teste.
- [ ] A aba se chama "Atmosferas".
- [ ] `audit` sem regressão contra o baseline; suíte inteira verde. Falha em arquivo não tocado foi rodada
      isolada antes de ser atribuída ([[00-backlog]] #5).

# 7. Como verificar (uso do revisor)

**Gate:** `chrome-token-parity:check` (existente) — passa a cobrir o schema `navigation` **inteiro**, não
uma lista fechada.

- `git status` + `git diff --stat` → só a §3.1, mais os gerados.
- **Efeito, não retorno:** para três tokens ao acaso, rodar o cromo real (`react-dom/server` num script
  `tsx`) com valor A e valor B, e comparar o HTML/estilo produzido nos dois modos.
- **Mutação no gate:** apagar temporariamente o consumo de um token de um dos lados → o gate cai nomeando
  o token e o lado. Restaurar byte a byte.
- **Mutação no Shell:** reverter só a condição do auto-hide → o teste correspondente cai. Restaurar.
- Conferir a regra do dono no `SarakBackgroundRenderer` (mesclagem `normal`) intacta.
- `grep -rnE "plan-[0-9]+|achado [0-9]+|veredito"` nos arquivos da entrega, rastreados e não rastreados.
- `npx vitest run --maxWorkers=3 > arquivo 2>&1` e ler a saída.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md` · `specs/04-shell-e-discovery.md` · `specs/06-painel-de-customizacao-e-preview.md` · `specs/07-responsividade-e-multidispositivo.md` · `arquitetura/04-contrato-de-tokens-e-paridade.md`

- **`05-cromo-e-slots`** — §2.4: a tabela passa a cobrir os tokens ligados, e a regra deixa de ter
  exceção conhecida. §2.4.1: o gate lê o schema inteiro.
- **`04-shell-e-discovery`** — três correções que esta síntese fecha:
  - §1: o modo módulos-plugin **tem** consumidor real;
  - §4: auto-hide, cor do item ativo e busca que navega;
  - §7.3 e §9: o registro de *ghost vars* já corrigidas (**#3 do backlog**) e a lacuna de teste de
    `src/shared/hooks/`, que já tem testes.
- **`06-painel-de-customizacao-e-preview`** — §4: o id do tema acompanha o rascunho e só é anunciado ao
  aplicar. §6: o que se provou sobre a mídia no preview.
- **`07-responsividade-e-multidispositivo`** — os ponteiros `arquivo:linha` defasados do cromo (**#2 do
  backlog**), reconferidos contra o código depois desta entrega.
- **`arquitetura/04-contrato-de-tokens-e-paridade`** — o número de paridade muda com a remoção do token.
  Reconferir contra o `audit`, sem copiar número à mão.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
