---
tipo: "spec"
titulo: "Correção de Hardcode — Guia Base da Campanha"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "hardcoded", "desengessamento", "governanca", "auditoria", "guia", "campanha"]
relacionados: ["07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Visão Geral
Esta é a **spec-guia** da campanha de erradicação de hardcode da Metade B (desengessamento) descrita na spec [[07-agente-llm-design-e-expansao-estrutural]]. Ela **não corrige nada**: é o documento de contexto que todo agente deve ler **ao iniciar uma nova conversa** antes de executar qualquer spec de correção (21+). Define o que ler, como escrever no módulo, e — principalmente — o **protocolo de auditoria** e o **método de validação** que provam que cada etapa foi coerente e não violou nenhuma regra da biblioteca.

> **Uso:** Esta spec é lida **em conjunto** com a spec de correção da vez (21+). A 21+ diz *o que* corrigir (escopo); esta 20 diz *como executar e validar*.

# 2. Missão e Escopo da Campanha
Zerar o **hardcode duro** da base atômica, medido pelo `auditor_hardcoded.mjs`. As classes são tratadas em três níveis:
- **Corrigir (reprova / dura):** espaçamento (`p`/`m`/`gap`), direção (`flex-col/row`), grid, e valores `px/rem/em`. Devem migrar para os Hooks Controladores e tokens (`var(--sx-spacing-*)`, etc.).
- **Tolerado:** hairlines `1px`/`2px` (bordas e offsets de sombra) — deduzidos.
- **Deduzido (não reprova):** ícones (`w-N`/`h-N`), `w-full`/`h-full` (o próprio hook os usa) e alinhamento (`items-`/`justify-`, micro-layout intrínseco). São **localizados e contados**, nunca invisíveis.

# 3. Leitura Obrigatória (Contextualização)
Antes de codar, carregue na janela de contexto:

### Skills
- `/ui-contexto-repositorio` — porta de entrada: 3 camadas, Design as Data, limites do módulo.
- `/ui-arquitetura-design` — **a lei do hardcode estrutural** e o roteamento via `useStructuralStyles`.
- `/ui-refatorar-componente` — alterar assinatura de token/prop mantendo paridade inversa.
- `/ui-novo-componente` — quando a correção de valor exigir **criar token** (Expansão).
- `/ui-auditoria-modulo` — execução do gate (`auditor_hardcoded.mjs` e suite completa).
- `sarak:code-adequacao` — metodologia segura de refatoração de legado (rede de caracterização).
- `sarak:padrao-typescript` / `sarak:padrao-escrita` — padrões de escrita e limiares.

### Specs
- `specs/specs/03-padrao-e-taxonomia-biblioteca-atomica.md` — Zero Hardcode atômico.
- `specs/specs/09-expansao-vs-configuracao.md` — fronteira Configurar vs Expandir (quando criar token).
- `specs/arquitetura/04-paridade-cinco-camadas.md` — paridade + Camada 6 (Hook Controlador).
- `specs/arquitetura/05-diretriz-zero-any-e-foundation.md` — Zero Any durante o refactor.
- `specs/arquitetura/06-plano-diretor-expansao-visual.md` — Zero Hardcode + paridade na expansão.
- `specs/plan/07-agente-llm-design-e-expansao-estrutural.md` — guarda-chuva (o porquê).

### Referências operacionais
- `.claude/skills/ui-auditoria-modulo/scripts/auditor_hardcoded.mjs` — define o gate e os baldes.
- `src/components/atomic/hooks/useStructuralStyles.ts` (+ hooks de domínio Card/Button/Modal/Table) — o **alvo** da migração.

# 4. Regras de Escrita no Módulo (durante a correção)
1. **Zero Hardcode estrutural:** geometria/espaçamento/direção saem do JSX e vão para o Hook Controlador (Camada 6).
2. **Preservar comportamento 1:1:** é refatoração — o visual renderizado deve permanecer pixel-equivalente.
3. **Não criar componentes:** a correção consome hooks existentes; não nasce `.tsx` novo.
4. **Token novo só via Expansão 1:1:1:1:1:** se um valor não tiver token equivalente (ex.: type-scale), crie-o nas 5 camadas (skill `ui-novo-componente`) — nunca chave órfã.
5. **Zero Any:** nenhuma tipagem afrouxada introduzida no caminho.
6. **Um arquivo por vez:** mudanças pequenas e verificáveis.

# 5. Metodologia de Execução
Aplicar o ciclo da skill `code-adequacao` por arquivo:
1. **Caracterizar:** garantir snapshot/teste que captura o comportamento ATUAL.
2. **Refatorar:** migrar o hardcode duro para hook/token.
3. **Verificar verde:** testes passam + verificação visual no Canvas/preview.

# 6. Protocolo de Auditoria (Início e Fim) — OBRIGATÓRIO
Toda spec 21+ é cercada por duas execuções de `/ui-auditoria-modulo` para medir a evolução:

1. **Baseline (ANTES):** ao iniciar a spec, rode o auditor e **registre o snapshot**:
   ```
   node .agents/skills/ui-auditoria-modulo/scripts/auditor_hardcoded.mjs
   ```
   Capture: total que reprova, **violações duras**, cada **balde deduzido** (ícones / `w-full,h-full` / alinhamento) e o **valor px/rem/em**. Guarde também o resultado dos demais auditores via `run_audit.mjs`.
2. **Execução:** aplique a correção do escopo da spec.
3. **Conferência (DEPOIS):** rode o auditor novamente e **compare** antes × depois.
4. **Registro:** anexe o bloco "Antes → Depois" no fechamento da spec (delta de violações duras + estado dos baldes).

# 7. Método de Validação (Gate de Coerência por Spec)
A spec 21+ só é considerada **coerente e concluída** se TODAS as regras abaixo forem verdadeiras na conferência (DEPOIS):

- **V1 — Redução real:** as **violações duras** caíram pelo menos a meta declarada pela spec da vez, e **nunca aumentaram**.
- **V2 — Anti-burla (sem regressão de baldes):** nenhum balde deduzido **aumentou** (ícones, `w-full/h-full`, alinhamento). Isso impede "esconder" um `p-4` transformando-o em `items-center` para fugir do gate.
- **V3 — Valor estável ou menor:** o total de `px/rem/em` **não aumentou** (idealmente caiu, se a spec for de valor).
- **V4 — Suite íntegra:** os outros 6 auditores do `run_audit.mjs` (TypeScript/Zero-Any, Paridade, CleanCode, Coverage, Arquitetura, Manifesto) **continuam verdes** — a correção não introduziu nenhuma nova quebra de regra do módulo.
- **V5 — Comportamento preservado:** testes de caracterização/snapshot verdes e verificação visual sem diferença perceptível.
- **V6 — Sem desvio arquitetural:** nenhum componente novo; qualquer token novo respeita a paridade 1:1:1:1:1.

> Falha em **qualquer** item V1–V6 invalida a entrega da spec, independentemente do número de violações corrigidas, o auste é obrigatório.

# 8. Critérios de Aceite (desta spec-guia)
- [ ] Toda spec 21+ referencia esta 20 como leitura inicial.
- [ ] Toda spec 21+ contém o snapshot Antes → Depois do `auditor_hardcoded.mjs`.
- [ ] O Gate de Coerência (V1–V6) está explícito como condição de fechamento da spec 21+.

# 9. Plano de Testes (Quality Gate)
- **Determinístico:** `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` verde (0 novas quebras) ao fim de cada spec 21+.
- **Caracterização:** snapshots dos componentes do escopo permanecem idênticos pós-refatoração.
- **Visual (E2E leve):** inspeção no Sarak UI Canvas confirmando paridade visual antes/depois.
