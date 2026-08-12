---
tipo: "adr"
titulo: "Persistência de tema tenant-aware e strategy configurável"
status: "🟢 Aceito"
tags: ["adr", "persistencia", "temas", "multi-tenant", "design-engine", "breaking-change"]
relacionados: ["[[003-remocao-backend-proprio]]", "[[005-modelo-modulos-plugin-e-apps-separados]]"]
substitui: ""
substituido_por: ""
---

# 1. Contexto e Problema

**Data da decisão: 2026-08-12.**

O dono relatou que a persistência de tema, hoje 100% em `localStorage`, "está causando muitos problemas" num
consumidor real que é **multi-tenant**. Levantamento no código, com `arquivo:linha`:

- `localStorage` é escrito de forma **incondicional**: `src/core/Provider/hooks/useDesignManager.ts:107`
  (`persistDesign`) grava sempre, **antes** de chamar `onSave` (`:108-110`); a leitura no boot
  (`useDesignManager.ts:76-88`) e o fallback de re-hidratação (`useDesignSync.ts:56-65`) leem `localStorage`
  direto, sem condição.
- `options.persistence.onSave`/`onLoad` ([[003-remocao-backend-proprio]]) já existem como as portas "traga sua
  persistência" — mas hoje **complementam** o `localStorage`, nunca o substituem. Não existe caminho para
  desligar o `localStorage` quando o consumidor já tem backend próprio.
- `options.persistence.strategy?: 'local' | 'remote' | 'hybrid'` está **declarado no tipo**
  (`src/core/Provider/types.ts:155`) e **nunca é lido** em nenhum outro lugar do código-fonte — campo morto.
- `crossTabSync` (default ligado) reage ao evento `storage` nativo do browser, que é **por origem**
  (`src/core/Provider/hooks/useDesignStorageSync.ts:29-76`, filtro só por `event.key !== storageKey`,
  `:50-51`). A chave default é fixa (`DEFAULT_STORAGE_KEY = 'sarak-ui-design-v9.0'`,
  `src/core/Provider/constants.ts:1`) e nada no contrato hoje força namescopo por tenant.
- Grep por `tenant`/`multi-tenant` em todo o repositório (`.ts`, `.tsx`, `.md`) devolve **zero ocorrências** —
  não há precedente de isolamento multi-tenant nesta base.

**A consequência medida:** num sistema que roda múltiplos tenants na mesma origem (troca de conta/tenant em
runtime, sem reload de página), o tema de um tenant pode vazar para outro — tanto na leitura inicial (o boot
lê `localStorage` sem saber "de quem" é aquele valor) quanto via `crossTabSync` (uma aba de um tenant reaplica
o tema salvo por outra aba de tenant diferente, porque as duas escrevem na mesma chave).

**O que este ADR NÃO reabre:** [[003-remocao-backend-proprio]] continua valendo por inteiro — a lib **nunca**
fala com servidor, não ganha endpoint, não ganha driver de banco. O que muda é só o *papel* do `localStorage`
dentro do contrato que já existia.

# 2. Decisão

**O `localStorage` passa a ser tenant-aware, e o campo `strategy` passa a ser funcional — com o default
preservando 100% do comportamento atual.**

## 2.1 Chave composta por tenant

`options.persistence` ganha um campo novo, `tenantId?: string`. Quando presente, a chave efetiva de
armazenamento (usada tanto na leitura/escrita quanto no filtro de `crossTabSync`) passa a ser
`` `${storageKey}::tenant:${tenantId}` `` em vez do `storageKey` cru. Sem `tenantId`, nada muda — é o
comportamento de hoje.

## 2.2 `strategy` funcional, default retrocompatível

| Valor | Comportamento |
| --- | --- |
| `'hybrid'` **(default)** | Grava/lê `localStorage` **e** chama `onSave`/`onLoad` quando fornecidos — **exatamente** o que a lib já faz hoje, sem nome. Zero consumidor existente muda de comportamento. |
| `'local'` | Ignora `onSave`/`onLoad` mesmo se fornecidos — só `localStorage`. Para quem quer isolar o teste ou desligar explicitamente a porta remota. |
| `'remote'` | `localStorage` deixa de ser **fonte de decisão**. É lido uma única vez, de forma síncrona, só para evitar o flash de tema errado no primeiro paint — e é **substituído** assim que `onLoad` resolver. `persistDesign` para de escrever em `localStorage`; a escrita passa a ser só via `onSave`. Sem `onSave`/`onLoad` configurados enquanto `strategy: 'remote'`, a lib emite um aviso único (`console.warn`) e degrada para o comportamento de `'local'` — **nunca perde o tema em silêncio**. |

**Por que `'hybrid'` é o default, e não `'local'`:** o comportamento de hoje já é "grava local e também chama
onSave/onLoad se existirem" — isso é literalmente a semântica de `'hybrid'`. Um default de `'local'` faria
consumidores que já configuraram `onSave`/`onLoad` pararem de tê-los chamados, o que é uma quebra silenciosa.
Com `'hybrid'` como default, **nenhum consumidor existente muda de comportamento** só por atualizar a lib.

## 2.3 O que fica para a implementação

Este ADR fixa o **contrato**; a implementação (os pontos exatos de `useDesignManager`, `useDesignSync`,
`useDesignStorageSync`, `useDesignRemoteLoader` que passam a checar `strategy`/`tenantId`) é a
`plan-34-persistencia-tema-tenant-aware`.

# 3. Consequências

- **Positivas:**
  - Resolve o vazamento real medido, sem exigir que a lib ganhe qualquer noção de backend ou de identidade de
    tenant — `tenantId` é só um valor opaco que o consumidor já sabe (ele é quem sabe qual tenant está ativo).
  - `strategy: 'remote'` dá ao consumidor que já tem backend próprio um caminho explícito para ele virar a
    fonte de verdade, sem o cache local "vencer" por acidente numa corrida entre boot síncrono e `onLoad`
    assíncrono.
  - Retrocompatibilidade total pelo default — zero consumidor precisa mudar uma linha para continuar
    funcionando como hoje.
  - O campo morto `strategy` deixa de ser promessa não cumprida no tipo público.

- **Negativas (Trade-offs):**
  - Mais um campo de configuração (`tenantId`) e mais um comportamento (`strategy`) para o consumidor
    entender e para o kit documentar.
  - **Mudança de comportamento default é MAJOR**, pela política de [[03-versionamento-e-release]] §3, mesmo
    que o default (`'hybrid'`) reproduza o comportamento atual — a introdução do `strategy` explícito e a
    mudança de prioridade de resolução no boot quando `'remote'` está em uso justificam a entrada obrigatória
    em `docs/migracoes.md`.
  - `strategy: 'remote'` sem `onLoad` que responde rápido pode reintroduzir, por um instante, o flash que o
    `localStorage` síncrono hoje evita — mitigado pelo fallback síncrono de leitura única, mas não eliminado
    por completo (depende da latência do backend do consumidor).
  - `tenantId` é responsabilidade do consumidor fornecer corretamente; a lib não valida se o valor é estável
    entre sessões — um `tenantId` que muda sem querer produz o mesmo efeito de "perder o tema" que existe
    hoje ao trocar de `storageKey`.

> **Escopo:** este ADR decide o contrato de persistência tenant-aware. A implementação, os testes e a
> atualização das specs fixas afetadas ([[09-temas-e-presets]] §4.4, [[02-design-engine]] §8) são a
> `plan-34-persistencia-tema-tenant-aware`.
