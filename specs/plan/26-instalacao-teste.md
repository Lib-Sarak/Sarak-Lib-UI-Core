---
tipo: "spec"
titulo: "Instalação Teste (Selo da Onda — importar a Sarak-UI no ERP e TESTAR a instalação)"
dominio: "Teste de aceitação em consumidor real / Qualidade da instalação"
status: "🔴 A Implementar"
prioridade: "Máxima"
tags: ["spec", "teste-de-aceitacao", "instalacao", "erp", "selo-da-onda", "plug-and-play"]
relacionados: ["25-limpeza-testes-praticos", "21-scaffolder-init", "22-skills-de-consumo-golden-path", "08-consumo-externo-e-integracao"]
---

# 1. Visão Geral e Objetivo

Importar a `@sarak/lib-ui-core` no sistema `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP` (previamente limpo pela spec 25) — **mas o objetivo NÃO é instalar; é TESTAR a instalação**. A instalação em si é o instrumento; o produto é a **medição** de se a promessa da onda "Renderizador Genérico" (specs 16-24 + 21/22) se cumpre em campo: plug-and-play real, interface 100% via manifesto, instrução embarcada suficiente, zero contorno.

Diferença crítica de postura: numa instalação normal, um obstáculo se contorna; **neste teste, um obstáculo se REGISTRA** — cada dificuldade é um dado de qualidade da biblioteca, e contorná-la silenciosamente destruiria a medição. A tentativa anterior no mesmo ERP (pré-onda) falhou e gerou 2 relatórios que motivaram 9 specs; esta é a re-medição nas mesmas condições.

# 2. Protocolo do Teste

## 2.1 Executor e isolamento
- Executado por **agente EXTERNO, sem nenhum contexto desta base** (outra conversa) — o prompt autocontido é o **P10** de `00-prompts-execucao.md` (fonte única do texto; esta spec define o protocolo que o P10 materializa).
- Pré-condição: spec 25 executada (ERP sem nenhum resíduo Sarak; confirmar via grep antes de começar — resíduo achado = executar/completar a 25 primeiro e registrar).

## 2.2 Regras do teste (invalidam a medição se violadas)
1. **Só o caminho oficial:** `npm install github:Lib-Sarak/Sarak-Lib-UI-Core` → `npx @sarak/lib-ui-core init` (entrevista/flags) → skills instaladas pelo init (`ui-integra-consumidor` → `ui-integra-escrever-manifesto` → `ui-auditoria-manifesto`) + catálogo `docs/manifest-catalog.md` do pacote.
2. **Contornos PROIBIDOS:** modificar `node_modules/@sarak/*`; patch/postinstall sobre a lib; componente React de UI no consumidor (só o plumbing que o init gera). Necessitou de contorno → registra como falha da lib e segue (ou marca o item como FAIL).
3. **Instrução embarcada apenas:** proibido ler o código-fonte da lib para descobrir uso — se skills/catálogo/erros não bastarem, isso É um achado (falha de instrução).

## 2.3 Roteiro funcional (o que construir para exercitar a lib)
1. App Modo App a partir do template starter: shell + navegação (Início, Propostas, Contratos, Projetos, Design Engine).
2. ≥1 tela de **lista com carga automática** (`source` + states loading/empty/error + `renderFor`) contra endpoint do backend gerado pelo init (dados de exemplo bastam; Supabase real do ERP é bônus).
3. ≥1 **formulário** com `model` + `validation` + `api_call` + toasts de sucesso/erro (`onError`).
4. **Design Engine**: `/design` abre, personalização aplica ao vivo (ex.: cor da topbar), tema salvo **persiste após reload** (storage escolhido na entrevista do init).
5. Validação real: `npm run dev` (backend+frontend de pé), telas conferidas no browser, `npm run build` do consumidor verde.

# 3. O que MEDIR (a matriz que transforma instalação em teste)

Cada item recebe **PASS / PARCIAL / FAIL** no relatório, com evidência (mensagem/print/saída literal):

| # | Medição | O que prova |
|---|---|---|
| M1 | `init` gera projeto completo em 1 comando (peerDeps gravadas, scripts, template, skills copiadas) | Spec 21 |
| M2 | `npm install` + `npm run dev` sobem backend+frontend sem nenhum ajuste manual | Golden Path real |
| M3 | Telas do template renderizam corretas de primeira (espaçamentos aplicados, sem "tela torta") | Spec 16 |
| M4 | Erro de autoria proposital (ex.: token inventado, `actions` como objeto) NÃO derruba a tela e o warn ensina a correção | Specs 16/17 |
| M5 | Lista com `source`+states funciona conforme o exemplo da skill (sem "botão Carregar") | Spec 22 |
| M6 | Formulário completo (validação barra submit; toasts zero-config) | Motor/Dispatcher |
| M7 | Topbar personalizada no Design Engine reflete ao vivo no shell | Spec 18 |
| M8 | Tema salvo persiste após reload (storage da entrevista) | Specs 19 + 21 |
| M9 | Skills+catálogo bastaram (zero consulta ao código-fonte da lib) | Spec 22 |
| M10 | Zero contorno necessário do início ao fim | Onda inteira |

# 4. Entregável (produto do teste)

`RELATORIO-INSTALACAO-UI.md` na raiz do ERP + reproduzido na conversa, com: (1) ambiente e tempo; (2) passo a passo real; (3) o que funcionou de primeira; (4) problemas um a um (sintoma exato, onde, bloqueou?, o que fez); (5) avaliação das instruções (onde precisou adivinhar); (6) contornos que teriam sido necessários; (7) **matriz M1-M10 preenchida com evidências**; (8) veredito plug-and-play **0-10** justificado + 3 melhorias mais sentidas.

# 5. Critérios de Aceite (desta spec — meta-nível)
- [ ] Pré-condição verificada (ERP limpo, spec 25 🟢).
- [ ] Teste executado por agente externo via P10, sem violação das regras 2.2 (violação declarada = teste inválido, repetir).
- [ ] Relatório entregue completo, com a matriz M1-M10 preenchida com evidências.
- [ ] **Triagem dos achados registrada no `00-progresso.md` da lib:** cada FAIL/PARCIAL vira item classificado (bug de lib / lacuna de skill-catálogo / lacuna do init) com destino (correção direta, nova spec, ou aceito com justificativa).
- [ ] **Selo da Onda:** concedido se M1-M10 = PASS (PARCIALs aceitos só com justificativa registrada). Caso contrário, a onda ganha uma rodada de correção e o teste se repete após ela.

# 6. Pós-teste
- Selo concedido → registrar na memória do projeto + índice (onda encerrada); o ERP segue como consumidor real de referência.
- Selo negado → os achados são a matéria-prima da próxima rodada (mesmo ciclo: specs → execução → revisão → re-teste). Não corrigir "no calor" dentro do próprio teste — a separação medição/correção é o que mantém o relatório honesto.

# 7. Plano de Testes (Quality Gate)
- [ ] O próprio teste É o gate (matriz M1-M10 com evidências).
- [ ] Verificação de integridade do teste: git do ERP sem nenhuma modificação em `node_modules/@sarak/*`; grep confirma ausência de patch; nenhum `.tsx` de UI criado fora do plumbing do init.
