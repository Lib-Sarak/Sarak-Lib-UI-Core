---
tipo: "plan"
titulo: "Atualizar as paletas prontas pela planilha do dono"
objetivo: "Fazer o catálogo de paletas prontas ser o da planilha do dono, com nome nos seis idiomas, sem quebrar o tema salvo de nenhum importador que use uma paleta que mudou ou saiu"
dominio: "Design Engine / Paleta calculada"
status: "⛔ Bloqueada"
prioridade: "Média"
tags: ["plan", "paletas", "catalogo"]
relacionados: ["[[09-temas-e-presets]]", "[[024-paleta-calculada-separada-do-tema]]", "[[10-seguranca-e-acessibilidade]]", "[[06-painel-de-customizacao-e-preview]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md"
---

# 1. Objetivo

A galeria de paletas do painel mostra exatamente as paletas da planilha do dono, cada uma com nome nos seis idiomas, e um tema salvo
com uma paleta que saiu continua abrindo com cor.

# 2. Contexto

**Pedido do dono (2026-11-10):** ele montou uma planilha com as paletas atuais e criou paletas novas; envia a planilha ao final.
**Bloqueada até a planilha chegar** — o caminho entra no prompt de execução, e a plan vai a `🔴` nesse momento.

**O que existe hoje.** 19 presets em `src/core/Design/palette/presets.ts` (`SARAK_PALETTE_PRESETS`), cada um só a ENTRADA do cálculo
(`{ type, base, secondary, accent }`); a escala, os papéis e o contraste são do motor (ADR-024). O nome de cada um mora em
`src/core/i18n/catalogEntries.palette.ts`, nos seis idiomas, pela chave do mapa de nomes no fim de `presets.ts`. O comentário do arquivo
fixa regras: ids proibidos (`default`, `matrix`, `neon`, `slate`, `sunset`), as três sementes declaradas, o desvio máximo de 45° do
ângulo do tipo (exceções nomeadas no teste de harmonia) e a faixa de luminosidade da base.

**Por que cuidado com id.** O id da paleta fica gravado no tema do importador (`colorPalette`). Paleta que some deixaria esse tema sem
cor calculada (09 §4.3.4: valor inválido é recusado com aviso e o tema compõe sem paleta).

**Temas que usam paleta.** Temas embarcados declaram `colorPalette` (o `sarak-sovereign` usa `ciano-violeta`); os sete resgatados
(09 §5) também declaram. Paleta usada por tema embarcado não sai sem o dono decidir.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/palette/presets.ts` (o catálogo e o mapa de nomes).
- `src/core/i18n/catalogEntries.palette.ts` (os nomes nos seis idiomas).
- Os testes de paleta em `src/core/Design/palette/__tests__/` (harmonia, contraste, ids) e o teste de paridade do catálogo de textos.
- `docs/migracoes.md`; os gerados (`npm run guide`, `npm run dev-kit`).

## 3.2 Fora
- O motor de paleta (`resolve.ts`, `scale.ts`, `seeds.ts`, `role-map.ts`, `contrast*.ts`).
- Os temas: nenhum muda de `colorPalette` nesta plan. Se a planilha remover uma paleta que um tema usa, pare e relate.
- A galeria do painel (`PaletteGallery.tsx`): a espiada é da `plan-160`; aqui só muda o dado.
- Qualquer arquivo de importador. Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/09-temas-e-presets.md` §4.3.4, §6.5 | paleta calculada, o papel de cada semente, os pares de contraste |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` §2.4 | paletas no painel (filtro por tipo, criar paleta) |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3.6 | o catálogo de textos nos seis idiomas e o teste de paridade |
| Spec fixa | `specs/03-versionamento-e-release.md` | o que é quebra |
| ADR | `adr/024-paleta-calculada-separada-do-tema.md` | paleta separada do tema |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` | escrita e testes |
| Código | `src/core/Design/palette/presets.ts` (o comentário do topo é regra) · `src/core/Design/palette/types.ts` · `src/core/i18n/catalogEntries.palette.ts` | ler antes de editar |
| Dado | a planilha do dono (caminho no prompt de execução) | a fonte das paletas |

# 5. Instruções de execução

1. Leia a planilha e liste, no resumo, cada linha → id, tipo, base, secundária, acento e nome. Linha que não dá para transcrever sem
   adivinhar (tipo ausente, cor fora de hex) vai como pergunta ao dono; não invente.
2. Compare com os 19 atuais: mantidas (mesmo id), alteradas (mesmo id, sementes novas), novas e removidas. Paleta removida que um
   tema embarcado usa: pare e relate.
3. Paleta removida: o id continua aceito e resolve para a paleta mais próxima da planilha (mesmo tipo e base mais parecida), sem aviso
   ao importador; a escolha de cada apelido vai no resumo. Teste: um design gravado com cada id removido abre com a paleta do apelido.
4. Nenhum id novo entre os proibidos do comentário de `presets.ts`, nem igual a um apelido.
5. Nomes nos seis idiomas no catálogo de textos; a tradução é do executor e vai no resumo para o dono conferir.
6. Testes de harmonia e contraste verdes; semente fora dos 45° só como exceção nomeada no teste, com o motivo.
7. `docs/migracoes.md`: paletas novas, alteradas e as que viraram apelido.

# 6. Critérios de aceite

- [ ] O catálogo de paletas é o da planilha (contagem e ids conferidos contra ela).
- [ ] Nomes nos seis idiomas; paridade verde.
- [ ] Ids removidos resolvem para o apelido, com teste; nenhum tema embarcado ficou sem paleta.
- [ ] Harmonia e contraste verdes; exceções nomeadas.
- [ ] `docs/migracoes.md` atualizado.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1.
- [ ] Prévia para o dono em `C:\tmp\sarak-previa-163\index.html` (o lote que grava as paletas), com capturas reais; o lote só fecha com o ok do dono nela.

# 7. Como verificar (uso do revisor)

**Gate:** teste — os testes de paleta existentes (harmonia, contraste) e o teste novo dos ids removidos; nenhuma regra de gate nova.

- Três linhas da planilha conferidas contra `presets.ts`; a contagem total.
- O teste dos apelidos lido e rodado.
- `npm run verify -- --tier=full`.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md`

- §4.3.4: a regra de que id de paleta removido vira apelido da mais próxima, sem aviso. A lista de paletas não vai para a spec (é dado
  do catálogo).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Nota do revisor — 2026-11-12 — prévia HTML para o dono aprovar

A pedido do dono, como nas campanhas anteriores: ao fim de o lote que grava as paletas, o executor gera `C:\tmp\sarak-previa-163\index.html`
com capturas reais do `dist/` ou do código-fonte (como as prévias da 136 a 149), mostrando cada paleta nos dois modos, como a prévia da plan-143. O resumo do lote dá o caminho.
O revisor confere a prévia antes do veredito, e o lote só fecha com o ok do dono nela (critério acrescentado à §6). A projeção da
campanha inteira, feita à mão, está em `C:\tmp\sarak-previa-campanha-9\index.html`: é referência de intenção, não de pixel.
