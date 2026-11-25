---
tipo: "plan"
titulo: "Identidade white label: o cromo mostra a marca do sistema, a marca acompanha a organização e a lib ensina o uso"
objetivo: "Fazer o SarakAppChrome mostrar o nome e o logo da marca gravada quando o importador não passa brand, fazer a marca acompanhar a troca de organização, e documentar no kit do consumidor como montar um sistema white label sobre a porta de marca"
dominio: "Identidade do host / Cromo"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "release-9-0-0", "white-label", "branding", "cromo", "identidade"]
relacionados: ["[[05-cromo-e-slots]]", "[[06-painel-de-customizacao-e-preview]]", "[[08-identidade-do-host-e-zero-marca]]", "[[12-kit-do-consumidor]]"]
depende_de: ""
retida_por: ""
destino_sintese: "08-identidade-do-host-e-zero-marca; 05-cromo-e-slots"
---

# 1. Objetivo

Num sistema white label, cada organização tem nome, logo, nome da aba e texto de login próprios, guardados pelo importador e editados
pelo administrador no painel. A lib já tem quase tudo para isso:
- a porta `options.branding` (`initial` + `onChange`);
- os campos no painel e o atalho "Usar minha marca";
- `onMediaUpload` para enviar o logo;
- `useSarakUI()` entregando `systemName` e `logoUrl` com a marca por cima do design.

Faltam duas coisas no código e uma na documentação:

1. **O cromo não mostra a marca.** O `SarakAppChrome` só desenha o que chega pela prop `brand`. Sem ela, a barra fica sem nome, mesmo com
   a marca gravada. O importador acaba fixando o nome em código, e o que o administrador grava no painel não aparece na barra.
2. **A marca não acompanha a organização.** `useBrandingManager` lê `options.branding.initial` uma vez, na montagem. O tema recarrega
   quando `options.persistence.tenantId` muda; a marca não, e a marca da organização anterior continua na tela.
3. **A lib não ensina o white label.** Não há guia que junte essas portas num fluxo para o importador seguir.

# 2. Contexto

- **Divergência spec × código que esta plan resolve:**
  - **O que a spec promete:** `[[08-identidade-do-host-e-zero-marca]]` §2 (linha da porta 2) diz que `config.systemName` alimenta o "rótulo de marca no cromo
    (sidebar/topbar)". Isso valia no `SarakShell`, que lia `systemName || brand.name` (§8).
  - **O que mudou:** o `SarakShell` saiu com o ADR-018, e o `SarakAppChrome` nunca passou a ler `systemName`
    (`src/components/Layout/SarakAppChrome.tsx:48`, `src/components/Layout/chrome/ChromeSlots.tsx:81-125`: só `brand`).
  - **O que esta plan faz:** volta a cumprir a promessa, em vez de apagá-la da spec.
- **A fonte do valor:** `mergeUIContextValue` (`src/core/Provider/mergeUIContextValue.ts:41-45`) já resolve
  `systemName = branding.companyName || design.systemName` e `logoUrl = branding.logoBase64 || design.logoUrl`. O cromo deve ler daí,
  não refazer a precedência.
- **A prévia do painel** já usa `activeDesign.systemName` com nome de amostra (`PreviewSystemRenderer.tsx:156`). Ela fica como está.
- **Validação real:** o hub-iarendel fixa `brand={{ name: 'Hub Iarendel' }}` e não liga `branding.onChange`. É o importador que vai
  usar o resultado desta plan. O hub **não** é alterado aqui.
- **Nível de release:** aditivo (o importador que passa `brand` não vê diferença). Entra na 9.0.0-rc.2.

# 3. Escopo

## 3.1 Dentro

- `SarakAppChrome` e `SarakAppChromeMobile`: o campo de `brand` ausente cai no valor de `useSarakUI()`.
- `useBrandingManager`: semear de novo a partir de `options.branding.initial` quando `options.persistence.tenantId` muda.
- Testes dos dois comportamentos.
- Documentação para o importador:
  - uma seção "White label" em `docs/identidade-do-host.md`;
  - a §3.12 do guia do consumidor (fonte do `npm run guide`) com o exemplo mínimo e o ponteiro;
  - a skill `ui-integra-consumidor`;
  - a nota em `docs/migracoes.md`.

## 3.2 Fora

- Porta nova de carga da marca (`branding.onLoad`). O importador carrega antes do render, como já faz com o tema. Se a medição mostrar que
  isso não basta, vira backlog.
- Logo escuro separado na marca (`logoDarkUrl` existe só no design).
- A identidade que mora no design (`systemName` e `logoUrl` do tema). Ela continua existindo com a mesma precedência. Remover seria major.
- A perda de chaves preservadas na troca de tema (`keepPalette`, `savedPalettes`, `systemName`), que é medida pela `plan-173`.
- Qualquer alteração no hub-iarendel.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` | as portas, a precedência, a regra de zero marca e o `zero-brand:check` |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | a prop `brand`, o slot `logo` e `brandDisplay` |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | o atalho "Usar minha marca" e os campos de marca |
| Spec fixa | `specs/specs/12-kit-do-consumidor.md` | como o guia e a skill do consumidor são gerados e conferidos |
| Código | `src/core/Provider/hooks/useBrandingManager.ts` | a semente de hoje |
| Código | `src/core/Provider/mergeUIContextValue.ts` | a precedência que o cromo deve consumir |
| Código | `src/components/Layout/chrome/ChromeSlots.tsx` | onde a marca é desenhada |
| Doc do consumidor | `docs/identidade-do-host.md` | onde entra a seção "White label" |

# 5. Instruções de execução

## Lote 1 — código e testes

1. **Cromo:** em `SarakAppChrome` e `SarakAppChromeMobile`, monte a marca efetiva por campo:
   - **nome:** `brand.name`, senão `useSarakUI().systemName`;
   - **logo:** `brand.logoUrl`, senão `useSarakUI().logoUrl`;
   - **o slot `logo`** continua vencendo a imagem, como hoje.

   String vazia conta como ausente. Sem nenhum dos três, o cromo fica como hoje (sem nome), e nenhum texto de marca é inventado: a regra
   de zero marca (`[[08-identidade-do-host-e-zero-marca]]` §1) vale.
2. **Organização:** em `useBrandingManager`, quando `options.persistence.tenantId` muda:
   - semeie de novo com `{ ...DEFAULT_BRANDING, ...options.branding.initial }`;
   - **não** chame `onChange` nessa semeadura, porque ela é carga e não edição;
   - com o mesmo `tenantId`, uma mudança de `initial` não reescreve o que o usuário editou.
3. **Testes:**
   - cromo sem `brand`, com marca gravada: nome e logo aparecem, nas duas orientações e no móvel;
   - `brand` explícito vence campo a campo;
   - slot `logo` vence;
   - sem nada, zero texto de marca;
   - troca de `tenantId`: a marca nova aparece, a antiga some e `onChange` não é chamado;
   - mesmo `tenantId` com `initial` novo: a edição do usuário fica.

## Lote 2 — documentação do white label

1. **`docs/identidade-do-host.md`, seção nova "White label":**
   - **marca × tema:** a marca é da organização e o tema é estilo. Por isso a marca fica numa tabela própria, e trocar de tema não a
     toca;
   - **os campos:** `companyName`, `tabName`, `loginName` e `logoBase64` (que aceita URL), e quem os edita no painel;
   - **o fluxo completo:**
     - carregar a marca antes do primeiro render e passar em `options.branding.initial`;
     - gravar em `onChange`;
     - enviar o logo por `onMediaUpload`, devolvendo a URL do storage em vez de guardar base64 na linha;
     - não passar `brand` fixo ao `SarakAppChrome`, para que o cromo mostre a marca gravada;
   - **por organização:** a tabela tem a chave da organização, `tenantId` vai em `options.persistence`, e a marca acompanha a troca;
   - **precedência:**
     - na barra: `brand` > marca > `systemName` do design;
     - no título da aba: `tabName` > `systemName`;
     - favicon só com logo;
   - **modo embarcado:** não escreve título nem favicon;
   - **primeiro quadro:** o servidor pode injetar a marca no HTML junto com o tema;
   - **o que a lib não faz:** nenhuma requisição, nenhum default de marca;
   - **um exemplo completo:** sugestão de colunas, `GET`/`PUT` e o código do Provider, com nomes genéricos ("Empresa", "Marca"),
     nunca o nome da lib, de pessoa ou de empresa.
2. **Guia do consumidor, §3.12:** acrescente o exemplo mínimo do white label e o ponteiro para a seção. Edite a fonte, rode
   `npm run guide`, e confira que `npm run guide:check` passa.
3. **Skill `ui-integra-consumidor`:** a pergunta "o sistema é white label?" na integração, com o caminho da seção.
4. **`docs/migracoes.md`:** uma seção `## 9.0.0 — o cromo mostra a marca do sistema sem a prop brand, e a marca acompanha a organização
   (aditivo)`. Diga o que muda para quem não passa `brand`: a barra, que ficava sem nome, passa a mostrar a marca gravada.
5. **`[[08-identidade-do-host-e-zero-marca]]` §2:** não edite. A síntese ajusta.

# 6. Critérios de aceite

- [ ] `SarakAppChrome` e `SarakAppChromeMobile` sem `brand`, com marca gravada, mostram o nome e o logo dela. Prova: teste.
- [ ] `brand` explícito e o slot `logo` vencem, campo a campo. Prova: teste.
- [ ] Sem `brand` e sem marca, nenhum texto de marca aparece, e `npm run zero-brand:check` passa.
- [ ] A troca de `tenantId` troca a marca sem chamar `onChange`, e o mesmo `tenantId` preserva a edição. Prova: teste.
- [ ] A seção "White label" existe em `docs/identidade-do-host.md` com tudo o que o lote 2.1 lista, e o exemplo compila contra a API
      pública (os nomes de prop e de opção conferem com `src/core/Provider/types.ts` e `providerProps.ts`).
- [ ] A §3.12 do guia e a skill apontam para ela, e `npm run guide:check` passa.
- [ ] A nota de migração existe.
- [ ] Nenhum outro comportamento do cromo muda (suíte do cromo e `cromo-css-real:check` verdes).

# 7. Como verificar (uso do revisor)

**Gate:** `npm run verify -- --tier=full`, mais `npm run cromo-css-real:check`, porque a mudança toca componente do cromo.

- `git diff --stat`: só os arquivos do §3.1, os testes e os gerados do `npm run guide`.
- Ler os testes novos e mutar a regra:
  - trocar a ordem `brand` > marca precisa derrubar um teste;
  - remover a semeadura por `tenantId` precisa derrubar outro.
- Conferir o exemplo da seção "White label" contra `types.ts` e `providerProps.ts`, nome a nome.
- `npm run zero-brand:check` e o grep de citação de plan nos arquivos tocados.

# 8. Destino da síntese

- **`[[08-identidade-do-host-e-zero-marca]]`:**
  - §2: a porta 2 volta a ser verdade, agora pelo `SarakAppChrome`, com a precedência campo a campo;
  - §6: a semeadura por `tenantId`;
  - um ponteiro para a seção "White label" do documento do consumidor.
- **`[[05-cromo-e-slots]]`:** a prop `brand` é opcional campo a campo e cai na marca do contexto.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-25

**Resultado:** Concluído (lotes 1 e 2)

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
?? specs/plan/plan-172-validacao-da-9-0-0-rc-1-no-hub-por-interacao-com-a-tela.md
?? specs/plan/plan-173-cobertura-completa-da-9-0-0-rc-1-no-navegador.md
?? specs/plan/plan-174-identidade-white-label-no-cromo-e-por-organizacao.md
```

**O que foi feito**
- `src/components/Layout/chrome/useEffectiveBrand.ts` (novo): `brand.name`/`brand.logoUrl` ausentes ou vazios caem no `systemName`/`logoUrl` de `mergeUIContextValue`; sem Provider e sem valor, devolve a marca como veio.
- `SarakAppChrome.tsx` e `SarakAppChromeMobile.tsx`: usam o hook (prop renomeada para `brandProp` internamente). O `SarakAppChrome` ficou em 250 linhas (teto): uni `designNav`/`device` numa declaração e `secondaryContent` na linha do `shared`.
- `useBrandingManager.ts`: semeia de novo de `{ ...DEFAULT_BRANDING, ...initial }` quando `persistence.tenantId` muda (estado derivado durante o render), sem chamar `onChange`.
- Docs: seção 5 "White label" em `docs/identidade-do-host.md`; subseção no §3.12 de `sarak-ui/GUIA-FRONTEND.md`; pergunta "white label?" na skill; seção 9.0.0 em `docs/migracoes.md`; `npm run guide` regenerou `sarak-ui/`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/Layout/chrome/useEffectiveBrand.ts` | criado | marca efetiva campo a campo |
| `src/components/Layout/SarakAppChrome.tsx` | alterado | usa o hook |
| `src/components/Layout/SarakAppChromeMobile.tsx` | alterado | usa o hook |
| `src/core/Provider/hooks/useBrandingManager.ts` | alterado | nova semeadura por `tenantId` |
| `src/components/Layout/__tests__/SarakAppChrome.brand.test.tsx` | criado | 7 casos |
| `src/components/Layout/chrome/__tests__/useEffectiveBrand.test.ts` | criado | 2 casos (sem Provider) |
| `src/core/Provider/hooks/__tests__/useBrandingManager.test.ts` | alterado | substitui o teste vazio por 4 casos |
| `docs/identidade-do-host.md`, `docs/migracoes.md` | alterado | seção White label e nota |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | subseção no §3.12 |
| `.agents/skills/ui-integra-consumidor/SKILL.md` (e `.claude/skills/...`, link) | alterado | pergunta white label |
| `sarak-ui/docs/migracoes.md`, `sarak-ui/skill/SKILL.md` | alterado (gerado) | `npm run guide` |

**Verificações executadas**
- `npx vitest run src/components/Layout src/core/Provider` → 109 arquivos, 1068 testes passando (antes do teste do hook; os dois arquivos do hook rodaram depois: 2 passando, e `SarakAppChrome.test.tsx` seguiu verde).
- `npm run verify -- --tier=quick` → `tsc` ok; `audit:baseline` acusou 2 regressões minhas (hook sem teste; `SarakAppChrome.tsx` com 251 linhas), corrigidas; `npm run -s audit:baseline -- --with-tsc` repetido → "igual ao baseline, nenhuma regressão"; demais checks do quick `[OK]`.
- `npm run guide:check` → kit em dia (9 arquivos). `npm run zero-brand:check` → 851 arquivos, zero marca. Grep de citação de plan nos arquivos de código tocados → nada.
- Não rodei: suíte completa, `cromo-css-real:check`, mutação das regras (são do revisor).

**Critérios de aceite**
- [x] cromo sem `brand` mostra nome/logo gravados (sidebar, topbar, celular) — `SarakAppChrome.brand.test.tsx`
- [x] `brand` explícito e slot `logo` vencem — mesmo arquivo
- [x] sem marca, zero texto de marca; `zero-brand:check` passa
- [x] troca de `tenantId` sem `onChange`; mesmo `tenantId` preserva edição — `useBrandingManager.test.ts`
- [x] seção White label com os itens do lote 2.1
- [x] §3.12 e skill apontam para ela; `guide:check` passa
- [x] nota de migração
- [ ] suíte do cromo e `cromo-css-real:check` verdes — suíte de Layout/Provider verde; `cromo-css-real:check` não rodado (do revisor)

**Decisões e suposições**
- Hook próprio em vez de editar `ChromeSlots`, para a mesma precedência nas três variantes.
- A §3.12 vive em `sarak-ui/GUIA-FRONTEND.md` (prosa editada à mão; o gerador só mexe entre marcadores).
- O exemplo do doc declara o tipo `Brand` e usa `Telas` como marcador; nomes de prop conferidos com `types.ts` (`branding`, `persistence.tenantId`, `SarakBrandingState` no barril) e `providerProps.ts` (`onMediaUpload`).

**Achados fora do escopo (não corrigidos)**
- `run_audit.mjs` lista `SarakMultiSelect.tsx` e `SarakUploader.tsx` como FAIL; o baseline os tolera (igual ao baseline).

**Pendências / riscos**
- `useBrandingManager` escreve `brandingRef` durante o render na troca de `tenantId` (padrão de estado derivado); vale o revisor olhar.
- Hub-iarendel não alterado; nada commitado.

---

## Resumo da execução (correção 1) — 2026-11-25

1. **Mobile direto sem teste** — `SarakAppChrome.brand.test.tsx`: caso novo monta `SarakAppChromeMobile` sem `brand` e com marca gravada (nome e logo). Evidência: com `useEffectiveBrand(brandProp)` trocado por `brandProp` em `SarakAppChromeMobile.tsx`, esse caso falha (1 falha, 7 passando); código restaurado depois (diff do arquivo voltou a 3+/1-).
2. **Exemplo contra a própria regra** — `docs/identidade-do-host.md`: `loaded` guarda `{ organizationId, initial }` e o Provider só monta quando `loaded.organizationId === organizationId`; o `useEffect` não zera mais o estado.
3. **Formato do PUT** — mesmo arquivo: `toRow` (inverso de `toState`) aplicado em `JSON.stringify(toRow(brand))`; a frase das rotas diz que o `PUT` usa as colunas do `GET`.
4. **Nota de migração** — `docs/migracoes.md`: diz que quem passa só um campo (ex.: só `name`) e tem logo na marca ou no design passa a ver o logo, e o inverso para só `logoUrl`.
5. **Cast no teste** — `useBrandingManager.test.ts`: `initial` tipado `Partial<SarakBrandingState>`, `as unknown as SarakUIOptions` removido; `tsc --noEmit` sem erros.

**Verificações:** `npx vitest run` dos dois arquivos de teste → 12 passando; `npx tsc --noEmit` limpo; `npm run guide` regenerou `sarak-ui/docs/migracoes.md` e `guide:check` → kit em dia. Não rodei `verify --tier=full` nem `cromo-css-real:check` (do revisor). Nada commitado; hub-iarendel intacto.

# 10. Veredito

## Veredito — 2026-11-25 — 🔴 Reprovado

**O que foi verificado:**
- **Escopo:** `git status` e `git diff --stat` mostram só os arquivos do §3.1, os testes e os gerados do `npm run guide`. Nada fora do
  escopo.
- **Código lido inteiro:**
  - `useEffectiveBrand` reaproveita `mergeUIContextValue`, sem refazer a precedência;
  - a semeadura por `tenantId` é estado derivado no render, sem `onChange`.
- **Mutação numa cópia fora do repositório, com 3 arquivos de teste e 13 casos.** A linha de base passou 13/13. Seis mutações derrubam
  ao menos um teste:
  - contexto vencendo `brand`;
  - sem recuo do nome;
  - sem recuo do logo;
  - sem semeadura por `tenantId`;
  - semeadura chamando `onChange`;
  - semear a cada `initial` novo.
- **A mutação que sobrevive** está no achado 1.
- **Anel 0 simulado** sobre as linhas adicionadas e não rastreadas: limpo. Grep de citação de plan no código tocado: limpo.
- **Não rodado:** `verify --tier=full` e `cromo-css-real:check`. Ficam para a correção, para rodar uma vez só sobre o código final.

**Achados:**

1. **`src/components/Layout/__tests__/SarakAppChrome.brand.test.tsx`: o `SarakAppChromeMobile` usado direto não tem teste.**
   - Trocar `useEffectiveBrand(brandProp)` por `brandProp` em `src/components/Layout/SarakAppChromeMobile.tsx` deixa os 13 casos
     verdes.
   - Os casos de celular montam o `SarakAppChrome`, que já entrega a marca efetiva ao móvel. O hook do móvel só age quando o importador
     monta o `SarakAppChromeMobile` direto, e ele é componente público.
   - Critério violado: 1 ("`SarakAppChromeMobile` sem `brand`, com marca gravada, mostra o nome e o logo dela. Prova: teste").
   - Correção: um caso montando o `SarakAppChromeMobile` sem `brand` e com marca gravada, que caia com a mutação descrita.
2. **`docs/identidade-do-host.md:169`: o exemplo completo contraria a regra da linha 123.**
   - A regra diz: "Carregue a marca da organização nova antes de trocar o `tenantId`".
   - O exemplo limpa `initial` num `useEffect`, que roda **depois** do render. Nesse render o Provider recebe o `tenantId` novo com o
     `initial` da organização anterior, e a semeadura grava a marca antiga sob a organização nova.
   - Correção: guardar o `initial` junto da organização para a qual foi carregado e só montar o Provider quando os dois coincidirem.
     Assim o exemplo segue a própria regra.
   - Critério violado: 5 (o exemplo é o fluxo que o importador copia).
3. **`docs/identidade-do-host.md:187`: o exemplo grava num formato e lê em outro.**
   - O `PUT` envia o `SarakBrandingState` em camelCase (`JSON.stringify(brand)`).
   - O `GET` devolve a linha com as colunas sugeridas (`company_name`…), lida por `toState`.
   - Correção: a conversão inversa antes do `PUT`, para o exemplo gravar o que ele mesmo lê. Critério violado: 5.
4. **`docs/migracoes.md:12`: a nota não diz o que muda para quem passa `brand` parcial.**
   - Ela trata "quem passa `brand` completo" e "quem não passa".
   - Quem passa só `name` (o caso do hub-iarendel) e tem logo na marca ou no design passa a ver o logo na barra. É uma mudança visível,
     e a nota precisa nomeá-la.
   - Critério violado: 7.
5. **`src/core/Provider/hooks/__tests__/useBrandingManager.test.ts:9`: `as unknown as SarakUIOptions` cala o tipo.**
   - Todos os campos de `persistence` e de `branding` são opcionais (`src/core/Provider/types.ts`), então a fábrica cabe tipada sem cast.
   - Sinal de atalho (`[[00-prompt-revisor]]` §7.1, item 7). Correção: tipar `initial` como `Partial<SarakBrandingState>` e remover o
     cast.

## Veredito — 2026-11-25 — 🟢 Aprovado

A correção 1 resolve os cinco achados do veredito anterior. O que foi verificado:

- **Mutação numa cópia fora do repositório, com 3 arquivos de teste e 14 casos.** A linha de base passou 14/14, e as **7** mutações
  derrubam ao menos um caso cada:
  - contexto vencendo `brand`;
  - sem recuo do nome;
  - sem recuo do logo;
  - sem semeadura por `tenantId`;
  - semeadura chamando `onChange`;
  - semear a cada `initial` novo;
  - `SarakAppChromeMobile` sem o hook, que antes sobrevivia.
- **Exemplo da seção "White label"** (`docs/identidade-do-host.md`):
  - o Provider só monta quando `loaded.organizationId === organizationId`, então a marca antiga nunca chega com o `tenantId` novo;
  - o `PUT` grava `toRow(brand)`, no mesmo formato que o `GET` lê.
- **Nota de migração:** cobre o `brand` parcial (só `name` ou só `logoUrl`). O teste usa `Partial<SarakBrandingState>` sem cast.
- **`npm run verify -- --tier=full`:** verde em `tsc`, suíte completa (4574 s), `audit:baseline --with-tsc`, os gates do Anel 1,
  `zero-brand:check`, `guide:check` e o Anel 0 simulado. O único vermelho foi o `plan-index:check` da `plan-175`, que mudou o status
  sem regenerar o índice. Não é desta plan, e o índice foi regenerado.
- **`npm run cromo-css-real:check`** (build e bateria de navegador): 892 passaram e 2 foram pulados, sem falha.
- **Escopo:** só os arquivos do §3.1, os testes e os gerados do `npm run guide`. Nenhuma citação de plan no código tocado.
