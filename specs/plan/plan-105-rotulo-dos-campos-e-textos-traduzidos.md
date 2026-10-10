---
tipo: "plan"
titulo: "Ligar o rotulo de todo campo ao controle e traduzir os textos fixos dos atomos"
objetivo: "Fazer todo atomo de campo com label expor um nome acessivel ligado ao controle e tirar dos atomos os textos fixos em portugues, que passam a vir do catalogo de traducao"
dominio: "Componentes atomicos / Inputs / Acessibilidade / i18n"
status: "🔴 A executar"
prioridade: "Media"
tags: ["plan", "acessibilidade", "i18n", "inputs", "label"]
relacionados: ["[[03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Leitor de tela anuncia o rótulo de qualquer átomo de campo que recebeu `label`, e nenhum átomo de `Inputs/` ou
`Media/` mostra texto fixo em português: tudo o que a lib escreve sai do catálogo de tradução, no idioma do tema.

# 2. Contexto

[[03-superficie-publica]] §6.9 promete as duas coisas, e o código cumpre em parte (medido em 2026-10-10):

**Rótulo.** Só `SarakInput` e `SarakSelect` usam `<label htmlFor>`. `SarakDatePicker`, `SarakMultiSelect`,
`SarakTimePicker`, `SarakUploader` e `SarakRangeSlider` desenham o rótulo num `<span>` solto, sem ligação com o
controle. `SarakTextarea` e `SarakRichText` não têm a prop `label`. Nem todo átomo tem um elemento rotulável
nativo (o `SarakRichText` é um `contenteditable`; o `SarakMultiSelect` e o `SarakDatePicker` têm um gatilho
próprio): nesses, a ligação é por `aria-labelledby` (ou `aria-label`) no elemento que recebe o foco.

**Textos fixos** (item 19 do backlog, promovido nesta plan): `aria-label="Hora"`/`"Minuto"`
(`SarakTimePicker.tsx`), o `'range'` de reserva do rótulo acessível (`SarakRangeSlider.tsx`), `'Buscar...'`
(`SarakMultiSelect.tsx`, `SarakAutocomplete.tsx`), `` `Remover ${label}` `` (`SarakMultiSelect.tsx`),
`'Negrito'` e os outros comandos, `'URL do link:'` (`SarakRichText.tsx`), e a mensagem de falha do PDF
(`Media/SarakPDFViewer/usePdfDocument.ts`). O catálogo de tradução mora em `src/core/i18n/catalogEntries.part*.ts`
(lido por `useLibraryText`), e o `part5` já guarda as chaves de campo (`field*`, `range*`, `time*`).

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Inputs/` — `SarakTextarea`, `SarakRichText`, `SarakDatePicker`, `SarakMultiSelect`, `SarakTimePicker`, `SarakUploader`, `SarakRangeSlider`, `SarakAutocomplete` e os testes deles.
- `src/components/atomic/Media/SarakPDFViewer/usePdfDocument.ts` — só a mensagem de erro.
- `src/core/i18n/catalogEntries.part*.ts` (chaves novas, nos idiomas que o catálogo já tem) e o que o gate de i18n exigir.
- Artefatos regenerados (`npm run catalog`, `npm run guide`).
- `docs/migracoes.md` — nota da prop `label` nova em `SarakTextarea`/`SarakRichText`, na seção da próxima versão.

## 3.2 Fora
- `SarakInput` e `SarakSelect` (já cumprem), o `SarakFieldError` (já cumpre).
- A interface do `SarakRichText` além do rótulo e dos textos (o `window.prompt` continua; só o texto dele traduz).
- Qualquer spec em `specs/`; o painel de autoria (`src/features/DesignEngine/`).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/03-superficie-publica.md` §6.9 | o contrato do campo: rótulo, erro, ícones, rótulos acessíveis |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3.6 | texto que a lib mostra, idioma, chave de tradução |
| Spec fixa | `specs/00-regras-e-invariantes.md` R12 e R34 | sem texto de marca; átomo renderiza sem Provider |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | um teste por átomo tocado |
| **Skill** | `ui-novo-componente` | prop pública nova alcançando barril e catálogo |
| Código | `src/components/atomic/Inputs/SarakInput.tsx`, `SarakSelect.tsx` | o padrão de rótulo que já cumpre |
| Código | `src/core/i18n/useLibraryText.ts` e `catalogEntries.part5.ts` | como uma chave nova entra |

# 5. Instruções de execução

1. Em cada átomo da §3.1 com `label`: o controle que recebe o foco tem nome acessível igual ao rótulo — `<label htmlFor>` quando houver elemento rotulável, `aria-labelledby` quando não houver. `SarakTextarea` e `SarakRichText` ganham a prop `label`, no mesmo formato dos outros átomos.
2. Trocar cada texto fixo listado na §2 por uma chave do catálogo, com o mesmo texto em português e o equivalente nos outros idiomas que o catálogo já tem. Sem Provider, o átomo continua renderizando (R34).
3. Um teste por átomo: com `label`, `getByRole(..., { name: <rótulo> })` encontra o controle; e os textos aparecem traduzidos quando o idioma do design muda.
4. Regenerar catálogo e kit; acrescentar a nota de migração (prop nova, só aditiva).
5. Rodar a verificação da §7.

# 6. Critérios de aceite

- [ ] Nos 7 átomos (`Textarea`, `RichText`, `DatePicker`, `MultiSelect`, `TimePicker`, `Uploader`, `RangeSlider`), o controle com foco é encontrado por `getByRole` com o nome do `label`.
- [ ] `grep` dos textos da §2 em `src/components/atomic/` (fora de testes) → nenhum literal.
- [ ] Teste de troca de idioma em pelo menos um átomo por grupo (rótulo acessível, placeholder, mensagem).
- [ ] Item 19 removido do `00-backlog` pelo revisor no veredito (não é do executor).
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; catálogo, kit e barril em dia.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — o invariante é de cada átomo e fica nos testes deles.

- `git diff --stat` → só a §3.1 e os gerados.
- `grep -rnE "\"Hora\"|\"Minuto\"|'Negrito'|URL do link|Buscar\.\.\.|Remover \\\$\{|Falha ao carregar" src/components/atomic --include=*.tsx --include=*.ts | grep -v __tests__` → vazio.
- Mutação: tirar o `htmlFor`/`aria-labelledby` de um átomo → o teste dele falha.
- `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline` · `npm run catalog:check` · `guide:check` · `barrel:check`.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md`

Texto para a §6.9, substituindo a frase do rótulo, pronto para transporte:

> Os átomos de campo têm `label`, e o controle que recebe o foco tem esse nome acessível: por `<label htmlFor>`
> quando há elemento rotulável, por `aria-labelledby` quando não há (editor rico, gatilho próprio).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
