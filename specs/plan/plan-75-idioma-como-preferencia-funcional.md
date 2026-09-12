---
tipo: "plan"
titulo: "Idioma como preferência funcional, com a tradução da aplicação entregue ao host"
objetivo: "Escolher um idioma na barra passa a fazer alguma coisa: a escolha fica guardada como preferência do usuário e chega ao host, que traduz as próprias telas"
dominio: "Sarak-Lib-UI-Core / Componentes atômicos / Navegação · Provider"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "idioma", "preferencias", "fronteira-host"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/10-seguranca-e-acessibilidade]]", "[[specs/09-temas-e-presets]]", "[[adr/016-preferencias-do-usuario-separadas-do-tema]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md · specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

O seletor de idioma lista os idiomas que o tema habilita, grava a escolha como preferência do usuário e a
entrega ao host por um caminho documentado. A tradução das telas da aplicação é do host; a lib entrega a
escolha, não o texto traduzido.

# 2. Contexto

Medido: **a lib não tem motor de tradução**, e o seletor de idioma, sem um componente injetado pelo host, é
um controle que não faz nada.

- `ShellLanguageSelector.tsx:33,64-65` — a escolha vai para um `useState` local, e morre ali. Nenhum
  componente, nenhum host, nenhuma persistência recebe o idioma escolhido.
- O painel já grava `language` e `enabledLanguages` no tema (`LanguageTab.tsx:28-29`) — o dado existe; o
  que falta é ele chegar a algum lugar.
- O seletor tem um caminho de substituição pelo host (`getLocalComponent` e um objeto global de
  sobrescrita, `:26-30`). Continua existindo; esta plan não o remove.

É o mesmo padrão que motivou a campanha: funcionalidade que existe e não está ligada. A
[[adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao]] fixou que um controle só monta quando tem com o que
funcionar — hoje, o seletor não tem.

## 2.1 O escopo decidido com o dono (2026-09-11)

- **Dentro:** o seletor funcional, o idioma como preferência ([[specs/09-temas-e-presets]] §4.7), e o caminho para o host
  saber o idioma e trocar a própria tradução — ler pelo hook de preferências e ser avisado da troca.
- **Fora:** traduzir os textos **da própria lib** (hoje há textos fixos em inglês e em português
  misturados — *"No results"*, *"Available Tools"*, *"Logout"*). É outro trabalho, com outro tamanho: vai
  para o [[00-backlog]] na síntese desta plan.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Navigation/ShellLanguageSelector.tsx` — lista os idiomas habilitados no tema e
  grava a preferência; o estado local some.
- `src/core/Provider/` — o aviso de troca de idioma para o host, pela mesma porta (`options.preferences`) e o mesmo hook (`useSarakPreferences`) da camada de preferências.
- `src/features/DesignEngine/Panels/LanguageTab.tsx` — **só** se for preciso para `enabledLanguages`
  alimentar o seletor.
- Testes, `docs/migracoes.md` e kits pelos geradores.

## 3.2 Fora
- Tradução dos textos da lib.
- Tradução das telas do host — é dele.
- A posição do idioma na barra — é da plan-74.
- Remover o caminho de substituição do seletor pelo host.
- Detecção automática do idioma do navegador.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | §3 — a fronteira do que o host provê; a tradução entra aqui |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.2.1 — o seletor é um dos controles do cromo |
| Spec fixa | `specs/09-temas-e-presets.md` | §4.7 — a camada de preferências |
| ADR | `adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao.md` | *"só monta quando tem com o que funcionar"* |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |

# 5. Instruções de execução

1. Ler as referências da §4 e a camada de preferências como ela está no código.
2. Seletor: lista `enabledLanguages` do tema; escolher grava a preferência de idioma; o valor mostrado vem
   da preferência, e na falta dela, do tema.
3. Com **um** idioma habilitado ou nenhum, o seletor não monta — não há o que escolher.
4. Host: ler o idioma pelo hook de preferências e ser avisado da troca, sem polling. Documentar o uso com um
   exemplo curto de integração com uma biblioteca de i18n do host.
5. Testes: a escolha grava a preferência e não o tema; o aviso chega ao host; um idioma só não monta o
   seletor; o caminho de substituição pelo host continua funcionando.
6. Nota em `docs/migracoes.md`.
7. Regenerar kits; rodar `npx vitest run`, `barrel:check`, `catalog:check`, `public-types:check`,
   `guide:check`, `dev-kit:check` e `audit:baseline --with-tsc`.

# 6. Critérios de aceite

- [ ] Escolher um idioma grava a preferência do usuário e **não** o tema — teste.
- [ ] O seletor lista só os idiomas habilitados no tema; com um ou nenhum, não monta.
- [ ] O host é avisado da troca e lê o idioma pelo hook — teste e exemplo documentado.
- [ ] O caminho de substituição do seletor pelo host continua funcionando — teste.
- [ ] Nenhum estado local de idioma sobra no seletor.
- [ ] `npx vitest run` e os gates do passo 7 verdes.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — comportamento de um componente, com dono no teste dele.

- `git diff --stat` → só a §3.1.
- Teste de mutação na regra de um idioma só.
- Ler o exemplo de integração do host: ele funciona sem a lib saber qual biblioteca de i18n o host usa.
- `npx vitest run` → verde.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md` · `specs/10-seguranca-e-acessibilidade.md`

- `specs/05` §2.2.1 — o seletor de idioma como controle que só monta com mais de um idioma habilitado.
- `specs/10` §3 — uma subseção *tradução*: a lib entrega a escolha do idioma e o aviso de troca; traduzir as
  telas é do host.
- [[00-backlog]] — um item para a tradução dos textos da própria lib.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
