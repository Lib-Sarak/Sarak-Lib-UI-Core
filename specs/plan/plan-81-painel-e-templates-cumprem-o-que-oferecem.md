---
tipo: "plan"
titulo: "Fazer o painel de design e os templates cumprirem o que oferecem"
objetivo: "Fazer o badge legível em todo tema, os templates aceitarem dado pronto, a busca do painel registrar a primeira tecla, o painel desfazer a última aplicação e mostrar o rascunho na tela real sem gravar nada"
dominio: "Sarak-Lib-UI-Core / Painel de design · Templates · Badge"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "painel", "templates", "badge", "contraste", "usabilidade"]
relacionados: ["[[specs/06-painel-de-customizacao-e-preview]]", "[[specs/09-temas-e-presets]]", "[[arquitetura/03-superficie-publica]]", "[[016-preferencias-do-usuario-separadas-do-tema]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md · specs/09-temas-e-presets.md · arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Cinco coisas que a lib oferece passam a funcionar como prometem:
- o `SarakBadge` é legível em todo tema;
- `SarakTable` e `SarakCardGrid` renderizam dado que o consumidor já tem, sem rede;
- a busca do painel registra a primeira tecla;
- o painel desfaz a última aplicação;
- enquanto o painel está aberto, o rascunho aparece **na tela real** de quem edita — sem gravar nada e sem
  chegar a mais ninguém.

# 2. Contexto

Tudo aqui saiu do pente fino no ERP (a plan de usabilidade no consumidor real). O revisor conferiu cada item
no código antes de escrever:

1. **O badge some em tema de borda opaca.** A variante `muted` (o default *soft*) do `SarakBadge` usa o
   token de **borda** como fundo: `bg-[var(--theme-border)] text-[var(--theme-muted)]`
   (`src/components/atomic/Feedback/SarakBadge.tsx:71`). `--theme-border` é `cardBorderColor`, cujo contrato
   é *"borda sutil, baixa opacidade"*. No `neo-brutalism`, que usa borda branca sólida de propósito, o badge
   ficou branco sobre branco, contraste ~1:1 (medido na tela). É o **único** fundo com token de borda em
   `src/components/`. O `auditor_contraste` não mede esse par, então nenhum gate viu.
2. **`SarakTable` ignora a prop `data`.** Ele a desestrutura como `initialData` e nunca a usa
   (`src/components/atomic/Templates/SarakTable.tsx:46` — a única ocorrência no arquivo): sempre busca por
   `endpoint`. `SarakCardGrid` nem declara `data` (`SarakCardGrid.tsx:82`, só `endpoint`). O irmão
   `SarakStats` aceita `data` e funciona sem rede (`SarakStats.tsx:15`). Um consumidor com o dado em mãos
   (cache, SSR, resposta de outra chamada) precisa fingir um endpoint.
3. **A busca do painel perde a primeira digitação** logo depois de abrir a aba Design. Reproduzido duas
   vezes, por dois métodos, no ERP. A leitura do código não mostrou um efeito que zere o termo — **a causa
   precisa ser reproduzida antes de consertar**.
4. **Não há desfazer depois de "Aplicar".** Existe reverter **um token do rascunho**
   (`src/features/DesignEngine/hooks/useDesignDraft.ts:175`), mas nada que volte ao estado anterior a um
   "Aplicar". Hoje a saída é lembrar o valor antigo, ou reaplicar o tema inteiro e perder as outras
   customizações.
5. **O rascunho só aparece numa maquete.** A barra real, onde o usuário está clicando, só muda depois de
   "Aplicar". Por isso o badge ilegível só apareceu **depois** de aplicar.

**Decisões do dono (2026-09-18):**
- as cinco numa plan só;
- o desfazer tem **um nível**;
- a prévia na tela real **entra**.

**Por que a prévia na tela real agora é segura — e o que a spec diz de errado.**
[[06-painel-de-customizacao-e-preview]] §4 justifica a maquete dizendo que a conversão claro↔escuro
"degradaria a paleta de forma acumulativa". Isso ficou velho com a camada de preferências
([[016-preferencias-do-usuario-separadas-do-tema]]). O modo é sobreposto ao design efetivo **a cada render,
a partir do tema salvo**, e nunca gravado nele (`src/core/Provider/utils/overlayPreferences.ts:62-79`), então
nada se acumula. Os dois cuidados reais que sobram são de engenharia: **não gravar nem espalhar** o rascunho,
e **voltar exato** ao descartar. O mecanismo de sobreposição que as preferências já usam é o modelo.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Feedback/SarakBadge.tsx` — o fundo da variante `muted` soft.
- `gates/scripts/audit/verify_contrast.ts` (e o teste dele) — o par fundo-do-badge × texto passa a ser
  medido, **se** o fundo escolhido não for um par que o auditor já mede (§5 passo 1).
- `src/components/atomic/Templates/SarakTable.tsx` · `SarakCardGrid.tsx` e os hooks de dado deles —
  aceitar `data`.
- `src/features/DesignEngine/**` — a busca, o desfazer e a prévia (os arquivos que os passos 3 a 5 exigirem).
- `src/core/Provider/**` — **só** o que a prévia precisar para sobrepor o rascunho ao design efetivo.
- Os testes de cada arquivo tocado.
- `docs/migracoes.md` — a mudança visual do badge `muted`, sob a **7.0.0**.
- `dist/` · `sarak-ui/` · `docs/component-catalog.*` · `sarak-dev/` — **só pelos geradores**.

## 3.2 Fora
- Temas. A recalibração é a outra metade da `plan-80`, e depende desta.
- Default de qualquer token.
- Histórico de vários níveis, refazer, ou desfazer que sobreviva ao recarregar a página.
- O consumidor (ERP).
- A mecânica da camada de preferências — a prévia a **usa**, não a altera.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | §4 — rascunho × sistema e a porta única de aplicar; §6 — o Gêmeo Digital |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | §4.4 — persistência e sincronização entre abas (o que a prévia **não** pode disparar); §4.7 — a camada de preferências; §6.5 — o `auditor_contraste` |
| ADR | `specs/adr/016-preferencias-do-usuario-separadas-do-tema.md` | o padrão de sobreposição que a prévia reutiliza |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | contrato público dos templates |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R31 (contraste) · R34 (átomo sem Provider) · R36 (código não cita o rastro) |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `padrao-typescript` · `ui-arquitetura-design` | sempre; o token certo para o fundo do badge |
| Skill | `test-unitario` | os testes de cada item |
| Código | `src/core/Provider/utils/overlayPreferences.ts` · `src/features/DesignEngine/hooks/useDesignDraft.ts` · `src/components/atomic/Templates/SarakStats.tsx` | o modelo de sobreposição, o rascunho, e o contrato de `data` a imitar |

# 5. Instruções de execução

1. **Badge.** O fundo da variante `muted` soft deixa de usar o token de borda e passa a usar um token de
   superfície com contrato de fundo. Meça: o par fundo × texto do badge passa a 4,5:1 em **todo** tema
   shippado, nos dois modos. Se esse par já for um dos que o `auditor_contraste` mede (por exemplo, texto
   apagado sobre superfície), registre qual e não duplique. Se não for, acrescente-o ao auditor, com teste
   que **cai** num tema de borda opaca. Nenhum outro componente muda.

2. **Templates com dado pronto.** `SarakTable` e `SarakCardGrid` aceitam `data`, no mesmo contrato do
   `SarakStats`:
   - com `data`, renderizam o dado e **não** fazem chamada de rede;
   - sem `data`, buscam por `endpoint`, como hoje.

   `endpoint` passa a opcional no `SarakCardGrid`. Testes nas duas direções, mais o caso "não muda nada" (só
   `endpoint`, igual a hoje) e a prova de que nenhum fetch ocorre com `data`.

3. **Busca do painel.**
   - **Primeiro reproduza**, por teste (digitação imediatamente depois de montar a aba), a perda da
     primeira tecla.
   - **Parada:** se o teste não reproduzir o defeito, pare e relate; não conserte às cegas.
   - Reproduzido: conserte, e o teste passa a ser o de regressão.

4. **Desfazer a última aplicação.** Imediatamente antes de "Aplicar", o painel guarda o design que estava
   no sistema. Aparece um controle **"Desfazer última aplicação"**. Acioná-lo devolve aquele design **pelo
   mesmo caminho do "Aplicar"**: sistema, persistência e porta de gravação do consumidor. Um nível só:
   - desfeito, o controle some;
   - uma nova aplicação substitui a foto guardada;
   - recarregar a página a descarta.

   Testes: aplicar → desfazer volta ao anterior, **e** a persistência recebe o valor restaurado; nada para
   desfazer → o controle não aparece.

5. **O rascunho na tela real.** Enquanto o painel está aberto **e** o rascunho difere do sistema, o design
   efetivo **da tela de quem edita** passa a ser o sistema com o rascunho por cima. As preferências do
   usuário continuam por cima de tudo, como hoje. Regras, cada uma com teste:
   - **nada é gravado**: nem `localStorage`, nem a porta `persistence.onSave`, nem a porta do tema;
   - **nada é espalhado**: a sincronização entre abas não dispara;
   - **"Aplicar"** grava de verdade, pelo caminho de hoje;
   - **"Descartar"** ou **fechar o painel** devolve a tela exatamente ao estado do sistema.

   A maquete do painel (simulação de dispositivo) continua existindo.

6. **Nota de migração** sob a 7.0.0: o badge `muted` muda de fundo (o que o consumidor pode ver de
   diferente). Os outros itens são aditivos.

7. Rode os geradores, `npm run build`, `npm run audit`,
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc`, `npm run trail-citation:check` e a
   suíte inteira (`npx vitest run --maxWorkers=3`). Leia a saída de cada um.

# 6. Critérios de aceite

- [ ] Badge `muted`: o fundo não usa o token de borda, e o par fundo × texto passa a 4,5:1 em todo tema
      shippado, nos dois modos — medido, com o par nomeado no resumo.
- [ ] `SarakTable` e `SarakCardGrid` renderizam `data` sem nenhuma chamada de rede; só com `endpoint`, o
      comportamento é o de hoje.
- [ ] A perda da primeira tecla foi reproduzida por teste antes do conserto, e o teste é o de regressão.
- [ ] Desfazer: volta ao design anterior pelo caminho do "Aplicar" (persistência inclusa); um nível; some
      depois de usado.
- [ ] Prévia na tela real: com rascunho, a tela de quem edita mostra o rascunho; nada é gravado nem
      sincronizado; "Aplicar" grava; "Descartar" e fechar o painel devolvem o estado do sistema.
- [ ] Nota de migração sob a 7.0.0.
- [ ] `audit` e `check-audit-baseline --with-tsc` sem regressão; `trail-citation:check` verde; suíte inteira
      verde.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum novo` — `auditor_contraste` (existente) passa a medir o par do badge, se ele ainda não for
medido; o resto é teste de módulo.

- `git status` + `git diff --stat` → só a §3.1, mais os gerados.
- Badge: `npm run audit` com contraste 0 e 0. **Mutação:** fundo de volta ao token de borda → o gate (ou o
  teste do par) cai no `neo-brutalism`.
- Templates: **mutação** que ignora `data` → o teste de "nenhum fetch com `data`" cai.
- Prévia: **mutação** que grava no `localStorage` durante a prévia → o teste de "nada é gravado" cai.
- Desfazer: medir pelo caminho real (a persistência recebe o valor restaurado), não pelo retorno da função.
- Anel 0 simulado sobre os arquivos alterados e os não rastreados; `tsc` com o gate do Anel 2.
- `npx vitest run --maxWorkers=3 > arquivo 2>&1`, sem mutação rodando ao mesmo tempo.

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md` · `specs/09-temas-e-presets.md` · `arquitetura/03-superficie-publica.md`

- **`06-painel-de-customizacao-e-preview`** §4: sai o argumento da degradação acumulativa, que a camada de
  preferências tornou falso. Entram a prévia na tela real (as quatro regras) e o desfazer de um nível.
- **`09-temas-e-presets`** §6.5: o par do badge no `auditor_contraste`, se ele entrar.
- **`arquitetura/03-superficie-publica`**: os templates aceitam `data`, no contrato comum aos três.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
