---
tipo: "spec"
titulo: "Teste Real — Implementação das Funcionalidades Reais do ERP via Manifesto (2ª parte do teste)"
dominio: "Teste de aceitação em consumidor real / Prova de produção / Renderizador Genérico"
status: "🔴 Planejada (executar DEPOIS do re-Selo e da Spec 40)"
prioridade: "Máxima"
tags: ["spec", "teste-de-aceitacao", "teste-real", "erp", "producao", "manifest-only", "fix-at-source"]
relacionados: ["26-instalacao-teste", "40-fechamento-achados-pos-selo", "31-limpeza-rodada2-erp", "08-consumo-externo-e-integracao"]
---

# 1. Visão Geral e Objetivo

Esta é a **segunda parte do teste** em consumidor real. A primeira parte (Spec 26 / re-Selo) provou o **plug-and-play da instalação** — o sistema sobe, o template renderiza, telas de demonstração com dados de exemplo funcionam. Isso responde "a lib INSTALA bem?". Não responde "a lib SUSTENTA um sistema de produção real?".

O **Teste Real** responde essa segunda pergunta: implementar as **funcionalidades reais** do ERP Earendel (Propostas, Contratos, Projetos) com **conexões reais** (dados reais do Supabase do ERP, fluxos de negócio reais — listar, filtrar, criar, editar, gravar de verdade), montando **100% da interface via manifesto JSON**. Hoje o ERP apenas IMPORTA a biblioteca (lib + plumbing do `init`); aqui ele passa a USÁ-la para valer.

É o teste que fecha a promessa da onda "Renderizador Genérico": um sistema de produção monta toda a sua UI declarativamente, sem uma linha de React de interface, e a biblioteca aguenta.

# 2. Regra de Ouro (a mais importante desta spec)

> **No sistema importador (ERP), APENAS o manifesto (`manifest.json`) pode ser alterado para construir a interface.** Nenhum componente React de UI, nenhum CSS, nenhuma adaptação de tela é escrita no ERP. Se a UI precisa de algo que o manifesto não entrega, **o problema é da biblioteca** e é corrigido **NA FONTE** (Sarak-Lib-UI-Core) — nunca contornado no importador.

Consequências diretas:
- **Zero adaptação no importador.** É proibido escrever `.tsx`/`.css`/componente de UI no ERP para "completar" uma tela, exatamente como a regra 2 da Spec 26. A diferença é que aqui isso não é só uma regra de teste — é o critério central que estamos medindo.
- **Defeito de lib → corrige na lib.** Diferente da Spec 26 (que PROIBIA corrigir "no calor" para manter a medição honesta), o Teste Real é um ciclo iterativo de **construção + correção na fonte**: detectou lacuna de renderização/comportamento na lib → registra → corrige na Sarak-Lib-UI-Core (com spec/fix + gates) → regenera/reinstala no ERP → continua a tela. A honestidade aqui é garantida pela regra "importador só mexe no manifesto", não por isolamento de contexto.
- **O que NÃO é "adaptar o importador" (fronteira do dado — a porta, não a UI):** a Sarak-Lib-UI-Core declara PORTAS de infraestrutura (Spec 19/20/30) — o `networkInterceptor` e os endpoints de backend que servem o dado. Configurar essa porta para apontar aos dados REAIS do ERP (Supabase / backend do ERP) é **plumbing de contrato**, não UI, e é permitido — é a mesma fronteira que a Spec 26 usou (endpoints de `server.ts` são backend, não interface). **Regra fina:** prefira CONFIGURAR a porta a ESCREVER código nela; se conectar o dado real exigir mais do que configurar/apontar a porta, **isso é um achado** sobre a ergonomia da porta de dados da lib (candidato a correção na fonte).

# 3. Protocolo do Teste

## 3.1 Pré-condições
- Re-Selo (Spec 26, P15) concedido — a instalação plug-and-play já está provada.
- Spec 40 executada — os achados residuais das rodadas 1/2 (inclusive `SarakActionCard` genérico) fechados, para não poluir o Teste Real com defeitos já conhecidos.
- ERP com a lib instalada (do re-Selo) e a porta de dados apontável ao Supabase real do ERP.

## 3.2 O que construir (funcionalidades REAIS, não demo)
Para cada módulo de negócio do ERP (Propostas, Contratos, Projetos), montar via manifesto:
1. **Listagem real:** `source` lê os dados REAIS do módulo (Supabase do ERP), com `states` loading/empty/error reais e `renderFor` sobre o dado real. Nada de mock.
2. **Detalhe/leitura:** abrir um registro real (navegação por rota + `$route`/estado), exibindo os campos reais.
3. **Formulário real (create/edit):** `form` + `model` + `validation` + `api_call` com `submit` que **grava de verdade** no backend do ERP; toasts de sucesso/erro reais; `curl`/consulta confirmando a persistência real.
4. **Composição densa real:** pelo menos uma tela com grid/cards/tabela densa refletindo dado real (não só empilhamento flex) — exercitando componentes além do subconjunto básico.
5. **Navegação e shell reais:** shell com as rotas reais do ERP, `navigationStyle` do tema aplicado, Design Engine acessível.

## 3.3 Ciclo de execução (build + fix-at-source)
Para cada tela: montar no manifesto → rodar → observar. Se algo não renderiza/comporta como o negócio exige:
- **É lacuna do autor (manifesto)?** Corrige o manifesto (consultando skills + catálogo).
- **É lacuna da lib?** Registra o achado, corrige NA FONTE (Sarak-Lib-UI-Core) seguindo o ciclo da onda (spec de correção quando o risco justificar, ou fix direto + testes; gates permanentes verdes), regenera o catálogo/rebuild, reinstala no ERP, e retoma a tela. **Nunca** adapta o ERP.

## 3.4 Proibições (invalidam o teste)
- Escrever qualquer componente/tela/CSS React no ERP (só o manifesto muda para UI).
- `registerComponent` de componente de UI no ERP para tapar buraco da lib (a demanda vai para a lib via `ui-novo-componente`).
- "Resolver" no importador algo que é da biblioteca.

# 4. O que medir

| # | Medição | O que prova |
|---|---|---|
| R1 | Cada módulo (Propostas/Contratos/Projetos) tem listagem real funcionando via `source` sobre dado real | Fonte de dados aguenta produção |
| R2 | Formulário real grava no backend do ERP (persistência confirmada) com validação barrando inválidos | Ciclo de escrita real |
| R3 | Composição densa real (grid/cards/tabela) com dado real | Catálogo além do básico |
| R4 | 100% da UI construída só no manifesto — ZERO arquivo de UI tocado no ERP | Renderizador genérico de verdade |
| R5 | Toda lacuna encontrada foi corrigida NA LIB, nunca no importador — contagem de correções-na-fonte vs. adaptações-no-importador (que deve ser 0) | Fix-at-source respeitado |
| R6 | A porta de dados conectou ao Supabase real só por configuração (ou o que faltou virou achado) | Ergonomia da porta |
| R7 | `npm run build` do ERP verde; app real de pé no browser | Entrega real |

# 5. Entregável
`RELATORIO-TESTE-REAL.md` na raiz do ERP + reproduzido na conversa, com: (1) ambiente e tempo; (2) telas reais construídas por módulo, com evidência (dado real na tela, persistência via `curl`/consulta); (3) **lista de defeitos da lib encontrados e corrigidos na fonte** (cada um: sintoma na tela → causa na lib → correção → commit/spec); (4) confirmação R4 (diff do ERP mostrando SÓ o `manifest.json` alterado para UI); (5) matriz R1-R7; (6) veredito: a lib sustenta o ERP real 100% via manifesto? Nota + lacunas remanescentes.

# 6. Critérios de Aceite
- [ ] Os 3 módulos do ERP com listagem + detalhe + formulário reais, dados reais, persistência real confirmada.
- [ ] Diff do ERP: nenhum arquivo de UI (`.tsx`/`.css`/componente) alterado — só `manifest.json` (e, se necessário, configuração da porta de dados, justificada).
- [ ] Toda lacuna de lib encontrada foi corrigida na Sarak-Lib-UI-Core (com gates verdes), nunca adaptada no ERP; a lista de correções-na-fonte está no relatório.
- [ ] Matriz R1-R7 preenchida com evidência; `npm run build` do ERP verde.
- [ ] Entrada no `00-progresso.md` da lib com o resultado e as correções de fonte disparadas.

# 7. Pós-teste
- Cada defeito de lib corrigido durante o Teste Real segue o ciclo da onda (spec/fix → revisão independente → gates). Correções de risco alto viram spec própria; as diretas entram com teste.
- Se o Teste Real passar limpo (R4 e R5 perfeitos), é a prova final de que a Sarak-Lib-UI-Core é um renderizador genérico de produção — não só de demonstração. Registrar na memória do projeto.
