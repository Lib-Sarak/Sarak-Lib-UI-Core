---
tipo: "plan"
titulo: "Verificar por máquina, no importador, o uso correto da lib"
objetivo: "Fazer o importador saber por máquina, no próprio repositório, onde usa a lib errado ou mantém à mão algo que ela já entrega, com um kit de verificação opcional distribuído no pacote, ligado regra a regra, cada achado com arquivo:linha e o nome público que substitui"
dominio: "Kit do consumidor / Verificação de uso"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "kit-do-consumidor", "verificacao", "importador", "eslint"]
relacionados: ["[[12-kit-do-consumidor]]", "[[03-superficie-publica]]", "[[13-instalacao-e-atualizacao]]", "[[00-regras-e-invariantes]]", "[[019-arrastar-e-soltar-do-kanban]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "adr/025 + specs/12-kit-do-consumidor.md + arquitetura/03-superficie-publica.md + specs/13-instalacao-e-atualizacao.md"
---

# 1. Objetivo

O importador liga, no lint dele, as regras que quiser de um kit de verificação que vem dentro do pacote da lib, e cada violação diz
`arquivo:linha`, o que está errado e **qual nome público da lib substitui** — inclusive quando a peça foi escrita à mão e a lib já a
entrega.

# 2. Contexto

**A lacuna medida.** Nos relatos finais da migração à `v8.0.0` (2026-11-10, anexos da `plan-119`), o ERP mantinha à mão cinco peças
que a lib entrega (`sarakErrorMessage`, `SarakPagination.getPageHref`, `SarakDocumentFrame` + `sarakPrint`, `sarakIsValidCnpj`,
`createSarakKitMock`) e usava cinco variáveis `--sarak-*` que não são públicas e caem no valor de reserva sem aviso. A lib **tinha
avisado**, mas só em `docs/migracoes.md`, que se lê uma vez; nada acusava por máquina. Onde o ERP construiu verificação própria, ela
funcionou: a regra de equivalência nativo → componente pegou **171** violações na estreia e hoje está em 0. Os logins não têm regra e
pagaram rodadas por seletor de classe interna e prop inválida.

**Decisão do dono.** 2026-10-19: "fazer, opcional para o importador — plugin de ESLint no pacote, regras ligadas uma a uma, numa plan
própria (com ADR)". 2026-11-10: a plan é agora, e o artefato tem de bastar para o importador usar a lib corretamente, evidenciando o
que foi criado à mão e já existe na lib.

**O que existe hoje.** Os três importadores usam ESLint (`eslint.config.mjs` na raiz do ERP; `eslint` no `package.json` dos dois
logins). A lib não tem ESLint e não exporta nada para lint. O `sarak-ui/catalog.json` já publica `barrelExports`, `components` e
`tokens.cssVars` (a lista das variáveis que a engine emite), gerados pelo `npm run guide` e travados pelo `guide:check`. A lista da
"base que o consumidor não reescreve" está em prosa na [[12-kit-do-consumidor]] §2.3, não em forma de dado.

**O ponto mais difícil é a detecção de peça reescrita**, porque é heurística: um nome local parecido com um nome público não prova
reescrita. O lote 0 decide a forma; o lote 2 mede acerto e falso positivo nos importadores reais antes de qualquer regra entrar no
conjunto recomendado.

# 3. Escopo

## 3.1 Dentro
- **Lote 0:** `specs/adr/025-<slug>.md` (novo, molde `specs/_templates/template-adr.md`), `specs/adr/README.md` (a linha do índice
  dele) e o anexo `specs/plan/anexos/plan-157-catalogo-de-regras.md` (novo). Leitura, sem edição, dos importadores.
- **Lote 1:** o código do kit de verificação na pasta que o ADR decidir (fora de `src/components/` e de `src/features/`); a entrada
  dele no `exports` do `package.json` e no build (o script `build:js` do `package.json`, que lista as entradas do `tsup`); a peer opcional `eslint` (se o ADR a escolher) em `package.json`
  e `package-lock.json`; os dados de equivalência no gerador do catálogo (`scripts/consumer-kit/` e, se a fonte for o JSDoc dos
  componentes, a tag nos componentes que substituem elemento nativo — só a tag, nenhuma linha de comportamento); os testes; a seção
  nova no `sarak-ui/GUIA-FRONTEND.md` (autoria) e o passo na skill `ui-integra-consumidor`; a nota em `docs/migracoes.md` (próxima
  versão, aditiva); os gerados (`guide`, `dev-kit`, `catalog`).
- **Lote 2:** o anexo `plan-157-catalogo-de-regras.md` (a medição) e as correções de regra que a medição pedir, nos arquivos do lote 1.

## 3.2 Fora
- **Qualquer arquivo de importador.** A medição do lote 2 roda com configuração fora da árvore dele (em `C:\tmp\`), sem cache gravado
  na árvore dele e sem instalar nada nela. Se não houver como rodar sem tocar o importador, pare e relate.
- Regra de gate nova **neste** repositório: o kit verifica o importador, não a lib.
- Mudar comportamento de componente para caber numa regra. Achado de componente vai para o resumo.
- O mapa "o que a lib já faz" no guia e a consolidação do kit de importação: são do lote final da `plan-119`, que começa depois desta.
  Esta plan escreve **só** a seção que ensina a ligar e ler o kit de verificação.
- Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/12-kit-do-consumidor.md` (§2 inteira, §3, §8) | o que o kit é, nunca escrever à mão o que muda, a base que o consumidor não reescreve, genericidade |
| Spec fixa | `arquitetura/03-superficie-publica.md` (§2, §3, §7.1) | barril, subpaths, fronteira lazy: o kit de verificação não pode entrar no bundle de quem não o usa |
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` §2 | peers obrigatórias × opcionais |
| Spec fixa | `specs/00-regras-e-invariantes.md` R17 | a lista de equivalências e de peças é **dado gerado**, nunca transcrita |
| Spec fixa | `specs/08-identidade-do-host-e-zero-marca.md` | o texto das mensagens das regras aparece no terminal do importador |
| Spec fixa | `specs/11-testes-e-cobertura.md` | onde e como os testes novos entram |
| ADR | `adr/README.md` · `adr/019-arrastar-e-soltar-do-kanban.md` | protocolo e o exemplo de peer opcional decidida com alternativas medidas |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-integra-consumidor` | escrita, testes, fonte do kit |
| Código | `scripts/consumer-kit/` · `scripts/catalogAst.mjs` · `scripts/componentCatalog.mjs` · `bin/sarak-ui.mjs` · `package.json` (`exports`) · `sarak-ui/catalog.json` | o gerador que dá os dados, a CLI que já existe, a superfície de pacote |
| Anexo | `specs/plan/anexos/plan-119-relatorio-final-erp.md` (A1, A2-A6, A10 e a tabela da C4) · `specs/plan/anexos/plan-119-perspectiva-final-login.md` (C4) | as regras que os importadores provaram e os casos reais que o kit tem de pegar |
| Importador (leitura) | ERP, raiz `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\`: `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\specs\arquitetura\05-regras-e-gate.md` §4.2, `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\tools-local\gate-rules\ui-equivalence.json`, `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\eslint.config.mjs`, `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\packages\ui-kit\src\` · logins: `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Biblioteca\Sarak-Lib-Login\login-completo\` e `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Biblioteca\Sarak-Lib-Login\login-provedores\` (o `package.json` e a config de ESLint de cada um) | as regras que existem lá e onde elas falham |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.**

**Lote 0 — desenho e ADR.** Só documento.
0.1. **Forma do artefato.** Compare, com custo medido, pelo menos: (A) plugin de ESLint num subpath do pacote; (B) comando novo na CLI
`sarak-ui` com análise própria; (C) A + B (o plugin para código, a CLI para o que o ESLint do importador não lê, como CSS). Para cada
uma: o que ela enxerga (`.tsx`, `.ts`, `.css`), dependência nova e peso para quem não usa, esforço do importador para ligar, como roda
na CI dele. O ADR registra a escolha, o custo e o gatilho de reavaliação; a decisão do dono de 2026-10-19 (plugin de ESLint) é a
hipótese a confirmar ou contestar com medida.
0.2. **Catálogo de regras** (o anexo). Uma linha por regra candidata: o que barra, de onde vem o dado (qual chave do `catalog.json`,
ou qual dado novo precisa ser gerado), o caso que **reprova** e o que **passa**, e quem pediu. Comece pelas que os importadores provaram:
- porta única (import da lib fora do caminho que o importador configurar);
- `var(--sarak-*)` fora de `catalog.json › tokens.cssVars` (A1 do ERP: os cinco nomes reais);
- elemento nativo com componente da lib (A10 do ERP: `h1`-`h3`, `section`, `fieldset`, `header`, `nav`…) — o par vem de dado gerado,
  nunca de lista no código do plugin (R17);
- **peça reescrita**: código local que reimplementa um nome público da lib (A2-A6 do ERP); diga qual sinal a regra usa e o falso
  positivo esperado;
- cor ou fonte literal fora de token, aceitando `var(--x, <reserva>)` (a regra do ERP acusava isso em falso);
- import direto de biblioteca que a lib encapsula (`ui-kit` do ERP);
- seletor por classe interna da lib (login).
Regra para a qual não se escreve um caso que reprova sai da lista. Para cada uma: severidade proposta e se entra no conjunto
recomendado.
0.3. **Para o dono aprovar antes do lote 1:** o ADR em `🟡 Proposto` e o anexo. O revisor leva ao dono; sem aprovação, o lote 1 não
começa.

**Lote 1 — o kit.**
1.1. Os dados que as regras leem saem do gerador do catálogo e entram no `sarak-ui/catalog.json` (ou num arquivo irmão gerado, se o ADR
decidir), cobertos pelo `guide:check`/`catalog:check` existentes. Nenhuma lista de nomes da lib escrita à mão no código do kit.
1.2. Cada regra do catálogo aprovado, **desligada por padrão**; um conjunto `recommended` só com as aprovadas para ele. Cada mensagem traz
o que está errado e o nome público que substitui; texto sem marca.
1.3. Testes por regra: pelo menos um caso que reprova e um que passa, com o dado real do catálogo gerado (não um dublê do catálogo).
1.4. O kit fica fora do bundle principal: `npm run build` e a medição de boot (`boot:measure`) sem crescimento no boot; cole os números.
Quem não instala a peer opcional não vê erro nem aviso novo no build dele (estenda `scripts/test-optional-peer-consumer.mjs` com o
cenário).
1.5. Guia: uma seção "Verificar o uso" — instalar, ligar regra a regra, ler o achado, desligar uma regra com motivo. Skill
`ui-integra-consumidor`: o passo, apontando para a seção. Nota aditiva em `docs/migracoes.md`.
1.6. `npm run guide`, `npm run dev-kit` por último.

**Lote 2 — medição nos importadores reais.** Só leitura dos importadores (§3.2).
2.1. Rode o kit, com todas as regras ligadas, contra o ERP (`packages/ui-kit`, `modules/*/web`) e os dois logins. Cole o comando e a
contagem por regra.
2.2. Por regra: verdadeiros positivos e falsos positivos, com `arquivo:linha` de cada falso. **O kit tem de pegar os casos conhecidos:**
os cinco `var(--sarak-*)` da A1 e as peças das A2-A6 do relato final do ERP que ainda estiverem no código dele (confira antes; o ERP
pode ter migrado alguma).
2.3. Regra com falso positivo que não se corrige sai do `recommended` e fica documentada com o limite. Corrija nos arquivos do lote 1
e registre tudo no anexo.

# 6. Critérios de aceite

- [ ] ADR-025 com as alternativas, o custo de cada uma e o gatilho de reavaliação, aprovado pelo dono antes do lote 1.
- [ ] Catálogo de regras no anexo, cada regra com o caso que reprova e o que passa.
- [ ] O importador liga o kit sem copiar nada da lib: um import do subpath (ou o comando) e as regras pelo nome.
- [ ] Cada achado com `arquivo:linha`, o problema e o nome público que substitui.
- [ ] Nenhuma lista de nomes da lib escrita à mão no código do kit; os dados vêm do gerador e o `guide:check`/`catalog:check` os trava.
- [ ] Boot sem crescimento; build do importador sem a peer, sem aviso novo.
- [ ] Medição nos três importadores: os casos conhecidos pegos, falsos positivos contados, `recommended` só com regras sem falso
  positivo conhecido.
- [ ] Seção do guia e passo da skill; nota em `docs/migracoes.md`.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1.

# 7. Como verificar (uso do revisor)

**Gate:** teste — cada regra com caso que reprova e caso que passa, sobre o catálogo gerado; os dados ficam sob o `guide:check` e o
`catalog:check` que já existem; nenhuma regra de gate nova neste repositório.

- Lote 0: as alternativas do ADR conferidas contra o que os importadores têm (ESLint presente, CSS que o ESLint deles lê ou não); duas
  regras do anexo, escolhidas por mim, com o caso que reprova escrito.
- Lote 1: `git diff --stat` → só a §3.1; um teste por regra lido e a mutação de um deles (tirar um nome de `tokens.cssVars` do
  dado e ver o teste reprovar, em cópia fora do repositório); `boot:measure` e o consumidor sem a peer; `npm run verify -- --tier=full`.
- Lote 2: rodo o kit eu mesmo contra o ERP com a configuração do anexo e confiro a contagem de uma regra e três achados por
  `arquivo:linha`.

# 8. Destino da síntese

**Destino:** `adr/025 + specs/12-kit-do-consumidor.md + arquitetura/03-superficie-publica.md + specs/13-instalacao-e-atualizacao.md`

- **`adr/025`:** nasce no lote 0 e só ganha a referência à plan sintetizada se o ADR a citar.
- **`12`:** o kit de verificação como parte do kit: de onde vêm os dados, o conjunto recomendado, o que cada regra não vê.
- **`03`:** o subpath novo e a regra de que ele fica fora do bundle principal.
- **`13`:** a peer opcional nova, se houver, e o passo de instalação.
- O anexo sai com a plan; o que é regra vai para as specs.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
