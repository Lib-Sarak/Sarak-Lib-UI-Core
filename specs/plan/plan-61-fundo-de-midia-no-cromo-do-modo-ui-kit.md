---
tipo: "plan"
titulo: "Fazer o cromo do modo ui-kit honrar o fundo de mídia global"
objetivo: "Escolher uma mídia de fundo passa a mudar a tela também no SarakAppChrome, e não só no SarakShell"
dominio: "Sarak-Lib-UI-Core / Layout / Cromo"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "cromo", "atmosfera", "modo-ui-kit"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/09-temas-e-presets]]", "[[arquitetura/01-forma-do-produto-e-modos-de-consumo]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md"
---

# 1. Objetivo

No modo de consumo ui-kit (`SarakAppChrome`), um tema com `globalBackgroundImageUrl` preenchido passa a
exibir a mídia atrás de todo o cromo — o mesmo comportamento que o `SarakShell` já tem.

# 2. Contexto

O dono comparou dois sistemas reais na tela e reportou *"não há escolha de imagem de fundo, não aplica"*.
A investigação isolou a causa e a **mediu em Chromium real** sobre o `dist/` publicado, com o mesmo tema,
o mesmo token e o mesmo build — trocando apenas o cromo:

| Cromo | `background-color` computado da raiz | mídia visível |
| --- | --- | --- |
| `SarakAppChrome` | `rgb(5, 5, 5)` | não |
| `SarakShell` | `rgba(0, 0, 0, 0)` | sim |

A assimetria está no código:

- `src/core/Shell/SarakShell.tsx:89` e `:181` alternam para `bg-transparent` quando
  `design.globalBackgroundImageUrl` está preenchido.
- `src/components/Layout/SarakAppChrome.tsx:163-166` pinta
  `background: var(--bg-body, var(--theme-body, transparent))` **incondicionalmente**, no `rootStyle`.

O `SarakBackgroundRenderer` monta normalmente (`src/core/Provider/SarakUIProvider.tsx:220-228`), com
`position: fixed` e `zIndex: -1`, e ocupa a viewport inteira. Ele **não** está quebrado: é integralmente
coberto pela raiz opaca do cromo.

O ERP — único consumidor real — usa o modo ui-kit (`packages/ui-kit/src/nav.tsx`), portanto vê a versão
que não funciona. O sistema de referência usava o `SarakShell`, que funciona. Não houve regressão ao longo
do tempo: os dois comportamentos sempre coexistiram, e a troca de modo de consumo os expôs.

Dois detalhes que evitam refazer a investigação:

- O `rootStyle` recebe `...style` **depois** do `background`, então o `style` do consumidor já sobrescreve.
  A altura própria (`minHeight: 100dvh`) e o motivo dela estão documentados em
  [[05-cromo-e-slots]] §5 e **não** devem ser alterados.
- O ramo mobile (`SarakAppChromeMobile`) recebe o `rootStyle` já montado (`SarakAppChrome.tsx:196`), então
  a correção na origem alcança os três modos de geometria de uma vez.

# 3. Escopo

## 3.1 Dentro
- `src/components/Layout/SarakAppChrome.tsx` — a montagem do `rootStyle`: o fundo passa a depender de haver
  mídia global, como no `SarakShell`.
- `src/components/Layout/__tests__/SarakAppChrome.test.tsx` — teste do novo comportamento, com e sem mídia.
- `browser-tests/fixtures/harness-entry.tsx` e `browser-tests/cromo-css-real.spec.ts` — acrescentar a
  medição do fundo renderizado ao conjunto nomeado que já existe.

## 3.2 Fora
- `src/core/Shell/` — o Shell já está correto; não se toca.
- `src/core/Design/components/SarakBackgroundRenderer.tsx` — o renderizador funciona; o defeito não é dele.
- `src/core/Provider/SarakUIProvider.tsx` — a montagem do renderizador está correta.
- A altura própria (`minHeight: 100dvh`) e a precedência de `...style`.
- Os 8 slots, a navegação, e qualquer outro comportamento do cromo.
- Qualquer refactor não listado em §5, mesmo que pareça óbvio.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/05-cromo-e-slots.md` | o contrato do cromo: §3 separa fundo global por tema de ornamento por slot, §5 explica a altura própria, §6 a regra de zero hardcode |
| Spec fixa | `specs/09-temas-e-presets.md` | §4 — o ciclo do token de tema até virar CSS |
| Spec fixa | `specs/11-testes-e-cobertura.md` | §7 — o que o harness de navegador cobre e o que ele declara não ver |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | §6.1 — o que `jsdom` prova e o que só o navegador prova |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-arquitetura-design` | mexe em estilo de componente |
| Código | `src/core/Shell/SarakShell.tsx:89,181` | o comportamento de referência a espelhar |
| Código | `src/components/Layout/SarakAppChrome.tsx:153-196` | o `rootStyle` e a passagem dele ao ramo mobile |
| Código | `src/core/Provider/SarakUIProvider.tsx:220-228` | como o renderizador de fundo é montado |
| Código | `browser-tests/cromo-css-real.spec.ts` · `browser-tests/fixtures/harness-entry.tsx` | o harness a estender |

# 5. Instruções de execução

1. Ler as referências da §4. Confirmar no código as duas linhas do `SarakShell` e a linha do `rootStyle`.
2. Fazer o fundo da raiz do `SarakAppChrome` deixar de ser opaco quando houver mídia global, espelhando a
   condição do `SarakShell`. **Pronto quando** a raiz não emite cor de fundo própria com mídia presente e
   continua emitindo exatamente o valor de hoje sem mídia.
3. Garantir que o `style` do consumidor continua vencendo nos dois casos.
4. Acrescentar teste em `SarakAppChrome.test.tsx` cobrindo os dois estados. **Pronto quando** o teste falha
   se a condição for removida.
5. Estender o harness (`harness-entry.tsx`) com um cenário que monta o Provider com mídia global, e
   `cromo-css-real.spec.ts` com a medição de `background-color` computado da raiz do cromo nos dois estados.
   Declarar o limite novo no bloco de limites do arquivo, como manda a R18.
6. Rodar `npx vitest run` e `npm run cromo-css-real:check`; os dois verdes.

# 6. Critérios de aceite

- [ ] Com `globalBackgroundImageUrl` preenchido, a raiz do `SarakAppChrome` não pinta fundo opaco.
- [ ] Sem mídia, o fundo emitido é idêntico ao de hoje.
- [ ] O `style` do consumidor sobrescreve nos dois estados.
- [ ] Os três modos de geometria (sidebar, topbar, celular) herdam o comportamento — nenhum ganha caso especial.
- [ ] Teste `jsdom` cobre os dois estados e falha se a condição sumir.
- [ ] A medição de navegador prova o valor computado nos dois estados, com o limite novo declarado no arquivo.
- [ ] `npx vitest run` verde; `npm run cromo-css-real:check` verde.
- [ ] Nenhum valor visual novo em hardcode — o que entrar é token com fallback.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é comportamento observável **deste** componente, então o dono é o teste do
módulo mais a medição de navegador que já existe. Nenhuma regra nova precisa varrer o vizinho.

- `git diff --stat` → só os arquivos de §3.1.
- Leitura de `src/components/Layout/SarakAppChrome.tsx` → a condição existe e espelha o `SarakShell`.
- `npx vitest run src/components/Layout` → verde.
- `npm run cromo-css-real:check` → verde, com o cenário de mídia presente na saída.
- `npx vitest run` → verde, comparado ao baseline de intermitência de [[11-testes-e-cobertura]] §3.5.
- `npm run audit` → comparar com `gates/baselines/audit-baseline.json`, nunca com zero.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md`

Texto pronto para transporte, para a §3 (os dois níveis de adicionar imagem/animação):

> O fundo global por tema (`globalBackgroundImageUrl`) alcança os **dois** cromos. `SarakShell` e
> `SarakAppChrome` deixam de pintar fundo próprio quando há mídia global, para que o
> `SarakBackgroundRenderer` do Provider apareça atrás do cromo inteiro. Sem mídia, cada um pinta o próprio
> token de fundo. A regra vale igual nos três modos de geometria.

Acrescentar à §9 (plano de testes) a linha da medição de navegador do fundo do cromo.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
