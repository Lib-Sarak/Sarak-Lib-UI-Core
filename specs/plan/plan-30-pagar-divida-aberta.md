---
tipo: "plan"
titulo: "Pagar os cinco achados abertos da dívida conhecida"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida técnica"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "divida", "gates", "r7", "temas", "eol"]
relacionados: ["[[15-divida-conhecida]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[09-temas-e-presets]]"]
depende_de: ""
destino_sintese: "specs/15-divida-conhecida.md · specs/01-gates-e-baseline.md"
objetivo: "Zerar a seção de achados abertos da spec de dívida conhecida"
---

# 1. Objetivo

A §3.1 de [[15-divida-conhecida]] — *"Segurança e medição"* — fica **vazia**: os cinco achados abertos
(**33 · 35 · 37 · 38 · 39**) saem da lista porque foram corrigidos, não porque foram aceitos.

# 2. Contexto

Os cinco são a **mesma categoria declarada pela própria spec**: *gate que mede errado ou não mede*. É isso
que os une numa plan só — cada um é pequeno, local, e verificável isoladamente, mas todos pagam a mesma
dívida e todos saem da mesma seção.

⚠️ **Três dos cinco (38, 39 e o já fechado 40) foram achados OLHANDO O CONSUMIDOR**, com a suíte verde e
todos os gates no baseline. É a advertência que a §3.1 daquela spec já carrega: **suíte verde não é produto
correto**.

**Reconferidos por medição direta no worktree limpo, em 2026-08-11** — o executor não precisa refazer a
investigação, só o conserto:

| # | Confirmação de que ainda está vivo |
|---|---|
| **33** | `ls .gitattributes` → *No such file or directory*; `git config --get core.autocrlf` → `true` |
| **35** | descrito em [[15-divida-conhecida]] §3.1 com a medição da `plan-21` (27 × 24); **não reconferido aqui** — ver §5, passo 2 |
| **37** | `SarakToast.tsx:84-85` — `var(--color-theme-card,#1e293b))` e `var(--sarak-text-main,#ffffff))`, os dois com parêntese a mais |
| **38** | `grep -rn "sarak-status-error-color-bg" src/` → **5 arquivos** consumindo; nenhum schema declara `generateVariants` para os tokens de status |
| **39** | `generate_theme_template.ts:59` — `designProps += \`${key}: ${value},\`` interpola objeto cru; os tokens responsivos (`{mob,tab,desk}`) viram `[object Object]` |

## 2.1 O que cada um custa hoje

- **39 é o mais caro.** Ele quebra o **segundo comando do fluxo documentado de criação de tema**
  (skill `ui-criar-tema`): o arquivo gerado não faz parse. Sem reparo manual fora do fluxo, **nenhum tema
  sai do papel**. Passou dois ciclos despercebido porque o aceite contava **chaves**, nunca **valores**.
- **37 é o mais barato e é bug visível:** duas declarações CSS malformadas são descartadas pelo parser, e o
  toast fica **sem fundo e sem cor de texto próprios**, herdando o que estiver atrás.
- **38 é uma metade de código e uma metade de gate.** O fundo de status **não é governado pelo tema** — o
  fallback duro sempre vence. E é a razão de o par texto-de-status estar **fora** do `auditor_contraste`
  (R31), declarado com número (7/18 e 5/18).
- **35 é a outra metade do mesmo gate:** o detector perde entradas por ordem de propriedade. É a suspeita de
  por que o `auditor_ghostvars` **não pegou o 38**.
- **33 produz falso vermelho:** sem `.gitattributes` e com `core.autocrlf=true`, qualquer `checkout` reescreve
  `sarak-dev/` em CRLF e o `dev-kit:check` acusa "defasado" comparando byte a byte. Foi reportado como
  *"pré-existente, fora do escopo"* por **dois** executores antes de a causa ser medida.

# 3. Escopo

## 3.1 Dentro
- `.gitattributes` — **criar** (achado 33)
- `gates/scripts/audit/auditor_ghostvars.mjs` — o detector (achados 35 e a metade de gate do 38)
- `src/components/atomic/Feedback/SarakToast.tsx` — as duas linhas (achado 37)
- `src/core/Design/schema/` **ou** os consumidores de `--sarak-status-*-color-bg` — a metade de código do
  achado 38, conforme a rota escolhida (§5, passo 4)
- `.agents/skills/ui-criar-tema/scripts/generate_theme_template.ts` — o gerador (achado 39)
- Os `__tests__/` correspondentes a cada conserto — **obrigatórios** (R8)
- `gates/baselines/audit-baseline.json` — **só** se um número melhorar, e só via `npm run audit:baseline -- --write`

## 3.2 Fora
- ⛔ **Toda spec de `specs/`.** A remoção das linhas em [[15-divida-conhecida]] e a atualização do baseline
  em [[01-gates-e-baseline]] são **síntese** (§9), feita pelo revisor. O executor não edita spec
  ([[00-prompt-executor]] §7.3).
- ⛔ **Ampliar escopo de qualquer gate além do necessário para o achado.** Se consertar o detector do 35
  revelar exposição nova, ela **entra no baseline e vira achado numerado** — não é consertada de carona.
  É a regra que [[15-divida-conhecida]] §8 fixa.
- ⛔ **Reescrever o `auditor_ghostvars` inteiro.** O achado é *"perde entradas por ordem de propriedade"* —
  o conserto é o parser, não a arquitetura.
- ⛔ Tocar em qualquer outro componente para "aproveitar a viagem". Achado fora da lista dos cinco vai para
  a seção *Achados fora do escopo* do resumo, e vira plan nova.
- ⛔ Rodar `npm version` ou empurrar qualquer coisa.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/15-divida-conhecida.md` §3.1 · §8 | o enunciado de cada achado e o contrato de manutenção |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` **R7** · **R11** · **R18** · **R8** | o namespace e a fonte emissora; Configuração × Expansão; o gate declara o que não vê; teste ao lado |
| Spec fixa | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` §6 | como o registro do `auditor_ghostvars` é construído e os 18 sufixos gerados |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §7 | o fluxo de criação de tema que o achado 39 quebra |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` §6 | a regra anti-afrouxamento — vale integralmente aqui |
| **Skill** | `padrao-escrita` · `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | todo conserto desta plan muda comportamento e leva teste |
| Código | `gates/scripts/audit/auditor_ghostvars.mjs` · `src/core/Design/schema/` | ler antes de editar |

# 5. Instruções de execução

> **Ordem obrigatória: 33 → 35 → 38 → 37 → 39.** O 33 primeiro porque, enquanto o EOL estiver solto,
> qualquer regeneração produz diff falso e envenena a verificação de tudo o que vem depois. O 35 antes do 38
> porque o detector é o instrumento com que o 38 se comprova consertado — **consertar o medido antes do
> medidor é como se chega a um verde que não vale nada**.

1. **Achado 33 — o fim de linha.** Criar `.gitattributes` normalizando os arquivos de texto do repositório
   para LF, **ou** fazer o comparador normalizar antes de comparar. Escolha uma das duas e **justifique no
   resumo**.
   ⚠️ Um `.gitattributes` novo pode reescrever o índice de arquivos já versionados. **Meça o efeito antes**
   (`git status` depois de criar) e declare no resumo **todo** arquivo que mudou de modo ou de conteúdo.
   **Pronto quando** `npm run dev-kit:check` continuar verde **e** um `checkout` do `sarak-dev/` não produzir
   mais diff fantasma.

2. **Achado 35 — o detector perde entradas.** A `plan-21` mediu **27** com varredura própria contra **24**
   do detector; as três a mais são `buttonHoverEffect`, `inputStyle`, `useTabularNums`. Reproduzir a
   diferença **primeiro** (é o teste que falha antes do conserto), depois corrigir o parser.
   **Pronto quando** um teste dedicado provar que as três entradas passam a ser vistas, e o `auditor_ghostvars`
   contar o mesmo que uma varredura independente sobre o mesmo insumo.

3. **⚠️ Parada obrigatória — reportar o efeito do passo 2.** Consertar o detector muda o número que ele
   reporta. **Antes de seguir, rode `npm run audit` e registre o novo valor de `auditor_ghostvars`.** Se ele
   **subir**, isso é exposição que estava escondida: ela **entra no baseline** com
   `npm run audit:baseline -- --write` e **cada item novo é relatado no resumo para virar achado numerado** —
   não é consertado aqui. Se **descer**, regrave o baseline pelo mesmo comando: teto folgado é gate desligado
   pela metade ([[01-gates-e-baseline]] §4.2).

4. **Achado 38 — o fundo de status.** O resultado exigido é: **o fundo dos blocos de status passa a ser
   governado pelo tema**, e o `auditor_ghostvars` (já consertado pelo passo 2) deixa de ter consumo que não
   resolve. Há duas rotas, e **a escolha é sua, com a medição na mão**:
   - **(a)** o token de status passa a gerar as variantes cromáticas — é **Expansão** (R11), e alcança
     também o par de contraste hoje excluído da R31;
   - **(b)** os consumidores passam a usar um nome que a engine já emite — é **Configuração**, mais barato,
     e não devolve o controle ao tema.
   ⚠️ **Meça antes de escolher** quantas variáveis a rota (a) faria a engine emitir a mais, e declare o
   número. Seja qual for a rota: **zero hardcode novo** (R2), paridade intacta (R4) e `run_audit` sem
   regressão.
   **Pronto quando** os 5 arquivos que consomem `--sarak-status-*-color-bg` resolverem contra uma fonte
   emissora real, com teste que prove.

5. **Achado 37 — o parêntese.** `SarakToast.tsx:84-85`: remover o parêntese excedente das duas declarações.
   São dois caracteres.
   ⚠️ **O conserto sem o teste não fecha o achado**, porque nenhum gate olha a sintaxe de `var()` dentro de
   string — foi exatamente por isso que ele sobreviveu. Escreva o teste que prova as duas declarações
   válidas. **Se você identificar um detector barato de `var()` desbalanceado, NÃO o construa aqui:** relate
   no resumo, e ele vira plan própria (é gate novo, e gate novo tem fronteira decidida antes —
   [[15-divida-conhecida]] §4).
   **Pronto quando** o teste passar e o toast tiver fundo e cor próprios.

6. **Achado 39 — o gerador de gabarito de tema.** `generate_theme_template.ts:59` interpola o valor cru; os
   **tokens responsivos** (`defaultValue` do tipo `{mob,tab,desk}`) viram `[object Object]` e o arquivo não
   compila (`TS1005` já na linha 75 da saída). Corrigir a serialização — serializar o objeto, ou achatar
   para o eixo `desk`, que é a convenção que os temas embarcados já usam. **Declare qual escolheu e por quê.**
   ⚠️ **O aceite deste passo é compilar a saída, não contar chaves.** Foi contar chaves (422 ✓) sem validar
   valores que deixou o defeito passar dois ciclos. **Pronto quando** existir um teste que **gera o gabarito
   e compila o resultado**, falhando se a saída não fizer parse.

7. **Fechar.** Rodar, nesta ordem, e colar **a saída real** no resumo:
   `npx vitest run` (INTEIRA — [[00-contexto]] §3) · `node gates/scripts/audit/run_audit.mjs` ·
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` ·
   `npm run dev-kit:check` · `git diff --stat`.
   **Declare toda métrica de baseline que se moveu, e em que direção.**

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-30-pagar-divida-aberta.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/15-divida-conhecida.md (§3.1 e §8), specs/specs/00-regras-e-invariantes.md
(R2, R7, R8, R11, R18), specs/arquitetura/04-contrato-de-tokens-e-paridade.md §6,
specs/specs/01-gates-e-baseline.md §6.
Skills a aplicar: padrao-escrita, padrao-typescript, test-unitario.

ORDEM OBRIGATÓRIA: 33 → 35 → 38 → 37 → 39. Consertar o medido antes do medidor produz
verde que não vale nada, e o EOL solto (33) envenena a verificação de todo o resto.

PARADA OBRIGATÓRIA no passo 3: depois de consertar o detector (35), rode `npm run audit`
e RELATE o novo número de auditor_ghostvars. Exposição que aparecer é registrada e
regravada no baseline — NUNCA consertada de carona.

LINHAS VERMELHAS:
  · Você NÃO edita nenhum arquivo de specs/ — a spec de dívida é atualizada pelo revisor.
  · Você NÃO amplia escopo de gate além do que o achado exige.
  · Você NÃO reescreve o auditor_ghostvars inteiro — conserte o parser.
  · Você NÃO constrói detector novo (o de `var()` desbalanceado): relate, vira plan própria.
  · Você NÃO relaxa allowlist nem exclui pasta de escopo para baixar número
    (01-gates-e-baseline §6).

Todo conserto leva teste ao lado (R8). O aceite do achado 39 é COMPILAR a saída do
gerador, não contar chaves — foi contar chaves que deixou o defeito passar.

Não commite. Ao terminar, escreva o resumo na própria plan, declarando cada baseline que
se moveu, e mova o status para 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] **33** — `.gitattributes` (ou a normalização no comparador) existe, e um `checkout` do `sarak-dev/`
      não produz mais diff fantasma. Todo arquivo reescrito pela mudança está **declarado** no resumo.
- [ ] **35** — teste dedicado prova que `buttonHoverEffect`, `inputStyle` e `useTabularNums` passam a ser
      vistos pelo detector; o número novo do `auditor_ghostvars` está relatado e o baseline, coerente.
- [ ] **37** — `SarakToast.tsx` sem parêntese excedente, com teste que prova as duas declarações válidas.
- [ ] **38** — os 5 consumidores de `--sarak-status-*-color-bg` resolvem contra fonte emissora real; a rota
      escolhida está justificada com medição; zero hardcode novo.
- [ ] **39** — existe teste que **gera o gabarito e compila a saída**, e ele falha se a saída não fizer parse.
- [ ] Cada conserto tem **teste ao lado** (R8) — `auditor_coverage` continua em 0 órfãos.
- [ ] `npx vitest run` **inteira**, verde, e **não encolheu**.
- [ ] `run_audit` **sem regressão** contra `gates/baselines/audit-baseline.json`; qualquer métrica que mudou
      está declarada, e o baseline foi regravado **pelo comando**, nunca à mão.
- [ ] `npx tsc --noEmit` → 0 erros (o baseline exige zero em produção **e** em teste).
- [ ] **Nenhum arquivo de `specs/` no diff.**

# 8. Como verificar (uso do revisor)

```bash
git diff --stat                         # nenhum specs/ ; só o que a §3.1 declara
git diff                                # ler INTEIRO nos arquivos que importam
ls -la .gitattributes && git config --get core.autocrlf
sed -n '82,88p' src/components/atomic/Feedback/SarakToast.tsx    # parênteses balanceados
grep -rn "sarak-status-error-color-bg" src/ | wc -l              # os 5 consumidores
npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
npm run dev-kit:check && npm run guide:check && npm run catalog:check
git diff gates/baselines/audit-baseline.json                     # mudou? o conserto correspondente está no MESMO diff?
```

**O que reprova, além do óbvio:**
- baseline que **melhorou sem conserto correspondente no diff** — é a desconfiança de
  [[01-gates-e-baseline]] §6.1, e ela vale integralmente aqui;
- teste que só monta e afirma `toBeTruthy()` no lugar do teste do achado 39 — o aceite é **compilar**;
- allowlist relaxada, pasta excluída de escopo, ou `@sarak-encapsula` usado para silenciar o que não é
  encapsulamento;
- exposição nova consertada de carona em vez de relatada.

# 9. Destino da síntese

**Destino:** `specs/15-divida-conhecida.md` · `specs/01-gates-e-baseline.md`

**Texto pronto para transporte, na síntese:**

- **`15-divida-conhecida` §3.1** — remover as linhas dos achados **33, 35, 37, 38 e 39** e acrescentar cada
  número à §6 (Achados FECHADOS) com o fechador (`plan-30`, data, e a rota escolhida onde houve escolha).
  A §3.1 fica **vazia**, e a categoria **permanece** — pelo contrato da §8 daquela spec, a seção é para onde
  volta o próximo achado da classe.
- **`15-divida-conhecida` §2** — atualizar a linha de estado pela **relação**, não pela cifra: todo número
  emitido aparece em exatamente uma das §3/§4/§5/§6. A própria §7 daquela spec já corrigiu esse critério uma
  vez por ter envelhecido; não reintroduza um total.
- **`01-gates-e-baseline` §3** — se `auditor_ghostvars` mudou de valor, a linha dele reflete o novo baseline,
  **datada**, apontando o JSON como fonte viva.
- **`00-regras-e-invariantes` R7** — se o achado 38 for fechado pela rota (a), a nota sobre o par de
  contraste excluído da **R31** deixa de valer, e a linha da R31 em `01-gates` §3 tem de ser reconferida.
  ⚠️ **Reconferir, não presumir:** rodar `npm run audit` e ler o `auditor_contraste` antes de escrever
  qualquer coisa.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
