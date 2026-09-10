---
tipo: "plan"
titulo: "Alinhar as duas barreiras e devolver ao predicado de mídia os valores legítimos que ele recusa"
objetivo: "Um valor de mídia legítimo deixa de ser recusado, e as duas barreiras de validação passam a aceitar e recusar exatamente o mesmo conjunto"
dominio: "Sarak-Lib-UI-Core / Provider / Fronteira de validação"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "validacao", "seguranca", "midia", "regressao"]
relacionados: ["[[specs/10-seguranca-e-acessibilidade]]", "[[specs/09-temas-e-presets]]", "[[specs/05-cromo-e-slots]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

O predicado dos tokens `image`/`file` volta a aceitar os valores que um consumidor legitimamente usa — a
começar pela string vazia, que é o próprio "sem mídia" — e as duas barreiras de validação passam a aceitar
e recusar **o mesmo conjunto**, provado por uma tabela única exercitada nas duas.

# 2. Contexto

O predicado `isSafeMediaString` (`src/core/Provider/utils/cssSafety.ts`) aceita **só** `https://` e mídia
embutida `data:` bem-formada. Medido contra valores reais:

```
""                        -> RECUSADO      <- o defaultValue E o legacyValue do token
"none"                    -> RECUSADO
"/local/bg.png"           -> RECUSADO      <- ativo do próprio consumidor
"http://x.com/a.png"      -> RECUSADO      <- localhost / intranet
"https://x.com/a.png"     -> ACEITO
'url("https://x.com/a.png")' -> ACEITO
```

**A string vazia é o caso mais grave**, porque é o estado padrão. `globalBackgroundImageUrl` tem
`defaultValue: ''` e `legacyValue: ''` — este último com o comentário no schema *"Garante que temas antigos
apaguem a mídia de fundo"* —, e o preset `bg-none` ("Nenhuma (Sem Mídia)") também é `''`.

**O sintoma observado no consumidor real:** centenas de
`[Sarak:Design] Valor inseguro para "globalBackgroundImageUrl" — descartado.` no console, em boot sem mídia
— ou seja, na configuração default de todo consumidor. O efeito funcional é inócuo (o fallback é
`token.defaultValue`, que é `''`, o mesmo valor), mas é um **aviso de segurança falso, em escala, no
caminho que esta base usa para diagnóstico honesto**. Aviso falso treina a ignorar aviso.

**Por que nenhum gate pegou, e é isto que a plan tem de fechar.** As duas barreiras não são simétricas
antes de chamarem o predicado:

| Barreira | O que faz com `''` |
| --- | --- |
| `validateDesign` (`validation.ts`) | **pula** — há um curto-circuito `if (value === null \|\| value === undefined \|\| value === '') return;` antes de `coerceTokenValue` |
| `useDesignVariables` | **não pula** — converte com `String(value)` e chama o predicado, que recusa |

Como `tokenContractParity.test.ts` e `shippedThemesConsoleClean.test.ts` exercitam a **primeira**, o `''`
nunca chega ao predicado neles, e ficaram verdes. O critério de aceite que deveria ter pego isto —
*"a segunda barreira aceita e recusa exatamente o mesmo conjunto que a primeira"* — foi dado por atendido
com o argumento *"as duas chamam o mesmo predicado"*. **Chamar o mesmo predicado não é aceitar o mesmo
conjunto**: o que difere é o que acontece antes da chamada. Essa é a lição desta plan, e é o motivo de a
prova aqui ser uma **tabela única rodada nas duas barreiras**, e não a inspeção de que a função é a mesma.

**O que NÃO é regressão:** nenhum valor shippado quebrou. Os três temas com mídia usam `https://` ou
`url("https://…")`, e os dois formatos são aceitos.

**A fronteira que continua valendo:** o `CSS_BREAKOUT_PATTERN` protege a interpolação de `responsiveCSS`
dentro de uma tag `<style>`. Nada nesta plan pode reabrir esse vetor — o alvo é o conjunto **legítimo** que
ficou de fora, não o afrouxamento da trava.

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/utils/cssSafety.ts` — o conjunto que `isSafeMediaString` aceita.
- `src/core/Design/hooks/useDesignVariables.ts` — a simetria com a primeira barreira.
- `src/core/Provider/utils/validation.ts` — só se a simetria exigir mexer no curto-circuito de entrada;
  avaliar, e não tocar se não for necessário.
- Os testes dos três, mais a **tabela única** de valores compartilhada entre as duas barreiras.

## 3.2 Fora
- `CSS_BREAKOUT_PATTERN` e o predicado geral dos demais tipos de token — cor, texto, fonte, `select` e as
  chaves extras não mudam.
- `COLOR_PATTERN` — `url()` em valor de cor continua barrado.
- `MediaUploaderControl`, `SarakBackgroundRenderer` e o cromo — nenhum deles é a causa.
- Os valores shippados dos temas — nenhum precisa mudar.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | §2.1 (c) e (c-bis) — a trava geral e o predicado de mídia; é o texto que esta plan corrige |
| Spec fixa | `specs/09-temas-e-presets.md` | §4.2 — os três comportamentos de `validateDesign` e a degradação campo a campo |
| Spec fixa | `specs/05-cromo-e-slots.md` | §3.1 — o cromo depende deste token para decidir o fundo |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `cyber-codigo` | mexe no conjunto aceito por uma barreira de injeção; cada valor que voltar a ser aceito precisa de análise escrita, não de conveniência |
| Código | `src/core/Provider/utils/cssSafety.ts` | o predicado inteiro |
| Código | `src/core/Provider/utils/validation.ts` | o curto-circuito de entrada de `validateDesign` — a origem da assimetria |
| Código | `src/core/Design/hooks/useDesignVariables.ts` | a segunda barreira e o ponto que emite o aviso |
| Código | `src/core/Design/schema/media.ts` | `defaultValue` e `legacyValue` do token, com o motivo escrito |

# 5. Instruções de execução

1. Ler as referências da §4 e reproduzir o sintoma: montar o Provider sem mídia e observar o aviso.
2. Levantar o **conjunto legítimo** que o predicado tem de aceitar, e escrever a justificativa de cada
   entrada. No mínimo: string vazia, `https://`, mídia embutida bem-formada, e o invólucro `url(...)` de
   qualquer um deles. **Avaliar e decidir, com análise escrita**, caminho relativo e `http://` — os dois
   eram aceitos antes e deixaram de ser; a decisão é do executor, mas a razão vai no código.
3. Ajustar o predicado ao conjunto decidido, **sem tocar** no `CSS_BREAKOUT_PATTERN` nem no comportamento
   dos demais tipos.
4. Alinhar as duas barreiras: o mesmo valor tem de ter o mesmo destino nas duas. **Pronto quando** não
   existe valor que uma aceite e a outra recuse.
5. Escrever a **tabela única** de valores — aceites e recusas, cada linha com o motivo — e exercitá-la
   **nas duas barreiras**, no mesmo arquivo de fixture. É esta tabela que prova o critério, não a inspeção
   de que a função chamada é a mesma.
6. Confirmar que continuam recusados: `javascript:`, `data:` com MIME não-mídia, e qualquer tentativa de
   breakout — inclusive anexada a um valor válido.
7. Confirmar que `tokenContractParity.test.ts` e `shippedThemesConsoleClean.test.ts` seguem verdes, sem
   mudança de contagem.
8. Rodar `npx vitest run` e `npm run audit`.

# 6. Critérios de aceite

- [ ] Boot sem mídia **não** emite nenhum aviso de valor inseguro — verificado montando o Provider, não só
      por teste unitário.
- [ ] String vazia, `https://`, mídia embutida e o invólucro `url(...)` são aceitos pelas **duas** barreiras.
- [ ] Caminho relativo e `http://` têm destino decidido, igual nas duas, com a razão escrita no código.
- [ ] Nenhum valor tem destino diferente entre as duas barreiras — provado pela tabela única.
- [ ] `javascript:`, `data:` de MIME não-mídia e tentativa de breakout continuam recusados.
- [ ] Nenhum outro tipo de token muda de comportamento.
- [ ] `tokenContractParity.test.ts` e `shippedThemesConsoleClean.test.ts` verdes, sem mudança de contagem.
- [ ] `npx vitest run` verde; `npm run audit` comparado ao baseline.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é a equivalência entre **duas funções de fronteira**, e ele é enumerável:
uma tabela de valores rodada nas duas prova por construção. Regra de gate varreria o repositório sem ter o
que cobrar, e a única regra de gate desta campanha já é da plan-66 ([[00-prompt-revisor]] §5.4).

> ⚠️ **A armadilha específica desta verificação:** *não aceite "as duas chamam o mesmo predicado" como
> prova.* Foi assim que o defeito passou. A prova é a **tabela**, e ela tem de incluir a string vazia.

- `git diff --stat` → só os arquivos de §3.1.
- Leitura do diff → `CSS_BREAKOUT_PATTERN` intacto; nenhum outro `case` do `coerceTokenValue` mudou.
- Rodar a tabela nas duas barreiras → mesmo destino para cada linha.
- Reprodução manual: Provider sem mídia → **zero** avisos no console.
- `npx vitest run src/core/Provider/utils src/core/Design/hooks` → verde.
- `npx vitest run` → verde.
- `npm run audit` → comparado ao baseline.

# 8. Destino da síntese

**Destino:** `specs/10-seguranca-e-acessibilidade.md`

A §2.1 **(c-bis)** afirma hoje que o predicado aceita *"exatamente duas formas"* — o texto sai e é
substituído pelo conjunto real, com a razão de cada entrada. Acrescentar à mesma seção:

> **As duas barreiras aceitam e recusam o mesmo conjunto, e isso é provado por uma tabela única exercitada
> nas duas** — não por inspeção de que chamam a mesma função. Chamar o mesmo predicado não basta: o que
> difere é o tratamento **antes** da chamada, e é ali que a assimetria se esconde.

Conferir se a §2.1 (c) precisa de ajuste na frase que descreve o alcance da trava geral.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
