---
tipo: "plan"
titulo: "Textos das peças opcionais fora do boot"
objetivo: "Fazer os catálogos de texto das peças opcionais carregarem junto com a peça, devolvendo ao boot do consumidor os cerca de 6,6 KB gzip que ele ganhou na rc.5, e fazer o boot:measure acusar crescimento absoluto"
dominio: "Bundle / Idiomas"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "bundle", "boot", "i18n", "lazy"]
relacionados: ["[[12-kit-do-consumidor]]", "[[01-gates-e-baseline]]"]
depende_de: "plan-180-textos-traduzidos-e-buscas-que-acham"
retida_por: ""
destino_sintese: "01-gates-e-baseline"
---

# 1. Objetivo

O boot do consumidor volta a 388 KB gzip ou menos, sem nenhuma peça perder texto. O `boot:measure` passa a reprovar quando o boot
cresce além de um teto absoluto.

# 2. Contexto

- **O que cresceu:** o boot subiu de 388,1 para 394,7 KB gzip na rc.5.
- **De onde veio o peso** (medido): quase tudo vem de quatro catálogos de texto, carregados no boot mesmo sem a peça em uso:
  - `catalogEntries.access`, `advanced`, `entries` e `system`;
  - somam cerca de 9 KB gzip na fonte;
  - são importados estaticamente por `src/core/i18n/catalog.ts:12-20`.
- **Por que o gate não acusou:** o teto do `boot:measure` (`scripts/measure-consumer-boot.mjs`) é relativo.
- **Dependência:** esta plan depende da `plan-180`, que mexe no mesmo catálogo.
- **Armadilhas conhecidas desta área:**
  - o tsup pode juntar um módulo lazy de volta no boot;
  - o barril público pode anular a fronteira lazy;
  - incluir a lib no `manualChunks` funde os chunks lazy de volta.

  A prova é sempre a medida do consumidor, nunca a leitura do código.

# 3. Escopo

## 3.1 Dentro
- `src/core/i18n/catalog.ts` e os quatro catálogos: carga sob demanda, disparada pela peça que os usa.
- As peças que leem esses textos: esperam a carga antes do primeiro texto, sem piscar a chave crua.
- `scripts/measure-consumer-boot.mjs`: um teto absoluto em KB gzip, além do relativo.
- Testes de unidade da carga e do texto pronto no primeiro quadro da peça.

## 3.2 Fora
- Os demais catálogos, que são do boot.
- A configuração do bundler, salvo o mínimo comprovado pela medida.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | o `boot:measure` e os tetos |
| Spec fixa | `specs/specs/12-kit-do-consumidor.md` | o consumidor medido |
| ADR | `specs/adr/022-tema-sob-demanda.md` | o molde de carga sob demanda que já funciona |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/core/i18n/catalog.ts` · `scripts/measure-consumer-boot.mjs` | a carga e a medida |

# 5. Instruções de execução

1. **Meça antes** com `npm run build` e `npm run boot:measure`, e registre o boot e o tamanho de cada catálogo.
2. **Carga sob demanda** dos quatro catálogos, seguindo o molde do tema sob demanda.
3. **Teste:** a peça mostra o texto traduzido no primeiro quadro em que aparece, e nunca a chave crua.
4. **Teto absoluto** no `boot:measure`: o valor medido depois do passo 2, mais 1%. Prova: com um catálogo de volta ao import
   estático, a medida reprova.
5. **Verificação do executor:**
   - `npx vitest run src/core/i18n`, mais os testes das peças tocadas;
   - `npm run verify -- --tier=quick`;
   - `npm run build`;
   - `npm run boot:measure`.

# 6. Critérios de aceite

- [ ] Boot medido no consumidor de 388 KB gzip ou menos; o resumo traz o antes e o depois.
- [ ] Nenhuma peça mostra chave crua (teste).
- [ ] O `boot:measure` reprova com um catálogo de volta ao import estático; a saída está no resumo.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** teto absoluto do `boot:measure` (regra única desta plan).

O revisor não repete a medida do executor. Ele confere:
- o diff;
- **mutação, em cópia:** volte um catálogo ao import estático → o `boot:measure` reprova.

# 8. Destino da síntese

**Destino:** `01-gates-e-baseline`. Texto para transporte, na entrada do `boot:measure`:

> Além do teto relativo, o boot tem um teto absoluto em KB gzip, medido no consumidor. Subir o teto é decisão do dono, registrada no
> commit.

---

# 9. Resumo da execução

---

# 10. Veredito
