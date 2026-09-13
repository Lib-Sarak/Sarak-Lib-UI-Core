---
tipo: "plan"
titulo: "Fazer os textos da própria lib seguirem o idioma que vale, com um seletor só"
objetivo: "Fazer todo texto que a lib mostra ao usuário final aparecer no idioma que vale, nos seis idiomas oferecidos, com um único seletor de idioma na base"
dominio: "Sarak-Lib-UI-Core / Idioma"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "idioma", "i18n", "cromo", "preferencias"]
relacionados: ["[[specs/10-seguranca-e-acessibilidade]]", "[[specs/09-temas-e-presets]]", "[[specs/05-cromo-e-slots]]", "[[016-preferencias-do-usuario-separadas-do-tema]]"]
depende_de: "plan-78-o-que-o-painel-oferece-a-tela-faz"
retida_por: ""
destino_sintese: "specs/10-seguranca-e-acessibilidade.md · specs/05-cromo-e-slots.md"
---

# 1. Objetivo

Com o idioma trocado para inglês, espanhol, francês, alemão ou italiano, **nenhum** texto que a lib mostra ao
usuário final continua em outro idioma: cromo, widgets, palette de busca, menu de preferências e rótulos
padrão de átomo. E existe **um** seletor de idioma na base, não dois.

# 2. Contexto

A lib já entrega **o idioma que vale**: `useSarakUI().design.language`, que é a preferência do usuário
quando o tema a oferece e habilita, e senão o idioma do tema ([[09-temas-e-presets]] §4.7 ·
[[10-seguranca-e-acessibilidade]] §3.6). O que falta é ela mesma usar esse valor. Os textos dela estão fixos,
em inglês e português misturados. Medido pelo revisor em 2026-09-13:

- `SarakSearch.tsx:120,150` — *"Available Tools"*, *"No results for …"*;
- `ShellSearchWidget.tsx:128` — *"No results for …"*;
- `ShellUserWidget.tsx:31-96` — *"User"*, *"Master"*, *"Admin"*, *"Logout"*;
- `SarakShell.tsx:202-217` — *"Falha Industrial detectada no Módulo…"*, *"Sincronizando DNA Industrial…"*,
  *"Estabilizando Ambiente Industrial…"*, *"v10.1.10 Diagnostic Active"*. Jargão que o usuário final não
  entende, em qualquer idioma.

Os idiomas oferecidos são os seis de `LANGUAGES` (`src/core/Discovery/constants.ts:5-12`): `pt`, `en`, `es`,
`fr`, `de` e `it`.

**O segundo seletor.** `src/components/atomic/Inputs/Controls.tsx:32-80` define outro `LanguageSelector`,
independente da camada de preferências ([[016-preferencias-do-usuario-separadas-do-tema]]):
- grava direto no `localStorage` com chave própria;
- escreve o cookie do Google Translate;
- recarrega a página.

Medido: nenhum dos quatro componentes desse arquivo (`LanguageSelector`, `ThemeToggle`, `UserMenu`,
`ModuleSelector`) está no barril público — `dist/index.d.ts` não os exporta. Nenhum arquivo de produção da
lib os importa, e o ERP também não. É código morto com um contrato concorrente. **Sai.** O seletor que fica é
o `ShellLanguageSelector`.

A chave de `localStorage` que ele gravava (`LANGUAGE_STORAGE_KEY`, `src/core/Provider/constants.ts:4`)
continua na lista do reset (`src/core/Provider/utils/storage.ts:10`). Assim o reset do painel ainda limpa o
dado antigo de quem já a tem salva. O comentário da constante passa a dizer que ela é legado.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Inputs/Controls.tsx` e `__tests__/Controls.test.tsx` — **removidos**.
- `src/core/Provider/constants.ts` — o comentário de `LANGUAGE_STORAGE_KEY`.
- **Novo:** o catálogo de textos da lib, um por idioma de `LANGUAGES`, e a leitura dele pelo idioma que vale.
  Mora em `src/core/` ou `src/shared/`, conforme a regra de dependência ([[00-mapa-do-modulo]]).
- Os componentes que o usuário final vê por padrão e que hoje têm texto fixo, dentro de:
  - `src/core/Shell/**`
  - `src/components/Layout/**`
  - `src/components/atomic/Navigation/**`
  - `src/components/atomic/Inputs/SarakSearch.tsx`
  - átomos com texto **padrão** (rótulo ou `aria-label` que aparece quando o consumidor não passa o dele) —
    paginação, estado vazio, fechar modal/drawer, seletor de data, upload. A lista exata sai do inventário
    do passo 1.
- Os testes de cada arquivo tocado.
- `dist/` · `sarak-ui/` · `docs/component-catalog.*` · `sarak-dev/` — **só pelos geradores**.

## 3.2 Fora
- **O painel de design** (`src/features/DesignEngine/**`). É ferramenta do administrador, e segue em português.
- Mocks e textos de exemplo do preview.
- Mensagem de console e de erro para o desenvolvedor.
- Texto que o consumidor passa por prop: o do consumidor vence sempre, e a lib não o traduz.
- Motor de tradução para as telas do host. Continua sendo do host ([[10-seguranca-e-acessibilidade]] §3.6).
- Porta para o host sobrescrever os textos da lib. É feature nova; não entra aqui.
- Temas: declarar `enabledLanguages` nos temas é da recalibração do catálogo.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §3.6 — a fronteira: a lib entrega o idioma, o host traduz as telas dele |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | §4.7 — o idioma que vale e de onde ele sai |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | §2.2.2 — o seletor de idioma no cromo e as condições de montagem |
| ADR | `specs/adr/016-preferencias-do-usuario-separadas-do-tema.md` | por que o idioma é preferência, e não gravação direta |
| Spec fixa | `specs/arquitetura/00-mapa-do-modulo.md` | onde o catálogo pode morar sem violar a regra de dependência |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R12 (zero-marca: texto novo não carrega marca) · R34 (átomo renderiza sem Provider — o texto padrão precisa de um idioma sem Provider) |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `padrao-typescript` | sempre |
| Skill | `test-unitario` | os testes do passo 5 |
| Código | `src/components/atomic/Navigation/ShellLanguageSelector.tsx` | o seletor que fica, e como ele lê o idioma |
| Código | `src/core/Discovery/constants.ts` | os seis idiomas |

# 5. Instruções de execução

1. **Inventário primeiro.** Liste no resumo cada texto fixo que o usuário final vê nos arquivos do escopo
   (`arquivo:linha` → texto), incluindo `aria-label`, `title` e `placeholder` padrão. Esse inventário é o
   critério de completude: texto listado e não convertido é pendência declarada.

2. **Remover o seletor duplicado.** `Controls.tsx` e o teste dele saem. Ajuste o comentário de
   `LANGUAGE_STORAGE_KEY`, e confirme que `barrel:check` e `catalog:check` continuam verdes, porque os
   componentes nunca foram públicos.

3. **O catálogo.** Uma chave por texto do inventário, com os seis idiomas preenchidos, **todos**. A leitura
   segue o idioma que vale. Sem Provider (R34), ou com um idioma fora dos seis, o texto sai em **português**,
   que é a base da lib. Onde o texto hoje é jargão (os de `SarakShell.tsx`), a versão nova diz em linguagem
   comum o que está acontecendo — *"Carregando…"*, *"Este módulo não pôde ser exibido"*. O papel do usuário
   (`Master`/`Admin`/`User`) também passa pelo catálogo.

4. **Converter** cada texto do inventário para a leitura do catálogo. A troca de idioma em runtime repinta
   os textos **sem recarregar a página**.

5. **Testes.**
   - **Paridade do catálogo:** toda chave existe nos seis idiomas, não vazia. Um teste que **cai** quando se
     apaga uma tradução.
   - Por componente convertido: o mesmo componente em `pt` e em `en` mostra o texto de cada idioma — **as
     duas direções**.
   - **"Não muda nada":** sem idioma definido, e sem Provider, o texto sai em português.
   - Trocar o idioma pela preferência repinta o cromo sem recarga.

6. Rode os geradores (`npm run catalog`, `npm run guide`, `npm run dev-kit`), `npm run build`,
   `npm run zero-brand:check`, `npm run audit` (compare com o baseline) e a suíte inteira
   (`npx vitest run --maxWorkers=3`).

# 6. Critérios de aceite

- [ ] O inventário do passo 1 está no resumo, e todo item dele está convertido ou declarado como pendência.
- [ ] `Controls.tsx` e o teste dele não existem mais; `barrel:check` e `catalog:check` verdes.
- [ ] O catálogo tem os seis idiomas completos, e o teste de paridade cai quando uma tradução some.
- [ ] Os componentes convertidos têm teste nas duas direções e no caso "sem idioma, sem Provider".
- [ ] Nenhum texto do inventário continua fixo em `src/core/Shell/**`, `src/components/Layout/**`,
      `src/components/atomic/Navigation/**` e `SarakSearch.tsx`.
- [ ] `zero-brand:check` verde; `audit` sem regressão; suíte inteira verde. Falha em arquivo não tocado foi
      rodada isolada antes de ser atribuída ([[00-backlog]] #5).

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — a verificação é o teste de paridade do catálogo e os testes por componente (invariante
do módulo, não da relação entre módulos).

- `git status` + `git diff --stat` → só a §3.1, mais os gerados.
- **Efeito:** renderizar o `SarakAppChrome` e o `SarakShell` com `language: 'en'` num script `tsx`
  (`react-dom/server`) e procurar, no HTML, os textos em português do inventário. Nenhum pode aparecer.
  Repetir com `'pt'` procurando os ingleses.
- **Mutação:** apagar uma chave de um idioma → o teste de paridade cai. Restaurar byte a byte.
- `grep` pelos textos do inventário nos arquivos convertidos → nenhum literal sobrou.
- `grep -rnE "plan-[0-9]+|achado [0-9]+|veredito"` nos arquivos da entrega, rastreados e não rastreados.
- `npx vitest run --maxWorkers=3 > arquivo 2>&1` e ler a saída.

# 8. Destino da síntese

**Destino:** `specs/10-seguranca-e-acessibilidade.md` · `specs/05-cromo-e-slots.md`

- **`10-seguranca-e-acessibilidade`** §3.6 — sai o aviso *"os textos da própria lib não são traduzidos"*.
  Texto pronto para transporte:

  > **Os textos da própria lib seguem o idioma que vale.** Cromo, widgets, palette e rótulos padrão de átomo
  > saem de um catálogo com os seis idiomas oferecidos, e repintam na troca, sem recarga. Sem Provider, ou
  > fora dos seis, saem em português. O painel de design é ferramenta do administrador e não entra nessa
  > promessa. Texto passado pelo consumidor por prop é dele, e a lib não o traduz.
- **`05-cromo-e-slots`** §2.2.2 — o seletor de idioma é um só, e troca os textos do cromo sem recarregar a
  página.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
