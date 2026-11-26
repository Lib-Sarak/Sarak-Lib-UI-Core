---
tipo: "plan"
titulo: "Temas de marca só de leitura e o erro do cromo entregue ao importador"
objetivo: "Permitir ao importador marcar um tema dele como só leitura, para o painel oferecer Duplicar em vez de Salvar e Apagar, e entregar ao importador os erros que o cromo contém por uma prop onError"
dominio: "Temas / Cromo"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "contrato-aditivo", "temas", "cromo", "erro"]
relacionados: ["[[09-temas-e-presets]]", "[[05-cromo-e-slots]]", "[[010-temas-salvos-pelo-usuario]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[017-porta-de-apagar-tema-simetrica-a-de-escrever]]"]
depende_de: ""
retida_por: ""
destino_sintese: "09-temas-e-presets; 05-cromo-e-slots"
---

# 1. Objetivo

- Um tema que o importador declara só de leitura aparece no painel com "Duplicar", e nunca com "Salvar" ou "Apagar".
- O importador recebe os erros que o cromo contém, por uma prop `onError` do `SarakAppChrome`.

# 2. Contexto

**Quando despachar:** depois do `npm version` da `9.0.0-rc.2`. As duas mudanças acrescentam contrato público, e a campanha da rc.2 é
de correção.

| Id | Achado |
|---|---|
| B72 | **Tema de marca sem como ser só de leitura.** `SarakThemeEntry` (`src/core/Provider/themeTypes.ts:4-10`) traz só `id`, `name`, `design` e `contraparte`, e a imutabilidade vale só para o catálogo da lib. O ERP põe os temas dele (`erp-corporativo`, `erp-noturno`) em `customThemes` e recusa o id no `onSave`. Pelo contrato atual, o painel oferece "Salvar" e "Apagar" sobre eles e o usuário recebe erro, em vez de "Duplicar" |
| B63 | **O erro do cromo não chega ao importador.** O `SarakAppChrome` contém o erro de render do conteúdo (o `SarakErrorBoundary` com `resetKeys` de `src/components/Layout/chrome/useStableContent.tsx`, e o do `secondaryContent` em `ChromeContentRegion.tsx`) e não expõe `onError`. O mesmo vale para `SarakSection` (`src/components/atomic/Templates/SarakSection.tsx`). Hoje, quem registrava erro com um boundary em volta do cromo precisa pôr outro dentro do conteúdo (`docs/migracoes.md`, perto da linha 794) |

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/themeTypes.ts`: campo opcional `readOnly?: boolean` em `SarakThemeEntry`.
- O painel: onde decide "Salvar", "Apagar" e "Duplicar" para um tema, trata `readOnly` como trata os temas do catálogo da lib.
- `SarakAppChrome` e `SarakSection`: prop opcional `onError(error, info)`, repassada ao `SarakErrorBoundary` interno.
- Testes de unidade.
- Documentação:
  - `docs/persistencia-de-tema.md`: o `readOnly`;
  - `docs/migracoes.md`: uma nota aditiva para cada mudança, e a troca da orientação da linha 794 pela prop;
  - `sarak-ui/GUIA-FRONTEND.md`, pela fonte do `npm run guide`.

## 3.2 Fora
- Mudar a imutabilidade do catálogo da lib.
- Um boundary novo em volta do cromo inteiro.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | temas salvos e catálogo imutável |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | props do cromo |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | o que é aditivo (minor) |
| ADR | `specs/adr/010-temas-salvos-pelo-usuario.md` · `specs/adr/011-tema-salvo-por-uma-porta-de-escrita.md` · `specs/adr/017-porta-de-apagar-tema-simetrica-a-de-escrever.md` | as portas de escrever e apagar |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/components/atomic/Feedback/SarakErrorBoundary.tsx` | a prop `onError` que já existe |

# 5. Instruções de execução

1. **B72.**
   - Teste: um tema em `customThemes` com `readOnly: true` → o painel mostra "Duplicar", não mostra "Salvar" nem "Apagar", e o
     `onSave` não é chamado com aquele id.
   - Sem `readOnly`, tudo como hoje.
2. **B63.**
   - Teste: um filho do conteúdo que lança no render → o `onError` do `SarakAppChrome` é chamado uma vez com o erro, e o resto do
     cromo continua na tela.
   - O mesmo teste para `SarakSection`.
3. **Documentação:** as notas, e `npm run guide`.
4. **Verificação do executor:**
   - `npx vitest run` com filtro nos testes novos e nos de `src/components/Layout`, `src/components/atomic/Templates` e
     `src/features/DesignEngine`;
   - `npm run verify -- --tier=quick`;
   - `npm run build`, porque o tipo público muda e o `public-types:check` só roda no build.

# 6. Critérios de aceite

- [ ] Os dois testes falhavam antes e passam depois.
- [ ] O build passa, com `public-types:check` em dia.
- [ ] As notas de migração estão escritas e o kit derivado está em dia.
- [ ] `git diff --stat` mostra só caminhos da §3.1, mais o kit derivado.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff do tipo público;
- **mutação, em cópia:**
  - ignore o `readOnly` no painel → o teste do B72 reprova;
  - não repasse o `onError` → o teste do B63 reprova.

# 8. Destino da síntese

**Destino:** `09-temas-e-presets; 05-cromo-e-slots`. Texto para transporte:

- **Spec 09** (temas salvos):

  > Um tema do importador com `readOnly: true` é tratado como os do catálogo da lib: o painel oferece "Duplicar", e não "Salvar"
  > nem "Apagar".

- **Spec 05** (props do cromo):

  > `onError(error, info)`, em `SarakAppChrome` e `SarakSection`, recebe os erros que o boundary interno contém.

---

# 9. Resumo da execução

---

# 10. Veredito
