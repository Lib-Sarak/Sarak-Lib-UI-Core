---
tipo: "spec"
titulo: "Versionamento e release — o que o número significa e como ele se move"
dominio: "Sarak-Lib-UI-Core / Distribuição / Contrato público"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "versionamento", "semver", "release", "migracoes", "distribuicao"]
relacionados: ["[[007-distribuicao-por-git]]", "[[05-build-e-distribuicao]]", "[[03-superficie-publica]]", "[[00-regras-e-invariantes]]"]
---

# 1. Visão geral

Até 2026-07-27 a `version` da lib era **`3.0.0` e não significava nada.** Nunca houve um 1.x nem um 2.x com release, o pacote nunca foi publicado em registry, e o número ficou parado enquanto o contrato público mudava.

Esta spec faz duas coisas: registra a **renumeração para `1.0.0`** e define **o que o número passa a significar** a partir dela.

O *como* a lib chega no consumidor (Git, sem registry) é [[007-distribuicao-por-git]]; o *como* o artefato é produzido é [[05-build-e-distribuicao]]. Aqui é só o **número**.

# 2. A renumeração — `3.0.0` → `1.0.0`

**Decisão do dono, tomada em 2026-07-27 e executada nesta spec.**

## 2.1 Os fatos medidos que a justificam

| Fato | Medição |
| --- | --- |
| Releases 1.x ou 2.x que existiram | **nenhum** |
| Publicações em registry npm | **nenhuma** (não há `publishConfig`) |
| Tags git no repositório | **0**, em **330 commits** |
| Commits que alteraram `package.json` sem mover a `version` | **9**, desde `2a43c28` (2026-07-19) |

Um número que não se move e não corresponde a release nenhum não é versão — é decoração. **Esta é a v1 do produto**, e o número passa a dizer isso.

## 2.2 O que foi alterado

| Arquivo | Como | Depois |
| --- | --- | --- |
| `package.json` → `version` | **editado à mão** | `1.0.0` |
| `sarak-ui/VERSION`, `sarak-ui/catalog.json`, `sarak-ui/START-HERE.md`, `sarak-ui/GUIA-FRONTEND.md` | **regenerados** por `npm run guide` | `libVersion=1.0.0` |
| `dist/BUILD_INFO.json` → `libVersion` | **regenerado** por `npm run build` | `1.0.0` |
| `dist/*.js`, `dist/index.cjs` | **regenerados** pelo build (o número entra no bundle) | `1.0.0` |
| `docs/migracoes.md` | entrada nova | registro da renumeração |

> **`npm version` NÃO foi usado.** Ele cria commit **e tag** — e a decisão sobre tags não foi tomada (§6). O campo foi editado diretamente.

**O gate provou que funciona:** trocada a versão, `guide:check` ficou **vermelho apontando os 4 arquivos defasados** antes de qualquer regeneração. Era o comportamento esperado — é a prova de que um derivado editado à mão, ou esquecido, derruba o build.

## 2.3 O que NÃO foi renumerado, e por quê

Três números parecidos que **não são a versão da lib**. Mexer neles seria confundir coisas com ciclos de vida independentes:

| Número | Onde | O que versiona | Muda quando |
| --- | --- | --- | --- |
| `kitSchemaVersion` (hoje `1`) | `sarak-ui/VERSION` | O **formato** do kit do consumidor | O layout/contrato dos arquivos do kit muda |
| `MASTER_DESIGN_MAP.version` (hoje `13.0.0`) | `src/core/Design/master-map.ts` | O **dicionário de tokens** | Tokens entram/saem do dicionário |
| `schema_version` | payload de design | O **formato do tema** persistido | O formato do payload muda (aciona `upgradeThemePayload`) |

## 2.4 O que assume `3.0.0` no repositório e continua assim de propósito

Quatro arquivos de teste usam `3.0.0`. **Nenhum deles lê a versão real do repositório** — todos passam a própria fixture e conferem o que a função fez com ela:

| Arquivo | Uso |
| --- | --- |
| `bin/scaffold/generators/__tests__/packageJsonFields.test.mjs:6,13` | `ctx.libVersion = '3.0.0'` → espera `^3.0.0` na saída. Testa a **propagação**, não o número |
| `bin/scaffold/checkUpdate/__tests__/localDependency.test.mjs:20,22,23` | Escreve seu próprio `package.json`/`BUILD_INFO`/`VERSION` num diretório temporário |
| `bin/scaffold/checkUpdate/__tests__/readInstalledCommit.test.mjs:34` | URL de tarball fictícia |
| `bin/scaffold/__tests__/mergePackageJson.test.mjs:22,32` | `zod: '^3.0.0'` — dependência de terceiro, sem relação |

Trocar esses valores para `1.0.0` não tornaria nenhum teste mais correto e apagaria a distinção entre "a versão da lib" e "um valor de entrada qualquer". **Ficam como estão.**

Também permanecem `>=3.0.0` nas `peerDependencies` de `@tanstack/react-virtual` e `echarts-for-react` — versões de terceiros.

## 2.5 Impacto no consumidor: nenhum

Os dois modos de instalação em uso resolvem **por commit** (`github:`) ou **por caminho** (`file:`/`link:`), nunca por semver. Um `^3.0.0` escrito à mão no `package.json` do consumidor **nunca esteve sendo respeitado** nesses modos.

# 3. A política a partir de `1.0.0`

O contrato público é **o barril `src/index.ts`** ([[03-superficie-publica]] §2). É contra ele que MAJOR/MINOR/PATCH são definidos.

| Nível | O que caracteriza |
| --- | --- |
| **MAJOR** | Quebra do contrato público: remover/renomear export do barril; mudar assinatura de um `<Nome>Props` exportado de forma incompatível; **renomear ou mudar a semântica de um token**; mudar um **comportamento default** (ex.: a lib passar a escrever `document.title` sem opt-in) |
| **MINOR** | Capacidade nova retrocompatível: componente novo no barril, token novo, prop opcional nova, preset/tema novo |
| **PATCH** | Correção que não muda o contrato: bug visual, correção de tipo que só relaxa, ajuste interno |

Três casos que valem explicitar, porque já causaram confusão:

- **Token renomeado é MAJOR**, mesmo sem mexer em `.tsx`. O nome do token é contrato: um tema do consumidor referencia a chave. `validateDesign` descarta chave desconhecida com `warn` (R6) — silenciosamente, o eixo some.
- **Tornar um export `React.lazy` é MAJOR**, porque o tipo público vira `LazyExoticComponent`. É exatamente o que trava a correção da dívida do `CustomizationPanel` ([[01-gates-e-baseline]] §4.5).
- **Mudar o que é default é MAJOR**, mesmo mantendo a capacidade. Quem dependia do default vê comportamento diferente sem alterar uma linha.

# 4. A fonte única do número

```
package.json ("version")
   │
   ├── npm run build  → scripts/generate-build-info.mjs → dist/BUILD_INFO.json (libVersion)
   │                                                    → dist/*.js (o número entra no bundle)
   └── npm run guide  → scripts/consumer-kit/kitFiles.mjs → sarak-ui/VERSION (libVersion=)
                                                          → sarak-ui/{catalog.json,START-HERE.md,GUIA-FRONTEND.md}
```

**`package.json` é a única fonte. Todo o resto é DERIVADO, por gerador.**

> **Editar um derivado à mão é bug**, não atalho — e `guide:check` pega (provado na §2.2). O `BUILD_INFO.json` não tem gate próprio, mas é reescrito inteiro a cada `npm run build`: qualquer edição manual é sobrescrita na build seguinte.

## 4.1 A armadilha do `baseCommit`

`dist/BUILD_INFO.json` tem `baseCommit`, e ele é **sempre um commit atrás**: o `dist/` é gerado *sobre* um commit e commitado *depois*, e o hash de um commit não pode conter a si mesmo.

**Nunca use `BUILD_INFO.baseCommit` para responder "estou atualizado?".** Use `sarak-ui check` ou o campo `resolved` do lockfile. A nota está dentro do próprio arquivo.

# 5. `docs/migracoes.md` — obrigatório para todo breaking change

Todo MAJOR tem entrada em `docs/migracoes.md`, mais recente primeiro, com:

1. **O que mudou** — tabela antes × depois.
2. **Por quê** — o defeito ou a decisão que motivou.
3. **Como migrar** — o passo concreto, com código quando houver.
4. **O que NÃO mudou** — quando houver risco de o leitor assumir demais.

> **Breaking change sem entrada em `docs/migracoes.md` é entrega incompleta.** Não há gate cobrando isso — é conduta, na mesma classe das regras R10/R11/R15/R16.

A renumeração desta spec **não é** breaking change, e mesmo assim ganhou entrada: um número que **anda para trás** normalmente significa perda de capacidade, e o consumidor merece ler que aqui não significa.

# 6. O ritual de release de hoje — honestamente

```
npm run build          # 4 gates → compila → regenera BUILD_INFO
npm run package:check   # confere o tarball (proibidos e obrigatórios)
commit do dist/         # o artefato viaja no repositório
```

E do lado do consumidor, **sob comando**:

```
npm run sarak:update    # ou o equivalente do gerenciador dele
```

**Sem `npm publish`. Sem `git tag`. Sem CI.** Não há release automático; "sempre a mais atual" é **sob comando**, nunca automático — a razão está em [[007-distribuicao-por-git]].

# 7. Opções em aberto (decisão do dono — NÃO decididas aqui)

## 7.1 Adotar `git tag vX.Y.Z` a cada release

| Prós | Contras |
| --- | --- |
| A `version` passa a ter **âncora verificável**: `v1.0.0` aponta para um commit exato | Mais uma etapa manual no ritual, que hoje tem duas |
| Consumidor pode fixar `github:org/repo#v1.0.0` — reprodutível | Tag errada/movida é pior que tag nenhuma; exige disciplina |
| `git describe` passa a responder "que build é este?" sem abrir o `BUILD_INFO` | Não resolve o `npm install` no-op (§7.2) — só torna o estado legível |

**Hoje: 0 tags em 330 commits.**

## 7.2 Publicar em registry (npm privado / GitHub Packages)

| Prós | Contras |
| --- | --- |
| Resolve a **raiz** do problema: com registry + semver, `npm install` deixa de ser no-op — é a causa dos dois incidentes reais do [[007-distribuicao-por-git]] | Infraestrutura e credenciais para manter; segredo novo no fluxo |
| `npm outdated` passa a funcionar no consumidor | O `dist/` deixaria de precisar ser commitado — mudança de fluxo, não só de destino |
| Faixas semver (`^1.2.0`) passam a **significar** algo | Publicar exige disciplina de versionar **todo** merge |

**Nenhuma das duas foi implementada.** Esta spec registra o trade-off; a escolha é do dono.

# 8. Critérios de aceite

- [x] `package.json` em `1.0.0`, editado diretamente (sem `npm version`, sem tag, sem push).
- [x] Todos os derivados **regenerados**, nenhum editado à mão.
- [x] `guide:check` demonstrado vermelho antes da regeneração e verde depois.
- [x] Testes/fixtures que citam `3.0.0` auditados um a um; nenhum lê a versão real, nenhum alterado.
- [x] Entrada em `docs/migracoes.md` explicando que é renumeração de identidade.
- [x] `kitSchemaVersion`, `MASTER_DESIGN_MAP.version` e `schema_version` **intocados**, com o porquê escrito.
- [x] Política MAJOR/MINOR/PATCH amarrada ao barril como contrato.
- [x] Tags e registry registrados como opções em aberto, sem escolher nenhuma.

# 9. Plano de testes (Quality Gate)

| Verificação | Comando | Resultado |
| --- | --- | --- |
| Kit regenerado | `npm run guide` → `npm run guide:check` | ✅ kit em dia (6 arquivos) |
| Build + `BUILD_INFO` | `npm run build` | ✅ `libVersion: "1.0.0"`, `baseCommit 97baeb0` |
| Conteúdo do pacote | `npm run package:check` | ✅ 77 arquivos, allowlist respeitada |
| Auditoria | `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` | ✅ baseline exato ([[01-gates-e-baseline]] §3) |
| Suíte completa | `npx vitest run` | 280 arquivos / 890 testes — com a falha ambiental já documentada em [[01-gates-e-baseline]] §3.1, **nenhum teste quebrou pela renumeração** |
