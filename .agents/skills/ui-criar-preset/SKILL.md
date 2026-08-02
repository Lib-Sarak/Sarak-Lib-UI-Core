---
name: ui-criar-preset
description: Cria presets modulares parciais (cards, atmosphere, typography, buttons, inputs) no Design Engine da UI Core. Use ao adicionar variantes visuais para componentes específicos. NÃO acione proativamente.
---

# Skill: Criar Preset Modular

Cria presets granulares para componentes no Sarak-Lib-UI-Core. Preset modular não é um tema
inteiro: ele altera apenas as chaves do escopo daquele componente (merge parcial).

> **Esta skill ORQUESTRA; ela não define regra.** A spec dona é
> `specs/specs/09-temas-e-presets.md`; o fluxo está no §4 do `sarak-dev/GUIA-MANUTENCAO.md`.
> Quando esta skill divergir de uma spec, **a spec vence**.

> **Preset e tema são a MESMA primitiva**, diferindo só na amplitude: o preset preenche a fatia de
> um domínio, o tema preenche tudo. A fonte da fatia é `getScaffold(<dominio>)`.

> ⚠️ **Criar preset é CONFIGURAÇÃO, não Expansão.** O preset **só consome** chaves que já existem
> no dicionário. Se a chave não existe, a tarefa é outra (`ui-novo-componente`).

## Quando usar
- Quando o usuário pedir para criar ou modificar uma variante visual de um componente
  (ex.: "preset de card fosco").
- Use APENAS quando o usuário solicitar explicitamente. NÃO acione proativamente.

## Workflow

### 1. Identificação do pilar
Os presets de componente vivem em `src/core/Design/presets/components/` — **um arquivo por pilar**.
Abra o diretório para ver quais existem e quais constantes cada um exporta; esta skill não repete a
lista, porque lista copiada para markdown fica errada na primeira adição (R17).

*(Temas completos ficam em `src/core/Design/presets/themes/` — outra skill: `ui-criar-tema`.)*

**Gate estrito:** verifique se cada chave que o preset vai preencher existe no schema do domínio.
Chave inventada é descartada por `validateDesign` com `console.warn` e nunca chega ao CSS — e, se
ela sobreviver no arquivo, o `auditor_presets` a reprova como **chave órfã**.

### 2. Elaboração (HITL)
Mostre ao usuário o objeto `ComponentPreset` preenchido e **aguarde confirmação** antes de injetar.

### 3. Injeção
Adicione o objeto no array da constante correspondente. Note que alguns presets são **derivados**
(`TEXTURE_PRESETS`, `BUTTON_STYLE_PRESETS` e `TYPOGRAPHY_PRESETS` são gerados por `.map()` sobre
uma lista de opções) — nesses casos o item novo entra na **lista de origem**, não no array final.

### 4. Homologação
```bash
npm run audit           # auditor_presets: 0 chave órfã contra o gabarito vivo
npx vitest run          # a suíte INTEIRA
```
Compare com o **baseline** de `specs/specs/01-gates-e-baseline.md`, nunca com zero.

## Regras
- **MERGE PARCIAL:** o preset contém **apenas** as chaves do escopo dele.
- **NUNCA** inclua cor primária global, modo light/dark ou configuração global num preset de
  componente — isso é responsabilidade do tema.
- O ID do preset **DEVE** ter o prefixo do componente (ex.: `card-`, `bg-`, `typo-`).
- **NÃO** invente token para satisfazer um preset: isso é Expansão e passa pelas três fontes.

## Checklist
- [ ] Todas as chaves do preset existem no schema do domínio?
- [ ] O ID tem o prefixo correto?
- [ ] O objeto não vazou propriedade global de tema (merge parcial respeitado)?
- [ ] Se o array é derivado por `.map()`, o item entrou na lista de ORIGEM?
- [ ] `auditor_presets` sem chave órfã e suíte inteira verde?
