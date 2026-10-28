---
tipo: "plan"
titulo: "Dar ao formulário seção com legenda, documentos brasileiros e campos de cadastro"
objetivo: "Fazer o formulário de CRUD do importador se compor só com a lib: SarakFormSection com legenda e colunas, prefixo e sufixo no SarakInput, SarakSelect com rótulo obrigatório, SarakDatePicker com limites, atalhos, digitação e limpar, CPF, CNPJ alfanumérico e CEP validados e formatados, e SarakAutocomplete por id com linha secundária e criar novo"
dominio: "Inputs / Formulário"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "rc.4", "formulario", "inputs", "erp"]
relacionados: ["[[anexos/rc4-contrato]]", "[[plan-128-idioma-unico-e-feedback-rico]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "plan-128-idioma-unico-e-feedback-rico"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Itens Formulário 1–6 do contrato entregues, com `SarakFormSection` público e Q1/Q5 na nota de migração.

# 2. Contexto

Contrato aceito: [`anexos/rc4-contrato.md`](anexos/rc4-contrato.md) §1.2, §1.5, §1.6, §2.8, §5 Q1 e Q5, §6. **Nomes, tipos e padrões
de lá são lei.**

O que a leitura revelou: `SarakInputProps extends InputHTMLAttributes` (`src/components/atomic/Inputs/SarakInput.tsx`) — por isso o
nome é `prefixText`/`suffixText` (o `prefix` do HTML é atributo RDFa e colidiria). `SarakSelect` tem `label` opcional
(`Inputs/SarakSelect.tsx`); no ERP, 49 usos sem rótulo (demanda 15). As máscaras estão em `Inputs/internal/mask.ts` (`0` = dígito;
presets `cpf`, `cnpj`, `phone`) e o campo em `Inputs/SarakMaskedInput.tsx` (teclado numérico por padrão). `SarakDatePicker` usa
`Inputs/internal/CalendarPanel.tsx` e emite ISO; o locale padrão já vem da `plan-128`. `SarakAutocompleteOption` tem só
`value`/`label` (`Inputs/SarakAutocomplete.tsx`). `SarakForm` (`Templates/SarakForm.tsx`) é gerado por `mapping`.

**CNPJ alfanumérico (Receita Federal, a partir de julho de 2026):** 12 primeiras posições alfanuméricas (A–Z, 0–9), 2 últimas
numéricas (DV); no cálculo do DV, cada caractere vale o código ASCII menos 48, com os mesmos pesos do módulo 11 do CNPJ numérico.
O numérico continua válido. Use um CNPJ alfanumérico de exemplo publicado pela Receita como caso de teste e cite a fonte no teste.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Inputs/` — `SarakInput`, `SarakSelect`, `SarakMaskedInput`, `internal/mask.ts`, `SarakDatePicker`,
  `internal/CalendarPanel.tsx`, `SarakAutocomplete` e seus testes; módulo puro novo de documentos (`sarakIsValidCpf`,
  `sarakIsValidCnpj`, `sarakFormatDocument`) e de atalhos de período, cada um com teste.
- `src/components/atomic/Templates/SarakFormSection.tsx` (novo, com teste) — ou em `Inputs/`, onde a skill `ui-novo-componente` indicar.
- `src/components/atomic/Templates/SarakForm.tsx` — só o JSDoc (não é para CRUD).
- Usos internos de `SarakSelect` sem `label` em `src/` que a Q1 quebrar no `tsc` (passam `label` + `hideLabel` quando não houver rótulo visível).
- `src/core/i18n/catalogEntries.forms.ts` · `src/index.ts` (acréscimo) · `docs/migracoes.md` (uma subseção na `## 8.0.0`: Q1, Q5).

## 3.2 Fora
- Motor de formulário tipado (contrato §6); `src/core/Manifest/` e o bloco `Form/` do renderer.
- Dependência nova (validação de documento é código próprio). Arquivos gerados.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contrato | `specs/plan/anexos/rc4-contrato.md` §1.2, §1.5, §1.6, §2.8, §5 Q1/Q5, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | rótulo, `fieldset`/`legend`, `aria-invalid`, `aria-describedby` |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-novo-componente` · `ui-arquitetura-design` | sempre · componente novo com paridade · CSS por token |
| Código | arquivos de §2 | ler antes de editar |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Documentos: `sarakIsValidCpf`, `sarakIsValidCnpj` (numérico e alfanumérico), `sarakFormatDocument`; preset `cep`; `cnpj` aceitando
   letra maiúscula nas 12 primeiras posições, com teclado de texto por padrão; `validate` no `blur`.
3. `SarakFormSection` (`<fieldset>`/`<legend>`, descrição por `aria-describedby`, colunas pelo `useSarakDevice()`, 1 no celular).
4. `SarakInput` `prefixText`/`suffixText`; `SarakSelect` com `label` obrigatório, `hideLabel` e `options`.
5. `SarakDatePicker`: `min`, `max`, `isDateDisabled` (dia desabilitado não é focável nem selecionável), `presets`, `allowTyping`
   (no `displayFormat`; inválida ou fora do limite marca `aria-invalid` sem emitir), `clearable`.
6. `SarakAutocomplete`: `description` na opção (lida pelo leitor de tela), `selection`/`onSelectionChange`, `onCreate`/`createLabel`.
7. JSDoc do `SarakForm`. Textos novos no `catalogEntries.forms.ts`, seis idiomas.
8. Subseção em `docs/migracoes.md`; `npm run barrel:check`; `npm run verify -- --tier=quick` uma vez, resumo colado (contrato §9).

# 6. Critérios de aceite

- [ ] CPF e CNPJ: válidos, DV errado, repetidos (`111.111.111-11`) e o alfanumérico publicado — testes puros.
- [ ] `SarakMaskedInput validate`: DV errado no `blur` → `aria-invalid` e mensagem ligada por `aria-describedby` — teste por papel.
- [ ] `SarakFormSection`: `group` com nome = legenda e descrição acessível — teste por papel.
- [ ] `SarakSelect` sem `label` não compila (teste de tipo com `@ts-expect-error`); `hideLabel` mantém o nome acessível — teste.
- [ ] `SarakDatePicker`: cada prop de §2.8 com teste; teclado no calendário pula dia desabilitado.
- [ ] `SarakAutocomplete`: seleção emite a opção (id em `value`), mostra `selection.label`, "Criar" chama `onCreate` com a busca — teste.
- [ ] Sem prop nova, comportamento da rc.3 (testes existentes passam sem alteração, salvo Q1/Q5, declarados).
- [ ] Resumo com a tabela item do contrato → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento provado por teste; a Q1 é cobrada pelo próprio `tsc`.

- `npx vitest run src/components/atomic/Inputs SarakFormSection SarakForm src/core/i18n` — uma vez.
- Diff lido contra o contrato; `git diff --stat` só com a §3.1. O `quick` do executor é aceito pelo resumo colado.

# 8. Destino da síntese

**Destino:** `—` — superfície documentada pelo catálogo gerado e pela nota de migração; nenhuma regra muda.

---

# 9. Resumo da execução

---

# 10. Veredito
