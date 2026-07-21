# Relatório de Instalação — Sarak-UI (@sarak/lib-ui-core) no ERP Earendel (Rodada 2 / Re-Selo)

Segunda rodada do Selo da Onda. A primeira (2026-07-20) foi **NEGADA** (nota 6,5/10, ver
`RELATORIO-INSTALACAO-UI-rodada1.md`) e motivou uma rodada de correção (specs 27/28/29). Este teste
reinstala a Sarak-UI **do zero** no ERP Earendel (previamente desinstalado pela spec 31), como um
consumidor externo sem contexto da lib — só pelo caminho oficial (`npm install github:...` →
`npx @sarak/lib-ui-core init` → skills instaladas → catálogo `manifest-catalog.md`), sem ler o
código-fonte da lib e sem nenhum contorno proibido pela regra 2 do protocolo (Spec 26). Validação real
via automação de navegador headless (CDP nativo, sem dependência instalada no consumidor) + `curl` nos
endpoints + `npm run build`.

---

## 1. Ambiente e tempo total

- **SO:** Windows 11 Pro 10.0.26200
- **Node:** v24.10.0
- **npm:** 11.6.1
- **Diretório do consumidor:** `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP`
- **Tempo total:** ~48 min corridos (2026-07-20 ~23:33 → 2026-07-21 ~00:21). Instalação + scaffold + 1ª
  tela no ar levaram **< 10 min**; o restante foi validação funcional real (formulário, Design Engine,
  persistência, erro proposital) via automação de browser para gerar evidência objetiva de cada item da
  matriz.

---

## 2. Passo a passo executado (comandos reais, na ordem)

```bash
cd "C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP"

npm init -y                                                # diretório não tinha package.json (spec 31 removeu por completo)

npm install github:Lib-Sarak/Sarak-Lib-UI-Core             # added 300 packages in 1m — instalou CORRETO no ERP desta vez

npx @sarak/lib-ui-core --help                               # flags descobertas via --help real, não por acidente

npx @sarak/lib-ui-core init --yes                            # Modo=app Stack=vite-express Storage=sqlite
                                                              # "12 arquivo(s) escrito(s)."
                                                              # "1 pulado(s) (já existiam; use --force p/ sobrescrever): package.json:dependencies.@sarak/lib-ui-core"

npm install                                                 # peerDeps gravadas pelo init — added 248 packages in 10s

# edição do manifesto (6 rotas: /, /propostas, /contratos, /projetos, /design, /qa-erro-proposital)
# via skill ui-integra-escrever-manifesto + docs/manifest-catalog.md
# edição de src/server.ts SÓ com endpoints de exemplo (GET propostas/contratos, GET/POST projetos) — plumbing, não UI

npm run dev                                                 # backend :3000, frontend :5175 (5173/5174 ocupadas por outro processo da máquina)

# validação funcional completa via automação de browser headless (CDP) + curl — ver seções 4 e 7

npm run build                                               # tsc --noEmit + vite build → ✓ built in 20.77s
```

Editei apenas os arquivos permitidos pela regra 2: `src/manifests/app.manifest.json` e `src/server.ts`
(endpoints Express de exemplo — backend, não UI). Nenhum componente React novo foi escrito no consumidor;
nenhum arquivo em `node_modules/@sarak/lib-ui-core` foi tocado.

---

## 3. O que funcionou DE PRIMEIRA, sem intervenção

- `npm install github:Lib-Sarak/Sarak-Lib-UI-Core` — instalação limpa no diretório correto, sem scripts
  de post-install suspeitos.
- `npx @sarak/lib-ui-core --help` — ajuda completa e precisa, lista todas as flags (`--mode`, `--stack`,
  `--storage`, `--schema`, `--backend-port`, `--frontend-port`, `--force`, `--yes`) com defaults
  documentados e avisa o comportamento não-interativo (falha com exit 1 e instrução, nunca sai em
  silêncio) — **Problema 2 da rodada 1 fechado**.
- `npx @sarak/lib-ui-core init --yes` — gerou os 12 arquivos do Golden Path, com `vite.config.ts` já
  trazendo o proxy `/api` → `:3000` pré-configurado.
- Tela padrão do template (`/` e `/design`) renderizou perfeitamente na primeira carga, shell +
  `SarakShellNav` com todos os itens, zero warning no console.
- Lista com `source`/`states`/`renderFor` (rota `/propostas`) funcionou exatamente como o exemplo
  canônico da skill.
- Grid de cards (rota `/contratos`, `SarakGrid` + `SarakActionCard` + `source`) funcionou de primeira, em
  grade real (não empilhamento flex) — cobertura nova pedida para esta rodada.
- Formulário com `validation` + `submit: true` funcionou exatamente como documentado, sem nenhuma
  tentativa/erro.
- `npm run build` do consumidor: verde na primeira tentativa.
- Design Engine acessível em `/design`, +20 temas prontos, preview ao vivo refletindo a tela real.

---

## 4. Problemas, um a um

### Problema 1 — Design Engine exige "Commit por categoria" antes de "Aplicar Alterações Globais" ter efeito (não documentado)
- **Sintoma:** mudar um valor (ex.: Estrutura de Navegação de Sidebar → Topbar) e clicar direto em
  "Aplicar Alterações Globais" não teve efeito visível na app real — o rótulo de estado continuou
  "SALVAR" (sujo). Só depois de perceber que cada categoria expandida tem um botão próprio
  **"Commit 0. Configurações Globais (2)"** (preciso clicar nele primeiro) é que "Aplicar Alterações
  Globais" passou a funcionar.
- **Onde apareceu:** motor (`CustomizationPanel`), não documentado em nenhuma skill nem no catálogo.
- **Bloqueou?** Não — descoberto por inspeção visual da própria tela (o botão está visível, só não é
  mencionado em nenhuma instrução).
- **O que fiz:** registrei e segui; nenhum contorno aplicado.

### Problema 2 — Modal "Persistência de Tema" — confirmado, e agora DOCUMENTADO (achado positivo)
- **Sintoma:** ao personalizar um tema padrão (read-only), abriu o modal "Persistência de Tema" pedindo
  para salvar como Novo Tema.
- **Onde apareceu:** motor (`CustomizationPanel`).
- **Bloqueou?** Não — e a skill `ui-integra-escrever-manifesto` **já avisa isso explicitamente** ("Temas
  padrão da biblioteca são READ-ONLY — personalizar exige 'Salvar como Novo Tema' (esperado, não é bug)").
  Este é o Problema 5 da rodada 1: **a documentação foi corrigida e bate 100% com o comportamento real.**
- **O que fiz:** preenchi o nome e salvei; o tema foi persistido e ativado normalmente.

### Problema 3 — Bundle de produção grande, sem code-splitting por rota
- **Sintoma:** `dist/assets/index-*.js` em **3,9 MB (993 KB gzip)**; Vite avisa "Some chunks are larger
  than 500 kB after minification".
- **Onde apareceu:** build do consumidor (Vite).
- **Bloqueou?** Não — build passa verde, é aviso de performance.
- **O que fiz:** apenas registrei (contorno de `manualChunks`/lazy-loading estaria fora do escopo do
  teste). **Já rastreado — ver seção "Relação com a Spec 30" abaixo.**

### Problema 4 — `SarakActionCard.label` não determina o texto do botão do card
- **Sintoma:** `"label": "Ver contrato"` esperado no botão do card; o botão renderizado sempre mostra
  "EXECUTAR" (rótulo fixo interno).
- **Onde apareceu:** componente (`SarakActionCard`); catálogo não documenta a semântica real da prop
  `label` neste componente (só lista o tipo `string`).
- **Bloqueou?** Não — cosmético; a tela funciona, só o texto do botão não é customizável como o nome
  sugere.
- **O que fiz:** registrei e segui (contornar exigiria componente React próprio, proibido pela regra 2).

Nenhum dos quatro pontos impediu a entrega das telas pedidas.

---

## 5. Avaliação das instruções

As duas skills (`ui-integra-escrever-manifesto`, `ui-auditoria-manifesto`) e o
`docs/manifest-catalog.md` bastaram para construir **100% das telas pedidas**, sem nenhuma leitura do
código-fonte da lib. A skill de manifesto está sensivelmente mais madura que na rodada 1: já traz, numa
seção "Erros comuns a evitar", exatamente os erros de autoria testados neste relatório (token de
espaçamento inventado, `actions` como objeto, `body` em vez de `params`, form sem `submit: true`) — sinal
de que a correção realimentou a documentação com os achados reais da rodada 1, não só o motor.

Único ponto onde precisei adivinhar: o passo de "Commit por categoria" antes de "Aplicar Alterações
Globais" no Design Engine (Problema 1) — não está em nenhuma skill nem no catálogo, só descoberto
navegando visualmente pela UI.

---

## 6. Contornos que teriam sido necessários (e que a regra 2 proibiu) — não aplicados

**Nenhum.** Todas as telas pedidas foram construídas inteiramente por manifesto JSON + o plumbing gerado
pelo `init` + endpoints de exemplo em `server.ts` (backend, não UI). Não houve `registerComponent`, edição
de `node_modules`, nem nenhum componente React de interface escrito à mão.

---

## 7. Matriz de medição M1–M10

| # | Critério | Resultado | Evidência |
|---|---|---|---|
| M1 | init gera projeto completo em 1 comando | **PASS** | `init --yes` → "12 arquivo(s) escrito(s)." — projeto completo na primeira execução. |
| M2 | install+dev sobem sem ajuste manual, sem poluir diretório ancestral | **PASS** | `npm install`+`npm install`+`npm run dev` sem edição manual; `node_modules`/`package.json` só em `...\ERP` — o `C:\Users\Igor\node_modules` pré-existente (de outro projeto) tem timestamp anterior ao teste, não tocado. **Problema 1 da rodada 1 (FAIL) fechado.** |
| M3 | telas do template corretas de primeira | **PASS** | Home e `/design` renderizaram completos, zero warning, na primeira carga. |
| M4 | erro de autoria proposital não derruba a tela e o warn ensina | **PASS** | Token `spacing-xxl` inventado + `actions` como objeto: tela de pé, console ensina a correção exata ("Você quis dizer 'spacing-xl'?" / exemplo de `actions` correto). |
| M5 | lista com source+states funciona pelo exemplo da skill | **PASS** | `/propostas` carregou via `source`+`states`+`renderFor` copiados do exemplo canônico, sem ajuste. |
| M6 | formulário completo (validação barra submit; toasts) | **PASS** | Submit vazio: 3 erros inline, zero toast de sucesso, zero chamada de rede (`curl` confirma nenhum registro vazio criado). Submit válido: toast de sucesso + `curl` confirma só o registro válido persistido. **Problema 4/M6 FAIL da rodada 1 fechado.** |
| M7 | topbar/navigationStyle personalizada reflete ao vivo sem quebrar o layout | **PASS** | `navigationStyle: "topbar"` aplicado ao vivo → navegação full-width com os 6 itens visíveis, sem faixa cortada. **Achado crítico 0 (Spec 27) fechado.** |
| M8 | tema persiste após reload | **PASS** | Reload completo da SPA manteve a navegação em topbar — persistido via storage escolhido na entrevista (SQLite). |
| M9 | skills+catálogo bastaram (zero leitura do código-fonte da lib; pacote sem o fonte) | **PARCIAL** | Zero leitura de código-fonte para aprender a usar a lib. Empacotamento: `node_modules/@sarak/lib-ui-core` não tem `specs/`/`playwright/`/componentes-fonte (Problema/achado da rodada 1 fechado), **mas existe uma pasta `src/`** contendo só `src/styles/sarak-base.css` (declarado em `package.json.files`, não é vazamento de componente — mas viola a expectativa literal de "pacote sem `src/`"). |
| M10 | zero contorno necessário | **PASS** | Nenhum `registerComponent`, nenhuma edição de `node_modules`, nenhum componente React de UI no consumidor. |

**Resumo: 9 PASS, 1 PARCIAL, 0 FAIL.** Os dois achados FAIL/crítico da rodada 1 (M2 instalação e M6
validação) e o achado crítico 0 da triagem (M7 topbar) estão fechados e comprovados com evidência de
interação real.

---

## 8. Veredito final

**Nota: 9,3/10.**

A instalação é, na prática, plug-and-play: `npm init -y` → `npm install github:...` → `npx @sarak/lib-ui-core init --yes` → `npm install` entregam um app completo, rodando, com shell, navegação, Design Engine e
persistência funcionando. Os dois achados críticos da rodada 1 — **M6 (validação não barrava submit
vazio)** e **M7 (topbar cortado/estreito)** — estão decisivamente corrigidos: testei ativamente tentar
quebrá-los (submit vazio real via automação de browser + `curl` no endpoint; troca de `navigationStyle`
ao vivo) e os dois se comportaram exatamente como esperado. A skill de manifesto também amadureceu:
documenta hoje, com exemplos "❌ ERRADO", precisamente os erros reais que apareceram na rodada anterior.

O que ainda tira uma nota mais alta:
1. O passo de "Commit por categoria" no Design Engine não está documentado em nenhuma skill/catálogo —
   único ponto em que precisei adivinhar por exploração visual.
2. Bundle de produção grande sem code-splitting por rota (3,9 MB / 993 KB gzip no chunk principal).
3. `node_modules/@sarak/lib-ui-core/src/` ainda existe (só 1 CSS, mas viola a expectativa literal de
   "pacote sem `src/`") e a prop `label` do `SarakActionCard` não documenta sua semântica real.

**As 3 melhorias que mais sentiria falta:**
1. Documentar o fluxo "Commit da categoria → Aplicar Alterações Globais → (possível) modal Salvar Novo
   Tema" na skill `ui-integra-escrever-manifesto` ou num guia dedicado ao Design Engine.
2. Mover `src/styles/sarak-base.css` para dentro de `dist/` no `package.json.files`, eliminando qualquer
   pasta `src/` de dentro de `node_modules/@sarak/lib-ui-core` (fecha M9 para PASS puro).
3. `build.rollupOptions.output.manualChunks` (ou lazy-loading por rota) sugerido por padrão no
   `vite.config.ts` gerado pelo `init`.

---

## Relação com a Spec 30 (Polimento pós-Selo) — checar antes de executar

A Spec 30 já foi planejada a partir dos achados **da rodada 1** (não bloqueantes, execução após o
re-Selo). Cruzando com os achados desta rodada 2:

- **Achado 7 da Spec 30 (bundle sem code-splitting, baseline "3,9 MB / 992 KB gzip")** é **o mesmo
  problema do Problema 3 acima** ("3,9 MB / 993 KB gzip" — mesma ordem de grandeza, mesmo chunk
  principal). **A Spec 30 já cobre este item** — nenhuma spec nova necessária para o code-splitting;
  a melhoria 3 desta rodada (manualChunks por padrão no `vite.config.ts` do `init`) é escopo adjacente
  dentro da mesma seção 2.2 da Spec 30 (vale mencionar/expandir ao executá-la).
- **Achado 6 da Spec 30 (`renderFor` sem chave natural além de `id`/`uuid`)** e **achado 8 (warning de
  `input[type=color]`)** não foram re-testados diretamente nesta rodada (o roteiro funcional não forçou
  os dois cenários), mas continuam válidos como estavam — sem mudança de status.
- **NÃO cobertos pela Spec 30** (achados novos desta rodada 2, fora do escopo dela — candidatos a uma
  spec própria ou a um adendo, não incluídos automaticamente na execução da 30):
  - Problema 1 (fluxo "Commit por categoria" no Design Engine não documentado);
  - Problema 4 (`SarakActionCard.label` não define o texto do botão / catálogo não documenta a
    semântica real da prop);
  - Melhoria 2 (pasta `src/` dentro do pacote publicado — só 1 CSS, mas ainda presente).
