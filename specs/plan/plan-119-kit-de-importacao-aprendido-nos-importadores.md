---
tipo: "plan"
titulo: "Ensinar a importar a lib com o que os importadores reais mostraram"
objetivo: "Fazer o importador usar a lib por inteiro sem reescrever o que ela entrega, com o kit de importação ensinado pelas licoes medidas nos importadores reais e com a gestao de temas do importador completa: salvar o aplicado como novo, editar, duplicar e criar, persistidos no importador"
dominio: "Kit do consumidor / Instalação e atualização / Temas do importador"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "kit-do-consumidor", "importacao", "temas", "persistencia"]
relacionados: ["[[12-kit-do-consumidor]]", "[[13-instalacao-e-atualizacao]]", "[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[017-porta-de-apagar-tema-simetrica-a-de-escrever]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/12-kit-do-consumidor.md + specs/13-instalacao-e-atualizacao.md + specs/09-temas-e-presets.md"
---

# 1. Objetivo

Quem importa a lib encontra no kit (`sarak-ui/`, skill `ui-integra-consumidor`) o caminho certo da instalação à tela, as armadilhas
que os importadores reais já pagaram, e o mapa do que a lib já faz; e o usuário do importador consegue, pelo painel, **salvar o tema
aplicado como novo, editar um tema dele e salvar, duplicar um tema (embarcado ou dele) e criar um do zero**, com os temas guardados
no banco do importador.

# 2. Contexto

**Os temas embarcados são exemplos; o diferencial é o tema do cliente** (decisão do dono, 2026-10-19). Os 19 temas foram refeitos e o
"do cliente ao tema" está consolidado no kit ([[09-temas-e-presets]] §5.3, `sarak-ui/GUIA-FRONTEND.md` §3.9), com as lições de cada
tema aplicadas na skill `ui-criar-tema`. Esta plan faz o mesmo para a **importação**: cada importador auditado deixa achados, e o kit
se reescreve a partir deles.

**Importadores** (2026-10-19): o ERP Earendel (`C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP`, porta única
`packages/ui-kit`, consome por `file:`), `Sarak-Lib-Login\login-completo` e, depois, `Sarak-Lib-Login\login-provedores` (em
desenvolvimento). **Cada importador é auditado por uma sessão de revisor própria, no repositório dele**, que escreve as specs de
correção **lá**, no formato daquele repositório. O que é da lib (defeito, lacuna do kit, porta que falta) volta para cá e entra no
registro da §5.1. Nenhuma sessão de importador edita esta lib; nenhuma execução desta plan edita um importador.

**Gestão de temas do importador — o que existe hoje** ([[09-temas-e-presets]] §4.6): a escrita é `options.theme.onSave`, o apagar é
`options.theme.onDelete` (`useSarakUI().deleteTheme`), a leitura é a prop `customThemes`; sem `onSave`, a ação de salvar some. O painel
salva por `SaveThemeModal.tsx` e `useThemePersistenceHandlers.ts`. **Não está medido** se o painel oferece os quatro gestos de ponta a
ponta: (a) salvar o aplicado como tema novo; (b) editar um tema do importador e salvar **por cima** (mesmo id); (c) **duplicar** um tema
(embarcado ou do importador) com nome e id novos; (d) criar do zero. Tema embarcado é da lib e **não** se sobrescreve: editar um
embarcado é duplicá-lo. O lote 1 mede e corrige.

**Versão:** as correções desta plan saem numa candidata nova (`8.0.0-rc.N`) antes da `8.0.0` final; nenhuma plan mexe em versão
nem tag ([[03-versionamento-e-release]]).

# 3. Escopo

## 3.1 Dentro
- **Lote 0:** `specs/plan/anexos/plan-119-licoes-das-importacoes.md` (novo). Leitura, sem edição, dos importadores e do histórico.
- **Lote 1:** o painel e as portas de tema — `src/features/DesignEngine/Main/` (`SaveThemeModal.tsx`,
  `hooks/useThemePersistenceHandlers.ts`, `ThemeCustomizationTab.tsx` e o que o fluxo de salvar exigir), `src/core/Provider/` só no
  que as portas `onSave`/`onDelete`/`customThemes` exigirem, testes, um caso em `browser-tests/` (harness existente), i18n dos
  rótulos novos, nota em `docs/migracoes.md` (`## 8.0.0`).
- **Lote 1, além do acima:** `src/core/Provider/hooks/useThemeCollection.ts` (colisão de id, apagar embarcado),
  `src/features/DesignEngine/Main/utils/exportTheme.ts` (a `contraparte` no payload), `Main/components/ThemeActionBar.tsx`,
  `Panels/AdvancedTab.tsx` só se o gesto "novo tema" morar ali, `docs/persistencia-de-tema.md` (o exemplo copiável das
  portas de tema).
- **Lote 2:** `src/core/Design/presets/themes/reference.ts` e os pontos do barril que exportam a referência, o teste do
  `col-span-*` junto aos de `src/components/atomic/Layouts/`,
  `src/components/atomic/Layouts/SarakFlex.tsx`, `docs/migracoes.md` (seções `## 8.0.0` e `## 7.0.0`),
  `docs/persistencia-de-tema.md`, `sarak-ui/GUIA-FRONTEND.md` (autoria) e os gerados.
- **Lotes do registro (§5.1):** os arquivos que cada linha nomear, declarados pelo revisor ao abrir o lote.
- **Lote final:** a skill `ui-integra-consumidor` (fonte do kit), `sarak-ui/GUIA-FRONTEND.md` (autoria), a CLI `bin/` só se uma
  lição pedir verificação nova no `sarak-ui check`, `docs/migracoes.md`, e os gerados (`guide`, `dev-kit`).

## 3.2 Fora
- **Qualquer arquivo de importador.** As correções deles são specs nos repositórios deles.
- Temas embarcados, schema de tokens, CSS do motor (salvo linha do registro que o revisor abra para isso).
- Specs fixas desta lib (a síntese é do revisor). Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/12-kit-do-consumidor.md` | o que o kit gera e onde mora o guia |
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` (inteira; em especial §9.1) | instalação, atualização, as três camadas de cache, o selo de build |
| Spec fixa | `specs/09-temas-e-presets.md` (§4.3, §4.4, §4.5, §4.6) | composição, persistência, exportar, salvar e apagar |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` (§2.3) | o caminho escolher/ajustar/aplicar e a barra de ações |
| ADR | `adr/011-tema-salvo-por-uma-porta-de-escrita.md` · `adr/017-porta-de-apagar-tema-simetrica-a-de-escrever.md` · `adr/018-um-cromo-so-e-o-consumidor-e-dono-das-rotas.md` | as portas de tema e o papel do importador |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-integra-consumidor` · `ui-criar-tema` · `padrao-escrita` + `padrao-typescript` · `test-unitario` | kit, tema, escrita, testes |
| Código | `src/features/DesignEngine/Main/` · `src/core/Provider/providerProps.ts` · `bin/` · `scripts/consumer-kit/` | o painel, as portas, a CLI e o gerador do kit |
| Doc | `docs/migracoes.md` · `docs/roteiro-de-validacao-dos-temas.md` · `docs/persistencia-de-tema.md` · `sarak-ui/GUIA-FRONTEND.md` | o que o importador lê hoje |
| Anexo | `specs/plan/anexos/plan-119-licoes-das-importacoes.md` · `specs/plan/anexos/plan-119-relatorio-erp.md` | as lições (lote 0) e o relatório do ERP, com `arquivo:linha` de cada achado |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.** O essencial (defeito da lib, porta que falta,
kit que ensina errado) se corrige quando achado, num lote do registro; o resto espera o lote final.

**Lote 0 — as lições das importações anteriores.** Só leitura e um anexo.
0.1. Levantar cada problema prático que um importador já teve com a lib, **pelas fontes desta lib**: `docs/migracoes.md`;
`specs/13-instalacao-e-atualizacao.md` e `specs/15-divida-conhecida.md`; e o histórico desta lib (`git log` de commits motivados por
consumidor: busque por `consumidor`, `importador`, `ERP`, `Earendel`, `login`). O lado do importador (o histórico e as specs dele) é
levantado pela sessão de revisor de cada importador, e o revisor desta plan acrescenta ao anexo o que ela relatar.
0.2. No anexo, uma tabela por problema: **o que aconteceu** (com `arquivo:linha` ou commit), **a causa**, **onde o kit deveria ter
avisado**, **estado hoje** (resolvido na 8.0.0, com a evidência; ou ainda vale) e **destino proposto** (skill `ui-integra-consumidor`,
GUIA, `sarak-ui check`, spec `13`, ou linha nova do registro).
0.3. Nenhum arquivo além do anexo. Achado que é defeito da lib vai para o fim do anexo, com a medição, para o revisor abrir a linha.

**Lote 1 — a gestão de temas do importador.**
1.1. Medir no navegador (harness de `browser-tests/`, com `onSave`/`onDelete` que gravam numa coleção em memória e devolvem por
`customThemes`) os quatro gestos da §2: salvar o aplicado como novo; editar um tema do importador e salvar por cima; duplicar um tema
embarcado e um do importador; criar do zero. E apagar.
1.2. O que faltar, corrigir no painel e nas portas — as linhas **I1 a I8** da §5.1, todas deste lote:
- **I1** o tema salvo e o exportado levam a `contraparte` do rascunho (o JSON é o do formato de tema, com o par);
- **I2** criar, substituir e duplicar são gestos distintos e nomeados: "Salvar como novo" (nome e id novos), "Salvar"
  (substitui o tema do importador que está sendo editado, mesmo id) e "Duplicar"; com `onSave` configurado, salvar é a
  ação primária e exportar JSON fica como ação à parte; a entrega a `onSave` deixa claro se é criação ou substituição
  (escolha do contrato justificada no resumo, sem quebrar quem já implementa `onSave(entry)`);
- **I3** o id de um tema do importador nunca colide com um embarcado nem com outro do importador (o painel recusa ou
  sufixa, e diz isso); tema embarcado nunca é sobrescrito (editar um embarcado é duplicá-lo);
- **I4** o painel oferece "Apagar" só para tema do importador, com confirmação; `deleteTheme` recusa id embarcado; se
  `onDelete` rejeitar, o tema volta à coleção e o painel avisa;
- **I5** "Novo tema" parte da referência completa (`sarakLoadReferenceThemes`) no modo escolhido, não dos padrões crus;
- **I6** sem `activeThemeId` vindo do `onLoad`, o painel identifica o tema ativo por `resolvedThemeId`, e "editar e
  salvar" não vira tema novo por engano;
- **I7** medir e fixar em teste: o tema salvo vira o ativo; o "Aplicar" seguinte grava o design com o id certo; apagar o
  tema ativo cai no padrão do modo, sem tela quebrada;
- **I8** tirar a prop vestigial `customThemes={[]}` de `ThemeCustomizationTab.tsx:156`.
Sem `onSave`, nenhum gesto de salvar aparece (§4.6); sem `onDelete`, o apagar continua só na sessão.
1.3. Teste de componente por gesto e o caso de navegador com mutação; `docs/persistencia-de-tema.md` §5 (o exemplo copiável)
mostra o `onSave` e o `onDelete` que **rejeitam** em falha, para o painel avisar; nota em `docs/migracoes.md` (`## 8.0.0`) do
que mudou para quem usa as portas.

**Lote 2 — contrato e documentação que os importadores pagaram** (linhas **I9 a I13** da §5.1).
2.1. **I9** `SARAK_REFERENCE_THEMES` deixa de ter o nome do par (decisão do revisor, aprovada pelo dono em 2026-10-19): o export
síncrono passa a ter um nome que diga que é só o tema do boot (o escuro), e o par continua em `sarakLoadReferenceThemes()`;
a quebra é de compilação, não silenciosa; nota MAJOR com o "de/para".
2.2. **I10** nota retroativa em `docs/migracoes.md`, seção `## 7.0.0`: o campo com erro anuncia por `role="alert"` (o que muda
para teste e leitor de tela).
2.3. **I11** `SarakFlex.gap` (e o mesmo padrão nas primitivas de layout irmãs, se houver) com o tipo da união dos valores
aceitos; nota MAJOR.
2.4. **I12 e I13** documentação: `docs/persistencia-de-tema.md:109` e `sarak-ui/GUIA-FRONTEND.md:558` sem contagem fixa de
temas; `GUIA-FRONTEND.md:550-552` sem o "modelo host" (ADR 018) e com salvar ≠ exportar (depende do lote 1);
a regra "porta que falha rejeita".
2.5. **C2** na nota MAJOR da 8.0.0 (`docs/migracoes.md`), uma tabela "de/para" **completa** de todo nome do barril que mudou
ou saiu entre a 7.0.0 e a 8.0.0, derivada da comparação do barril (não escrita de memória), com o que usar no lugar.
2.6. **C5** `col-span-*` nos filhos do `SarakGrid` em `col-12` é contrato suportado: teste que trava o comportamento (o filho
com a classe ocupa o span; sem ela, o padrão por breakpoint) e o texto no guia (`GUIA-FRONTEND.md`, seção do grid) e na
[[15-divida-conhecida]] o achado 42 passa a ter destino (a síntese fecha).
2.7. `npm run guide` e `npm run dev-kit` por último.

**§5.1 — Registro vivo dos achados da lib** (mantido pelo revisor; vem do lote 0 e das sessões dos importadores):

| # | Achado (`arquivo:linha` e medição) | Origem | Decisão | Lote | Estado |
|---|---|---|---|---|---|
| I1 | o tema salvo e o exportado não levam a `contraparte`: `Main/hooks/useThemePersistenceHandlers.ts:63` e `Main/utils/exportTheme.ts:59-66` | ERP | corrigir | 1 | fechada |
| I2 | criar, substituir e duplicar indistintos: `Main/components/SaveThemeModal.tsx:45` pré-preenche o nome do ativo, id = `slugifyThemeId(nome)` (`exportTheme.ts:62`); o modal se chama "Exportar" com `onSave` ligado | ERP | corrigir | 1 | fechada |
| I3 | id do importador colide com embarcado: `Provider/hooks/useThemeCollection.ts:30,37` funde sem deduplicar | ERP | corrigir | 1 | fechada |
| I4 | nenhum componente do painel chama `deleteTheme`; ele aceita id embarcado e não desfaz se `onDelete` rejeitar (`useThemeCollection.ts:67-72`) | ERP | corrigir | 1 | fechada |
| I5 | "criar do zero" só por "Restaurar Padrões" (`Panels/AdvancedTab.tsx:110`), dos padrões crus | ERP | corrigir (gesto "Novo tema" da referência) | 1 | fechada |
| I6 | sem `activeThemeId` do `onLoad`, o modal cai em "Meu Novo Tema" (`SaveThemeModal.tsx:45`) e editar vira tema novo | ERP | corrigir (fallback `resolvedThemeId`) | 1 | fechada |
| I7 | não medido: o salvo vira ativo? o "Aplicar" seguinte grava com o id certo? apagar o ativo? | ERP | medir e fixar em teste | 1 | fechada |
| I8 | prop vestigial `customThemes={[]}` em `Main/ThemeCustomizationTab.tsx:156` | ERP | retirar | 1 | fechada |
| I9 | `SARAK_REFERENCE_THEMES` (`reference.ts:31`) virou só o escuro sob o mesmo nome; o `find(light)` do importador devolve `undefined` sem erro de tipo | ERP | renomear o export síncrono (quebra em compilação), nota MAJOR | 2 | aberta |
| I10 | `role="alert"` no campo com erro (7.0.0) sem nota em `docs/migracoes.md` | ERP | nota retroativa na `## 7.0.0` | 2 | aberta |
| I11 | `SarakFlex.gap?: string` (`Layouts/SarakFlex.tsx:15`): `gap="md"` compila e é ignorado | ERP | tipo da união dos valores aceitos | 2 | aberta |
| I12 | "23 temas" em `docs/persistencia-de-tema.md:109` e `GUIA-FRONTEND.md:558`; "modelo host" em `GUIA-FRONTEND.md:551` (ADR 018) | ERP · lote 0 (21) | corrigir o texto | 2 | aberta |
| I13 | o exemplo copiável das portas (`docs/persistencia-de-tema.md` §5) não rejeita em falha; o ERP engoliu o erro por semanas | ERP | ensinar "porta que falha rejeita" | 2 | aberta |
| C1 | helper oficial para ler o tema persistido e injetá-lo no HTML antes do primeiro paint (o ERP escreveu ~220 linhas; `persistencia-de-tema.md` §6 descreve três saídas) | ERP | **dono, 2026-10-19: depois da 8.0.0** (função aditiva; vai ao `00-backlog` no lote final) | final | aberta |
| C2 | `sarak-ui migrate <major>`: aplicar a tabela de renomes de um MAJOR nos imports do consumidor | ERP | **dono, 2026-10-19: não fazer**; no lugar, tabela "de/para" completa dos renomes na nota da 8.0.0 | 2 | aberta |
| C3 | `sarak-ui check` em modo `file:` avisar quando o major instalado muda (hoje cala por desenho, `13` §5.1) e comparar a cópia `sarak-ui/` do consumidor com a instalada | ERP | **dono, 2026-10-19: não fazer**; o guia ensina que `file:` é só para iterar localmente e produção instala pela tag | final | aberta |
| C4 | verificação por máquina para o consumidor (as três regras de gate que o ERP escreveu: `ui-kit`, `ui-ponto-unico`, `ui-token`) | ERP | **dono, 2026-10-19: fazer, opcional para o importador** — plugin de ESLint no pacote, regras ligadas uma a uma, numa plan própria (com ADR) **depois da 8.0.0 e da atualização dos importadores**; o lote final desta plan entrega a lista de regras candidatas que as auditorias provaram comuns, e a linha vai ao `00-backlog` | final | aberta |
| C5 | span do grid de 12 colunas sem contrato público (`15-divida-conhecida` achado 42) | lote 0 (30) | **dono, 2026-10-19:** declarar `col-span-*` como contrato suportado, com teste que trava o comportamento; `SarakGridItem` ao backlog | 2 | aberta |

**Lote final — o kit de importação consolidado.**
F.1. Aplicar **uma vez**, sem repetir o que já está lá (R17), as lições do anexo e do registro: na skill `ui-integra-consumidor`, no
`sarak-ui/GUIA-FRONTEND.md` (a ordem de instalação, a atualização sem cair nas três camadas de cache, a gestão de temas do importador
com a persistência dele, o mapa "o que a lib já faz") e, se uma lição pedir, num aviso novo do `sarak-ui check`.
F.2. `npm run guide` e `npm run dev-kit` por último.

# 6. Critérios de aceite

- [ ] Anexo de lições com cada problema, causa, onde o kit deveria ter avisado, estado hoje e destino.
- [ ] Os quatro gestos de tema e o apagar funcionando no painel, com teste de componente por gesto e caso de navegador com mutação;
  embarcado nunca sobrescrito; sem `onSave`, nada de salvar aparece.
- [ ] Registro da §5.1 sem linha aberta.
- [ ] Kit consolidado: skill, GUIA e (se for o caso) `sarak-ui check`; `guide:check` e `dev-kit:check` verdes.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1; bateria do navegador.

# 7. Como verificar (uso do revisor)

**Gate:** teste — os gestos de tema são comportamento do painel (teste de componente e caso de navegador); nenhuma regra de gate nova.

- Lote 0: amostra de três problemas do anexo contra a fonte citada (o commit, a linha, a spec).
- Lote 1: os quatro gestos e o apagar no navegador; o caso com mutação; o painel sem `onSave`.
- Lote final: o guia lido como um importador que começa do zero; `npm run verify -- --tier=full` e a bateria do navegador.
- `git diff --stat` → só a §3.1 do lote.

# 8. Destino da síntese

**Destino:** `specs/12-kit-do-consumidor.md + specs/13-instalacao-e-atualizacao.md + specs/09-temas-e-presets.md`

- **`12`:** o que o kit ensina da importação e o mapa "o que a lib já faz" como parte do kit.
- **`13`:** o que as lições mudarem na instalação e na atualização (avisos novos do `sarak-ui check`, se houver).
- **`09` §4.6:** os quatro gestos de tema do importador e a regra de que embarcado não se sobrescreve.
- O anexo sai com a plan; o que é regra vai para as specs.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

### Rodada 1 — lote 0 (2026-10-19)

- **Resultado:** lote 0 executado e encaminhado para revisão. O restante da plan continua pendente.
- **Anexo:** criado specs/plan/anexos/plan-119-licoes-das-importacoes.md, com ocorrências das fontes da lib e histórico Git, causa, ponto de aviso no kit, estado observado e destino proposto.
- **Escopo:** não foram abertos repositórios de importadores, nem alterados código, kit, migrações, specs fixas ou a tabela §5.1. O achado 42 da dívida conhecida foi anotado como candidato para decisão do revisor; os relatos antigos de rótulo/commit por categoria ficaram explicitamente sem revalidação.
- **Pendências:** lote 1 deve medir os quatro gestos de temas e o apagar no painel; o lote final deve consolidar skill/GUIA e executar os gates previstos. Nenhuma dessas etapas foi iniciada.
- **Estado inicial do worktree:** ?? .claude/settings.local.json, observado antes da primeira edição e mantido intacto.
- **Verificação:** documentação revisada e diff conferido; testes não executados, pois este lote só produz documentação e não pediu alteração/teste de código.

### Rodada 2 — lote 1 (2026-10-19)

- **Resultado:** lote 1 executado e encaminhado para revisão; o lote final permanece pendente.
- **Escopo:** concluídos os passos 1.1 a 1.3 e as linhas I1 a I8: salvar como novo, substituir tema do importador, duplicar tema importado e embarcado, criar a partir de referência, aplicar e persistir o id ativo, apagar com fallback e retirar a prop vestigial.
- **Contrato de `onSave`:** a porta recebe o segundo argumento opcional `operation: 'create' | 'replace'`; callbacks antigos `onSave(entry)` continuam válidos. Temas embarcados não são substituíveis; colisões de ids são evitadas; falha de `onSave` rejeita e mantém o tema disponível na sessão; falha de `onDelete` rejeita e restaura a coleção.
- **Docs:** exemplo em `docs/persistencia-de-tema.md` agora rejeita em falha; nota de migração 8.0.0 descreve a porta e os gestos.
- **Verificação:** Vitest focado — 6 arquivos, 67/67 testes; Playwright — 1 caso aprovado com `ThemeActionBar`, `SaveThemeModal`, hooks e Provider reais e mutação em `customThemes` em memória (canvas de preview omitido); `persistence-doc:check` — aprovado.
- **Limite desta rodada:** não foram executados suíte completa, `tsc`, baseline, build nem bateria geral de navegador; permanecem para as rodadas previstas.
- **Worktree:** `.claude/settings.local.json` permaneceu intacto; alterações do revisor em plan/anexos e `specs/specs/09-temas-e-presets.md` foram preservadas.

**Status: 🟠 Em revisão (lote 1).**

### Resumo da execução (correção 1) — 2026-10-19

- **Escopo:** exclusivamente os oito achados do veredito de 2026-10-19, lote 1. Os vereditos e resumos anteriores permanecem intactos.
- **Achados corrigidos e evidência:**

| Achado | Correção e evidência |
|---|---|
| 1 | Removido `exact` da consulta de Testing Library que gerava TS2769. `npx tsc --noEmit` passou após a correção. |
| 2 | Extraídos o estado/ações de gestão para `useThemeCustomizationActions`, o fallback de exclusão para `useThemeDeletionHandler`, o acesso a contexto para `useSarakUI` e os tipos de portas para `themeTypes.ts`. Alinhado o JSDoc de `onSave`. `audit:baseline -- --with-tsc` passou e o auditor do projeto não reportou regressão de Clean Code. |
| 3 | O modal usa `SarakRadio` em grupo `fieldset`/`legend`, com estado visual pelos tokens e suporte a setas; rótulos e acessibilidade usam `useLibraryText`. O teste de `SaveThemeModal` cobre a navegação por teclado. |
| 4 | A exclusão pede confirmação via `useOverlay().confirm()`. Avisos de salvar/apagar, confirmação e sucesso foram movidos para o catálogo de seis idiomas. O teste de `useThemeCustomizationActions` verifica o overlay; os cenários de navegador cobrem confirmação, falha e rollback. |
| 5 | A exclusão usa `SARAK_DEFAULT_THEME_ID` e o nome vem de `SARAK_THEME_CATALOG`. O fixture e as asserções de navegador também derivam id/nome do catálogo, sem literais do tema padrão. |
| 6 | O título da migração passou a `### Gestão de temas no painel`, sem citação à plan. |
| 7 | A suíte de navegador tem oito casos: novo, substituir, duplicar importado, duplicar embarcado, referência, recusa de sobrescrita embarcada, apagar ativo e apagar rejeitado. Resultado: **8/8 passaram**. Em cópia temporária fora do repositório, **9/9 contrafactuais** (I1–I6, I7a fallback, I7b confirmação e I8 rollback) fizeram falhar o cenário correspondente; a cópia foi removida. |
| 8 | Incluída a tabela de arquivos alterados abaixo, evidência por achado e a decisão do contrato `onSave`. |

**Decisão do contrato:** `operation: 'create' | 'replace'` é o comando da gravação, não dado do tema. Mantê-lo como segundo argumento opcional evita alterar o JSON persistido ou o formato do tema e preserva consumidores que implementam somente `onSave(entry)`; JavaScript ignora o argumento adicional.

**Arquivos alterados nesta execução:**

| Área | Arquivos |
|---|---|
| Harness e navegador | `browser-tests/build-harness.mjs`; `browser-tests/fixtures/importador-temas-entry.tsx`; `browser-tests/importador-temas.spec.ts` |
| Documentação de consumidor | `docs/migracoes.md`; `docs/persistencia-de-tema.md` |
| Provider e portas | `src/core/Provider/SarakUIProvider.tsx`; `src/core/Provider/context.ts`; `src/core/Provider/themeTypes.ts`; `src/core/Provider/types.ts`; `src/core/Provider/hooks/useSarakUI.ts`; `src/core/Provider/hooks/useThemeCollection.ts`; `src/core/Provider/hooks/useThemeDeletionHandler.ts`; `src/core/Provider/__tests__/SarakUIProvider.test.tsx`; `src/core/Provider/hooks/__tests__/useSarakUI.test.ts`; `src/core/Provider/hooks/__tests__/useThemeCollection.test.ts`; `src/core/Provider/hooks/__tests__/useThemeDeletionHandler.test.ts` |
| Catálogo i18n | `src/core/i18n/catalog.ts`; `src/core/i18n/catalogEntries.part3.ts` |
| Design Engine | `src/features/DesignEngine/Canvas/PreviewCanvas.tsx`; `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx`; `src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx`; `src/features/DesignEngine/Main/components/SaveThemeModal.tsx`; `src/features/DesignEngine/Main/components/ThemeActionBar.tsx`; `src/features/DesignEngine/Main/components/__tests__/SaveThemeModal.test.tsx`; `src/features/DesignEngine/Main/components/__tests__/ThemeActionBar.test.tsx`; `src/features/DesignEngine/Main/hooks/useThemePersistenceHandlers.ts`; `src/features/DesignEngine/Main/hooks/__tests__/useThemePersistenceHandlers.test.ts`; `src/features/DesignEngine/Main/hooks/useThemeCustomizationActions.ts`; `src/features/DesignEngine/Main/hooks/__tests__/useThemeCustomizationActions.test.ts`; `src/features/DesignEngine/Main/utils/exportTheme.ts`; `src/features/DesignEngine/hooks/useDesignDraft.ts` |
| Entrada pública e relatório | `src/index.ts`; esta plan (`specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md`) |

- **Verificações:** `npx tsc --noEmit` aprovado após a correção; Vitest dos três hooks novos — **3 arquivos, 8/8 testes**; Playwright — **8/8 casos**; `audit:baseline -- --with-tsc` aprovado; Anel 0 simulado — **0 achados**. A última execução de `npm run verify -- --tier=quick` terminou não verde: registrou um TS18048 no teste antes do ajuste (corrigido e revalidado separadamente) e `guide:check` defasado nos cinco artefatos `sarak-ui/` após a edição da migração. A plan reserva `guide`, `dev-kit` e `plan-index` para regeneração do revisor na aprovação; não os regenerei nesta correção.
- **Worktree preservado:** não alterei `specs/specs/09-temas-e-presets.md`, os dois anexos `plan-119-*`, `.claude/settings.local.json` nem o diff preexistente de `specs/00-indice.md`.

**Status: 🟠 Em revisão (correção 1 do lote 1).**

### Resumo da execução (correção 2) — 2026-10-19

- **Escopo:** exclusivamente o achado 1 do veredito “correção 1 (lote 1)”.
- **Correção:** o teste seleciona “Salvar como novo” pelo rádio localizado por papel e nome, clicando no `label` visível; o envio segue pelo botão com papel e nome próprios. O primeiro cenário ativa um tema embarcado para que rádio e botão tenham deliberadamente o mesmo nome. No fixture, a segunda edição deriva uma cor diferente do design aplicado, mantendo real a verificação de que o “Aplicar” seguinte persiste o id novo.
- **Mutação contrafactual:** em cópia temporária fora do repositório, restaurar `getByText('Salvar como novo', { exact: true }).click()` fez o cenário falhar em strict mode: dois elementos (rótulo do rádio e botão). A cópia temporária foi removida.
- **Verificação final:** `npm.cmd run build` aprovado; em seguida, sem execução intermediária alterando fontes, `npx.cmd playwright test --config=browser-tests/playwright.config.ts browser-tests/importador-temas.spec.ts` — **8/8 casos passaram** contra o `dist/` recém-gerado.
- **Arquivos desta correção:** `browser-tests/importador-temas.spec.ts`; `browser-tests/fixtures/importador-temas-entry.tsx`; `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` (gerados pelo build); `dist/` (gerado pelo build); esta plan.

**Status: 🟠 Em revisão (correção 2 do lote 1).**

### Resumo da execução (correção 3) — 2026-10-19

- **Escopo:** exclusivamente o achado 1 do veredito “correção 2 (lote 1)”.
- **Medição e causa:** depois de salvar, `systemDesign.primaryColor` era `#19e3f0`, `sarak.draftDesign.primaryColor` era nulo, `draftState.draft.primaryColor` era `#19e3f0`, `isDirty` era `false` e `dirtyTokenCount` era `0`. Antes da correção, “Editar rascunho” mudava `sarak.draftDesign.primaryColor` para `#7c3aed`, mas `draftState.draft.primaryColor` permanecia `#19e3f0` e o contador ficava `0`; a leitura imediata ainda retornava `isEnabled() = true`, enquanto o retrato da página após o timeout mostrava “Aplicar” desabilitado. A causa era a fixture gravar no rascunho do Provider, sem atualizar o rascunho local do hook. Não era defeito do painel.
- **Contador da interface:** `ThemeActionBar` desabilita “Aplicar” quando `dirtyTokenCount === 0`. `useDesignDraft` compara os tokens do rascunho local com `systemDesign` (usando o valor padrão do token quando o valor do sistema falta); strings são comparadas por igualdade estrita.
- **Correção:** a fixture agora muda `primaryColor` pelo `draftState.updateDraft`, escolhendo entre duas cores candidatas e rejeitando qualquer valor igual ao aplicado. O teste exige que “Aplicar” esteja habilitado antes do clique e ainda verifica que a persistência recebe `erp-noite-novo`.
- **Build e artefato:** `npm.cmd run build` aprovado. O `dist/index.js` usado teve `LastWriteTime` local **2026-10-19 23:00:12 -03:00** (UTC **2026-10-20T02:00:12.662Z**); o `builtAt` do selo foi `2026-10-20T02:00:08.949Z`.
- **Playwright:** sem execução intermediária que alterasse fontes entre o build e as três execuções consecutivas de `npx.cmd playwright test --config=browser-tests/playwright.config.ts browser-tests/importador-temas.spec.ts`. Saídas do reporter:

  **Execução 1:**

  ```text
  Running 8 tests using 1 worker
    ok 1 browser-tests\importador-temas.spec.ts:26:1 › salva o rascunho aplicado como tema novo e o Aplicar seguinte persiste o id novo (5.0s)
    ok 2 browser-tests\importador-temas.spec.ts:47:1 › substitui o tema do importador preservando o id na coleção retornada por customThemes (4.0s)
    ok 3 browser-tests\importador-temas.spec.ts:60:1 › duplica um tema do importador com nome e id novos, mantendo o original (5.1s)
    ok 4 browser-tests\importador-temas.spec.ts:73:1 › duplica um tema embarcado como criação com identidade nova (4.7s)
    ok 5 browser-tests\importador-temas.spec.ts:90:1 › cria tema a partir da referência completa para o modo atual (13.6s)
    ok 6 browser-tests\importador-temas.spec.ts:103:1 › não oferece substituir tema embarcado e salva uma cópia com id livre (4.4s)
    ok 7 browser-tests\importador-temas.spec.ts:127:1 › apagar ativo usa confirmação da lib e ativa o tema padrão do modo (4.0s)
    ok 8 browser-tests\importador-temas.spec.ts:141:1 › apagar rejeitado mantém o tema na coleção e mostra o aviso (4.7s)

    8 passed (53.2s)
  ```

  **Execução 2:**

  ```text
  Running 8 tests using 1 worker
    ok 1 browser-tests\importador-temas.spec.ts:26:1 › salva o rascunho aplicado como tema novo e o Aplicar seguinte persiste o id novo (5.2s)
    ok 2 browser-tests\importador-temas.spec.ts:47:1 › substitui o tema do importador preservando o id na coleção retornada por customThemes (8.2s)
    ok 3 browser-tests\importador-temas.spec.ts:60:1 › duplica um tema do importador com nome e id novos, mantendo o original (5.6s)
    ok 4 browser-tests\importador-temas.spec.ts:73:1 › duplica um tema embarcado como criação com identidade nova (5.4s)
    ok 5 browser-tests\importador-temas.spec.ts:90:1 › cria tema a partir da referência completa para o modo atual (4.5s)
    ok 6 browser-tests\importador-temas.spec.ts:103:1 › não oferece substituir tema embarcado e salva uma cópia com id livre (3.6s)
    ok 7 browser-tests\importador-temas.spec.ts:127:1 › apagar ativo usa confirmação da lib e ativa o tema padrão do modo (4.3s)
    ok 8 browser-tests\importador-temas.spec.ts:141:1 › apagar rejeitado mantém o tema na coleção e mostra o aviso (5.5s)

    8 passed (49.5s)
  ```

  **Execução 3:**

  ```text
  Running 8 tests using 1 worker
    ok 1 browser-tests\importador-temas.spec.ts:26:1 › salva o rascunho aplicado como tema novo e o Aplicar seguinte persiste o id novo (21.2s)
    ok 2 browser-tests\importador-temas.spec.ts:47:1 › substitui o tema do importador preservando o id na coleção retornada por customThemes (11.4s)
    ok 3 browser-tests\importador-temas.spec.ts:60:1 › duplica um tema do importador com nome e id novos, mantendo o original (9.7s)
    ok 4 browser-tests\importador-temas.spec.ts:73:1 › duplica um tema embarcado como criação com identidade nova (6.8s)
    ok 5 browser-tests\importador-temas.spec.ts:90:1 › cria tema a partir da referência completa para o modo atual (8.1s)
    ok 6 browser-tests\importador-temas.spec.ts:103:1 › não oferece substituir tema embarcado e salva uma cópia com id livre (8.1s)
    ok 7 browser-tests\importador-temas.spec.ts:127:1 › apagar ativo usa confirmação da lib e ativa o tema padrão do modo (7.1s)
    ok 8 browser-tests\importador-temas.spec.ts:141:1 › apagar rejeitado mantém o tema na coleção e mostra o aviso (7.9s)

    8 passed (1.6m)
  ```

- **Arquivos desta correção:** `browser-tests/fixtures/importador-temas-entry.tsx`; `browser-tests/importador-temas.spec.ts`; `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` (gerados pelo build); `dist/` (gerado pelo build); esta plan.

**Status: 🟠 Em revisão (correção 3 do lote 1).**

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-19 — lote 0 — 🟢 Aprovado

**Conferido:** o diff tem só o anexo `plan-119-licoes-das-importacoes.md` e o relato na §9; nenhum importador aberto, nenhum
código. O anexo traz 30 problemas, cada um com o que aconteceu (`arquivo:linha` ou commit), a causa, onde o kit deveria ter
avisado, o estado hoje e o destino; os relatos históricos sem prova atual estão separados e marcados para revalidar, sem
virar regra. **Amostra conferida na fonte:** o 8 (a skill `ui-integra-consumidor` diz "tags/semver fora de escopo",
`SKILL.md:314-317`), o 21 (`GUIA-FRONTEND.md:550-552` ainda fala do "modelo host", contra o ADR 018) e o 30 (achado 42 da
`15-divida-conhecida`). Os três batem.

**Integração do relatório do ERP (mesma data):** gravado em `specs/plan/anexos/plan-119-relatorio-erp.md`. Conferi no código os
achados que viraram linha: o salvar e o exportar sem `contraparte` (`useThemePersistenceHandlers.ts:63`, `exportTheme.ts:59-66`),
a coleção sem deduplicar (`useThemeCollection.ts:30,37`), `deleteTheme` sem chamador no painel e aceitando id embarcado,
`SARAK_REFERENCE_THEMES` só com o escuro (`reference.ts:31`), `SarakFlex.gap?: string`, os textos com "23 temas" e "modelo host".
Viraram **I1 a I13** (lotes 1 e 2) e **C1 a C5** (candidatas do dono, funções novas). O `BUILD_INFO` com commit anterior não é
achado: o gancho `version` do release regrava `dist/` e o `BUILD_INFO` no commit da tag. **Divergência spec × código corrigida na
mesma ação:** a `09` (§2.1, §4.1, §5.2) dizia que `SARAK_REFERENCE_THEMES` é o par claro/escuro; agora diz o que o código faz
(o par vem de `sarakLoadReferenceThemes()`), e a frase de que o par difere em navegação saiu (navegação é funcional).

**Status: 🟡 Em execução (lote 1).**

## Veredito — 2026-10-19 — lote 1 — 🔴 Reprovado (8 achados)

**O que está certo (conferido no diff):** a coleção deduplica e protege os embarcados (`useThemeCollection.ts`: salvar e apagar
id embarcado lançam; `create` em id existente lança; `onDelete` que rejeita restaura a coleção); a porta `onSave(entry,
operation)` com `SarakThemeSaveOperation` (`'create' | 'replace'`) não quebra quem implementa `onSave(entry)`; o salvo e o
exportado levam a `contraparte` (`exportTheme.ts`, `getThemeCounterpartForMode`); id livre por sufixo (`createUniqueThemeId`); o
salvo vira o ativo e o design é persistido com o id novo; apagar o ativo cai no tema padrão do modo (`SarakUIProvider.tsx`);
"Novo tema" parte de `sarakLoadReferenceThemes()`; a prop vestigial saiu; os rótulos novos têm os seis idiomas; o exemplo de
`docs/persistencia-de-tema.md` rejeita em falha. **Medido por mim:** `npx vitest run src/core/Provider src/features/DesignEngine
src/core/i18n` — **151 arquivos, 989/989**.

**Achados:**

1. **`tsc` vermelho** — `src/features/DesignEngine/Main/components/__tests__/SaveThemeModal.test.tsx:77`: `exact` não existe em
   `ByRoleOptions` (TS2769). O baseline de `tsc` é 0 e o Anel 2 bloqueia o commit.
2. **Clean code: quatro violações novas** (`audit:baseline`: `auditor_cleancode` 0 → 4): `src/core/Provider/SarakUIProvider.tsx`
   (272 linhas), `src/core/Provider/types.ts` (252), `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` (285 linhas e 5
   `useState`/`useEffect` no componente). Extrair os gestos de tema para um hook próprio (por exemplo, o estado de tema de
   origem, o salvar, o criar e o apagar), a queda no tema padrão do Provider para um hook ou utilitário, e os tipos das portas
   de tema para um arquivo de tipos ao lado, sem mudar o que o barril exporta. Nada de afrouxar o limiar.
3. **O seletor de ação do modal não é um controle de verdade** — `Main/components/SaveThemeModal.tsx:127-136`: três `<button
   role="radio">` sem classe nenhuma (aparência crua do navegador, a opção escolhida não se distingue) e sem a navegação por
   setas do padrão de grupo de rádio; `aria-label="Ação de salvamento"` e `aria-label="Fechar"` são texto fixo fora do i18n.
   Usar um controle da lib para a escolha (ou o padrão de rádio completo, com o estado visível pelos tokens do tema) e os
   rótulos pelo `useLibraryText` ([[10-seguranca-e-acessibilidade]] §3.6).
4. **A confirmação de apagar é o diálogo nativo do navegador** — `ThemeCustomizationTab.tsx`, `handleDeleteTheme`:
   `window.confirm(...)`. A lib tem a confirmação dela (`useOverlay().confirm()`, [[03-superficie-publica]] §6.7), que segue o
   tema e o idioma; o painel da lib não usa o diálogo cru. No mesmo trecho e em `useThemePersistenceHandlers.ts`, os textos
   novos de aviso (apagado, falha ao apagar, "use um nome diferente", "selecione um tema do importador", "salvo e ativado")
   estão fixos em português, enquanto os rótulos novos foram para o i18n: os novos vão para o i18n também.
5. **Tema padrão escrito à mão** — `ThemeCustomizationTab.tsx`, `handleDeleteTheme`: `'sarak-sovereign'` e `'Sarak Sovereign'`
   literais. Usar `SARAK_DEFAULT_THEME_ID` e o nome do catálogo.
6. **A nota do consumidor cita a plan** — `docs/migracoes.md`, título "### Gestão de temas no painel (plan-119, lote 1)". O
   `docs/` viaja no pacote e a plan some na síntese: título sem plan (o que mudou, para quem usa as portas).
7. **O caso de navegador não prova os gestos nem a mutação** — `browser-tests/importador-temas.spec.ts` tem **um** caso, e o
   relato diz "mutação em `customThemes` em memória", que não é a mutação pedida. A §1.3 pede o caso de navegador **com
   mutação**: cobrir salvar como novo, substituir, duplicar (embarcado e do importador), novo tema da referência, apagar com
   `onDelete` que rejeita (o tema volta) e a recusa de sobrescrever embarcado; e provar, **numa cópia da árvore fora do
   repositório**, que reverter a correção de cada gesto derruba o caso correspondente, com os números no relato.
8. **O relato não segue o formato do executor** — faltam a tabela de arquivos alterados, a evidência por critério de aceite
   (`arquivo:linha` ou saída de comando) e as decisões (por exemplo, por que `operation` é o segundo argumento e não um campo
   do tema). Completar no relato da correção. De passagem: as linhas do JSDoc de `onSave` em `types.ts` perderam o alinhamento
   do `*` (cosmético, ajustar junto com o achado 2).

**Status: 🔵 Em correção** (os oito achados). `guide`, `dev-kit` e `plan-index` são regenerados pelo revisor na aprovação.

## Veredito — 2026-10-19 — correção 1 (lote 1) — 🔴 Reprovado (1 achado)

**Fecharam (conferido):** 1 (`tsc` verde); 2 (`SarakUIProvider.tsx` 225 linhas, `types.ts` 241, `ThemeCustomizationTab.tsx` 168,
os gestos em `useThemeCustomizationActions.ts`, a queda no padrão em `useThemeDeletionHandler.ts`, o contexto em `context.ts` e
`hooks/useSarakUI.ts` com os reexports mantidos em `SarakUIProvider.tsx`; `audit:baseline --with-tsc` sem regressão); 3 (o modal
usa `SarakRadio` num `fieldset` com `legend`, rótulos pelo i18n); 4 (a confirmação é `useOverlay().confirm()`, os avisos novos
nos seis idiomas); 5 (`SARAK_DEFAULT_THEME_ID` e o nome do catálogo); 6 (título da nota sem plan); 8 (relato com arquivos,
evidência e a decisão do segundo argumento). Os avisos de "exportado" que seguem fixos em português já existiam antes do lote.
**Medido por mim:** regenerei `guide`, `dev-kit` e `plan-index`; `npm run verify -- --tier=full` **verde** (`tsc`, **suíte
completa**, baseline com `tsc`, Anel 1, R36, Anel 0); `npm run build` verde; navegador contra o `dist/`:
`tema-sob-demanda` e `cromo-css-real` verdes, `importador-temas.spec.ts` **7 de 8**.

**Achado 1 — o caso "salvar como novo" falha contra o `dist/`, e o relato diz 8/8.** `browser-tests/importador-temas.spec.ts:30`:
`getByText('Salvar como novo', { exact: true })` casa **dois** elementos (o rótulo do `SarakRadio` no `fieldset` e o botão de
enviar, que tem o mesmo texto), e o Playwright recusa por modo estrito. Falhou nas três execuções que rodei (na bateria e duas
vezes isolado: 7/8 cada), então é determinístico. **Correção:** selecionar a opção pelo papel e nome (o rádio) e o envio pelo
botão, sem ambiguidade; rodar o arquivo inteiro **contra o `dist/` reconstruído** (`npm run build` e depois o Playwright, nesta
ordem, sem nenhuma outra execução mexendo nas fontes) e colar a saída; refazer a mutação desse cenário na cópia fora do
repositório; e corrigir no relato a contagem "8/8" que não se sustentava, dizendo contra qual artefato o caso tinha rodado.

**Status: 🔵 Em correção** (só o achado 1).

## Veredito — 2026-10-19 — correção 2 (lote 1) — 🔴 Reprovado (1 achado; o relato diverge do medido pela segunda vez)

**Fechou:** a ambiguidade do seletor — `importador-temas.spec.ts:30` seleciona o rádio por papel e nome, e o envio pelo botão.

**Achado 1 — o mesmo caso continua falhando, agora no passo seguinte, e o relato diz 8/8.** Rodei
`browser-tests/importador-temas.spec.ts` contra o `dist/` que o executor reconstruiu (22:05) **três vezes**: o arquivo inteiro
(7 de 8) e o caso sozinho, duas vezes (falhou nas duas). Os outros sete passam em segundos. O caso "salva o rascunho aplicado
como tema novo e o Aplicar seguinte persiste o id novo" (`:26`) salva certo (a página mostra `create:erp-noite-novo` e o tema
ativo `erp-noite-novo`), mas **depois de "Editar rascunho" o botão "Aplicar" segue desabilitado** (`:39-40`, retrato da página no
estouro), e o caso espera por ele até o tempo acabar. Duas causas possíveis, e é preciso dizer qual, medindo:
(a) **defeito do painel** — depois de salvar e ativar, a edição do rascunho não conta como alteração pendente (o que o I7 exige:
"o Aplicar seguinte grava o design com o id certo"); ou (b) **a fixture** — `onChangeDraft`
(`browser-tests/fixtures/importador-temas-entry.tsx:81-86`) alterna a cor comparando `sarak.systemDesign.primaryColor` com
`'#7c3aed'`; se a cor aplicada voltar em outra forma, a "edição" repete o valor atual e nada muda.
**Correção:** achar a causa com medição (o valor de `systemDesign.primaryColor` e do rascunho depois do salvar, e o que o
contador de alterações pendentes compara); se for (a), corrigir o painel e dizer no relato; se for (b), fazer a fixture editar
um valor que **sempre** difere do aplicado. Depois: `npm run build` e o Playwright do arquivo inteiro, nessa ordem, sem nenhuma
outra execução mexendo nas fontes, **três vezes seguidas**, colando as três saídas e o horário do `dist/index.js` usado.

**Sobre o relato:** é a segunda rodada em que "8/8" não se sustenta contra o `dist/` reconstruído. O relato desta correção
precisa trazer a saída colada, não a contagem redigida.

**Status: 🔵 Em correção** (só o achado 1).

## Veredito — 2026-10-19 — correção 3 (lote 1) — 🟢 Aprovado; lote 1 fechado

**Achado fechado:** a causa era a fixture, não o painel. `onChangeDraft` escrevia no rascunho do Provider, e o contador de
alterações pendentes do painel acompanha o rascunho local de `useDesignDraft`; a fixture passou a usar `draftState.updateDraft`
(`browser-tests/fixtures/importador-temas-entry.tsx:85`), e o caso confirma o "Aplicar" habilitado antes de clicar
(`browser-tests/importador-temas.spec.ts:41`). O diff da correção ficou nesses dois arquivos.
**Medido por mim:** `browser-tests/importador-temas.spec.ts` contra o `dist/` reconstruído (`dist/index.js` de 2026-10-19 23:00:12),
**duas vezes seguidas: 8/8 e 8/8** (52 s e 41 s); o executor colou três execuções 8/8. O resto do lote não mudou desde a
correção 1, em que `verify --tier=full` (suíte completa, `tsc`, baseline com `tsc`, Anel 1, Anel 0) e o `build` passaram, e
`tema-sob-demanda` e `cromo-css-real` passaram contra o `dist/`.

**Lote 1 fechado (I1 a I8):** o painel tem "Salvar" (substitui o tema do importador em edição), "Salvar como novo", "Duplicar",
"Novo tema" (da referência) e "Apagar" (só tema do importador, com a confirmação da lib); o tema salvo e o exportado levam a
`contraparte`; embarcado não se sobrescreve nem se apaga; id sem colisão; `onSave(entry, operation)` com `'create' | 'replace'`;
`onDelete` que rejeita devolve o tema; apagar o ativo cai no tema padrão do modo. Segue o lote 2 (I9 a I13, C2 e C5).

**Status: 🟡 Em execução (lote 2).**
