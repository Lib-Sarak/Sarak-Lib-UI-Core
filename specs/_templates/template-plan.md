---
tipo: "plan"
titulo: "Título curto no infinitivo (Ex: Extrair validação de CPF para o domínio)"
objetivo: "" # Uma frase no infinitivo: o resultado observável, não a tarefa. Alimenta a coluna Objetivo do 00-indice.
dominio: "Nome do Módulo (Ex: Autenticação)"
status: "🔴 A executar" # 🔴 A executar · 🟡 Em execução · 🟠 Em revisão · 🔵 Em correção · 🟢 Aprovada · ⚪ Sintetizada · ⛔ Bloqueada
prioridade: "Alta"
tags: ["plan"]
relacionados: [] # Ex: [[arquitetura/03-api]], [[specs/02-login]]
depende_de: "" # Ex: plan-04-extrair-contrato — precisa estar 🟢 antes
retida_por: "" # Ex: plan-07 — preencher SÓ ao sintetizar uma plan que outra AINDA ABERTA usa como contexto
destino_sintese: "" # arquitetura/NN-*.md · adr/NNN-*.md · specs/NN-*.md · 00-contexto.md · — (nenhum)
---

> ⚠️ **O formato dos valores acima é rígido, e vem do parser** (`scripts/generate-plan-index.mjs`): **aspas
> duplas, uma linha só, sem aspas duplas no interior do texto**. Um valor fora disso é lido como `null` — e
> em `objetivo` isso derruba o `plan-index:check` nomeando o arquivo. **Ao copiar este molde, substitua a
> linha inteira**: comentário `#` depois do valor também quebra a leitura.

> **Molde de plan.** Escrita pelo **agente revisor** ([[00-prompt-revisor]]), executada pelo **agente
> executor** ([[00-prompt-executor]]). Nome do arquivo: `plan-NN-<slug-kebab>.md`, com `NN` monotônico e
> definitivo. Ao criar, adicione a linha correspondente em [[00-indice]].
>
> **Critério de qualidade:** um executor **sem nenhum contexto prévio** consegue realizar esta plan lendo
> apenas ela e o que ela aponta. Se não consegue, a plan está incompleta.

# 1. Objetivo

Uma frase: o **resultado observável** quando isto estiver pronto. Não a tarefa — o efeito no sistema.

# 2. Contexto

Por que agora, o que existe hoje, o que a leitura do repositório revelou. Inclua o que evita que o executor
repita a investigação já feita. Sem história longa.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)
- `caminho/do/arquivo.ext` — o que muda nele
- `caminho/do/modulo/` — o que muda nele

## 3.2 Fora (o que NÃO pode ser tocado)
- `caminho/intocavel.ext` — motivo
- Qualquer refactor não listado em §5, mesmo que pareça óbvio.

> Esta seção previne a maioria das reprovações. Seja explícito.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/NN-<nome>.md` | regra estrutural que restringe a solução |
| Spec fixa | `specs/NN-<nome>.md` | regra de negócio afetada |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-<linguagem>` | sempre |
| **Skill** | `<skill-específica>` | o que ela resolve aqui |
| Código | `caminho/arquivo.ext` | ler antes de editar |

> **Referencie, nunca copie.** Nada de conteúdo de skill ou de spec fixa reproduzido aqui.

# 5. Instruções de execução

Passos numerados, verificáveis, sem ambiguidade. Um passo = uma ação com critério de pronto.

1. …
2. …
3. Rodar `<comando de teste/validação>` e garantir verde.

# 6. Critérios de aceite

- [ ] Critério objetivo e verificável.
- [ ] …
- [ ] Suíte de testes verde; validadores de limiares sem violação nova.

# 7. Como verificar (uso do revisor)

Escrito **antes** da execução. Os comandos e checagens exatos do veredito.

**Gate:** `<regra que passa a ser cobrada por máquina · ou nenhum>`

> **Sempre preenchida, `nenhum` incluso.** Que forma a verificação toma — teste do módulo, regra de gate ou
> `--check` do gerador — decide-se **aqui, na criação**, nunca na execução. O critério, mais as duas travas
> (no máximo uma regra de gate por plan; regra sem caso que falha não é regra), está em
> [[00-prompt-revisor]] §5.4.

- `git diff --stat` → só os arquivos de §3.1 aparecem.
- `<comando de teste>` → verde.
- `<validador>` → sem violação nova.
- Leitura de `<arquivo:linha>` → confirma \<o que\>.

# 8. Destino da síntese

**Destino:** `<valor do frontmatter>`

O que deve ser levado para a spec fixa depois (texto pronto para transporte, se aplicável). Se o destino é
`—`, escreva o motivo: esta execução não altera nenhuma verdade documentada.

> A síntese é ato do **revisor** ([[00-prompt-revisor]] §7.4), e o gatilho é do **usuário**: o revisor
> propõe ao aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
