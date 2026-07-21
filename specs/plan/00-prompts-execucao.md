# Prompts de Execução — PENDENTES

Cada bloco abaixo é um prompt COMPLETO para iniciar a execução de uma spec **numa conversa nova** (agente sem contexto anterior). Copie e cole o bloco inteiro. A numeração (`P15`, `P17`…) corresponde ao número do item no Roteiro de Execução do `00-indice.md` — por isso há lacunas: os prompts já executados foram removidos.

Regras comuns já embutidas em todos os prompts: acionar `ui-contexto-repositorio` primeiro; ler `00-indice.md`, `00-progresso.md` e a spec inteira; ao terminar, atualizar status/checkbox/progresso; gates permanentes (`RegistryParity`, `catalog:check`, `npm run build`, testes por pasta, `run_audit.mjs` — comparar com o baseline conhecido, não esperar 0).

> **Limpeza de 2026-07-21:** este arquivo contém **apenas o que ainda precisa ser executado**. Os prompts **P1-P14 e P16** (specs 16-31 + 30, todas concluídas) foram removidos. O histórico integral está no git; o registro do que cada um produziu está no `00-progresso.md`.
>
> **Atualização de 2026-07-21:** **P17** (Spec 39 — Importação e Atualização) foi executado e removido — o ERP já está destravado (`resolved` no HEAD atual, `dist/styles/` presente, `src/` ausente, `npm run build` verde). Ver a entrada correspondente no `00-progresso.md`.

## Ordem de execução

| Prompt | Spec | Item | Observação |
|---|---|---|---|
| **P15** | 26 (re-Selo) | 15 | ⚠️ **Condicional** — a rodada 2 JÁ rodou (9,3/10). Só reutilize se o veredito do Selo exigir uma rodada 3. |
| **P18** | 40 — Teste Real | 18 | Pré-requisito ERP atualizado (Spec 39, ✅ concluída) satisfeito; falta só o veredito do Selo. |
| **P19** | 41 — Piso de Bundle | 19 | ⚠️ Rodar **ANTES** da P20 (2 arquivos em comum). |
| **P20** | 42 — Generalizar CardGrid | 20 | Rodar depois da P19. |

---

## P15 — Re-Selo da Onda (Spec 26, AGENTE EXTERNO) — ⚠️ CONDICIONAL

> **Estado:** a rodada 2 do re-Selo **já foi executada** (2026-07-21, nota 9,3/10 — ver `RELATORIO-INSTALACAO-CONSOLIDADO.md`). Este prompt permanece aqui só porque o **veredito do Selo segue em aberto** (item 15 do roteiro): se a decisão for exigir uma **rodada 3** — por exemplo, para re-medir o M9 agora que o `src/` saiu do pacote (Spec 30) —, reutilize o bloco abaixo. **Se o Selo for concedido, este prompt pode ser removido.**
>
> Antes de disparar uma nova rodada: refaça a limpeza do ERP (Spec 31 — o inventário muda a cada rodada, refaça o inventário vivo), confirme que `origin/main` da lib está sincronizado com as correções (o `init`/pacote testado tem que ser o corrigido) e que o ERP está sem `package.json` (gate de prontidão da Spec 31). Mesmas regras de sempre: agente sem contexto, só caminho oficial, contornos proibidos, matriz M1-M10.

```
Você vai REINSTALAR a biblioteca Sarak-UI (@sarak/lib-ui-core) DO ZERO no sistema `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP` e produzir um relatório de avaliação da experiência. Esta é a SEGUNDA rodada do Selo da Onda: a primeira (2026-07-20) foi NEGADA (nota 6,5/10) e uma rodada de correção (specs 27/28/29) foi executada desde então — seu teste mede se as correções realmente fecharam os achados. Contexto mínimo: o ERP Earendel é um sistema de gestão (módulos de Propostas, Contratos e Projetos, banco Supabase, scripts Python de negócio) que hoje NÃO tem frontend — a Sarak-UI será responsável por TODA a renderização, via manifestos JSON. NÃO leia o relatório anterior nem as specs de correção: você é um agente externo sem contexto da lib; o teste mede a instalação como um consumidor novo a vê.

REGRAS DO TESTE (inegociáveis):
1. Use SOMENTE o caminho oficial da biblioteca: garanta um `package.json` na raiz do diretório-alvo (se não existir, `npm init -y` primeiro), depois `npm install github:Lib-Sarak/Sarak-Lib-UI-Core` e depois `npx @sarak/lib-ui-core init` (o scaffolder faz a entrevista: modo/stack/storage — em caso de dúvida, use os defaults do Golden Path, ou `--help` para ver as flags). Após o init, siga as skills que ele instala em `.agents/skills/` (`ui-integra-consumidor` → `ui-integra-escrever-manifesto` → `ui-auditoria-manifesto`) e o catálogo `node_modules/@sarak/lib-ui-core/docs/manifest-catalog.md`.
2. É PROIBIDO: modificar qualquer arquivo dentro de `node_modules/@sarak/lib-ui-core`; criar patch/postinstall sobre a lib; escrever componente React de interface no consumidor (só o plumbing que o init gera: Provider/Renderer/interceptors/store). Se algo só funcionar com um contorno desses, NÃO aplique o contorno — registre o problema no relatório e siga para o próximo item. O teste mede a BIBLIOTECA, não a sua habilidade de contorná-la.
3. Não leia o código-fonte da lib para descobrir como usá-la — use apenas skills, catálogo, templates e mensagens de erro/warns. Se a instrução fornecida não bastar, isso É um achado para o relatório.

O QUE CONSTRUIR (critério de sucesso funcional):
- App Modo App com shell + navegação (Início, Propostas, Contratos, Projetos, Design Engine) partindo do template starter.
- Pelo menos UMA tela de lista real com carga automática (`source` com states loading/empty/error + `renderFor`) consumindo um endpoint do backend gerado pelo init (pode ser dado de exemplo servido pelo server.ts; integração real com o Supabase do ERP é bônus, não requisito).
- UM formulário com validação + `api_call` + toasts de sucesso/erro.
- PELO MENOS UMA tela com grid e/ou cards (não só empilhamento flex) — a rodada anterior só exercitou flex+form+lista e deixou essa lacuna de cobertura; force grid/`SarakCard` desta vez.
- Design Engine acessível em `/design`, com personalização aplicando ao vivo (ex.: cor da topbar) e tema salvo persistindo após reload (use o storage escolhido na entrevista do init).
- Um teste PROPOSITAL de erro de autoria (ex.: um token de espaçamento inventado e um `"actions"` como objeto num nó de rascunho): a tela deve continuar de pé e o console deve ensinar a correção — registre o comportamento observado.
- Validação real: `npm run dev` com backend+frontend de pé, telas conferidas no browser, `npm run build` do consumidor verde.

FOCO DE REGRESSÃO (os itens que falharam/atritaram na rodada anterior — teste cada um explicitamente e registre a evidência):
- M6 (validação): o formulário com `validation` DEVE barrar o submit vazio — nenhum registro vazio persistido, nenhum toast de sucesso, os campos revelam o erro. Teste também com `curl` no endpoint que NÃO há registro vazio criado.
- M7 (navegação): ative `navigationStyle: "topbar"` no Design Engine e confirme que a navegação ocupa a largura CHEIA com TODOS os itens visíveis — não uma faixa horizontal estreita e cortada. Personalizar um tema padrão pode abrir um modal de "salvar novo tema": registre se a skill/catálogo avisaram sobre isso.
- M1/M2 (instalação): descubra as flags do `init` via `--help` (não por acidente); ao instalar, confirme que o `package.json`/`node_modules` foram criados NO diretório do ERP e que NENHUM projeto ancestral (ex.: `C:\Users\Igor\`) foi poluído.
- M9 (empacotamento): confirme que `node_modules/@sarak/lib-ui-core` NÃO contém `src/`/`specs/`/`playwright/` (só `dist/`/`bin/`/`backend/`/`docs/`/`templates/` e o necessário).

RELATÓRIO OBRIGATÓRIO (entregável principal) — salve como `RELATORIO-INSTALACAO-UI.md` na raiz do ERP (sobrescrevendo a versão anterior) e reproduza o conteúdo integral na conversa:
1. Ambiente (SO, Node, npm) e tempo total aproximado.
2. Passo a passo executado (comandos reais, na ordem).
3. O que funcionou DE PRIMEIRA, sem intervenção.
4. PROBLEMAS, um a um: sintoma exato (mensagem/print), onde apareceu (init/skill/catálogo/motor/build), se bloqueou ou só atrapalhou, e o que você fez (registrou e seguiu / parou o item).
5. Avaliação das instruções: as skills e o catálogo bastaram? Onde você precisou adivinhar?
6. Contornos que teriam sido necessários (e que a regra 2 proibiu) — cada um é uma falha da biblioteca a corrigir.
7. MATRIZ DE MEDIÇÃO M1-M10 — preencha cada item com PASS/PARCIAL/FAIL + evidência (mensagem/saída literal):
   M1 init gera projeto completo em 1 comando · M2 install+dev sobem sem ajuste manual (e sem poluir diretório ancestral) · M3 telas do template corretas de primeira · M4 erro de autoria proposital não derruba a tela e o warn ensina · M5 lista com source+states funciona pelo exemplo da skill · M6 formulário completo (validação barra submit; toasts) · M7 topbar/navigationStyle personalizada reflete ao vivo sem quebrar o layout · M8 tema persiste após reload · M9 skills+catálogo bastaram (zero leitura do código-fonte da lib; pacote sem o fonte) · M10 zero contorno necessário.
8. Veredito final: a instalação foi efetivamente plug-and-play? Nota 0-10 com justificativa, e as 3 melhorias que você mais sentiria falta.

NÃO corrija a biblioteca, NÃO abra specs dela, NÃO commite nada sem autorização do usuário.
```

---


---

## P18 — Spec 40: Teste Real (2ª parte do teste — funcionalidades reais do ERP via manifesto)

> Só dispare DEPOIS do re-Selo (P15) concedido E da Spec 30 (P16) executada. Diferente do re-Selo (que MEDE a instalação), aqui se CONSTRÓI as funcionalidades reais do ERP e se CORRIGE na fonte toda lacuna da lib. O importador só mexe no manifesto.

```
Execute a spec `specs/plan/40-teste-real.md` da Sarak-Lib-UI-Core. É a 2ª parte do teste em consumidor real: implementar as funcionalidades REAIS do ERP Earendel (`C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP`) — Propostas, Contratos, Projetos — com conexões REAIS (Supabase do ERP), 100% via manifesto JSON.

Preparação obrigatória: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md`, `00-progresso.md` e a spec 40 INTEIRA; (3) leia as skills de consumo `ui-integra-escrever-manifesto` e `ui-auditoria-manifesto` e o catálogo `docs/manifest-catalog.md`. Pré-condições (se qualquer uma faltar, PARE e avise): (a) **Spec 39 executada (P17)** — o ERP PRECISA estar com a build atual da lib; confirme os 3 marcadores no `node_modules/@sarak/lib-ui-core` do ERP: `dist/styles/` presente, `src/` ausente, `resolved` do lock no HEAD atual. Se o ERP ainda estiver na build antiga, você vai testar uma lib de 4 commits atrás e produzir ACHADOS FALSOS (ex.: reportar o botão "Executar" hardcoded, que a Spec 30 já corrigiu). (b) Spec 30 executada. (c) Veredito do Selo dado.

REGRA DE OURO (o que esta spec mede): no ERP, APENAS o `manifest.json` pode ser alterado para construir a UI — ZERO componente/tela/CSS React no importador. Se a UI precisa de algo que o manifesto não entrega, o problema é da BIBLIOTECA e se corrige NA FONTE (Sarak-Lib-UI-Core), com o ciclo da onda (spec/fix + gates verdes + catálogo/rebuild + reinstala no ERP) — NUNCA se adapta o ERP. A porta de dados (interceptor/backend) pode ser CONFIGURADA para apontar ao Supabase real do ERP (é plumbing de contrato, não UI); se conectar dado real exigir mais que configurar a porta, isso é um achado sobre a ergonomia da porta.

Construa, por módulo (Propostas/Contratos/Projetos): listagem real via `source` sobre dado real (Supabase), detalhe/leitura, formulário real (create/edit) que GRAVA de verdade com validação barrando inválidos, e ≥1 composição densa real (grid/cards/tabela). Ciclo: montar no manifesto → rodar → se lacuna do autor, corrige o manifesto; se lacuna da lib, corrige na fonte e retoma.

Entregue: `RELATORIO-TESTE-REAL.md` na raiz do ERP + na conversa, com as telas reais por módulo (evidência de dado real + persistência via curl/consulta), a LISTA de defeitos da lib corrigidos na fonte (sintoma→causa→correção), o diff do ERP provando que só o `manifest.json` mudou (R4), e a matriz R1-R7. `npm run build` do ERP verde. Entrada no `00-progresso.md` da lib. NÃO commite sem autorização.
```

---

## P19 — Spec 41: Piso de Bundle / barris de ícone (rodar ANTES da Spec 42)

> Origem: achado da execução da Spec 30. Toca 2 arquivos em comum com a Spec 42 (`SarakCoreCard`, `SarakCardGrid`) — **nunca em paralelo**; esta vem primeiro.

```
Execute a spec `specs/plan/41-piso-de-bundle-barris-de-icone.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md` (especialmente a entrada da Spec 30, que contém o achado que originou esta spec); (3) leia a spec 41 INTEIRA; (4) leia a `specs/plan/42-generalizar-cardgrid-corecard.md` para saber o que NÃO invadir (ela vem depois e toca 2 dos mesmos arquivos). Skills de execução: `sarak:otimizacao-nivel-1` (disciplina de medir antes/depois — é o coração desta spec) e `sarak:padrao-typescript`.

Contexto essencial: a Spec 30 tentou reduzir o bundle com `manualChunks` e NÃO reduziu bytes (~2,44 MB antes e depois). A razão é estrutural: num renderizador de manifesto a ligação é por STRING em runtime (`{"type": "X"}`), então o Registry precisa de todo componente não-lazy de forma ansiosa — o bundler não pode podar o que não sabe que não será usado. A causa ATACÁVEL é outra: 6 arquivos fazem `import * as LucideIcons from 'lucide-react'` e acessam por índice DINÂMICO (`LucideIcons[nomeEmRuntime]`), o que impede tree-shaking e arrasta ~1500 ícones. Os 5 cards (`SarakActionCard`, `SarakSearchCard`, `SarakTitleCard`, `SarakCoreCard`, `SarakCardGrid`) burlam o átomo oficial `SarakIcon`, que já resolve nome→ícone via `IconMap` CURADO. Atenção às duas mecânicas diferentes: `lucide-react` é peerDependency e está em `--external` (incha o bundle do CONSUMIDOR), enquanto `@phosphor-icons/react` e `@tabler/icons-react` são `dependencies` e NÃO estão em `--external` (hipótese a verificar: podem estar sendo empacotadas inteiras dentro do `dist/` da lib).

REGRA DURA: **meça ANTES de refatorar.** Isole com número quanto cada família de ícone contribui (dist da lib vs bundle do consumidor), usando um app mínimo do `init` como cobaia. Se o ganho for irrelevante, a spec fecha com a CONCLUSÃO NEGATIVA documentada — não force o refactor para justificar a spec.

Entregue: os itens 2.1 a 2.4 da spec — medição antes/depois registrada; zero `import * as *Icons` com acesso dinâmico em `src/` (cards usando `SarakIcon`); cobertura do `IconMap` estendida onde faltar + nome desconhecido degradando com `console.warn` (postura da Spec 17), nunca quebrando a tela; nomes de ícone válidos DOCUMENTADOS no catálogo gerado (hoje ícone é a exceção não documentada da regra dura de tokens); e a conclusão "manualChunks não reduz bundle em renderizador de manifesto" registrada no `vite.config.ts` gerado pelo `init` e/ou na skill, para não voltar como achado na próxima rodada de teste.

Ao terminar: gates `RegistryParity`/`catalog:check`/`npm run build` verdes; `run_audit.mjs` sem regressão (compare com o baseline conhecido, não espere 0); suítes de `src/components/atomic/Cards`, `Templates` e `Icon` verdes (snapshots dos 5 cards mudam de propósito — revise cada um); frontmatter da spec + checkbox (item 18) no `00-indice.md` + entrada no `00-progresso.md` com os NÚMEROS de antes/depois.
```

---

## P20 — Spec 42: Generalizar SarakCoreCard / SarakCardGrid (follow-up da Spec 30)

> Follow-up da Spec 30 (decisão HITL de 2026-07-21): não bloqueia nenhum Selo, mas fecha a mesma classe de defeito (domínio LLM embutido) que sobrou fora do escopo nomeado da 40. Pode rodar a qualquer momento depois da Spec 30 — sem dependência do re-Selo/Teste Real.

```
Execute a spec `specs/plan/42-generalizar-cardgrid-corecard.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 42 inteira; (4) leia a relacionada `specs/plan/30-fechamento-achados-pos-selo.md` (o precedente direto — mesma solução aplicada ao `SarakActionCard`) e a entrada de 2026-07-21 no `00-progresso.md` (as 4 decisões HITL que criaram esta spec). Skills de execução: `sarak:padrao-typescript` e `ui-refatorar-componente` (o tipo público `SarakCardGridProps.mapping` perde campos — paridade/quebra de contrato).

Contexto essencial: `SarakCoreCard` (`src/components/atomic/Templates/components/SarakCoreCard.tsx`) é a variante `"classic"` — a DEFAULT de `SarakCardGrid` — e tem o mesmo domínio de catálogo de modelos LLM que o `SarakActionCard` tinha antes da Spec 30: painel fixo "Custo In/Out (1M)" e "Janela de Contexto" com aritmética embutida (`Number(context)/1000`), bloco "Tokenizer", default de subtitle `'Modelo'`. Pior: a interface pública `SarakCardGridProps.mapping` (`SarakCardGrid.tsx` linhas 36-47) declara `price_in?`/`price_out?`/`context?` NO TIPO, já publicado no catálogo (`docs/manifest-catalog.md`, seção `SarakCardGrid`) — removê-los é BREAKING CHANGE de contrato tipado, não só de comportamento.

Ordem obrigatória: (1) criar `SarakCoreCard.test.tsx` (caracterização do comportamento ATUAL, snapshot) ANTES de tocar no componente; (2) só então generalizar o painel de detalhes para `mapping.details` (mesmo modelo da Spec 30 — array de pares `{label, value}` pré-formatados pelo consumidor, sem aritmética de domínio na Sarak); (3) remover `price_in`/`price_out`/`context` do tipo `SarakCardGridProps.mapping`; (4) escrever nota de migração (antes/depois) e remover a nota temporária que a Spec 30 deixou no catálogo/skill sobre esta pendência.

Entregue: os 4 itens da seção 2 da spec (2.1 a 2.4); `SarakCardGrid.test.tsx` com fixtures migradas para `details`; catálogo regenerado (a seção `SarakCardGrid` reflete o tipo novo); nota de migração documentada.

Ao terminar: gates `RegistryParity`/`catalog:check`/`npm run build` verdes; `run_audit.mjs` sem regressão (baseline conhecido); suítes de `src/components/atomic/Templates` verdes; frontmatter da spec 42 + checkbox (item 20) no `00-indice.md` + entrada no `00-progresso.md`. Pré-requisito: a **Spec 41 (P18)** deve ter rodado antes — vocês tocam `SarakCoreCard`/`SarakCardGrid` em comum; se por algum motivo a 43 ainda não rodou, PRESERVE a troca de ícone que ela fará (use o átomo `SarakIcon`, nunca `import * as LucideIcons` com índice dinâmico).
```
