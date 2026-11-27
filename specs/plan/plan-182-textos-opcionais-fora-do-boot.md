---
tipo: "plan"
titulo: "Textos das peças opcionais fora do boot"
objetivo: "Fazer os catálogos de texto das peças opcionais carregarem junto com a peça, devolvendo ao boot do consumidor os cerca de 6,6 KB gzip que ele ganhou na rc.5, e fazer o boot:measure acusar crescimento absoluto"
dominio: "Bundle / Idiomas"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "bundle", "boot", "i18n", "lazy"]
relacionados: ["[[12-kit-do-consumidor]]", "[[01-gates-e-baseline]]"]
depende_de: ""
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
- **Base:** o catálogo já tem os textos da 180 (commit `fa6cb5e1`). A medida de antes é a do `HEAD` atual, não a da rc.5.
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
- **A `plan-181` e a `plan-184` correm em paralelo, no mesmo worktree.** Fique fora de `src/core/Provider/`, do painel de temas e
  do `SarakAppChrome`. Siga a trava de build da §5, passo 6.

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
6. **Trava de build:** cada `npm run build` com o `boot:measure` que o segue (passos 1, 4 e 5) roda com a trava
   `C:\tmp\sarak-build.lock`, a mesma das plans paralelas.
   - Pegue a trava com `node -e "require('fs').writeFileSync('C:/tmp/sarak-build.lock','plan-182',{flag:'wx'})"`. Se o comando
     falhar, outra plan está com ela: espere e tente de novo.
   - Solte com `node -e "require('fs').rmSync('C:/tmp/sarak-build.lock')"` assim que a medida terminar, inclusive se falhar.
   - Nunca apague a trava de outra plan. Se ela ficar parada mais de 30 minutos sem build rodando, relate.
   - O build lê o worktree inteiro, inclusive o que a 181 e a 184 ainda estão escrevendo. Registre no resumo, junto de cada
     medida, o `git status --short src` daquele momento.

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
