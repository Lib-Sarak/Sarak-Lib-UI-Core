---
tipo: "plan"
titulo: "Aceitar mídia embutida nos tokens de imagem sem afrouxar a fronteira de CSS"
objetivo: "Uma imagem enviada pelo painel deixa de ser descartada em silêncio ao chegar no design do sistema"
dominio: "Sarak-Lib-UI-Core / Provider / Fronteira de validação"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "validacao", "seguranca", "midia"]
relacionados: ["[[specs/10-seguranca-e-acessibilidade]]", "[[specs/09-temas-e-presets]]", "[[specs/06-painel-de-customizacao-e-preview]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

Um valor de token do tipo `image`/`file` no formato de mídia embutida (`data:`) atravessa `validateDesign`
e chega ao design do sistema, enquanto todo vetor de breakout de CSS/HTML continua barrado nos demais tipos.

# 2. Contexto

`MediaUploaderControl` (`src/features/DesignEngine/components/controls/MediaUploaderControl.tsx:36-48`)
tem dois caminhos: com `onMediaUpload` configurado, delega ao host e recebe uma URL pública; **sem** ele,
cai em `reader.readAsDataURL(file)` e produz uma string `data:image/png;base64,...`.

Esse valor nunca chega ao sistema. `src/core/Provider/utils/validation.ts:39` define
`CSS_BREAKOUT_PATTERN = /[<>{};]/`, e `isSafeCssString` (`:41`) rejeita qualquer string que o contenha.
Toda `data:` URI carrega `;base64,` — logo, **toda** mídia embutida é descartada. O tipo `image`/`file`
cai no ramo default do `coerceTokenValue` (`:125-130`), que só aplica esse predicado.

Reproduzido em Chromium real, contra o `dist/` publicado, com uma `data:` URI mínima:

```
[Sarak:Design] Token "globalBackgroundImageUrl" com valor fora do contrato — descartado. data:image/svg+xml;base64,...
```

Consequência para o usuário final: ele escolhe um arquivo, **vê a miniatura no controle**, aplica, e nada
acontece. Não há erro na tela — só um `console.warn` que ninguém lê. O ERP não configura `onMediaUpload`
(verificado por varredura em `modules/` e `packages/ui-kit/src/`), então é sempre este o caminho.

**Por que a barreira existe, e por que ela não pode ser afrouxada em geral.** O `CSS_BREAKOUT_PATTERN`
protege a interpolação de `responsiveCSS` dentro de uma tag `<style>`. Há uma **segunda** barreira com o
mesmo predicado em `src/core/Design/hooks/useDesignVariables.ts:22` (`isCssSafeValue`), deliberada: ela
cobre o caso de alguém chamar `applyConfig`/`setDesign` direto, pulando `validateDesign`. As duas existem
por motivo declarado e as duas veem o mesmo valor — quem mexer numa tem de considerar a outra.

O que muda aqui é estreito: **um predicado próprio para os tipos `image` e `file`**, que reconheça a forma
de uma mídia embutida bem-formada em vez de tratá-la como texto CSS arbitrário. Nenhum outro tipo de token
muda de comportamento.

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/utils/validation.ts` — predicado próprio para os tipos `image`/`file` no
  `coerceTokenValue`, e a razão correspondente em `describeDriftReason`.
- `src/core/Design/hooks/useDesignVariables.ts` — a segunda barreira passa a reconhecer a mesma forma, para
  que o valor não seja aceito num ponto e descartado no outro.
- `src/core/Provider/utils/__tests__/validation.test.ts` — casos de aceite e de recusa.
- `src/core/Design/hooks/__tests__/` — teste da segunda barreira, no arquivo que já cobre o hook.

## 3.2 Fora
- `CSS_BREAKOUT_PATTERN` e `isSafeCssString` **em qualquer outro tipo de token** — cor, texto, fonte,
  `select` e as chaves extras continuam exatamente como estão.
- `MediaUploaderControl` — o controle está correto; o defeito é da fronteira.
- `COLOR_PATTERN` — `url()` em valor de cor continua barrado; é vetor clássico e não tem relação com isto.
- Qualquer limite de tamanho de payload ou de `localStorage` — é assunto da plan 69 e do dono.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | §2.1 — a fronteira que trata tema como dado hostil; é a regra que esta plan estreita |
| Spec fixa | `specs/09-temas-e-presets.md` | §4.2 — os três comportamentos de `validateDesign` e a garantia de degradação campo a campo |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` | §3 — o controle polimórfico por `token.type`, e §9.4, a assimetria de fronteira do preview |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `cyber-codigo` | mexe numa barreira de injeção; a mudança tem de ser justificada por análise, não por conveniência |
| Código | `src/core/Provider/utils/validation.ts:36-131` | as duas funções e o `switch` por tipo |
| Código | `src/core/Design/hooks/useDesignVariables.ts:13-22` | a segunda barreira e o motivo escrito dela |
| Código | `src/features/DesignEngine/components/controls/MediaUploaderControl.tsx:18-48` | o caminho que produz o valor |

# 5. Instruções de execução

1. Ler as referências da §4, com atenção ao motivo escrito das duas barreiras.
2. Definir o predicado de mídia: aceita `https:` e uma mídia embutida **bem-formada** (`data:`, tipo MIME de
   imagem ou vídeo, codificação declarada, payload no alfabeto correspondente). Recusa qualquer outra coisa,
   inclusive `data:` com MIME não-mídia, `javascript:`, e string que contenha os caracteres de breakout fora
   da posição legítima. **Pronto quando** existe pelo menos um caso de recusa que só este predicado pega.
3. Ligar o predicado aos tipos `image` e `file` no `coerceTokenValue`, e dar a razão correspondente em
   `describeDriftReason`.
4. Alinhar a segunda barreira (`useDesignVariables`) à mesma forma, preservando o papel dela para todos os
   outros valores.
5. Escrever os testes: aceite de `https:` e de mídia embutida bem-formada; recusa de `data:` mal-formada,
   de MIME não-mídia, de `javascript:` e de tentativa de breakout. **Pronto quando** cada recusa tem um caso
   que falha se o predicado for removido.
6. Confirmar que `tokenContractParity.test.ts` e `shippedThemesConsoleClean.test.ts` seguem verdes — nenhum
   valor shippado muda de veredito.
7. Rodar `npx vitest run`.

# 6. Critérios de aceite

- [ ] Mídia embutida bem-formada em token `image`/`file` atravessa `validateDesign` sem warn.
- [ ] Mídia embutida mal-formada, MIME não-mídia e `javascript:` continuam descartados com warn.
- [ ] Nenhum outro tipo de token muda de comportamento — provado por teste que exercita cor, texto e `select`.
- [ ] A segunda barreira aceita e recusa exatamente o mesmo conjunto que a primeira.
- [ ] `tokenContractParity.test.ts` e `shippedThemesConsoleClean.test.ts` verdes, sem mudança de contagem.
- [ ] `npx vitest run` verde.
- [ ] O predicado carrega, no próprio código, o que ele aceita e por quê — a mesma exigência de declaração
      que o `CSS_BREAKOUT_PATTERN` já cumpre.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é comportamento observável de **uma** função de fronteira, com casos de
aceite e recusa enumeráveis. O dono é o teste do módulo. Uma regra de gate aqui varreria o vizinho sem ter
o que cobrar.

- `git diff --stat` → só os arquivos de §3.1.
- Leitura do diff de `validation.ts` → o `CSS_BREAKOUT_PATTERN` não mudou; o predicado novo é aditivo e
  restrito aos dois tipos.
- `npx vitest run src/core/Provider/utils` → verde.
- `npx vitest run src/core/Design` → verde.
- `npx vitest run` → verde.
- Reprodução manual: montar o Provider com `globalBackgroundImageUrl` numa mídia embutida e confirmar que o
  warn de contrato **não** aparece.

# 8. Destino da síntese

**Destino:** `specs/10-seguranca-e-acessibilidade.md`

Texto pronto para transporte, para a §2.1:

> Os tokens de tipo `image` e `file` têm predicado próprio: aceitam URL `https:` e mídia embutida
> (`data:`) com tipo MIME de imagem ou vídeo e payload bem-formado; recusam o resto. Os demais tipos
> continuam sob o predicado geral de breakout de CSS/HTML, que não foi afrouxado. A mesma forma é
> reconhecida pelas duas barreiras — a de `validateDesign` e a de `useDesignVariables` —, para que nenhum
> valor seja aceito numa e descartado na outra.

Conferir se [[09-temas-e-presets]] §4.2 precisa de uma linha apontando para a exceção.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
