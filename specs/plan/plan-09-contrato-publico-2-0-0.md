---
tipo: "plan"
titulo: "Limpar o contrato público — as três quebras saem juntas num único major"
dominio: "Sarak-Lib-UI-Core / Superfície pública"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "breaking-change", "major", "superficie-publica", "migracao"]
relacionados: ["[[03-superficie-publica]]", "[[03-versionamento-e-release]]", "[[15-divida-conhecida]]"]
depende_de: "plan-06"
destino_sintese: "arquitetura/03-superficie-publica.md · adr/009-* (se o SarakTabs exigir) · docs/migracoes.md"
---

> ⚠️ **A única plan que quebra contrato público de propósito.** Revalidação no ERP é **obrigatória** — ele é o
> único consumidor real. *Um major que não foi provado no consumidor real é um major que ninguém sabe se migra.*

# 1. Objetivo

`npm version major` → **`2.0.0`** com **uma** nota de migração só, e o consumidor atravessa o major **uma vez,
não três**.

# 2. Contexto

Três quebras de contrato estão paradas há tempo, e sempre pelo mesmo motivo: **cada uma, sozinha, custaria uma
migração ao consumidor.** Três migrações separadas custam ao importador três vezes o mesmo trabalho de leitura,
teste e ajuste — por isso saem juntas ou não saem.

# 3. Escopo

## 3.1 Dentro — as quatro saem no mesmo major

- **`CustomizationPanel` lazy** *(achado 3)*. Hoje sai **eager** do barril (`src/index.ts:50`) e ainda é
  importado eager pelo efeito colateral de `:119-125` — é **o painel inteiro do Design Engine no caminho
  crítico de todo consumidor**, inclusive de quem nunca o abre. Tornar lazy muda o tipo público para
  `LazyExoticComponent`: é breaking por tipo, não por comportamento.
- **Dedup do `SarakTabs`** — dois componentes, **mesmo nome**, APIs incompatíveis
  (`items`/`defaultActiveId` × `tabs`/`activeTab`/`onChange`). Exige **decidir qual API sobrevive**.
- **Os 2 ids legados do Discovery** (`mx-customization`, `personalization`), registrados por **efeito colateral
  de import**: manter ou remover — decisão do dono, pendente desde 2026-07-30.
- **Achado 27** — `chromeSlots` contando **9 para 8 regiões**: resolver o alias legado `topbarActions` junto.
  É imprecisão de derivação, e o major é a única janela barata para acertá-la.

## 3.2 Fora
- ⛔ Emitir o `npm version major` **antes** da revalidação no ERP.
- ⛔ Qualquer outra quebra de contrato não listada acima. **O major não é carona** — o que não está aqui espera
  o próximo.
- Achados de comportamento (plan-08) e do baseline (plan-07): entram antes, no `1.x`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/03-superficie-publica.md` §8 | as três dívidas que morrem aqui |
| Spec fixa | `specs/03-versionamento-e-release.md` | o ciclo `npm version` e o anel de release |
| ADR | `adr/008-releases-com-tag-e-semver-em-git` | como o consumidor resolve a faixa |
| Spec fixa | `specs/12-kit-do-consumidor.md` | o que o kit publica e precisa acompanhar |
| Plan | `plan-04-alinhamento-erp` | o ERP precisa estar alinhado para a prova valer |

# 5. Instruções de execução

1. **`CustomizationPanel` lazy** — e remover o import eager por efeito colateral (`src/index.ts:119-125`).
   Medir o boot do consumidor antes e depois: o ganho é o argumento da nota de migração.
2. **`SarakTabs`** — apresentar as duas APIs ao dono, com quem usa cada uma, e aplicar a decisão.
   ⚠️ Se **uma sobrevive e outra morre**, isso é decisão técnica com trade-off: **escreva um ADR**.
3. **Ids legados do Discovery** — decisão do dono. Se saírem, verificar quem os registra por efeito colateral.
4. **Achado 27** — resolver o alias `topbarActions` e fazer o coletor contar por **semântica**, não por tipo.
5. **Uma entrada única em `docs/migracoes.md`**, cobrindo as quatro: antes/depois e como migrar. Uma entrada,
   não quatro — é o ponto inteiro desta plan.
6. **⇒ PARE. Revalidar no ERP** *antes* do `npm version`: diagnóstico read-only → relatório → **"sim" do dono**
   → execução. O ERP tem de subir e funcionar com o `2.0.0`.
7. Só então emitir o major, pelo ciclo normal (`npm version major`).

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-09-contrato-publico-2-0-0.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/arquitetura/03-superficie-publica.md, specs/specs/03-versionamento-e-release.md,
specs/specs/12-kit-do-consumidor.md.
Skills a aplicar: padrao-typescript, test-unitario.

Você NÃO emite `npm version major` — quem publica é o usuário, e só depois da revalidação
no ERP. O SarakTabs e os ids do Discovery têm decisão do dono: pare e pergunte.
As quatro mudanças produzem UMA entrada em docs/migracoes.md, não quatro.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] `CustomizationPanel` fora do caminho crítico; o import eager por efeito colateral removido.
- [ ] Ganho de boot **medido**, antes e depois.
- [ ] `SarakTabs` com **uma** API; ADR escrito se uma sobreviveu e outra morreu.
- [ ] Decisão sobre os ids legados do Discovery registrada e aplicada.
- [ ] `chromeSlots` contando **8 para 8 regiões**.
- [ ] **Uma** entrada em `docs/migracoes.md` cobrindo as quatro, com antes/depois.
- [ ] `arquitetura/03-superficie-publica.md` §8 sem as três dívidas.
- [ ] **ERP revalidado com o `2.0.0`** — sobe, navega e builda.
- [ ] Suíte verde; `npm run gates:full` verde; DTS gerado sem erro.
- [ ] O `npm version major` **não** foi rodado pelo agente.

# 8. Como verificar

- `grep -n "CustomizationPanel" src/index.ts` → export lazy; sem import por efeito colateral
- `grep -c "SarakTabs" dist/index.d.ts` → uma definição
- Contagem de `chromeSlots` no artefato gerado → **8**
- `docs/migracoes.md` → **uma** entrada nova cobrindo as quatro
- No ERP: `pnpm install && npm run dev` → sobe com o `2.0.0`; as telas navegam
- `npx vitest run` · `npm run gates:full` → verdes

# 9. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md` (as dívidas da §8 morrem) · `adr/009-*` (se o `SarakTabs`
exigir) · `docs/migracoes.md` (a entrada única) · `specs/15-divida-conhecida.md` (achados 3 e 27 saem)

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
