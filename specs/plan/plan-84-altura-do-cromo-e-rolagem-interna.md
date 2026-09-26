---
tipo: "plan"
titulo: "Dar ao cromo altura de viewport e rolagem interna, para a barra lateral não esticar"
objetivo: "A barra lateral e a barra superior permanecem visíveis e do tamanho da janela em páginas de rolagem longa, com o conteúdo rolando dentro do cromo"
dominio: "Sarak-Lib-UI-Core / Cromo e layout de aplicação"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "cromo", "layout", "rolagem", "multidispositivo", "major"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/07-responsividade-e-multidispositivo]]", "[[specs/11-testes-e-cobertura]]", "[[specs/24-modo-embarcado]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md"
---

# 1. Objetivo

Num app com página longa, a barra lateral fica onde está, com a altura da janela e rolagem própria quando
os itens não cabem; quem rola é o conteúdo, dentro do cromo. O mesmo vale para a barra superior.

# 2. Contexto

**O achado, vindo do consumidor (ERP Earendel, 2026-09-19):** *"o `SarakAppChrome` não fixa a altura da
barra lateral, então ela estica para acompanhar a altura total de páginas com rolagem longa."*

**O achado procede, e a causa está escrita no código — é decisão, não descuido:**

- `SarakAppChrome.tsx:193` define `minHeight: '100dvh'`. **Mínimo, não altura**: o cromo cresce com o
  conteúdo, e a barra lateral, que é filha de um `flex` que se estica, cresce junto.
- `ChromeFrame.tsx:49` põe `h-full` na raiz. Esse percentual resolve contra o ancestral do host; sem
  `height` no host, ele vira `auto` — ou seja, não limita nada.
- **A estrutura interna já foi construída para rolagem interna e só não tem o que a segure:**
  `ChromeSidebarBody.tsx:72` (`flex-1 min-h-0`), `:79` (`overflow-y-auto` na barra) e `:145`
  (`overflow-auto` no conteúdo). Falta a altura no topo da cadeia.

**Por que o `minHeight` existe, e por que ele NÃO pode simplesmente virar `height`:** a
[[05-cromo-e-slots]] §5 registra o bug que o originou — sem altura própria, o `h-full` colapsava, a
navegação era recortada e o sintoma era *"a barra lateral sumiu e o conteúdo aparece"*. A altura própria é
o que torna o cromo independente do host ter `html/body/#root { height: 100% }`. **A correção tem de manter
essa independência**, e é por isso que ela é plan: mexe na regra que uma spec fixa afirma.

**A alternativa descartada, para não ser represcrita:** deixar o documento rolar e fazer a barra lateral
`position: sticky`. Funciona e é menos invasiva, mas cria dois contextos de rolagem que coexistem (o
documento e o conteúdo, que já tem `overflow-auto`), obriga a calcular o deslocamento do `sticky` por
causa dos slots `banner` e da barra superior, e deixa a barra superior ainda esticando. A casca de app com
rolagem interna é o que a estrutura atual já pede.

**O que isto quebra, e é preciso dizer ao consumidor:** a rolagem da página deixa de ser a do documento e
passa a ser a do painel de conteúdo. `window.scrollTo`, `scrollIntoView` sobre o documento, âncoras e o
comportamento de esconder a barra de endereço no celular mudam de lugar. É mudança de comportamento
observável, então entra na nota do próximo major.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/Layout/SarakAppChrome.tsx` — a altura da raiz.
- `src/components/Layout/chrome/ChromeFrame.tsx` — a classe de altura da raiz, se preciso.
- `src/components/Layout/chrome/ChromeSidebarBody.tsx` · `ChromeTopbarBody.tsx` — o que faltar para a
  cadeia de rolagem interna fechar.
- `src/components/Layout/SarakAppChromeMobile.tsx` — **só se** a medição mostrar regressão no celular.
- Os testes ao lado de cada arquivo tocado.
- `browser-tests/cromo-css-real.spec.ts` e o que a fixture precisar — é onde o invariante é medido.
- `docs/migracoes.md` — a entrada da mudança de rolagem.
- Artefatos **gerados**, por regeneração e nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- `specs/**` — inclusive a §5 da [[05-cromo-e-slots]], que esta plan contradiz. Quem a reescreve é o
  revisor, na síntese.
- Criar token de design novo, ou prop nova de API.
- O `SarakShell` e o roteamento; os slots e a sua geometria; a barra de preferências.
- O consumidor (o ERP).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/05-cromo-e-slots.md` | **§5** (a altura própria e o bug que a originou — a regra que muda) · §2.2 (geometria dos slots) · §2.3 (nada some) |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | o refluxo do cromo e o colapso no celular |
| Spec fixa | `specs/24-modo-embarcado.md` | o cromo dentro de container do host — o `...style` do consumidor tem de continuar vencendo |
| Spec fixa | `specs/11-testes-e-cobertura.md` | **§7** — o harness de navegador, que é o único lugar onde altura se mede de verdade |
| Spec fixa | `specs/01-gates-e-baseline.md` | como ler cada gate e o baseline do `audit` |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `padrao-typescript` · `ui-arquitetura-design` · `test-unitario` | sempre |
| Código | `src/components/Layout/SarakAppChrome.tsx:186-196` | a altura da raiz, com o motivo escrito ao lado |
| Código | `src/components/Layout/chrome/ChromeSidebarBody.tsx:72,79,145` | a cadeia de rolagem que já existe |
| Código | `browser-tests/cromo-css-real.spec.ts` · `build-harness.mjs` | o molde do teste em navegador real |

# 5. Instruções de execução

1. **Dê ao cromo altura de janela, sem perder a independência do host.** A raiz passa a ter altura de
   viewport **e** a conter a rolagem, em vez de só um piso. O que a §5 da spec protege continua valendo:
   o cromo não pode depender de `height` vinda do host, e o `style` do consumidor tem de continuar
   sobrescrevendo (é o que sustenta o uso embarcado).

2. **Feche a cadeia de rolagem interna** para os dois modos, barra lateral e barra superior: quem rola é o
   painel de conteúdo; a barra lateral rola sozinha só quando os próprios itens não cabem; os slots
   `banner` e `footer` continuam sendo faixas do cromo, e não rolam com o conteúdo.

3. **Confirme que o celular não regrediu.** O `SarakAppChromeMobile` tem refluxo próprio; se a mudança na
   raiz o afetar, ajuste — e diga no resumo o que mediu para afirmar isso.

4. **Meça em navegador real**, no `browser-tests/`, com conteúdo mais alto que a janela:
   - a altura da caixa da barra lateral é a da janela, e não a do conteúdo;
   - depois de rolar o conteúdo até o fim, a barra lateral continua visível na mesma posição;
   - com muitos itens de navegação, a barra lateral rola por dentro e nenhum item fica inalcançável
     (é a §2.3 da spec: nada some);
   - o mesmo para a barra superior, no modo de navegação horizontal.

5. **Escreva a entrada em `docs/migracoes.md`**, titulada com o major em curso (`7.0.0`), dizendo o que
   muda para quem já usa: a rolagem da página passa para o painel de conteúdo, e o que fazer quem dependia
   da rolagem do documento — inclusive a saída pelo `style` do consumidor.

6. **Rode e leia:** `npx vitest run` inteiro · `npm run cromo-css-real:check` · `npm run audit:baseline` ·
   `npm run barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check`.

# 6. Critérios de aceite

- [ ] Com página longa, a barra lateral tem a altura da janela e permanece visível depois de rolar o
      conteúdo — medido em navegador real, com os números no resumo.
- [ ] Com muitos itens, a barra lateral rola por dentro e o último item é alcançável.
- [ ] A barra superior não estica com o conteúdo, no modo de navegação horizontal.
- [ ] O cromo continua íntegro **sem** o host definir `height` em `html`, `body` ou na raiz do app — é o
      bug da §5, e ele não pode voltar. Teste explícito.
- [ ] O `style` do consumidor continua sobrescrevendo a altura da raiz (uso embarcado) — teste.
- [ ] Celular sem regressão, com a medição declarada.
- [ ] `docs/migracoes.md` explica a mudança de rolagem e a saída de quem depende da anterior.
- [ ] `npx vitest run` inteiro verde · `cromo-css-real:check` nos 16 casos · `audit:baseline` sem
      regressão · barril, catálogo e os dois kits em dia.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é comportamento observável **deste** módulo e já tem dono: o harness de
navegador (`cromo-css-real:check`), que é o único lugar onde altura e posição se medem de verdade. Nenhuma
regra nova de gate nasce aqui.

- `git status` + `git diff --stat` → só os caminhos da §3.1; **nada** em `specs/`.
- `npm run cromo-css-real:check` → os casos existentes mais os novos, verdes.
- **Mutação 1:** devolver a raiz para `minHeight` → o caso novo da barra lateral cai.
- **Mutação 2:** tirar o `overflow` do painel de conteúdo → o caso de rolagem interna cai.
- **Mutação 3:** remover a altura própria da raiz → o teste do bug da §5 cai (a barra lateral some sem
  `height` no host).
- Leitura do `...style` na raiz: o do consumidor continua vindo por último.
- `npx vitest run` inteiro e `npm run audit:baseline`.
- `grep -rnE "plan-[0-9]+|veredito"` nos arquivos da entrega, rastreados e não rastreados.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md`

A **§5 é reescrita**, não acrescida: ela hoje afirma `minHeight: 100dvh` e explica por quê. Passa a
afirmar a altura de janela com rolagem interna, **preservando** o que continua verdadeiro e é a parte mais
valiosa dela — o cromo não depende do CSS do host, o sintoma do bug antigo (*"a barra lateral sumiu e o
conteúdo aparece"*) e a saída pelo `style` do consumidor. Acrescenta o que esta plan estabelece: **quem
rola é o painel de conteúdo, não o documento**, e a barra lateral rola sozinha só quando seus itens não
cabem.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese, imediatamente antes da remoção da plan. -->
