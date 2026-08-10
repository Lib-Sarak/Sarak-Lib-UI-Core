---
tipo: "plan"
titulo: "Aplicação de temas — recriar os 18 shippados com contraste no critério, e ligar o gate da R31"
dominio: "Sarak-Lib-UI-Core / Design / Temas"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "r31", "temas", "acessibilidade", "wcag"]
relacionados: ["[[00-regras-e-invariantes]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[15-divida-conhecida]]"]
depende_de: "plan-23"
objetivo: "Recriar os temas shippados com contraste AA no criterio e ligar o gate da R31"
destino_sintese: "specs/specs/09-temas-e-presets.md · specs/specs/00-regras-e-invariantes.md · specs/specs/01-gates-e-baseline.md"
---

> 🎯 **É a única pendência que o USUÁRIO FINAL enxerga.** Todo o resto desta campanha foi dívida interna:
> gate, nome de variável, endereço de arquivo. Isto é texto ilegível na tela de quem usa o produto.

# 1. Objetivo

**Os temas shippados passam em WCAG AA**, e a **R31 sai de ⏳ para ✅** — deixa de ser a única regra sem gate.

# 2. Contexto

## 2.1 A medição, e por que ela não é discutível

A `plan-12` mediu e o revisor **reproduziu de forma independente**: **12 dos 18 temas** falham em pelo menos
um dos 4 pares canônicos de contraste.

| Fato | Medição |
|---|---|
| Temas que falham ≥1 par canônico | **12 de 18** |
| Falhas em **texto primário ou secundário** (não só tom apagado) | **4** |
| Pior caso | `neo-brutalism`: `#000000` sobre `#050505` = **1.03:1** |
| Um dos reprovados é referência | `minimalist-airy`, um dos dois `SARAK_REFERENCE_THEMES` |

> 🔴 **O `minimalist-airy` é o que dói.** A [[09-temas-e-presets]] §4.1 manda o consumidor **clonar** um dos
> `SARAK_REFERENCE_THEMES` como ponto de partida. Ou seja: a lib entrega um molde com defeito de contraste e
> pede para copiá-lo.

## 2.2 Não é ajuste de régua — isso foi testado

A primeira leitura enquadrou o problema como escolha de limiar: *"talvez `textColorMuted` deva ser cobrado a
3:1 em vez de 4,5:1"*. O revisor mediu o contrafactual: **relaxar `textColorMuted` para 3:1 resgata apenas 1
dos 12**.

As outras 11 falham **abaixo até de 3:1**. **São 12 temas com defeito de contraste real**, não uma régua
apertada demais.

## 2.3 A decisão do dono — recriar, não emendar *(2026-08-09)*

> *"Os temas atuais são apenas temas criados anteriormente, podemos recriá-los sem problemas, inclusive
> criaremos mais temas em etapa posterior."* — e, depois: *"essa biblioteca possui uma granularidade imensa
> para criação de layout; a maior funcionalidade é a criação de temas/layouts personalizados, os temas atuais
> foram criados anteriormente, muitos são antigos."*

**Recriar sai mais barato que emendar 12**, e por um motivo estrutural: emendar 12 paletas uma a uma produz 12
decisões isoladas de cor, sem critério comum. Recriar com o contraste **no critério de nascimento** produz um
conjunto coerente — e o gate nasce verde em vez de nascer vermelho.

## 2.4 O script de medição — resgatar antes de começar

A `plan-12` mediu com um script que viveu só no `%TEMP%` da sessão. O revisor o **reproduziu e preservou como
anexo da `plan-12`**. **Ele é o ponto de partida do gate**, não trabalho novo — mas precisa sair de anexo de
plan e virar código versionado.

# 3. Escopo

## 3.1 Dentro

1. **Trazer o script de contraste para `gates/`**, versionado, com teste próprio.
2. **⇒ PARADA: a fronteira da R31**, que a `plan-12` deixou aberta e ninguém fechou (§3.3).
3. **Recriar os temas** com o contraste no critério, e o `minimalist-airy` **primeiro** — é o molde.
4. **Ligar o gate da R31**, nascendo **verde**.
5. R31 sai de ⏳ para ✅ no quadro de [[00-regras-e-invariantes]].

## 3.2 Fora

- **Criar temas novos.** O dono falou em ampliar o catálogo depois; ampliar **não** é desta plan.
- Mudar a API de tema, o schema ou os tokens. Aqui muda **valor de cor**, não contrato.
- Os presets de componente — só os 18 temas.

## 3.3 ⇒ AS TRÊS PERGUNTAS DE FRONTEIRA — do dono, e vêm ANTES do código

A `plan-12` parou aqui e ninguém retomou. **O gate não pode nascer sem estas três respostas**, e um gate que
nasce com a fronteira errada é pior que gate nenhum, porque ninguém desconfia dele.

| # | Pergunta | Por que importa |
|---|---|---|
| 1 | **Quais pares** são cobrados? Os 4 canônicos, ou todos que os componentes realmente produzem? | 4 pares é o que foi medido; o real é maior. Cobrar só 4 dá selo com furo |
| 2 | **`textColorMuted` a 4,5:1 ou 3:1?** | WCAG permite 3:1 para texto grande. Medido: relaxar resgata **1** dos 12 — quase não muda o trabalho, mas muda o que a lib **promete** |
| 3 | **Os 19 pares em `rgba()`**, pulados na medição | contraste com alfa depende do que está atrás; ou se resolve compondo sobre o fundo, ou se declara fora |

**Recomendação do revisor:** (1) começar pelos **4 canônicos**, com o vão declarado no gate (R18) e a
ampliação como item futuro — cobrir tudo de uma vez transforma esta plan numa campanha; (2) **manter 4,5:1**,
porque resgata só 1 e a promessa "AA" sem asterisco é mais fácil de sustentar que "AA exceto tom apagado";
(3) **declarar os `rgba()` fora do gate** nesta rodada, nomeando quantos são — compor sobre fundo variável é
problema próprio.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Spec fixa | [[00-regras-e-invariantes]] → **R31** | o enunciado, hoje ⏳ |
| Spec fixa | [[09-temas-e-presets]] §4.1 | por que o `minimalist-airy` é o mais grave |
| Spec fixa | [[10-seguranca-e-acessibilidade]] | o contrato de acessibilidade da lib |
| Anexo | `plan-12` — o script de contraste preservado | ponto de partida do gate |
| Suíte | `shippedThemesConsoleClean.test.ts` | o molde de "teste que varre os 18 temas" |
| **Skill** | `ui-criar-tema` · `test-unitario` | criar tema tem fluxo próprio nesta base |

# 5. Instruções de execução

1. **Script primeiro, tema depois.** Sem a medição versionada, "recriei o tema" não é verificável.
2. **⇒ PARE no passo 2** — as três perguntas da §3.3 são do dono.
3. **`minimalist-airy` primeiro.** É `SARAK_REFERENCE_THEMES`, e o consumidor o clona. Cada dia que ele passa
   reprovado é um consumidor herdando o defeito.
4. **Um tema por vez, com a medição antes e depois** de cada um. 12 temas num diff é irrevisável.
5. **O gate nasce por último e nasce VERDE.** Se nascer vermelho, algum tema não fechou — e aí o número vai
   declarado, não maquiado.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-24-aplicacao-de-temas.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md (R31), specs/specs/09-temas-e-presets.md,
specs/specs/10-seguranca-e-acessibilidade.md, o anexo com o script de contraste da
plan-12, e a §2 desta plan.
Skills: ui-criar-tema, test-unitario, padrao-typescript, padrao-escrita.

⚠️ É A ÚNICA PENDÊNCIA QUE O USUÁRIO FINAL ENXERGA. Todo o resto da campanha foi
dívida interna; isto é texto ilegível na tela de quem usa o produto.

PASSO 1 — trazer o script de contraste da plan-12 para gates/, versionado e com
teste próprio. Ele mediu 12/18 e foi reproduzido pelo revisor; NÃO reescreva do
zero, e NÃO comece pelos temas: sem medição versionada, "recriei o tema" não é
verificável.

⇒ PARADA OBRIGATÓRIA no passo 2 — as TRÊS perguntas da §3.3 são do dono:
   (1) quais pares o gate cobra; (2) textColorMuted a 4,5:1 ou 3:1;
   (3) o que fazer com os 19 pares em rgba().
   O revisor recomenda: 4 canônicos com o vão declarado · manter 4,5:1 ·
   declarar os rgba() fora nesta rodada, nomeando quantos são.
   NÃO comece a recriar tema antes destas respostas — a fronteira decide o alvo.

PASSO 3 — recriar os temas, UM POR VEZ, com a medição colada antes e depois de
cada um. 12 temas num diff é irrevisável.
   minimalist-airy PRIMEIRO: é SARAK_REFERENCE_THEMES, e a 09-temas-e-presets §4.1
   manda o consumidor CLONÁ-LO. Cada dia reprovado é um consumidor herdando o defeito.

PASSO 4 — ligar o gate da R31. Ele nasce VERDE. Se nascer vermelho, algum tema não
fechou: declare o número, não maquie o limiar.

LINHAS VERMELHAS:
  · Você NÃO cria tema novo. Ampliar o catálogo é decisão do dono, outra etapa.
  · Você NÃO muda API de tema, schema nem token. Aqui muda VALOR DE COR.
  · Você NÃO afrouxa o limiar para fechar tema. Medido pelo revisor: relaxar
    textColorMuted para 3:1 resgata só 1 dos 12 — não é ajuste de régua, são 12
    temas com defeito real.
  · Você NÃO edita specs/specs/, specs/adr/, specs/arquitetura/ nem 00-indice.md.

Os três espelhos: gates/baselines/ · sarak-dev/ (npm run dev-kit) · sarak-ui/
(npm run guide, se a contagem de temas mudar — não deve).

VERIFICAÇÕES, com a saída colada:
  npm run audit           (ANTES e DEPOIS)
  npx vitest run          (INTEIRA — shippedThemesConsoleClean é a rede)
  npm run gate-limits:check · npm run dev-kit:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] O script de contraste vive em `gates/`, **versionado e com teste próprio** — não em anexo de plan.
- [ ] As **três perguntas** da §3.3 foram respondidas pelo dono **antes** de qualquer tema mudar, e as
      respostas estão escritas na plan.
- [ ] **`minimalist-airy` foi o primeiro**, e a medição antes/depois dele está colada.
- [ ] Cada tema tem medição **antes e depois**, um por vez.
- [ ] O gate da R31 existe, **nasce verde**, e declara o que **não** vê (R18) — incluindo os `rgba()`.
- [ ] **Nenhum limiar foi afrouxado** para fechar tema.
- [ ] R31 sai de ⏳ para ✅ no quadro — a anotação é do revisor, na síntese.
- [ ] `npx vitest run` verde; baseline e espelhos regravados junto.

# 8. Como verificar

```bash
node gates/scripts/audit/auditor_contraste.mjs     # nome a definir; nasce verde
npm run audit
npx vitest run
npm run gate-limits:check
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
```

# 9. Destino da síntese

`specs/specs/09-temas-e-presets.md` (os temas recriados e o critério de nascimento) ·
`specs/specs/00-regras-e-invariantes.md` (R31 ⏳ → ✅) ·
`specs/specs/01-gates-e-baseline.md` (o gate novo e o baseline).

# 10. Resumo da execução

*(a preencher pelo executor)*

# 11. Veredito

*(a preencher pelo revisor)*
