---
tipo: "plan"
titulo: "Fechamento do arsenal: injecao sem disputa de canal, cascata e movimento que cedem ao tema, painel e descricoes que dizem a verdade, travas sem furo e contraste dos pares que faltavam"
objetivo: "Corrigir o residuo que a re-auditoria de fechamento da plan-114 mediu nos pontos cegos das travas, em tres lotes revisados um a um, fechar os furos das proprias travas e repetir a re-auditoria ate zero, antes de os temas serem refeitos"
dominio: "Design Engine / Injecao / CSS do motor / Painel / Contraste / Gates"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "design-engine", "injecao", "cascata", "movimento", "painel", "contraste", "gate", "temas"]
relacionados: ["[[02-design-engine]]", "[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "arquitetura/02-design-engine.md + specs/06-painel-de-customizacao-e-preview.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md"
---

# 1. Objetivo

O que o tema declara aparece igual nos modos App e Embarcado e sobrevive à troca de tema; nenhuma regra do motor,
nem montada em TypeScript, atropela o componente; a velocidade do tema chega a toda transição; o painel mostra a
descrição verdadeira de cada token e não apaga o que não entende; nenhum token do painel deixa de desenhar; as
travas não têm os furos medidos; e os pares de contraste desenhados que faltavam passam.

# 2. Contexto

**Decisão do dono, 2026-10-13:** criar esta plan com o resíduo da re-auditoria de fechamento da `plan-114`, antes
de refazer os temas (`plan-110`, lote 1 em espera).

A `plan-114` zerou as categorias da primeira verificação (dono de variável, nome sem dono, reserva, contrato de
tema, controle do painel, cor que busca recurso). A re-auditoria de 2026-10-13 foi instruída a procurar **o que cada
trava declara não ver** e mediu classes novas: a disputa entre o valor inline e o `<style>` responsivo, a variável
inline nunca removida, o material de superfície sempre ativo com `!important`, a duração padrão das transições
desligada do token, a descrição que o painel não mostra, tokens que o gate dá como lidos sem efeito, e furos nas
próprias travas. A lista medida, com arquivo e linha, está em
[`anexos/plan-115-residuo-da-reauditoria.md`](anexos/plan-115-residuo-da-reauditoria.md).

| Lote | Classe | Peso |
|---|---|---|
| **1 — Injeção, cascata e movimento** | canto editado que não aparece no modo App; valor do tema anterior que persiste; material com `!important` sempre ativo; padding e sombra da camada final; `!important` em TypeScript; transição a 150 ms fixos | o que o tema declara não chega, ou chega diferente por modo |
| **2 — Painel, descrições, tokens e travas** | descrição ausente em 391 controles; campo numérico sem faixa; seletor que apaga `var()`; faixas meio mortas; valores fora do passo; catálogo duplicado; descrições falsas; tokens sem efeito; leituras mortas; furos de quatro travas | o painel e o schema dizem uma coisa e a tela faz outra |
| **3 — Contraste e valores fixos** | 6 pares desenhados fora do verificador; contrapartes sem aviso/informação; valores fixos restantes em componentes e mocks | ilegível em alguns temas; mocks que não mostram o tema |

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/hooks/`, `src/core/Provider/components/` (injetor), `src/core/Provider/utils/`, `src/core/Design/schema/`, `catalog/`, `presets/themes/` (só trocar valor que o contrato exigir e a cor de contraparte que reprovar — sem redesenho), `src/styles/`, `src/components/**`, `src/features/DesignEngine/**`.
- `gates/` — os furos medidos (anexo R2.10) e as travas novas de cada lote, com limites (R18) e mutação; `gates/scripts/audit/verify_contrast.ts`.
- `browser-tests/`, testes unitários, `docs/migracoes.md` (subseção em `## 8.0.0`), artefatos regenerados.

## 3.2 Fora
- Redesenhar tema (`plan-110`). Criar componente. Token novo só quando o componente existe e o aspecto que um tema espera controlar não tem token (ex.: sombra de sobreposição) — declarado no resumo antes de criar.
- Mudar o desenho padrão sem declarar: diferença vai na nota MAJOR, com o motivo.
- Qualquer spec em `specs/` (síntese do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/plan-115-residuo-da-reauditoria.md` | a lista medida, por lote |
| Spec fixa | `arquitetura/02-design-engine.md` (§4, §9.1, §10) | emissão, camadas, o que cada token desenha, cascata, um dono, cor e texto sobre cor sólida |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` (§3) | controles e descrição |
| Spec fixa | `specs/09-temas-e-presets.md` (§4.2, §6) · `specs/10-seguranca-e-acessibilidade.md` (§2.1) | contrato de tema, travas de tema, validação |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R18, R31, R40-R44) · `specs/01-gates-e-baseline.md` (§2.2) | as regras e os gates que esta plan aperta |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-arquitetura-design` · `ui-refatorar-componente` · `dataviz` · `padrao-escrita` + `padrao-typescript` · `test-unitario` | CSS do motor, token, contraste, escrita, testes |
| Código | `src/core/Design/hooks/useDesignVariables.ts`, `src/core/Provider/components/DesignInjector.tsx`, `src/core/Provider/components/SovereignThemeInjector.tsx`, `src/styles/_surfaces.css`, `src/features/DesignEngine/Main/components/TokenControl.tsx`, `gates/scripts/contrato/helpers/variable-contract-core.ts`, `gates/scripts/contrato/check-token-reader.mjs` | onde moram os defeitos de maior peso |

# 5. Instruções de execução

**Três lotes, nesta ordem, um por vez.** Cada lote termina com resumo **num bloco novo** da §9 (append-only: não
editar bloco anterior) e status 🟠; o próximo só começa depois do veredito. Cada item do anexo termina corrigido, ou
fora com motivo medido.

1. **Lote 1 — Injeção, cascata e movimento (anexo, Lote 1).** O valor que o tema declara vale igual nos modos App e
   Embarcado, qualquer que seja o formato (escalar ou responsivo) de mestre e exceção; trocar de tema não deixa valor
   do tema anterior. O material e a moldura escolhidos por atributo não atropelam a classe do componente (o padrão do
   material mora na camada que cede, como o do cartão); padding, sombra e recorte do cartão cedem à classe; o
   injetor de modo claro não monta `!important` sobre componente que já lê o tema, e o lightbox fica legível; a
   duração e a curva padrão das transições do Tailwind vêm de `motionDuration*`/`motionEaseMain`. Prova em navegador
   para cada item, com a contraprova do padrão, nos dois modos de injeção.
2. **Lote 2 — Painel, descrições, tokens e travas (anexo, Lote 2).** O painel mostra a descrição do schema em todo
   controle; o campo numérico tem faixa, passo e unidade e não grava `NaN`; o seletor de cor não apaga `var()`,
   `color-mix()`, `hsl()`; faixas de slider só cobrem o que o CSS desenha; valores de tema na grade do `step` (e a
   validação confere a grade); o catálogo sem entrada duplicada; descrição e rótulo dizem o que o código faz (ou o
   código passa a fazer o que a descrição promete, quando o componente existe — `neumorphism` do botão, por exemplo:
   leitor, ou a opção sai); token sem efeito ganha leitor ou sai do schema (regra da `plan-113`); leituras e escritas
   mortas saem; os furos das quatro travas (anexo R2.10) fecham, cada um com caso de mutação.
3. **Lote 3 — Contraste e valores fixos (anexo, Lote 3).** Os pares desenhados que faltavam entram no verificador e
   passam nos 14 temas × 2 modos; a contraparte declara as cores que reprovam no modo oposto; os valores fixos
   restantes leem o token; os mocks do painel mostram o tema (o detector de cor fixa passa a ver hex e `rgba` quase
   preto/branco em `src/features/`).
4. **Em todo lote:** testes unitários do que é JS; casos de `browser-tests/` para cada efeito de CSS (o padrão de
   cada caso é o que a cena aplica); nota MAJOR na `## 8.0.0`; gerados regenerados (`guide` por último); simulação
   do Anel 0 sobre as linhas adicionadas.
5. **Travas:** cada classe nova fechada ganha trava (gate novo ou extensão justificada), com limites no cabeçalho
   (R18), caso de mutação, falhando no `HEAD` anterior, ligada ao Anel 1 e à CI. Em particular: valor do mesmo token
   em canais que disputam (inline × `<style>`) e variável inline órfã (lote 1); descrição exibida em todo ramo de
   controle (lote 2).

# 6. Critérios de aceite

- [ ] Lote 1: canto/mestre iguais nos dois modos em todo formato; troca de tema sem valor órfão; material, padding, sombra e recorte cedem à classe; injetor de modo claro sem atropelo; transição pelo token — com casos de navegador.
- [ ] Lote 2: descrição em todo controle; campo numérico com faixa e sem `NaN`; seletor de cor sem perda; faixas e grade; catálogo sem duplicata; descrições verdadeiras; zero token sem efeito; zero leitura/escrita morta; os quatro furos das travas fechados com mutação.
- [ ] Lote 3: os pares do anexo medidos e verdes; contrapartes completas onde reprovavam; valores fixos lidos do token; mocks seguindo o tema.
- [ ] Uma trava por classe nova, falhando no `HEAD` anterior e passando depois.
- [ ] Paridade, `auditor_presets`, `tokenContractParity`, `shippedThemesConsoleClean` e contraste verdes.
- [ ] Nota MAJOR em `## 8.0.0` a cada lote.
- [ ] Suíte completa verde numa passada (repetida depois do último conserto); `tsc` 0; `audit:baseline` sem regressão; Anel 1 inteiro; casos de `browser-tests/` escritos (o revisor roda `npm run build` e `cromo-css-real:check`); Anel 0 simulado: 0.
- [ ] Fechamento: o revisor repete a re-auditoria completa (as três frentes) e o resultado nas categorias medidas é zero.

# 7. Como verificar (uso do revisor)

- `git diff --stat` → só a §3.1 e os gerados.
- Cada item do anexo do lote: no código e, quando é CSS ou injeção, no navegador (inclusive no modo Embarcado).
- Cada trava: falha no `HEAD` anterior; mutação faz falhar.
- `npm run build` + `npm run cromo-css-real:check` · `npm run audit` · `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline -- --with-tsc` · Anel 1 · simulação do Anel 0.
- Depois do lote 3: as três re-auditorias.

# 8. Destino da síntese

**Destino:** `arquitetura/02-design-engine.md + specs/06-painel-de-customizacao-e-preview.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md`

- **`02-design-engine`:** como o motor escreve sem disputa de canal e limpa o que sai; material na camada que cede; transição padrão pelo token.
- **`06-painel`:** descrição em todo controle; campo numérico; cor sem perda.
- **`09-temas-e-presets`:** grade do `step` conferida; contrapartes; pares de contraste novos.
- **`00-regras` e `01-gates`:** as travas novas e os furos fechados (R40-R44 atualizadas, ou regra nova).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido nem reescrito. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
