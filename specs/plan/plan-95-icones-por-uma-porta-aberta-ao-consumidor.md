---
tipo: "plan"
titulo: "Fazer todo ícone passar por uma porta só, aberta ao consumidor"
objetivo: "Fazer a familia e o peso de icone escolhidos no painel valerem para todo icone da lib, e permitir ao consumidor trazer os proprios icones por registro ou por elemento, sem lista fechada"
dominio: "Sarak-Lib-UI-Core / Átomos / Ícones"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "icones", "iconFamily", "lucide", "consumidor"]
relacionados: ["[[03-superficie-publica]]", "[[09-temas-e-presets]]", "[[01-gates-e-baseline]]"]
depende_de: "plan-94-um-cromo-so"
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md"
---

# 1. Objetivo

Trocar a família ou o peso de ícone no painel repinta **todos** os ícones da lib — como o catálogo já
promete — e um consumidor usa qualquer ícone que precise: registrando os seus por nome, ou passando o
elemento direto, sem bater numa lista fechada.

# 2. Contexto

**Decisão do dono (2026-10-02):** corrigir os ícones e tornar a escolha configurável no painel; os pacotes de
ícone por tema (troca do *desenho* do ícone de navegação, herdados do legado Oss) **saem** — abrir o ícone ao
consumidor cobre o caso.

**Medido em 2026-10-02:**

| Fato | Onde |
|---|---|
| Os tokens `iconFamily` (`lucide` / `phosphor` / `tabler`) e `iconWeight` existem, 14 temas os declaram, e o `SarakIcon` os consome | `src/core/Design/schema/system.ts:205-232` · `src/components/atomic/Icon/SarakIcon.tsx:40-41` |
| **37 arquivos** de `src/components` e `src/core` importam `lucide-react` direto e não seguem o token — entre eles `SarakModal`, `SarakStats`, `SarakTable`, `SarakSearch`, `SarakExpandableCard`, `SarakShellThemeToggle` | `git grep -l "from 'lucide-react'" -- src/components src/core` (38 arquivos, um é a própria família) |
| O catálogo de componentes afirma que trocar a família "repinta todos os ícones" | `docs/component-catalog.md:89` |
| A lista de nomes é fechada em 100; nome desconhecido vira `AlertCircle` com um aviso. Dos ícones que o Oss usa faltam 25 de 38; dos do Cripto, 39 de 98 (`Brain`, `Gauge`, `Key`, `Wallet`, `Wifi`, `Target`…) | `src/components/atomic/Icon/iconNames.ts:19-54` · `SarakIcon.tsx:28-47` |
| `iconStrokeWidth` só é lido pelo `SarakSpinner`; dois temas o declaram sem efeito | `src/components/atomic/Feedback/SarakSpinner.tsx:47` |
| Código morto dos pacotes de ícone: `src/constants/icon-packs.tsx` (8 pacotes), `emojiSet` no payload, `ThemeEditor.tsx`, `useThemePreview.ts`, `ShortcutsTab.tsx`, `LanguageTab.tsx` — nenhum tem importador | `git grep -l` por nome |
| A família lucide importa ícones de **marca** (`Chrome`, `Github`) que a linha 1.x do `lucide-react` removeu; o peer é aberto (`>=0.284.0`), e o `login-completo` precisou pinar `0.577.0` | `src/components/atomic/Icon/families/lucideIcons.ts:24,43` · `package.json` |
| `arquitetura/03` §6.2 cita `ICON_NAMES` (hoje `SARAK_ICON_NAMES`) e diz que nome desconhecido "não desenha ícone" — desenha `AlertCircle` | `specs/arquitetura/03-superficie-publica.md:248-250` |

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/atomic/Icon/**` — a porta: o registro extensível, o elemento como ícone, o consumo de
  `iconStrokeWidth`.
- Os 37 arquivos que importam `lucide-react` direto — passam a usar `SarakIcon` (ou a porta que ele expõe).
- `src/core/Design/schema/system.ts` — só `description` dos três tokens, se precisar dizer o alcance.
- `src/constants/icon-packs.tsx`, `src/features/DesignEngine/Library/ThemeEditor.tsx`,
  `src/features/DesignEngine/Context/useThemePreview.ts`, `src/features/DesignEngine/Panels/ShortcutsTab.tsx`,
  `LanguageTab.tsx`, a chave `emojiSet` em `src/core/Provider/types.ts` e `payloadExtraKeys.ts`, e os testes
  deles — **removidos**.
- `gates/scripts/contrato/` — o gate que impede `lucide-react` (e as outras famílias) fora da porta, com teste.
- `package.json` — a faixa do peer `lucide-react`, se a escolha for cortar os ícones de marca ou fixar o teto.
- `src/components/Layout/chrome/navItem.ts` e `src/components/atomic/Navigation/SarakMenuItem.tsx` — `icon`
  aceita nome **ou** elemento.
- `docs/migracoes.md`; `docs/component-catalog.*`, `sarak-ui/`, `sarak-dev/`, `dist/`, `src/core/Provider/generated/`
  regenerados.

## 3.2 Fora (o que NÃO pode ser tocado)

- Os nomes dos 100 ícones já publicados — ninguém some.
- Família nova de ícones (SVG próprio, emoji). O registro é a porta; quem quer outra família a registra.
- O painel além de garantir que `iconFamily`/`iconWeight`/`iconStrokeWidth` apareçam como os outros tokens.
- Os pacotes de ícone por tema do legado: não voltam.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §6.2 (contrato de nomes de ícone — a versão atual está defasada e é destino) e §4.3 (prefixo) |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | o que um tema declara; a paridade das chaves que saem (`emojiSet`) |
| Spec fixa | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` | a paridade das três fontes — remover chave é operação da skill |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R18 (todo gate declara o que não vê) e R35 (o molde de "porta única" com gate) |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | §2.2 — onde o gate novo entra no catálogo |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | §3 — remover chave de payload é MAJOR; §5 — a nota |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-refatorar-componente` | remover `emojiSet` sem quebrar a paridade |
| **Skill** | `test-unitario` | os testes |
| Código | `src/components/atomic/Icon/SarakIcon.tsx` · `IconMap.ts` · `iconNames.ts` · `families/*.ts` | a porta de hoje |
| Código | `gates/scripts/contrato/check-class-merge.mjs` | o idioma de um gate de "porta única" (R35) a reproduzir |

# 5. Instruções de execução

1. **Inventário**: liste os 37 arquivos e, em cada um, os ícones usados. Registre no resumo.
2. **A porta aceita elemento**: `SarakIcon` (e o `icon` do item de navegação) aceita nome registrado **ou**
   `ReactNode`. Elemento passa direto, com o tamanho e a cor do contexto.
3. **Registro extensível**: `sarakRegisterIcons({ nome: componente })` — o consumidor acrescenta nomes; os 100
   continuam. Nome desconhecido continua caindo em `AlertCircle` com aviso único.
4. **Família e peso valem para todos**: os 37 arquivos passam a usar a porta; nenhum `from 'lucide-react'`
   (nem phosphor/tabler) sobra fora de `src/components/atomic/Icon/families/`. `iconStrokeWidth` chega ao
   ícone.
5. **O gate**: `icon-port:check`, no Anel 1 e na CI, acusa import direto de qualquer família fora da porta.
   Caso que falha por fixture. Cabeçalho com os limites (R18).
6. **Ícones de marca**: tire `Chrome`/`Github` da família lucide (o `SarakSocialButton` passa a receber o
   ícone do consumidor por `icon`, elemento) e ajuste o peer para a faixa que a lib de fato suporta. Registre
   a escolha no resumo.
7. **Código morto** sai: pacotes de ícone, `emojiSet`, as abas e o editor sem importador, com seus testes. A
   paridade das três fontes fecha; `docs/migracoes.md` ganha a nota MAJOR (`emojiSet` deixa de ser chave
   aceita; `Chrome`/`Github` saem dos nomes).
8. Confirme que `iconFamily`, `iconWeight` e `iconStrokeWidth` aparecem no painel como qualquer token de
   `select`/`slider` — se não aparecerem, é achado: relate.
9. `npm run build` · `npm run guide` · `npm run catalog` · `npm run dev-kit` · `npx tsc --noEmit` ·
   `npx vitest run` · `npm run audit` → verdes.

# 6. Critérios de aceite

- [ ] `git grep -l "from '\(lucide-react\|@phosphor-icons/react\|@tabler/icons-react\)'" -- src` devolve só
      arquivos de `src/components/atomic/Icon/families/`.
- [ ] Teste: trocar `iconFamily` no Provider muda a família de um ícone do `SarakModal` e de um do `SarakTable`
      (dois dos 37, escolhidos como amostra).
- [ ] Teste: `sarakRegisterIcons` torna um nome novo renderizável; `icon={<svg/>}` renderiza o elemento.
- [ ] Teste: `iconStrokeWidth` chega ao `stroke-width` do ícone.
- [ ] O gate acusa uma fixture com import direto e passa sobre a base.
- [ ] `git grep -n "emojiSet\|icon-packs\|ThemeEditor\|ShortcutsTab\|LanguageTab\|useThemePreview" -- src`
      → vazio; paridade das três fontes verde.
- [ ] `docs/migracoes.md` tem a nota; o catálogo não promete mais do que faz.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx vitest run` verdes; `npm run audit` sem regressão.

# 7. Como verificar (uso do revisor)

**Gate:** regra nova — *todo ícone da lib passa pela porta de ícones; nenhuma família é importada fora dela*
(`icon-port:check`). Vale para a relação entre todos os componentes; é a mesma forma da R35.

- `git status` + `git diff --stat` → só §3.1.
- O `grep` do critério 1 → só `families/`.
- Mutação por fixture do gate → acusa; sobre a base → verde.
- Rodar isolados os testes dos critérios 2 a 4.
- `node gates/scripts/contrato/check-minor-no-removal.mjs` → os nomes removidos batem com a nota.
- `npm run build` · `npx tsc --noEmit` · `npx vitest run` · `npm run audit`.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md`

- **`03-superficie-publica`** §6.2 reescrita — o contrato de ícones: nome registrado ou elemento; registro
  extensível; família, peso e espessura do tema valem para todo ícone; nome desconhecido → `AlertCircle` + aviso.
- **`09-temas-e-presets`** — o que um tema declara de ícone (família, peso, espessura) e que `emojiSet` não é
  mais chave.
- **`00-regras-e-invariantes`** — a regra nova (próximo número livre), com gate; a contagem da §1.3.
- **`01-gates-e-baseline`** §2.2 e §2.2.1 — o gate no catálogo e onde roda.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
