---
tipo: "plan"
titulo: "Alinhar o ERP Earendel — o instrumento de medição da lib"
dominio: "ERP Earendel (repositório EXTERNO)"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "erp", "consumidor", "repositorio-externo", "workspace"]
relacionados: ["[[00-contexto]]", "[[13-instalacao-e-atualizacao]]", "[[adr/007-distribuicao-por-git]]"]
depende_de: ""
destino_sintese: "—"
---

> ⚠️ **REPOSITÓRIO DE FORA.** Esta é a única plan da fila que **não toca a biblioteca**. O alvo é
> `Earendel/ERP/`. Nada é escrito lá sem diagnóstico read-only → relatório → **"sim" do dono**.

# 1. Objetivo

O ERP volta a ser um **instrumento de medição confiável**: o gerenciador de pacotes leva a lib aos 4 apps por
resolução declarada, `pnpm install` sai `0`, e o aviso de versão nova dispara sozinho.

# 2. Contexto

O ERP é o **único consumidor real** — é nele que a plan-09 vai provar que um `2.0.0` migra. A auditoria de
2026-07-30 achou 8 defeitos estruturais, e o mais desconfortável é este: **a atualização da lib chegou aos 4
apps por acidente favorável** (*junction* manual), não porque o gerenciador a levou.

**Um instrumento que funciona por acidente não serve para validar mudança de contrato.**

O dono declarou (2026-07-30) que corrige direto. Se um agente executar, vale o mesmo protocolo.

# 3. Escopo

## 3.1 Dentro — 8 itens, no repositório do ERP

**A ordem é obrigatória: o 0.2 derruba o install se o 0.1 não vier antes.**

| # | Item | Onde |
|---|---|---|
| **0.1** | `"name": "@erp/<modulo>-web"` é **placeholder literal**. Hoje inofensivo porque `_template` está fora do workspace — o 0.2 o coloca dentro, e aí `<modulo>` **derruba o `pnpm install`**. Excluir do glob (`!Modulos/_template/*`) ou dar nome válido | `Modulos/_template/web/package.json` |
| **0.2** 🔴 | **O glob não casa com a pasta real.** Declara `'modulos/*/web'`; a pasta é **`Modulos/`**. NTFS é case-insensitive para abrir arquivo, mas o glob compara **string**. Efeito: os 4 `web` e as `api` **não são projetos do workspace** (`pnpm ls -r` vê 5); `--filter @erp/conector-web` → *"No projects matched"*. ⚠️ **Bomba de portabilidade:** os 5 scripts `dev:*` do root usam `--prefix modulos/...` minúsculo — Windows resolve, **Linux não**. Qualquer CI quebra no primeiro dia | `pnpm-workspace.yaml:6-7` |
| **0.3** | `allowBuilds` com **placeholder literal** (`set this to true or false`) onde se espera booleano → todo install termina `exit 1` (`ERR_PNPM_IGNORED_BUILDS`). Efeito prático nulo, e é por isso que é insidioso: **install sempre vermelho treina a ignorar o vermelho** | `pnpm-workspace.yaml:11-12` |
| **0.4** | Convenção de nome: `Contratos`/`Projetos`/`Propostas` capitalizados, `conector`/`_template` minúsculos. Escolher uma — senão o 0.2 volta em outra forma | `Modulos/` |
| **0.5** | `conector:build` e `conector:test` são **provavelmente no-op**: usam `turbo --filter=@erp/conector-*` e o turbo lê o mesmo workspace. Sem os apps como projetos, o filtro não casa nada e sai `0` sem rodar. *Inferência do 0.2 — **CONFIRMAR** vendo quantos pacotes o turbo reporta* | scripts do root |
| **0.6** | `sarak:check` **existe e nunca dispara** — `\|\| true`, e nenhum `predev` o invoca. **Pior que não existir: parece montado.** ⚠️ O `predev` do root já é ocupado (`matar-portas-dev.mjs`) — **encadear, não substituir**. O `\|\| true` pode sair (o `check` já é `exit 0` por contrato) | `packages/ui-kit/package.json:15` |
| **0.7** | **Junctions manuais como único elo** — `Modulos/*/web/node_modules/@erp/ui-kit` nos 4. Acoplamento **fora do gerenciador**: foi o que fez a atualização chegar, e é o que um install que recrie `node_modules` apaga sem nada acusar até um build falhar. **Corrigir o 0.2 elimina a necessidade** | `Modulos/*/web/node_modules/` |
| **0.8** | **O ADR 009 do ERP nunca foi superado** — registra a **remoção** do Sarak; o Sarak foi **reintroduzido** como `packages/ui-kit`. ADR vigente que descreve o oposto do código: o mesmo defeito que a lib passou seis fases corrigindo. ADR é imutável → criar novo com `substitui`/`substituido_por`; o 009 vira `🔴 Substituído` | `ERP/specs/adr/` |

**Ordem sugerida:** `0.1 → 0.2 → 0.3 → 0.5 → 0.6 → 0.4 → 0.8`. Os dois primeiros provavelmente resolvem três
problemas com uma edição (0.2 resolve 0.6 e 0.7 de tabela).

## 3.2 Fora
- ⛔ **Todo este repositório (a lib).** Nenhum arquivo de `Sarak-Lib-UI-Core` é tocado.
- **`file:` exigir `pnpm install --force` após cada rebuild NÃO é defeito** — é o preço da escolha deliberada
  de consumir por caminho local, e desaparece quando o ERP migrar para `github:…#semver:^1.x`. **Não "consertar".**
- **`pnpm` não invocável** é problema da **máquina**, não do ERP. Hoje: `corepack pnpm <args>`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` | o contrato do lado da lib |
| ADR | `adr/007-distribuicao-por-git` · `adr/008-releases-com-tag-e-semver-em-git` | por que o alvo é `#semver:` |
| Contexto | `00-contexto.md` §7 | as fronteiras (o agente não commita, não empurra) |

# 5. Instruções de execução

1. **Diagnóstico read-only** dos 8 itens, com `arquivo:linha` e o comando que prova cada um.
   Confirmar o 0.5, que é inferência.
2. **⇒ PARE. Relatório em texto. Aguarde o "sim" do dono** — nada é escrito no ERP antes disso.
3. Aplicar na ordem `0.1 → 0.2 → 0.3 → 0.5 → 0.6 → 0.4 → 0.8`.
4. Após 0.2, rodar `pnpm install` e `pnpm ls -r` — confirmar que os 4 apps `web` aparecem.
5. Remover os junctions manuais (0.7) **só depois** de 0.2 provado, e confirmar que os builds seguem.
6. Ligar o `sarak:check` no `predev` **encadeando** ao que já existe.
7. Escrever o ADR novo que supera o 009.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-04-alinhamento-erp.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/13-instalacao-e-atualizacao.md.

ATENÇÃO: o alvo é um REPOSITÓRIO EXTERNO (Earendel/ERP). Nenhum arquivo da biblioteca é
tocado. Faça o diagnóstico read-only dos 8 itens, PARE no passo 2 e apresente o relatório
ao usuário. Só escreva no ERP depois do "sim" dele, e na ordem declarada.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] `pnpm install` sai **0** (o `ERR_PNPM_IGNORED_BUILDS` some).
- [ ] `pnpm ls -r` lista os **4 apps `web`** como projetos do workspace.
- [ ] `pnpm --filter @erp/conector-web <script>` casa.
- [ ] Os builds funcionam **sem** junction manual (`Modulos/*/web/node_modules/@erp/ui-kit` removidos).
- [ ] `npm run dev` dispara o `sarak:check` sozinho, sem substituir o `matar-portas-dev`.
- [ ] Os scripts `dev:*` do root não dependem mais de case-insensitividade (rodariam em Linux).
- [ ] ADR novo criado; o 009 do ERP marcado `🔴 Substituído` com `substituido_por`.
- [ ] ⛔ `git status` **na lib** permanece limpo.

# 8. Como verificar

- No ERP: `pnpm install; echo $?` → `0`
- `pnpm ls -r --depth -1` → 4 `*-web` presentes
- `ls Modulos/*/web/node_modules/@erp/` → sem junction manual
- `npm run dev` → a linha do `sarak:check` aparece antes do servidor subir
- Na lib: `git status --porcelain` → vazio

# 9. Destino da síntese

**Destino:** `—`

Os 8 itens são do repositório do ERP e não alteram nenhuma verdade documentada **desta** base. A exceção:
quando 0.2 e 0.7 mudarem a topologia, os fatos do ERP registrados em `00-contexto` §8 ficam desatualizados —
o revisor os atualiza no veredito.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
