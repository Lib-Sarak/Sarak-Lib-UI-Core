---
tipo: "plan"
titulo: "Ciclo de atualização do consumidor — dar comando a quem só recebia aviso"
dominio: "Sarak-Lib-UI-Core / Distribuição"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "cli", "atualizacao", "consumidor", "semver"]
relacionados: ["[[13-instalacao-e-atualizacao]]", "[[adr/008-releases-com-tag-e-semver-em-git]]", "[[12-kit-do-consumidor]]"]
depende_de: "plan-05"
destino_sintese: "specs/13-instalacao-e-atualizacao.md"
---

# 1. Objetivo

O consumidor atravessa uma atualização — **dentro da faixa ou através de um major** — por um comando que lhe
mostra o que quebra **antes** de ele confirmar.

# 2. Contexto

Hoje o consumidor é **avisado** de que há versão nova (`sarak-ui check`), mas **não tem comando para agir**.
Dentro da faixa ele descobre sozinho que é `npm update`; **atravessar um major** exige editar o `package.json`
à mão, sem ninguém dizer o que quebra.

Some-se um defeito que transforma o aviso em ruído: `tagComparison.mjs:54-59` lê **só o MAJOR**, então `~1.2.0`
é tratado como `^1.2.0`. O consumidor recebe aviso de um `v1.9.0` que o `npm update` **nunca vai lhe dar** —
aviso permanente, exatamente o ruído que o comando existe para combater.

# 3. Escopo

## 3.1 Dentro
- **`sarak-ui update`** — atualiza **dentro da faixa**, com o comando do gerenciador detectado.
- **`sarak-ui update --latest`** — **atravessa o major**: mostra quantos majors pula, imprime as entradas de
  `docs/migracoes.md` **entre a versão instalada e a nova**, pede confirmação, e só então reescreve a faixa no
  `package.json`. *O caminho seguro é um comando; o caminho que quebra é um comando **com o que quebra na tela**.*
- **Corrigir o filtro de faixa** (`bin/scaffold/checkUpdate/tagComparison.mjs:54-59`) — capturar o minor e
  filtrar por major+minor quando a faixa for `~`. Corrigir também o rótulo, que imprime `(^N)` para quem
  escreveu `~`.
- `specs/13-instalacao-e-atualizacao.md` e `sarak-ui/GUIA-FRONTEND.md` §2.7.

## 3.2 Fora
- ⛔ **Comando não executado de verdade não entra.** Regra herdada e dura: o que não foi rodado num consumidor
  real é declarado `validated: false` e a mensagem **degrada para instrução genérica** — nunca manda o
  consumidor rodar um chute.
- ⛔ O fio do `predev` no ERP — é da plan-04. Esta plan o revisita **só se o comando mudar**.
- Publicar release: quem roda `npm version` é o usuário.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` | o contrato atual do `check` |
| ADR | `adr/008-releases-com-tag-e-semver-em-git` | como `#semver:` resolve contra tags |
| Código | `bin/scaffold/packageManager.mjs` | os comandos por gerenciador e a regra `validated` |
| Código | `bin/scaffold/checkUpdate/tagComparison.mjs:54-59` | o defeito de faixa |
| Spec fixa | `specs/12-kit-do-consumidor.md` | o `GUIA-FRONTEND` é gerado — editar a fonte |

# 5. Instruções de execução

1. Corrigir o **filtro de faixa** primeiro: sem isso, o `update` herda o mesmo erro e atualiza para fora da
   faixa que o consumidor declarou.
2. Implementar `sarak-ui update` usando `localRefreshCommand`/`gitUpdateCommand` já existentes — **não
   reinventar** a detecção de gerenciador.
3. Implementar `--latest`: contar os majors pulados, extrair de `docs/migracoes.md` as entradas **entre** a
   versão instalada e a alvo, imprimir, **pedir confirmação**, e só então reescrever a faixa.
4. **Provar em consumidor real, um por gerenciador** (npm, pnpm, yarn): dentro da faixa **e** atravessando um
   major, com a nota de migração aparecendo **antes** da confirmação.
5. O que não puder ser provado entra como `validated: false`, com a degradação prevista.
6. Atualizar `specs/13` e regenerar o `GUIA-FRONTEND.md` pelo gerador (`npm run guide`), nunca à mão.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-10-ciclo-atualizacao.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/13-instalacao-e-atualizacao.md, specs/specs/12-kit-do-consumidor.md,
specs/adr/008-releases-com-tag-e-semver-em-git.md.
Skills a aplicar: padrao-typescript, test-unitario.

REGRA DURA: comando que você não executou de verdade não entra. O que não foi provado é
declarado validated:false e degrada para instrução genérica. Não edite sarak-ui/ à mão —
é gerado; edite a fonte e rode `npm run guide`.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] `~1.2.0` **não** recebe mais aviso de `v1.9.0`; o rótulo imprime `(~N.M)` para quem escreveu `~`.
- [ ] `sarak-ui update` provado **nos 3 gerenciadores**, cada um efetivamente executado.
- [ ] `sarak-ui update --latest` mostra os majors pulados **e** as notas de migração **antes** da confirmação.
- [ ] Nada declarado como validado sem ter sido rodado.
- [ ] `specs/13` atualizada; `GUIA-FRONTEND.md` regenerado pelo gerador (`guide:check` verde).
- [ ] Teste automatizado do filtro de faixa (`~` × `^`).
- [ ] Suíte verde.

# 8. Como verificar

- Consumidor de teste com `~1.2.0` e uma tag `v1.9.0` no remoto → **nenhum** aviso
- `sarak-ui update --latest` num consumidor 2 majors atrás → imprime as 2 notas e pede confirmação
- `npm run guide:check` → verde (o guia foi regenerado, não editado)
- `git diff --stat sarak-ui/` → só o que o gerador produz
- `npx vitest run` → verde, com o teste novo do filtro de faixa

# 9. Destino da síntese

**Destino:** `specs/13-instalacao-e-atualizacao.md`

O `GUIA-FRONTEND.md` é **gerado** — não é destino de síntese, é consequência do gerador.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
