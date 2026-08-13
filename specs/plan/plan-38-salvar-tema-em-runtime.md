---
tipo: "plan"
titulo: "Permitir que o usuário final salve temas criados, sem depender de deploy"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel / Persistência"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "painel", "temas", "persistencia", "adr-010", "adr-011"]
relacionados: ["[[010-temas-salvos-pelo-usuario]]", "[[009-persistencia-tenant-aware]]", "[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "plan-34"
destino_sintese: "specs/specs/09-temas-e-presets.md · specs/specs/06-painel-de-customizacao-e-preview.md"
objetivo: "Um usuário final, sem acesso ao código do importador, cria um tema no painel, salva, e o tema aparece na lista — sobrevivendo a reload quando o importador guarda e devolve, por UMA porta de escrita"
---

# 1. Objetivo

Um usuário final do sistema importador — sem acesso ao repositório — cria um tema no painel de customização,
clica em **Salvar**, e esse tema passa a aparecer na lista de temas disponíveis, sem que ninguém mexa em
código ou faça deploy.

**O recorte, decidido pelo dono em 2026-08-12 e detalhado na §2.0:** a lib **sempre** embarca os temas
internos; o importador guarda **só** o tema aplicado (já resolvido pela `plan-34`) e **os temas novos que o
usuário criar**. É isso, e nada mais.

# 2. Contexto

**Depende da `plan-34`** — o tema *aplicado* já persiste por lá (`persistence.onSave`/`onLoad`,
tenant-aware). Esta plan trata só da **coleção** de temas criados.

O que a investigação mediu, `arquivo:linha` — **conferido de novo em 2026-08-12**, não refaça a leitura:

- `src/features/DesignEngine/Main/components/SaveThemeModal.tsx` — hoje é **só exportação**: título
  "Exportar Tema (JSON)", com o texto explícito de que *"a Sarak UI não tem backend próprio"*. Renderizado
  por `ThemeCustomizationTab.tsx:226`. Este fluxo **fica intocado**.
- `src/features/DesignEngine/Main/hooks/useThemePersistenceHandlers.ts` — `handleExportTheme` é o único
  handler de persistência; chama `buildThemeExportPayload` + `downloadThemeJson`
  (`src/features/DesignEngine/Main/utils/exportTheme.ts`). Nenhuma chamada de rede.
- **A lista viva de temas é `Main/TemplatesTab.tsx:22,73`** — lê `sarak.allThemes` e renderiza `name` e
  `description` (com fallback `'Tema customizado.'`). É a aba que `ThemeSidebarContent.tsx:126` monta.
  `Canvas/components/PresetsCatalog.tsx:46` lê a **mesma** `allThemes`.
- `src/core/Provider/SarakUIProvider.tsx:118-120` — `allThemes = [...GLOBAL_THEMES, ...customThemes]`,
  tipado `ThemeEntry[]`. **É o único ponto de junção da lista.** Quem entrar aqui aparece nas duas telas
  acima de graça, sem seção nova.

## 2.0 🟢 EMENDA — 2026-08-12: o bloqueio era menor do que eu disse, e a decisão foi tomada

Esta plan esteve **⛔ Bloqueada** por uma emenda minha que afirmava que o `ThemePresetId` de união fechada
impedia um tema de runtime de entrar na lista. **Fui conferir o caminho real e ele não impede.** O registro
fica aqui, e não apagado, pelo mesmo motivo das outras emendas: **corrigir a plan em silêncio é o defeito.**

### O que eu disse errado

| O que a emenda anterior afirmava | O que a medição de 2026-08-12 responde |
|---|---|
| "o tema salvo não entra na lista porque `ThemePresetId` é união fechada" | a porta de entrada **já é aberta**: `customThemes` é `unknown[]` (`types.ts:229`) e `allThemes` é `ThemeEntry[]`, cujo `id` é **`string` puro** (`types.ts:34-38`) |
| "o painel exige `ThemePreset`" | `PresetsCatalog.tsx:46` e `TemplatesTab.tsx:22` fazem **cast**, não constraint — a união fechada já é contornada no código de hoje |
| "R1 impede: o shape certo mora em `features/`" | o shape certo é o **`ThemeEntry`**, que já mora em `src/core/Provider/types.ts`. A opção "A" da tabela antiga (*mover o shape para `core/`*) **já estava feita** |
| "opção B: abrir `ThemePresetId`" | desnecessária. `ThemePresetId` descreve os **23 embarcados**, e o `auditor_presets` só audita esses — tema de runtime não encosta em gate nenhum |

O que sobrou do achado é pequeno e verdadeiro: **uma frase do [[010-temas-salvos-pelo-usuario]] §2 manda
reaproveitar `ThemePreset`, e seguir essa frase ao pé da letra não compila.** O alvo certo é `ThemeEntry`.
Custo: zero tipo novo, zero MAJOR, zero conflito com R1.

### A decisão do dono, 2026-08-12

> *"A lib sempre terá os temas internos, e o importador irá salvar somente o tema aplicado e os novos temas
> criados. O correto é que o importador escolha onde quer armazenar, seja em JSON ou tabela."*

Disso decorre o desenho, e ele é deliberadamente magro:

1. **UMA porta de escrita.** `options.theme.onSave` recebe o tema pronto. A lib entrega o JSON; o importador
   grava onde quiser — arquivo, tabela, `localStorage`, o que for. A lib não pergunta e não sabe.
2. **NENHUMA porta de leitura.** O caminho de volta já existe e chama-se **`customThemes`**: o importador
   passa o array na montagem e o Provider funde com os embarcados. Um `onLoadThemes` seria uma segunda porta
   fazendo o que uma prop já faz — duas fontes para a mesma lista, que é o tipo de duplicação que a R6
   existe para impedir.
3. **NENHUMA porta de apagar.** A lista pertence ao importador; a lib nunca remove o que não guardou.
4. **`ThemeEntry` + um campo.** Hoje ele tem `id`, `design`, `contraparte`. Um tema salvo precisa de rótulo
   para aparecer na lista, então entra **`name?: string`** — campo opcional em tipo existente, **aditivo,
   MINOR**. `description` não entra: `TemplatesTab.tsx:80` já tem fallback.
5. **Registro:** como o item 1 contraria a letra do ADR-010, o registro honesto é um **ADR-011** curto,
   substituindo **uma** conclusão do 010 e mantendo o resto vigente — mesmo movimento do 008 sobre o 007.

### O preço, dito na cara

Com só a porta de escrita, o ida-e-volta é do importador: ele guarda e ele devolve em `customThemes`. **A
lib não lembra de nada sozinha.** É o custo de não ter backend, e é o custo certo — a alternativa é a lib
voltar a ter opinião sobre armazenamento, que foi exatamente o que o [[003-remocao-backend-proprio]]
removeu.

# 3. Escopo

## 3.1 Dentro

1. **`src/core/Provider/types.ts`**
   - `ThemeEntry` ganha **`name?: string`**. Opcional — os temas embarcados já têm `name` pelo
     `ThemePreset`, e a opcionalidade evita quebrar quem passa `customThemes` sem rótulo.
   - `options.theme` ganha **`onSave?: (theme: ThemeEntry) => Promise<void> | void`**, com JSDoc dizendo o
     contrato: quando é chamada, o que recebe, e que **guardar e devolver é do consumidor**.
   - `SarakUIContextType` ganha **`saveTheme: (theme: ThemeEntry) => Promise<void>`** — é o que o painel
     chama. ⛔ **Não** crie um bloco `options.themes` (plural): confunde com o `options.theme` que já existe.
2. **`src/core/Provider/SarakUIProvider.tsx`** — estado de sessão para os temas salvos nesta montagem,
   fundido em `allThemes` **depois** de `customThemes`. Sem isso o usuário salva e não vê nada até
   recarregar. `saveTheme` acrescenta ao estado **e** chama `options.theme.onSave`. Salvar duas vezes o mesmo
   `id` na mesma sessão **substitui**, não duplica.
3. **`src/features/DesignEngine/Main/hooks/useThemePersistenceHandlers.ts`** — `handleSaveTheme` novo: monta
   o tema **completo** reaproveitando `buildThemeExportPayload`/`resolveCompleteDesign` (mesma regra do
   export — [[09-temas-e-presets]] §4.5), acrescenta o `name` que o usuário digitou, e chama
   `sarak.saveTheme`. Erro segue o padrão de `handleExportTheme` (`showToast('warning', …)`).
4. **`src/features/DesignEngine/Main/components/SaveThemeModal.tsx`** — ganha a ação **Salvar** ao lado de
   "Exportar JSON". **Sem `options.theme.onSave` configurado, "Salvar" não aparece** e o modal fica
   exatamente como é hoje. Nunca ofereça um Salvar que evapora no reload — é a mesma disciplina do
   `strategy: 'remote'` sem porta ([[009-persistencia-tenant-aware]] §2.2): avisa e degrada, nunca perde em
   silêncio.
5. **Validação de fronteira** — o tema montado passa por `validateDesign` antes de entrar em `allThemes`,
   como qualquer tema de origem externa ([[10-seguranca-e-acessibilidade]] §2.1). Vale também para o que
   chega por `customThemes`, se já não valer hoje: **meça e relate**, não conserte de passagem.
6. Testes ao lado de cada arquivo tocado (R8): `saveTheme` chama `options.theme.onSave` com o payload certo;
   o tema aparece em `allThemes` **na mesma sessão**; salvar o mesmo `id` duas vezes substitui; sem a porta
   configurada, "Salvar" não aparece; `onSave` que rejeita **não** derruba o painel nem some com o tema da
   sessão; tema com chave fora do contrato é descartado com warn.

## 3.2 Fora

- ⛔ **`onLoadThemes` e `onDeleteTheme`.** Foram descartados pela decisão da §2.0 — ler é `customThemes`,
  apagar é do importador. Se você achar que faltam, **relate**: é achado, não escopo.
- ⛔ **`src/features/DesignEngine/Library/ThemeList.tsx`.** A versão anterior desta plan mandava acrescentar
  uma seção "Meus Temas" ali. **É código órfão** — medido em 2026-08-12: nenhum arquivo o importa além do
  próprio teste. A lista viva é `TemplatesTab.tsx`, e ela lê `allThemes`, então **o tema salvo aparece
  sozinho**. Não crie seção nova.
- ⛔ **Qualquer backend embarcado na lib.** Zero endpoint, zero `fetch` para servidor próprio.
- ⛔ **Editar ou renomear** tema já salvo — fora deste corte.
- ⛔ Mudar o fluxo de "Exportar JSON" — continua intocado, é o caminho do desenvolvedor.
- ⛔ Mexer em `ThemePresetId`, em `GLOBAL_THEMES` ou nos 23 temas embarcados. A união fechada continua
  descrevendo **só** o que a lib embarca, e isso está certo.
- ⛔ `src/core/Provider/hooks/useDesignManager.ts` e a persistência do **design ativo** — é a `plan-34`, já
  aprovada. Esta plan não encosta lá.
- ⛔ Decidir **quem vê quais temas** (permissão, compartilhamento) — é do backend do importador.
- ⛔ Layout/CSS (`plan-35`), performance (`plan-36`), modo essencial (`plan-37`).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| ADR | `specs/adr/011-tema-salvo-por-uma-porta-de-escrita.md` | **o contrato desta plan** — uma porta, `ThemeEntry`, sem porta de leitura nem de apagar |
| ADR | `specs/adr/010-temas-salvos-pelo-usuario.md` *(🔴 Substituído — leitura ainda obrigatória)* | o objetivo, a coexistência com "Exportar JSON", o corte de CRUD e a validação de fronteira **continuam vigentes**; só o recorte técnico foi substituído |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §2 · §4.5 | o formato do tema e "tema exportado nasce completo" |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §2.1 | tema de origem externa é dado não-confiável |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R6 · R8 · R33 | contrato de valor; teste ao lado; payload de tema é contrato público |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |
| Código | `SaveThemeModal.tsx`, `useThemePersistenceHandlers.ts`, `TemplatesTab.tsx`, `SarakUIProvider.tsx:118-120`, `exportTheme.ts` | ler antes de editar |

# 5. Instruções de execução

0. **Leia o [[011-tema-salvo-por-uma-porta-de-escrita]] antes da §3** — ele é o contrato desta plan, e
   substitui o recorte técnico do 010. Escrito em 2026-08-12; o pré-requisito está cumprido.
1. **Estender os tipos** (`types.ts`): `ThemeEntry.name?`, `options.theme.onSave`, `SarakUIContextType.saveTheme`.
   **Pronto quando** compila, `run_audit` segue no baseline e cada campo novo tem JSDoc de contrato.
2. **`saveTheme` no Provider** — estado de sessão + fusão em `allThemes` **depois** de `customThemes` + chamada
   a `options.theme.onSave`. **Pronto quando** um teste prova que o tema aparece em `allThemes` na mesma
   sessão e que o mesmo `id` salvo duas vezes não duplica.
3. **`handleSaveTheme`** — tema completo (`resolveCompleteDesign`), com `name`, validado, entregue a
   `sarak.saveTheme`.
4. **Botão "Salvar"** em `SaveThemeModal.tsx`, condicionado à porta. **Pronto quando** um teste prova que,
   sem `options.theme.onSave`, o modal é idêntico ao de hoje.
5. **Erro de `onSave`** — avisa por toast e **mantém** o tema na sessão. Perder o que o usuário acabou de
   criar porque o backend dele caiu é o pior desfecho possível.
6. **Fechar.** Nesta ordem, colando a saída real: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` ·
   `npx tsc --noEmit` · `npm run container-query:check` · `git diff --stat`.
7. **`docs/migracoes.md`** — entrada nova. É **aditivo** (nada existente muda de comportamento sem opt-in),
   então classifique por [[03-versionamento-e-release]] §3 e diga como o importador liga a porta.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-38-salvar-tema-em-runtime.md.

LEIA specs/adr/011-tema-salvo-por-uma-porta-de-escrita.md E a §2.0 ANTES DA §3.
O ADR-011 é o contrato desta plan: ele substitui o recorte técnico do ADR-010 (que
mandava três portas e o tipo `ThemePreset`). O tipo certo é `ThemeEntry`, que já existe
em src/core/Provider/types.ts e cujo `id` já é `string` aberto. O 010 continua valendo
no resto — objetivo, coexistência com "Exportar JSON", corte sem editar/renomear,
validação de fronteira —, por isso ele é leitura obrigatória mesmo marcado Substituído.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/adr/011-tema-salvo-por-uma-porta-de-escrita.md, specs/adr/010-temas-salvos-pelo-usuario.md,
specs/specs/09-temas-e-presets.md §2 e §4.5,
specs/specs/10-seguranca-e-acessibilidade.md §2.1,
specs/specs/00-regras-e-invariantes.md R6, R8 e R33.
Skills: padrao-escrita, padrao-typescript, test-unitario.

O DESENHO É DELIBERADAMENTE MAGRO — uma porta de escrita, e só:
  · options.theme.onSave(theme) — a lib entrega o JSON, o importador grava ONDE QUISER.
  · A leitura de volta JÁ EXISTE: é a prop `customThemes`. NÃO crie onLoadThemes.
  · NÃO crie onDeleteTheme — a lista é do importador.
  · ThemeEntry ganha `name?: string`. Nenhum tipo novo.

DUAS ARMADILHAS MEDIDAS, não repita:
  · src/features/DesignEngine/Library/ThemeList.tsx é CÓDIGO ÓRFÃO (só o próprio teste
    o importa). NÃO acrescente seção nenhuma ali. A lista viva é Main/TemplatesTab.tsx,
    que lê `sarak.allThemes` — quem entra em allThemes aparece sozinho.
  · NÃO crie um bloco `options.themes` (plural) ao lado do `options.theme` que já existe.

LINHAS VERMELHAS:
  · Você NÃO cria backend, endpoint nem fetch da lib para servidor.
  · Você NÃO mexe em ThemePresetId, GLOBAL_THEMES nem nos 23 temas embarcados.
  · Você NÃO mexe no fluxo de "Exportar JSON" — continua intocado.
  · Você NÃO mexe em useDesignManager.ts nem na persistência do design ATIVO (plan-34).
  · Você NÃO implementa editar/renomear/apagar tema salvo.
  · Sem a porta configurada, "Salvar" NÃO aparece. Nunca ofereça um Salvar que evapora.

Se `onSave` rejeitar, avise por toast e MANTENHA o tema na sessão. Perder o que o
usuário acabou de criar porque o backend dele caiu é o pior desfecho possível.

Todo conserto leva teste ao lado (R8).

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] `ThemeEntry.name?`, `options.theme.onSave` e `SarakUIContextType.saveTheme` existem, com JSDoc de
      contrato. **Nenhum tipo novo** foi criado.
- [ ] O tema salvo aparece em `allThemes` **na mesma sessão** — evidência: teste, não captura de tela.
- [ ] Salvar o mesmo `id` duas vezes **substitui**, não duplica.
- [ ] Sem `options.theme.onSave`, o `SaveThemeModal` é **idêntico** ao de hoje — nenhum teste existente dele
      mudou de expectativa.
- [ ] `onSave` que rejeita: toast de aviso, tema **permanece** na sessão, painel não quebra.
- [ ] Tema montado passa por `validateDesign` antes de entrar na lista; payload fora do contrato é
      descartado com warn.
- [ ] Nenhum `onLoadThemes`/`onDeleteTheme` no diff. Nenhuma linha em `ThemeList.tsx`.
- [ ] `docs/migracoes.md` com entrada nova, classificada.
- [ ] `npx vitest run` inteira, verde, não encolheu.
- [ ] `run_audit` sem regressão; `npx tsc --noEmit` → 0; `container-query:check` verde.
- [ ] `git diff --stat` — só os arquivos da §3.1 (mais testes e `docs/`).

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

# as portas — e a ausência das que foram descartadas
grep -n "onSave\|saveTheme\|name?" src/core/Provider/types.ts
grep -rn "onLoadThemes\|onDeleteTheme" src/          # tem de voltar VAZIO
git diff --stat -- src/features/DesignEngine/Library/ThemeList.tsx   # tem de voltar VAZIO

npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
npm run container-query:check
```

**O que reprova, além do óbvio:**
- **"Salvar" visível sem a porta configurada** — é a promessa que evapora no reload, o defeito que esta plan
  existe para não criar;
- porta de leitura inventada (`onLoadThemes`) "para ficar simétrico" — a decisão da §2.0 é explícita;
- seção nova em `ThemeList.tsx` — código órfão, medido;
- tema entrando em `allThemes` **sem** `validateDesign`;
- `docs/migracoes.md` sem entrada: a porta é pública, o importador precisa saber que ela existe.

**O que esta verificação não vê:** que o importador realmente guardou e devolveu. O ciclo completo
(salvar → recarregar → tema ainda lá) só se prova **no consumidor**, porque metade dele é código que não
mora aqui. Registre isso no resumo em vez de fingir cobertura.

# 9. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` · `specs/specs/06-painel-de-customizacao-e-preview.md`

**Texto pronto para transporte:**

- `09-temas-e-presets.md` §4 (Ciclo de vida) ganha uma sexta fase — **Salvar em runtime** — com a porta
  única, a divisão "a lib embarca os internos / o importador guarda os criados", e a razão de não haver
  porta de leitura (é `customThemes`).
- `06-painel-de-customizacao-e-preview.md` ganha, onde documenta o `SaveThemeModal`, a distinção entre as
  duas ações — **Exportar** para o desenvolvedor, **Salvar** para o usuário final — e a degradação quando a
  porta não está configurada.
- Registrar também o achado colateral: **`Library/ThemeList.tsx` é código órfão**, na mesma prateleira das
  abas inalcançáveis já documentadas em `06-painel-de-customizacao-e-preview.md` §9.3.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
