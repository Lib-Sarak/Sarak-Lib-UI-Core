---
name: ui-criar-tema
description: Orquestra a geração autônoma e paramétrica de temas completos (ThemePresets) para a Sarak UI Core. Use ao configurar esquemas globais de cores e atmosferas. NÃO acione proativamente.
---

# Skill: Criar Tema Master

Orquestra a geração orientada a dados de temas completos (`ThemePreset`) para o ecossistema Sarak UI.

> **Esta skill ORQUESTRA; ela não define regra.** A spec dona é
> `specs/specs/09-temas-e-presets.md`; o fluxo passo a passo está em
> `sarak-dev/GUIA-MANUTENCAO.md` §4. Quando esta skill divergir de uma spec, **a spec vence**.

> ⚠️ **Criar tema é CONFIGURAÇÃO, não Expansão.** Um tema **só consome** chaves que já existem no
> dicionário; ele **nunca** inventa token. Se a chave que você quer não existe, isso é outra
> tarefa (`ui-novo-componente`) e outra decisão.

## Quando usar
- Quando o usuário desejar criar um esquema visual global (light/dark, brand colors, atmosfera).
- Use APENAS quando o usuário solicitar explicitamente. NÃO acione proativamente.

## Workflow

### 1. Coleta de Parâmetros (HITL)
Pergunte as definições base: nome/id do tema, paleta primária, modo (light/dark), estilo de
navegação e a atmosfera pretendida.

### 2. Parta de um gabarito, nunca do zero
```bash
npx tsx .agents/skills/ui-criar-tema/scripts/generate_theme_template.ts <id-do-tema>
```
O script escreve `src/core/Design/presets/themes/<id-do-tema>.ts` já pré-populado a partir do
`MASTER_DESIGN_MAP` vivo. ⚠️ **Ele cria o arquivo no `src/`** — não o rode para "experimentar";
se rodar por engano, apague o arquivo gerado.

**A regra que mais economiza tempo:** parta de um **tema de referência completo** e customize
poucos valores. Um consumidor real montou um tema só com COR e concluiu que "fonte e cromo não
mudam" — os eixos de completude existem para pegar isso.

### 3. Preenchimento
Preencha o `design` **só com ids que existem no dicionário**. Chave inventada é descartada por
`validateDesign` com `console.warn` e nunca chega ao CSS: o tema *parece* completo e não é.

### 4. Registro
O gerador **não** registra o tema — ele só escreve o arquivo. Exporte e registre o tema em
`src/core/Design/presets/themes/index.ts` (`THEME_PRESET_IDS` e `GLOBAL_THEMES`), senão ele não é
alcançável por ninguém.

### 5. Verificação — completude E contraste

```bash
npm run audit           # inclui auditor_presets (CHAVE ÓRFÃ) e auditor_contraste (R31, WCAG AA)
npx vitest run          # a suíte INTEIRA
```

Para medir **completude** (quais eixos o tema deixou vazios), use o utilitário público
`findMissingThemeAxes` / `warnOnIncompleteTheme` (`src/core/Design/utils/themeAxes.ts`). Ele
**avisa e devolve a lista; não lança** — a lib não força completude, ela só impede que a
incompletude seja silenciosa (R33).

Para medir **contraste** — o `npm run audit` acima já cobra, mas para saber **qual token corrigir**
antes de rodar a auditoria completa, use o solucionador:

```bash
npx tsx .agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts <id-do-tema>
```

Ele mede os pares reais com o mesmo gate (`gates/scripts/audit/verify_contrast.ts`), e onde reprovar,
ajusta **só a luminosidade** do token de texto — matiz e saturação saem intactos. Devolve um relatório
(par, valor antes/depois, razão, delta): **cole esse relatório** ao registrar o tema — é o que transforma
a correção numa proposta revisável, não um fato consumado. Um par que o relatório marcar como "não
resolvido" exige uma decisão sua (ver `references/liberdade-e-restricao.md` §1).

Compare o `npm run audit` com o **baseline** de `specs/specs/01-gates-e-baseline.md`, nunca com zero.

### 6. Confirmação
Comunique que o tema está registrado, quantos eixos ficaram vazios (se algum) e o resultado do
`auditor_presets`.

## Regras
- **NÃO** invente token: um tema só consome o que o dicionário já tem.
- **NÃO** misture a lógica de Tema Master com presets parciais de componente — o tema é a fundação.
- **Tipagem correta importa:** `borderRadius: '16px'` onde o token é `number` quebra a compilação
  e o valor é descartado em runtime.
- Tema **parcial é legítimo** — mas a lacuna tem de ser deliberada, não acidente. Meça com
  `findMissingThemeAxes` antes de declarar pronto.

## Checklist
- [ ] O tema foi gerado a partir do gabarito vivo (não escrito do zero)?
- [ ] Todas as chaves do `design` existem no dicionário (zero chave inventada)?
- [ ] Os tipos batem com o `token.type` (number × string, enum válido)?
- [ ] O tema foi registrado em `presets/themes/index.ts`?
- [ ] `auditor_presets` sem chave órfã e suíte inteira verde?
- [ ] A completude foi medida com `findMissingThemeAxes`, e as lacunas são deliberadas?
- [ ] O solucionador rodou e o relatório foi colado? Todo par "não resolvido" tem decisão registrada?
- [ ] `npm run audit` fecha sem regressão no auditor de contraste (R31)?

## Referências (Camada 3)

**Gerador — esta skill invoca:**
- `.agents/skills/ui-criar-tema/scripts/generate_theme_template.ts` — gera o arquivo do tema
  pré-populado com os tokens vivos do `MASTER_DESIGN_MAP`. **Escreve em `src/`.**
- `.agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts` — o solucionador (plan-24-1). Mede
  contraste com o gate da R31 e corrige **só a luminosidade** do texto que reprovar, preservando matiz e
  saturação. Devolve tema + relatório; **não escreve arquivo sozinho** — você aplica o valor corrigido.
- `.agents/skills/ui-criar-tema/references/liberdade-e-restricao.md` — o mapa de onde há restrição
  (os pares de contraste) e onde não há nenhuma (tudo o mais). Leia antes de preencher cor de texto.

**Validador — o GATE invoca, não você:**
- `gates/scripts/audit/verify_contrast.ts` (`auditor_contraste.mjs`) — **tem gate**, dentro de
  `npm run audit` (R31). Mede os 36 pares reais texto/fundo a 4,5:1 em cada tema embarcado; é o que o
  solucionador (acima) consulta para saber o que corrigir.
- `gates/scripts/audit/verify_theme_parity.ts` — valida UM tema. **Reprova**
  chave que não existe no dicionário; **avisa** (sem reprovar) quando o tema é parcial. A
  assimetria é deliberada: **tema novo nasce 100% preenchido pelo gerador**, mas tema que já
  existe é parcial de propósito e continua funcionando — as chaves ausentes caem no default do
  schema. Reprovar por ausência quebraria todo tema antigo a cada token novo.

> ⚠️ **Este validador ainda NÃO tem gate** — hoje nenhum pipeline o invoca. Ele está registrado
> para entrar no pipeline de CI/CD em `specs/specs/00-regras-e-invariantes.md` §3.1. Até lá, a
> cobertura de tema que **existe** é o `auditor_presets` dentro do `npm run audit`, que cobra
> chave órfã em todos os temas embarcados de uma vez.

- `.agents/skills/ui-criar-tema/references/examples.md` — estrutura de um `ThemePreset` (bom × ruim).
