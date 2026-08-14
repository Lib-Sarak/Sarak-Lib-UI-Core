# START HERE — kit de uso da `@sarak/lib-ui-core`

> **Para quem é este arquivo:** para você, agente de IA (ou pessoa) trabalhando no **projeto que
> IMPORTOU** a biblioteca. Você o encontrou em `node_modules/@sarak/lib-ui-core/sarak-ui/`.
> Leia estas duas páginas ANTES de escrever a primeira linha de frontend.

Esta pasta é o **kit de uso**: tudo o que o importador precisa para escrever o frontend com a
biblioteca — o guia de autoria, a skill de uso, os templates copiáveis e o **catálogo vivo** do
que esta versão expõe. Ela viaja dentro do pacote publicado: o que está aqui **é** a verdade da
versão que você instalou, não uma documentação paralela que pode ter envelhecido.

---

## A regra nº 1 — leia o catálogo, não assuma

**`catalog.json` (nesta pasta) é a fonte da verdade sobre o que existe.** Componentes, props,
tokens de tema, CSS Variables, nomes de ícone, contrato de responsividade e slots do cromo saem
todos dele, gerados do código-fonte da versão instalada.

- Antes de usar um componente: confirme o nome e as props em `catalog.json` → `components`.
- Antes de usar um token: confirme em `catalog.json` → `tokens.cssVars` (CSS Variables) ou
  `designTokens.ids` (chaves de tema).
- Antes de usar um ícone: confirme em `catalog.json` → `tokens.iconNames`.
- **Nunca invente um nome de memória** (nem do seu treino, nem de outra versão da lib). Nome
  inexistente não quebra a tela — ele silenciosamente não faz nada, que é pior.

Se algo que você precisa não está no catálogo, a resposta está na **regra de fallback universal**
do guia (`GUIA-FRONTEND.md` §0). Ela cobre inclusive os casos que ninguém previu.

---

## O que fazer com esta pasta (3 movimentos)

Faça isto **uma vez**, ao instalar a biblioteca. Os caminhos abaixo são os que o comando de
atualização conhece — se você escolher outros, terá de re-sincronizar à mão.

| # | O quê | De | Para | Por quê |
| --- | --- | --- | --- | --- |
| 1 | **O guia de autoria** | `sarak-ui/GUIA-FRONTEND.md` | `specs/sarak-ui-guia-frontend.md` do seu projeto | Vira **decisão estrutural do seu projeto**: como este sistema escreve frontend. Fica versionado junto com o seu código. |
| 2 | **A skill de uso** | `sarak-ui/skill/` | `.claude/skills/ui-integra-consumidor/` **e** `.agents/skills/ui-integra-consumidor/` | Autoria assistida por IA: o agente do seu repositório passa a saber instalar, acoplar e atualizar a base. |
| 3 | **O kit inteiro** | `sarak-ui/` (do `node_modules`) | `sarak-ui/` na raiz do seu projeto | Deixa `catalog.json`, `VERSION` e `templates/` à mão, sem depender de `node_modules`. |

> Se você rodou `npx sarak-ui init`, o movimento **3** já foi feito por ele — confira se a pasta
> `sarak-ui/` existe na raiz do projeto antes de copiar de novo.

Os movimentos 1 e 2 são **cópias** (não recortes): a origem continua no `node_modules` e é
substituída a cada atualização da lib.

---

## O que tem aqui dentro

| Arquivo | O que é |
| --- | --- |
| `START-HERE.md` | Este arquivo. |
| `GUIA-FRONTEND.md` | **O documento único de autoria**: as 4 topologias de projeto + todos os casos (usar componente, criar o seu, personalizar um elemento, tema, multidispositivo, dados/formulários, estados de tela, ícones, isolamento). Comece pelo `GUIA-FRONTEND.md` §0 — a árvore de decisão. |
| `skill/` | A skill `ui-integra-consumidor`, versão consumidor. |
| `templates/` | Esqueletos de código copiáveis: wiring do app, forma de um `ui-kit` compartilhado, tela-exemplo com os 3 estados e componente próprio temável. |
| `catalog.json` | **GERADO.** A superfície viva desta versão. A regra nº 1 acima. |
| `VERSION` | **GERADO.** Carimbo (versão + hash do kit) para saber quando re-sincronizar. |

`catalog.json`, `VERSION` e o Apêndice A do guia são **gerados do código-fonte** e conferidos por
um gate no build da biblioteca: é impossível publicar uma versão cujo kit não bata com a API.
Não os edite à mão — a próxima atualização sobrescreve.

---

## Como re-sincronizar depois de atualizar a lib

```bash
npm run sarak:update    # atualiza a lib E refresca as cópias movidas acima
```

O `sarak:update` compara o `VERSION` do kit novo (no `node_modules`) com o das suas cópias e
reescreve o que ficou para trás — guia, skill e kit. Ele **só toca no que já existe** nos
caminhos da tabela; nada do seu código é alterado.

Para conferir se a lib está atualizada sem instalar nada: `npm run sarak:check`.

Ao atualizar, leia `node_modules/@sarak/lib-ui-core/docs/migracoes.md` **antes** de investigar
qualquer quebra de tipo — mudanças de contrato público ficam registradas lá com antes/depois.

---

## Carimbo desta versão

<!-- SARAK-KIT:CARIMBO:INICIO -->

- **Versão da lib:** `5.0.0`
- **Carimbo do kit (`kitHash`):** `193f3815e56b` — igual ao do arquivo `VERSION`.
- **Superfície desta versão:** 83 componentes públicos · 422 tokens de tema · 73 CSS Variables · 100 ícones · 23 temas embutidos.
- **Guias completos que viajam no pacote:** `docs/component-catalog.md` · `docs/extensibilidade-de-layout.md` · `docs/identidade-do-host.md` · `docs/migracoes.md` · `docs/persistencia-de-tema.md` · `docs/temas-cromo-e-multidispositivo.md`.

<!-- SARAK-KIT:CARIMBO:FIM -->

---

## Próximo passo

Abra **`GUIA-FRONTEND.md`** e leia a **§0 — Como agir em qualquer necessidade**. São duas telas,
e é o que evita 90% das gambiarras: a árvore de decisão diz para qual seção ir, e a regra de
fallback resolve o que não estiver mapeado.
