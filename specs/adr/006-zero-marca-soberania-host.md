---
tipo: "adr"
titulo: "A lib nunca estampa a própria marca"
status: "🟢 Aceito"
tags: ["adr", "identidade", "zero-marca", "branding", "gate", "dx"]
relacionados: ["[[005-modelo-modulos-plugin-e-apps-separados]]", "[[001-tres-arquiteturas]]"]
substitui: ""
substituido_por: ""
---

# 1. Contexto e Problema

**Data da decisão: 2026-07-26.**

Na validação de browser de um consumidor real, a aba do navegador mostrava **"Sarak OS"**. Durante o carregamento aparecia o título que o importador escreveu no próprio `index.html`; quando o React montava, a biblioteca **sobrescrevia** com a marca dela.

A causa não era um bug isolado, era um **default**: o estado inicial de branding nascia com `companyName` e `tabName` valendo `'Sarak OS'`. Como o guard que escrevia o título só checava se havia valor, e o default era sempre truthy, a lib **sempre** sobrescrevia. O favicon já era condicional e se comportava corretamente. Havia ainda **dois efeitos independentes** escrevendo `document.title`, e qual vencia dependia da ordem de execução dos efeitos.

A primeira rodada de correção fechou a **fonte** — os defaults de identidade e o título da página. Estava certa, e não bastou.

**A revisão independente achou o furo: o vazamento não fechou, apenas mudou de string.** O grep da primeira rodada procurou por `'Sarak OS'`; a marca hardcoded espalhada pela base era `'Sarak Lib'`. Com o default de nome do sistema agora ausente, um componente de estado vazio que exibia `'Sarak OS'` **passou a exibir `'Sarak Lib'`** — literalmente uma regressão causada pela correção.

Havia uma **classe inteira** de literais de marca em componentes que o consumidor embute no produto dele: estado vazio, busca, cabeçalho de chat, rótulo padrão de chat. E a segunda rodada, ao confirmar cada ocorrência no código, achou **dois sinks além dos reportados** — um deles crítico: o `brand` padrão do `SarakShell` valia `{ name: "Sarak Lib" }`, e é **essa a fonte** do `brand.name` que a navegação lateral e a superior consomem. Sem corrigi-la, a afirmação de que a navegação "já cai na marca do consumidor" era falsa na prática. O outro era o rótulo padrão do widget de usuário.

Cinco sinks reportados, sete corrigidos.

# 2. Decisão

**A identidade da página é SEMPRE do importador, e a biblioteca nunca estampa a própria marca no produto do consumidor.**

A regra se desdobra em quatro cláusulas:

**1. Opt-in, não opt-out.** Título, favicon e rótulo de marca só são escritos quando o consumidor **fornece** o valor. Sem valor, a lib não age — o que estiver no `index.html` do importador permanece exatamente como ele escreveu, antes e depois do React montar.

**2. Defaults de identidade nascem AUSENTES.** É a distinção que sustenta tudo: em `SarakBrandingState` (`src/core/Provider/types.ts:186`), `companyName`, `tabName` e `logoBase64` são **identidade** e são opcionais; `loginName` é apenas **rótulo de UI** e mantém um texto genérico. Rótulo genérico não é marca.

**3. Uma fonte de verdade para o título.** Um único efeito decide `document.title`, com precedência do mais específico para o mais genérico: `branding.tabName` vence `config.systemName`. O segundo setter foi removido.

**4. Onde não houver fonte do consumidor, usa-se rótulo genérico de função — nunca `'Sarak …'`, e nunca um cabeçalho vazio.** A regra de fallback é determinística: existe `systemName`/`brand.name`? cai nele; senão, um nome de função ("Sistema", "Search Engine", "Chat Engine").

**A regra é cobrada por gate**, não por disciplina: `gates/scripts/contrato/check-zero-brand.mjs`, ligado ao `npm run build` como `zero-brand:check`. Ele varre por AST (API do compilador TypeScript) e só conta nós que são **texto de saída** — literais de string e `JsxText`. Comentário não conta, o que é essencial: as notas que *documentam* a correção citam a string antiga e não podem gerar falso positivo.

A allowlist tem exatamente **três arquivos**, todos painéis internos do Design Engine, cada um com o motivo escrito no próprio código. A justificativa é conceitual, não pragmática: esses painéis são a **ferramenta de autoria da própria lib**, não algo que o consumidor embute no produto dele. Eles podem citar a lib porque são a lib.

O contrato completo para o consumidor está publicado em `docs/identidade-do-host.md`, que viaja no pacote.

# 3. Consequências

- **Positivas:**
  - **A lib volta a ser infraestrutura invisível.** O produto do consumidor é do consumidor — nenhuma marca de terceiro aparece nele sem que ele peça.
  - **A regra é executável.** Um gate no build impede o carimbo de voltar em silêncio, que é exatamente como ele tinha chegado ali.
  - **Nenhuma capacidade foi removida.** Quem quer controlar título, favicon e marca continua controlando, por duas portas documentadas com precedência definida. O que saiu foi só o default que vazava.
  - **A escolha por AST em vez de regex foi decisiva.** Sem ela, o gate acusaria as próprias notas de migração e viraria ruído a ser ignorado — que é como gates morrem.
  - **A distinção identidade × rótulo** dá um critério reutilizável para qualquer campo futuro: se nomeia alguém, nasce ausente; se nomeia uma função, pode ter default.

- **Negativas (Trade-offs):**
  - **Mudança visível para quem dependia do default.** Um app que exibia "Sarak OS" na aba sem nunca ter configurado nada passa a exibir o próprio título. É a correção pretendida, mas é uma mudança de comportamento observável — registrada em `docs/migracoes.md`.
  - **Rótulos decorativos ficaram mais genéricos.** "Sarak Lib Core Engine" virou um nome de função. Perde-se um pouco de personalidade nos estados vazios em troca de neutralidade.
  - **A allowlist é uma porta que precisa ser vigiada.** Ela existe por um motivo legítimo, mas toda allowlist tende a crescer. A barra tem de continuar alta, e cada entrada tem de manter o motivo escrito.
  - **O gate cobre texto, não composição.** Ele acha um literal de marca; não acha uma marca montada por concatenação em runtime nem uma imagem. A cobertura é boa, não total.

> **A lição que este ADR registra, e que vale além do assunto:** **fechar a fonte não fecha o sink**, e **grep por UMA string não é auditoria**. A primeira rodada corrigiu o default corretamente e mesmo assim deixou o vazamento de pé, com outro nome. O que fechou de verdade foi varrer a classe do defeito, não a ocorrência relatada.
