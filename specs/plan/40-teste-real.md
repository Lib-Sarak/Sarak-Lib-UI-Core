---
tipo: "spec"
titulo: "Teste Real — o ERP como módulos-plugin na base Sarak (modelo MyService)"
dominio: "Teste de aceitação em consumidor real / Prova de produção / Modelo módulos-plugin"
status: "🔴 Planejada (REESCRITA 2026-07-22 — modelo módulos-plugin; executar DEPOIS de 43/44/45)"
prioridade: "Máxima"
tags: ["spec", "teste-de-aceitacao", "teste-real", "erp", "producao", "modulos-plugin"]
relacionados: ["43-design-system-primeiro", "44-temas-json-e-persistencia", "45-scaffolder-react-e-skills", "46-remover-motor-de-manifesto"]
---

> **Reescrita (2026-07-22):** a 1ª versão media "montar o ERP 100% via manifesto" — e FALHOU (4 paredes numa tela simples). A 2ª versão (breve) media "importar componentes à la MUI" — descartada porque a premissa "MyService roda esse modelo" era falsa. Esta versão testa o **modelo REAL e provado**: o ERP como **módulos-plugin** na base Sarak, exatamente como o MyService, tematizado pela central (Design Engine). É o gate empírico que libera a remoção do #2 (Spec 46).

# 1. Visão Geral e Objetivo

Provar que a Sarak-Lib-UI-Core, como **base de front (Shell + Design Engine central + modelo de módulos-plugin)**, sustenta um sistema de PRODUÇÃO real. O ERP Earendel (Propostas, Contratos, Projetos) passa a ter um front real: suas features viram **módulos React** registrados na base, com **dados reais** (Supabase) e fluxos reais, e o layout de todas as telas é controlado pela **central de tema/template**. É o padrão que o MyService já valida — aqui provamos que ele aguenta outro sistema real.

# 2. Regra de Ouro

> **O importador registra seus MÓDULOS na base; a base fornece Shell + tema.** O ERP escreve suas features como módulos React (`registerSarakModule`) e overrides pontuais (`registerLocalComponent`), usando os **componentes Sarak** e os **tokens** para serem tematizáveis pela central. Falta um componente? Caminho default (opção A): o módulo usa React próprio com **tokens** (`var(--sarak-*)`). Bug/lacuna REAL de componente Sarak → corrige NA LIB (ciclo da onda: fix + gates + `sarak:update`), não hackeia no ERP. O layout global (tema/template) é alterado **só pela central**, e a troca atinge todas as telas.

# 3. Protocolo do Teste

## 3.1 Pré-condições
- **Specs 43, 44, 45 executadas** — modelo de módulos oficial, Design Engine central sem backend, e o `init` gerando o starter padrão.
- ERP com a build atual (`npm run sarak:check` → "Atualizado"; senão `sarak:update`).
- O front do ERP parte do **starter do `init`** (Spec 45) — é o "importar o módulo e o frontend ser criado no padrão".
- Porta de dados apontável ao Supabase real do ERP.

## 3.2 O que construir (features REAIS, como módulos)
Por módulo de negócio (Propostas, Contratos, Projetos), como módulo React registrado na base:
1. **Listagem real:** lê dados REAIS do Supabase, com estados loading/empty/error, usando componentes Sarak (`SarakTable`/`SarakCardGrid`/`SarakDataTable`). Nada de mock.
2. **Detalhe/leitura:** tela exibindo TODOS os campos reais — inclusive os que quebraram no manifesto (JSONB `dados_extras` formatado em JS, link clicável, moeda do próprio registro): agora triviais em React.
3. **Formulário real (create/edit):** grava de verdade no backend do ERP, com validação e feedback; `curl`/consulta confirmando a persistência.
4. **Composição densa real:** ≥1 tela com grid/cards/tabela densa sobre dado real.
5. **Layout central:** o Design Engine (`/design`) altera tema/template e **todas as telas do ERP** (módulos incluídos) respondem; tema persiste (localStorage) e recarrega mantendo.

## 3.3 Ciclo de execução
Montar a feature como módulo → registrar na base → rodar → observar. Falta componente → React+tokens (opção A). Bug/lacuna real de componente → corrige na lib, `sarak:update`, retoma. Layout/composição → é do importador (livre no módulo).

# 4. O que medir

| # | Medição | O que prova |
|---|---|---|
| R1 | Cada módulo (Propostas/Contratos/Projetos) registrado na base, com listagem real sobre dado real | Modelo de módulos aguenta produção |
| R2 | Formulário real grava no backend com validação/feedback | Ciclo de escrita real |
| R3 | Detalhe exibe JSONB, link e moeda dinâmica — as 4 paredes do manifesto agora triviais em React | **As 4 paredes caíram** |
| R4 | ≥1 composição densa real (grid/tabela) sobre dado real | Componentes além do básico |
| R5 | **A central (Design Engine) altera o layout de TODAS as telas** do ERP; troca de tema/template reflete nos módulos; tema persiste | **O valor central do produto** |
| R6 | Onde faltou componente, o módulo usou React+tokens (temático); fricções da ergonomia de tokens registradas | Escape hatch (opção A) |
| R7 | Bug/lacuna real de componente → corrigido NA LIB (contagem); layout resolvido no módulo do ERP | Fronteira base×importador respeitada |
| R8 | `npm run build` do ERP verde; app real de pé no browser | Entrega real |

# 5. Entregável
`RELATORIO-TESTE-REAL.md` na raiz do ERP + na conversa, com: ambiente/tempo; as features reais por módulo (dado real + persistência via curl); AS 4 PAREDES cada uma resolvida em React (como/qual componente/token); a prova de que a central tematiza todas as telas do ERP (R5, com evidência de troca de tema atingindo os módulos); bugs/lacunas de componente corrigidos NA LIB; fricções da ergonomia de tokens; matriz R1-R8; veredito (a base sustenta o ERP real? nota + próximos gaps de componente).

# 6. Critérios de Aceite
- [ ] Os 3 módulos do ERP registrados na base, com listagem + detalhe + formulário reais, dados reais, persistência confirmada.
- [ ] Detalhe exibe JSONB formatado, link clicável e moeda do registro — as 4 paredes explicitamente derrubadas (R3).
- [ ] **A central altera o layout de todas as telas do ERP** (R5) — evidência de troca de tema/template atingindo os módulos + persistência.
- [ ] Onde faltou componente, resolvido com React+tokens (temático), não hardcode fora do contrato; fricções registradas.
- [ ] Bug/lacuna real de componente corrigido na lib (gates verdes), nunca hackeado no ERP.
- [ ] Matriz R1-R8 com evidência; `npm run build` do ERP verde.
- [ ] Entrada no `00-progresso.md` com o resultado, os componentes demandados e as correções de fonte.

# 7. Pós-teste
- Cada lacuna real de componente vira demanda na lib (ciclo da onda) — o relatório alimenta o roadmap de componentes com base em uso REAL.
- **Gate para a Spec 46:** se o Teste Real passar (o modelo de módulos + central sustenta o ERP real), está provado que o modelo React é suficiente → libera a remoção do #2. Se revelar que a camada declarativa é necessária, reavaliar ANTES da 46.
