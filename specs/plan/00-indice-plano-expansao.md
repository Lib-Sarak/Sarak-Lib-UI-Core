---
tipo: "indice"
titulo: "Índice e Ordem de Build do Plano de Expansão"
dominio: "Sarak-Lib-UI-Core (Plano)"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["indice", "plano", "roadmap", "dependencias"]
relacionados: ["01-plano-mestre-expansao-generica", "02-plano-mestre-expansao-logica-e-dados"]
---

# 1. Propósito
Mapa de navegação do diretório `specs/plan/`. O plano transforma a Sarak-Lib-UI-Core num **Motor UI agnóstico** (Design as Data) e divide-se em **dois blocos por faixa numérica**, cada um com seu Mestre. Este índice fixa a **ordem de build** e o **grafo de dependências** para evitar construção fora de ordem.

# 2. Estrutura por Faixa Numérica

## Mestres (01–02)
- `01-plano-mestre-expansao-generica.md` — Mestre do **Bloco Visual**.
- `02-plano-mestre-expansao-logica-e-dados.md` — Mestre do **Bloco Funcional** (inclui o Gate de Qualidade Funcional — ver §4).

## Bloco Visual (10–19) — os "blocos de Lego" da UI
| Nº | Spec | Categoria do Mestre 01 |
|---|---|---|
| 10 | micro-layout | 1. Estrutura Base |
| 11 | formulários | 2. Entrada de Dados |
| 12 | data-grids-vis | 3. Densidade/Visualização |
| 13 | feedback-interacoes | 4. Feedback/Status |
| 14 | navegação | 5. Navegação |
| 15 | mídia-renderizadores | 6. Mídia |
| 16–19 | *(reservado para crescimento)* | — |

## Bloco Funcional (20–39) — o "cérebro" (Manifest Renderer)
| Nº | Spec | Papel |
|---|---|---|
| 20 | manifest-schema-e-gramatica-no | **Fundação:** contrato do nó JSON |
| 21 | datastore-estado-reativo | **Fundação:** estado reativo |
| 22 | component-registry-resolver | **Fundação:** type → componente |
| 23 | motor-de-repeticao-renderfor | Engine: listas/loops |
| 24 | motor-de-data-binding-pipes | Engine: interpolação + pipes |
| 25 | dispatcher-central-de-eventos | Engine: ações/eventos |
| 26 | motor-avaliacao-condicional | Engine: renderIf/disabledIf |
| 27 | error-boundaries-e-fallbacks | Engine: isolamento de falhas |
| 28 | persistencia-estado-local | Engine: LocalStorage |
| 29 | validacao-schema-formularios | Engine: validação |
| 30 | contrato-importador-renderer | **Composição final:** `<SarakManifestRenderer />` |

# 3. Ordem de Build e Grafo de Dependências
A construção segue dependências reais (não a ordem numérica cega):

1. **Visual primeiro (10–15):** os átomos precisam existir para serem resolvidos/renderizados.
2. **Fundação funcional (20 → 21 → 22):** gramática do nó, depois o estado reativo, depois o resolver. Nada do bloco funcional compila sem estas três.
3. **Engines (23–29):** dependem da fundação. Atenção às dependências cruzadas:
   - `23 renderFor` → consome **21** (escopo) e delega virtualização à **12** (DataGrid).
   - `24 pipes` → consome **21** (leitura de estado) e **15** (sanitização de HTML).
   - `25 dispatcher` → consome **24** (interpolação de URL/body) e abre **13** (Drawer/Modal).
   - `26 condicional` → consome **21** e **24**.
   - `29 validação` → consome **11** (inputs) e bloqueia ações da **25**.
4. **Composição (30):** o `SarakManifestRenderer` orquestra tudo e fecha o contrato com o importador (atualiza a Spec 08 em `specs/specs/`).

> **Inversão de prioridade a vigiar:** a `23` (Crítica) depende da `12` (Média). Antecipar ao menos a virtualização base da `12` antes de fechar a `23`.

# 4. Gate de Qualidade (e Auditoria)
- **Bloco Visual:** gate = **Paridade 1:1:1:1:1** (tokens novos nas 5 camadas) + plano de testes da spec.
- **Bloco Funcional:** a paridade de tokens **não se aplica** (engines não são design tokens). O gate é definido na §5 do Mestre Funcional (`02-...`): **contratos TypeScript tipados (zero `any`) + cobertura de testes por engine**. Este gate **deve ser incorporado à `ui-auditoria-modulo`** como um sub-auditor próprio (tarefa de implementação do auditor, fora do escopo "apenas specs").
