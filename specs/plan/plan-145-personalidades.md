---
tipo: "plan"
titulo: "Criar Personalidades: presets de estrutura que mudam o caráter do sistema e mantêm a paleta"
objetivo: "Fazer o painel oferecer dez Personalidades que aplicam forma, fontes, densidade, barras, tabela, movimento e ícones de uma vez, mantendo a paleta escolhida, para que paleta e estrutura combinem livremente em dois cliques"
dominio: "Painel de customização / Presets"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "painel", "presets", "personalidades"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[05-cromo-e-slots]]", "[[plan-141-enriquecer-presets-do-painel]]"]
depende_de: "plan-141-enriquecer-presets-do-painel"
retida_por: ""
destino_sintese: "specs/specs/09-temas-e-presets.md + specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

O usuário escolhe uma cor e um caráter, e sai com um sistema coerente: com 10 Personalidades e 15 paletas, são 150 combinações em dois cliques.

# 2. Contexto

Aprovada pelo dono em 2026-11-01. Hoje um tema traz estrutura e cor juntas: não dá para ter "o caráter do Corporativo com a cor da minha marca". A paleta (`colorPalette`) já separou a cor; falta o lado da estrutura.

**Personalidade é um preset composto:** um dado com os tokens de estrutura, sem nenhuma cor, montado a partir dos grupos da `plan-141`. Aplicar é rascunho até "Aplicar", como todo preset. Com "Usar minha marca" ([[06-painel-de-customizacao-e-preview]] §2.1), a marca dá a cor, e a Personalidade dá a estrutura.

**As barras entram na Personalidade.** Os 19 temas nascem com as barras neutras, então é aqui que o sistema ganha o caráter de barra de [[05-cromo-e-slots]] §2.1. `sidebarTone` e `topbarTone` são papel, não cor: a Personalidade escolhe o papel, e a paleta calcula o fundo e os textos ([[09-temas-e-presets]] §4.3.4). Por isso eles não violam a regra de "nenhuma cor". O tom não vence uma cor declarada em `sidebarColor` ou `topbarColor`, nem vale sem `colorPalette`: é o comportamento certo, e a Personalidade não escreve essas cores para contorná-lo.

**Conjunto inicial:**

| Personalidade | Caráter |
|---|---|
| Corporativo | sóbrio, denso, tabelas fortes |
| Executivo | espaçoso, serifado |
| Técnico | mono, cantos retos, compacto |
| Moderno | arredondado, leve, flutuante |
| Suave | sem bordas, sombras macias |
| Editorial | foco em tipografia |
| Brutalista | bordas fortes, contraste alto |
| Vidro | translúcido, com atmosfera |
| ERP de alta densidade | máximo de dados por tela |
| Painel de operação | para telas ligadas o dia todo |

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/components/` — `personalities.ts` e testes.
- `src/features/DesignEngine/` — o grupo Personalidades, primeiro bloco da decisão Tema, e a entrada em "Usar minha marca".
- `src/core/i18n/` — nomes e descrições, nos seis idiomas.
- `docs/migracoes.md` e `sarak-ui/GUIA-FRONTEND.md` — seção curta na autoria: tema = estrutura + paleta, e a Personalidade como atalho da estrutura.

## 3.2 Fora
- Token novo. Cor em Personalidade. Temas embarcados. Marca, setor ou cliente no nome de Personalidade (zero-marca).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/09-temas-e-presets.md` §3, §4.3.3, §4.3.4 | preset parcial e ordem de composição |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2, §4 | decisões e rascunho |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` §2.1 | grupos, marca, tom e largura das barras |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` | zero-marca |
| **Skill** | `ui-criar-preset` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | autoria · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Escreva as 10 Personalidades como dado, sobre os tokens de estrutura. Cada uma cobre forma, fontes, densidade, barras, tabela, movimento e ícones. Em barras, declare ao menos `sidebarTone`, `topbarTone`, `sidebarLogoPlacement` e a orientação, e use os cinco tons no conjunto, com `neutral` só onde for o caráter. Se alguma ficar parecida com outra, troque o caráter ou proponha outra, com o motivo.
3. O grupo mostra a Personalidade com a paleta atual do rascunho, com o componente real. Escolher é rascunho; a espiada funciona como nos outros grupos. Ajustes manuais de estrutura perguntam antes de ser descartados, como na troca de paleta.
4. "Usar minha marca" ganha o campo Personalidade, opcional.
5. **Prévia para o dono:** `C:\tmp\sarak-previa-145\index.html`: as 10 × 3 paletas × 2 modos, e as 10 em tela de ERP densa, com a lateral à vista, itens de menu reais e um grupo aberto.
6. Guia e `docs/migracoes.md`.
7. Depois de `npm run build`, rode os specs do painel e `troca-de-tema`. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
8. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] 10 Personalidades, distintas entre si: ao menos 8 tokens de estrutura com efeito visível diferem — teste.
- [ ] Nenhuma cor em Personalidade; trocar de Personalidade não muda `colorPalette` — teste.
- [ ] Toda Personalidade declara os tons das duas barras, sem `sidebarColor` nem `topbarColor`, e os cinco tons aparecem no conjunto — teste.
- [ ] Nome, avatar, idioma, engrenagem e sair legíveis nas 10 Personalidades, nos dois modos — navegador.
- [ ] Pares de `PAIRS` passando nas 10 × 15 paletas × 2 modos — teste.
- [ ] Nomes nos seis idiomas — teste.
- [ ] Ajuste manual pergunta antes de ser descartado; só o botão explícito perde — teste.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/core/Design src/features/DesignEngine src/core/i18n` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A prévia aberta; o veredito só fecha com a aprovação do dono.

# 8. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` + `specs/specs/06-painel-de-customizacao-e-preview.md`.

- 09 §3 e §5: a Personalidade é um preset composto de estrutura, sem cor.
- 06 §2: o grupo na decisão Tema.

---

# 9. Resumo da execução

---

# 10. Veredito
