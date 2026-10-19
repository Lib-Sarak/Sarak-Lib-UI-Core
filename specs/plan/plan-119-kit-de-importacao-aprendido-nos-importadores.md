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
| Doc | `docs/migracoes.md` · `docs/roteiro-de-validacao-dos-temas.md` · `sarak-ui/GUIA-FRONTEND.md` | o que o importador lê hoje |

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
1.2. O que faltar, corrigir no painel: o gesto que não existe passa a existir; tema embarcado nunca é sobrescrito (editar = duplicar);
o id do tema novo nunca colide com embarcado nem com outro do importador; sem `onSave`, nenhum gesto de salvar aparece (§4.6).
1.3. Teste de componente por gesto e o caso de navegador com mutação; nota em `docs/migracoes.md` se o comportamento visível mudou.

**§5.1 — Registro vivo dos achados da lib** (mantido pelo revisor; vem do lote 0 e das sessões dos importadores):

| # | Achado (`arquivo:linha` e medição) | Origem | Decisão | Lote | Estado |
|---|---|---|---|---|---|

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

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
