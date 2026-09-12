---
tipo: "plan"
titulo: "Barra configurável: o administrador escolhe o que é oferecido, e se fica fixo ou no menu"
objetivo: "O administrador monta a barra no painel — cada preferência oferecida fica fixa na barra ou dentro do menu Preferências —, e o usuário final usa o que foi configurado"
dominio: "Sarak-Lib-UI-Core / Layout / Cromo · Design Engine"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "cromo", "preferencias", "design-engine", "painel"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/09-temas-e-presets]]", "[[adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]"]
depende_de: "plan-73-preferencias-do-usuario-separadas-do-tema"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md"
---

# 1. Objetivo

No painel, o administrador decide, para cada preferência do usuário, se ela é **oferecida** e **onde**:
fixa na barra, como botão direto, ou dentro do menu ⚙ "Preferências". O usuário final vê e usa exatamente
isso — nos dois cromos e no celular.

# 2. Contexto

A plan-73 cria a camada de preferências e a regra de que o tema decide o que é oferecido. Esta plan dá a
cara dela: o que aparece na barra e onde o administrador configura.

## 2.1 A forma decidida com o dono (2026-09-11) — menu, mais itens fixados

Foram três opções: um botão por preferência (a barra lota e espreme a navegação); um menu único (barra
limpa, mas o que se usa todo dia passa a custar dois cliques, e muda o que a barra já mostra); **menu mais
itens fixados** (escolhida — o frequente fica a um clique, o raro fica guardado).

Para cada uma das cinco preferências da plan-73, o administrador escolhe uma de três posições:

| Posição | O que o usuário final vê |
| --- | --- |
| **não oferecida** | nada — a barra usa o valor do tema |
| **no menu** | um item dentro do ⚙ "Preferências" |
| **fixa na barra** | um controle direto na barra — e também no menu |

**Regras que fecham o comportamento:**
- **Nenhum item no menu → o ⚙ não aparece.** Não existe botão que abre um painel vazio.
- **No celular, tudo o que é oferecido vai para o drawer**, fixado ou não — não há espaço na barra, e nada
  some ([[specs/05-cromo-e-slots]] §2.3).
- **Padrão de fábrica:** modo e navegação recolhida **fixos**; tamanho da fonte, navegação topo/lateral e
  idioma **não oferecidos**. É exatamente a barra que existe hoje
  ([[adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]), então nenhum consumidor vê a barra mudar; o ⚙
  só aparece quando o administrador liberar algo para o menu.

**Duas camadas de controle, e a ordem entre elas:** a prop `widgets` do `SarakAppChrome` é do **código**
do consumidor e é o teto — o que o desenvolvedor desligou não volta pelo painel. A configuração da barra é
do **tema** e escolhe dentro desse teto. Busca e usuário não são preferências; seguem só a
[[adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao]].

**Descartado com o dono:** as preferências dentro do menu do avatar. Desde a plan-67 o widget de usuário só
monta com `user`; sem identidade, as preferências ficariam sem lugar.

# 3. Escopo

## 3.1 Dentro
- **Não** cria o token de posição: ele nasce na plan-73, no `design`, com as três posições e o padrão de
  fábrica da §2.1. Esta plan o **lê**, o renderiza e o expõe no painel.
- `src/components/Layout/chrome/` — o widget ⚙ "Preferências", os controles fixados, a montagem nos dois
  corpos do cromo.
- `src/components/Layout/SarakAppChromeMobile.tsx` — as preferências oferecidas dentro do drawer.
- `src/core/Shell/` — **só** o necessário para o Shell respeitar a mesma configuração.
- `src/features/DesignEngine/` — a seção do painel onde o administrador escolhe, por preferência, a
  posição; com a prévia refletindo a escolha.
- Testes, `docs/migracoes.md`, kits pelos geradores, barril e catálogo.

## 3.2 Fora
- A camada de preferências em si — plan-73.
- O seletor de idioma funcional — plan-75. Aqui o item de idioma aparece conforme a configuração, com o
  seletor no estado em que a plan-75 o deixar.
- Preferências além das cinco.
- Reordenar os itens da barra por arraste, ou qualquer posição além das três da §2.1.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.2.1 widgets default · §2.3 degradação · §2.4 tokens nos dois modos |
| Spec fixa | `specs/09-temas-e-presets.md` | a seção de preferências que a plan-73 escreve |
| ADR | `adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao.md` | `widgets` como teto; *"só monta quando tem com o que funcionar"* |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | §2.4 — o menu é um overlay: foco, ESC, teclado |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-arquitetura-design` | o widget novo do cromo e a prévia do painel |

# 5. Instruções de execução

1. Ler as referências da §4, e a camada da plan-73 como ela ficou no código.
2. Ler a posição de cada preferência do token que a plan-73 criou — conferir que o padrão de fábrica dele é
   o da §2.1 antes de montar qualquer coisa.
3. Montar na barra: controles fixados como botões diretos; o ⚙ com os itens do menu; nada do ⚙ quando o
   menu está vazio. Nos dois cromos, com a mesma regra.
4. Levar tudo o que é oferecido para o drawer no celular.
5. Menu acessível como overlay: abre e fecha por teclado, ESC fecha, o foco volta ao ⚙, rótulos
   acessíveis nos controles.
6. A seção do painel: por preferência, as três posições; a prévia do painel mostra a barra que o usuário
   vai ver.
7. Testes: padrão de fábrica igual à barra de hoje; cada posição de cada preferência; menu vazio sem ⚙;
   `widgets` do código vencendo o tema; drawer; teclado.
8. Nota em `docs/migracoes.md` — o padrão de fábrica não muda a barra; o que muda é o que o administrador
   passa a poder fazer.
9. Regenerar kits; rodar `npx vitest run`, `cromo-css-real:check`, `barrel:check`, `catalog:check`,
   `guide:check`, `dev-kit:check`, `chrome-token-parity:check` e `audit:baseline --with-tsc`.

# 6. Critérios de aceite

- [ ] Com o padrão de fábrica, a barra é idêntica à de hoje — provado por teste.
- [ ] Cada preferência respeita as três posições nos dois cromos; fixada aparece na barra **e** no menu.
- [ ] Menu vazio não mostra o ⚙.
- [ ] No celular, tudo o que é oferecido está no drawer.
- [ ] O que o código desligou em `widgets` não volta pela configuração do tema.
- [ ] O menu é navegável só por teclado, ESC fecha e o foco volta ao ⚙.
- [ ] O painel configura a posição de cada preferência, e a prévia reflete a escolha.
- [ ] Kits, barril e catálogo em dia; `npx vitest run` e os gates do passo 9 verdes.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` novo — o token de posição nasce na plan-73, já sob a paridade de tokens; o
comportamento desta plan tem dono no teste do cromo.

- `git diff --stat` → só a §3.1.
- Rodar o teste do padrão de fábrica e conferir que ele compara com a barra **atual**, não com uma nova.
- Teste de mutação na regra do menu vazio e na precedência de `widgets`.
- Abrir o menu só pelo teclado, no teste de jornada.
- `npx vitest run` → verde.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md`

Na §2.2.1, uma subseção *a barra configurada pelo administrador*: as três posições, as regras (menu vazio
sem ⚙, drawer no celular, padrão de fábrica) e a ordem entre `widgets` (código, o teto) e a configuração
do tema. Sem ADR: a escolha da forma tem alternativas, mas voltar atrás é trocar uma montagem de widget, não
uma decisão estrutural cara.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
