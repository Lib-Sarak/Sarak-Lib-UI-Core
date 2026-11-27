# Persistência de tema no seu backend — o contrato do dado (opcional)

> Referência do contrato firmado nos ADR-003, ADR-009 e ADR-011. Este documento descreve **o que
> guardar**, caso você decida guardar. Ele não ativa nada sozinho.

## 0. Nada disto é obrigatório

**Sem nenhuma porta configurada, a lib funciona exatamente como sempre funcionou:** a seleção do
usuário vai para `localStorage`, e ponto. A lib nunca fala com um backend próprio — não tem
endpoint, não tem driver de banco, não pergunta nada a ninguém (ADR-003).

Este documento existe porque, quando **você** decide que o seu sistema precisa sincronizar tema
entre dispositivos ou guardar num banco seu, os tipos públicos (`SarakThemePayload`, `SarakThemeEntry`,
`SarakUIOptions`) dizem o **formato**, mas não dizem **o que fazer com ele**. Isto é a receita — um
ponto de partida que você copia inteiro, adapta, ou ignora. Quem guardar em arquivo, Mongo ou S3
não deve nada a ninguém: o schema em `docs/schema/` é **descritivo, nunca normativo**. Se algum dia
isto virar "sua tabela precisa ser assim", a decisão mudou de natureza e passa a exigir um ADR novo
— não é o que este documento é.

## 1. As duas coisas persistíveis

A lib entrega dois callbacks distintos porque são **duas entidades distintas**. Não são o mesmo
dado em dois formatos — misturá-las na mesma tabela/linha é o erro mais fácil de cometer lendo só
os tipos.

### 1.1 O estado aplicado — `options.persistence.onSave`/`onLoad`

O **design aplicado**, guardado pelo que foi **escolhido**: o tema (pelo id), a paleta, os tons da barra, o modo e o que foi
ajustado à mão. O que a paleta calcula não é gravado e a lib o refaz a cada carga — por isso trocar a paleta, o tom da barra
ou o modo depois de qualquer número de aplicações sempre chega à tela. No painel, escolher
um tema na decisão **Tema** (ou uma opção nas demais decisões) muda apenas o rascunho; a prévia aparece imediatamente na tela
de quem está editando, sem gravar. `Aplicar (N)` é a ação que
confirma esse rascunho no Provider e persiste o estado aplicado; com a estratégia padrão (`hybrid`),
isso também grava a chave de `localStorage` do tenant. A porta recebe três argumentos:

```ts
onSave?: (design: SarakThemePayload, activeThemeId?: string, format?: 2) => Promise<void> | void
```

- `design` — as escolhas: só as chaves cujo valor difere do que o tema do id produz com a paleta e os tons escolhidos. Nenhuma
  chave nova entra no dicionário, e ele pode vir vazio (`{}`) para quem aplicou um tema sem mexer em nada. **Pode não
  corresponder a nenhum tema salvo.** A escolha na
  decisão **Tema** e as opções das demais decisões ficam no rascunho até `Aplicar (N)`; antes disso, não chamam esta porta nem gravam
  o estado aplicado.
- `format` — `2` quando `design` traz só as escolhas. **Guarde-o e devolva-o no `onLoad`**: sem ele, a lib lê o gravado como
  dado do formato anterior (abaixo). Vem `undefined` quando o tema do id não estava em memória no instante de gravar; aí
  `design` vai inteiro, como antes, e nada é descartado.
- `activeThemeId` — o id do tema que estava efetivamente no ar no instante do save.
  **Opcional de verdade:** vem `undefined` sempre que não há nenhum tema resolvido ainda. Pode
  apontar tanto para um tema embarcado da lib (`'minimalist-airy'`, por exemplo) quanto para um
  tema salvo pelo importador — a lib não distingue as duas origens neste campo.

**Duas chaves de paleta que o importador não precisa tratar à parte** (ADR-027). `keepPalette` (booleano) e `savedPalettes` (texto)
são escolhas do design do sistema como qualquer outra: gravadas pelo `onSave` quando diferem do padrão (`false` e `''`), devolvidas
pelo `onLoad`. `savedPalettes` guarda as paletas criadas no painel com nome (`id|nome|valor` separadas por `~`, até 24); a troca de
tema não a apaga, e a lib descarta a entrada inválida ao carregar. Se o seu servidor valida a lista de chaves do design, acrescente as
duas; se guarda o design como JSON opaco (os esquemas de `docs/schema/`), nada muda.

Trate os valores de `design` como opacos. Tokens de cor podem conter `var()` e `color-mix()` aninhados,
e não precisam ser cores literais. O backend pode guardar o JSON como veio ou validar apenas sua forma;
não rejeite esses valores por esperar um formato simples de cor. Por exemplo, o tema embarcado
`cyberpunk-neon` envia este token dentro de `design`:

```json
{
  "mode": "dark",
  "cardSearchPlaceholderColor": "var(--sarak-input-placeholder-color, color-mix(in srgb, var(--sarak-input-text-color, var(--text-muted, rgba(242, 246, 251, 0.55))) 30%, transparent))"
}
```

**Tokens de mídia não são cor nem URL de rede.** O token de imagem (hoje, `globalBackgroundImageUrl`; a lista dos tokens de mídia
está em `sarak-ui/catalog.json` → `designTokens.ids`, os de `type: image` e `file`) chega ao `onSave` com um destes valores:
`''` (sem mídia, o padrão), uma URL `https://` ou `http://`, um caminho do próprio sistema (`/assets/fundo.png`) ou mídia embutida,
`data:image/svg+xml;base64,…` (o `organic-clay` traz esse, com 626 caracteres), todos eles com ou sem o
invólucro `url(...)`. O predicado que a lib aplica ao carregar é o `isSafeMediaString` (a spec de segurança da lib, §2.1): ele
recusa qualquer outro esquema (`javascript:`, `vbscript:`, um `data:` que não seja imagem ou vídeo em base64) e os caracteres
`<`, `>`, `{`, `}` e `;` fora da mídia embutida, e o valor recusado é descartado com aviso. Por isso o backend **não** valida esse
campo como URL `http`: um validador desse tipo recusa o tema embarcado que a lib mesma entrega, e a coluna que guarda o JSON precisa
caber o `data:` (use `text`, não `varchar(255)`). Quem quiser validar no servidor aceita o mesmo conjunto acima.

**Servidor que valida as chaves por lista.** Tire a lista de `sarak-ui/catalog.json` → `designTokens.ids`, a cada versão da lib. Um tema
guardado de antes pode trazer chave que saiu: `designTokens.removed` diz, por token, a versão em que saiu e o destino (o nome que
ficou no lugar, ou `sem substituto`). A lib descarta a chave removida ao carregar, com aviso; o servidor que a recusa com 400 impede
o usuário de salvar o tema inteiro por causa dela.

`onLoad` é o inverso. Devolva o que `onSave` entregou — `{ design, activeThemeId, format }` (`SarakSavedDesign`). Continua
aceitando o formato antigo, que devolve apenas o `design`, ou o par sem o marcador:

```ts
onLoad?: () => Promise<SarakThemePayload | SarakSavedDesign | null | undefined>
  | SarakThemePayload
  | SarakSavedDesign
  | null
  | undefined
```

Com `format: 2`, o Provider refaz o design pelo tema do id e pelas escolhas, e o resultado **substitui** o que veio do cache
local (sem fundir por cima): um valor que saiu do servidor sai da tela. Sem o marcador, o gravado é dado do formato anterior,
que trazia as cores calculadas e o que sobrou de outro tema: a lib funde por cima, como antes, e tira dele as cores que a paleta
calcula e que o tema do id e o `config` do host não declaram (a cor de papel ajustada à mão nesse dado volta à da paleta). Essa
correção vale para a tela, não chama `onSave`, e o próximo `Aplicar` grava no formato novo.

Quando `activeThemeId` vier no objeto, o Provider restaura essa identidade junto com o `design`.
`activeThemeId` controlado na prop do Provider continua vencendo. `null`/`undefined` significa que
nenhum estado foi salvo. `onLoad` não recebe argumento: a lib nunca pede identidade de usuário,
porque não tem esse conceito (§4). Ao trocar `tenantId`, a lib chama `onLoad` de novo sem exigir
remontagem do Provider.

No cache local da estratégia `hybrid`, o design **inteiro** continua no formato JSON bruto da chave efetiva
(`storageKey`, já particionada por `tenantId`) — é ele que pinta o primeiro quadro — e o id fica na chave companheira
`${storageKey}::active-theme-id`. As escolhas ficam numa terceira, `${storageKey}::choices`, presa ao design inteiro gravado
junto: com o tema em memória, o Provider refaz o design por elas. Assim, o cache restaura o par sem alterar o formato de design
que o sync entre abas já lê. O id do cache é usado enquanto `onLoad` está pendente; um id devolvido
por `onLoad` substitui o cache e atualiza as duas entradas locais sem chamar `onSave`. Se a resposta
não trouxer id, o id em cache é mantido. A prop controlada continua acima das duas fontes.

O boot e a hidratação não chamam `onSave`. Depois da carga, alterações aplicadas diretamente ao
Provider continuam sendo gravadas pelo debounce. No painel, `Aplicar (N)` confirma o rascunho e
grava imediatamente pelo `onSave` do estado aplicado; não chama `options.theme.onSave`, que é a
porta separada para salvar um tema nomeado (§1.2).

Se `onSave` rejeitar, a alteração permanece aplicada na tela e a biblioteca mostra um aviso
traduzido. A tentativa não é marcada como gravada; não há repetição automática, e a próxima mudança
aplicada tenta salvar de novo.

#### Troca de tenant no Provider montado

Passe o `tenantId` atual e callbacks que fechem sobre ele. A troca de tenant muda a chave local e
carrega o novo estado sem remontar o Provider. A resposta de uma leitura anterior é descartada e
um debounce pendente do tenant anterior é cancelado antes de aceitar novas edições.

```tsx
function App({ tenantId }: { tenantId: string }) {
  return (
    <SarakUIProvider
      options={{
        persistence: {
          strategy: 'hybrid',
          storageKey: 'tema-aplicado',
          tenantId,
          onLoad: () => buscarTemaDoBackend(tenantId),
          onSave: (design, activeThemeId, format) => salvarTemaNoBackend(tenantId, design, activeThemeId, format),
        },
      }}
    >
      <Aplicacao />
    </SarakUIProvider>
  );
}
```

`onLoad` não recebe o tenant como argumento; a função fecha sobre o `tenantId` da renderização
atual. Se o consumidor só conseguir fornecer `onLoad` depois que a autenticação resolver, a nova
porta também inicia a carga. Em `'hybrid'`, o cache local do novo tenant é aplicado primeiro e o
remoto é fundido por cima; em `'remote'`, o remoto substitui a semente. `null`/`undefined` mantém
o fallback disponível para o tenant e não grava durante a hidratação. Use `strictBackendSync` para
segurar os filhos enquanto a leitura remota termina.

Se a troca também precisar zerar o estado React dos filhos, use uma chave no Provider:

```tsx
<SarakUIProvider key={tenantId} options={{ persistence: { tenantId, onLoad, onSave } }}>
  <Aplicacao />
</SarakUIProvider>
```

Essa alternativa desmonta e monta o Provider e seus filhos; mantenha `tenantId` para isolar o cache.

### 1.2 Os temas criados — `options.theme.onSave`

Quando o usuário clica **"Salvar"** no painel para nomear e guardar um tema novo (ADR-011):

```ts
onSave?: (theme: SarakThemeEntry, operation?: 'create' | 'replace') => Promise<void> | void
```

O segundo argumento identifica a operação: `'create'` para **Salvar como novo** e **Duplicar**;
`'replace'` para **Salvar** sobre o tema do importador em edição. O argumento é opcional para
manter compatibilidade com callbacks antigos que recebem somente o tema.

```ts
interface SarakThemeEntry {
  id: string;              // livre, definido no momento do salvamento (slug do nome)
  name?: string;           // rótulo exibido nas listas
  design?: Record<string, unknown>;
  contraparte?: Partial<SarakDesignState>; // variante do modo oposto (claro/escuro), opcional
}
```

**Salvar um tema nomeado também o ativa e grava o estado aplicado.** O botão "Salvar" do painel não para em `theme.onSave`.
Em ordem: (1) `sarak.saveTheme` valida o tema, funde-o em `allThemes` e chama `options.theme.onSave`; (2) o tema salvo vira o
tema resolvido (`activeThemeId`); (3) `applyFullConfigRaw` aplica o design salvo ao Provider; (4) `persistDesign` grava o
estado aplicado: escreve o `localStorage` (estratégias `local` e `hybrid`) e chama `options.persistence.onSave` (estratégias
`hybrid` e `remote`, quando a porta existe), com o `activeThemeId` resolvido naquele instante; uma gravação idêntica à última
é descartada. Se a etapa (1) rejeitar, nada depois dela acontece e o painel avisa que o salvamento falhou. Quem implementa as
duas portas recebe, portanto, **duas chamadas por um único "Salvar"**: uma de `theme.onSave` (o tema novo, com `operation`) e
outra de `persistence.onSave` (o estado aplicado). Não trate a segunda como uma gravação inesperada.

Não existe porta separada de leitura: a prop `customThemes` recebe a lista de temas guardados no
próximo boot, e eles entram na sessão junto dos embarcados. Para apagar, `useSarakUI().deleteTheme(id)`
remove o tema da coleção da sessão e chama `options.theme.onDelete(id)` quando essa porta opcional
estiver configurada. O consumidor continua responsável por removê-lo da própria fonte persistente.

Quem dispara `theme.onSave` é o contexto do Provider, pelo método `sarak.saveTheme(theme)` — é o
que o botão "Salvar" do painel chama por baixo. Se você construir uma UI própria para criar temas
em vez de usar o painel embarcado, chame `saveTheme` do contexto (`useContext`/`useSarakUI`, o que
o seu ponto de acesso ao Provider expuser) em vez de reimplementar a fusão na lista de temas da
sessão — `saveTheme` já valida (`validateDesign`) e já funde o tema em `allThemes` antes de entregar
a `theme.onSave`.

## 2. O JSON é OPACO — guarde byte a byte

**Não normalize. Não faça `pick` de campos. Não valide o conteúdo.**

O `design` (nos dois callbacks) carrega `schema_version` dentro de si e é contrato público — a
regra **R33** garante que uma chave que você salvou na versão N continua sendo aceita e emitindo a
mesma variável CSS na versão N+1. Um backend que "arruma" o payload — remove uma chave que parecia
não usada, reordena, tipa de novo — quebra o tema do seu usuário na próxima atualização da lib, de
um jeito que nenhum teste seu vai pegar, porque o teste também vai ler o payload já "arrumado".

A validação de conteúdo **já acontece dentro da lib**, na leitura — `validateDesign` roda sobre
qualquer origem (`localStorage`, `onLoad`, tema importado por `customThemes`) e descarta com aviso
o que não bate com o catálogo real de tokens (R6). É essa fronteira, e só ela, que precisa validar
o conteúdo. O seu banco só precisa guardar e devolver os bytes que recebeu.

## 3. Os temas da lib são imutáveis

Os temas embarcados são **código**: vêm dentro do pacote, iguais para todo consumidor, e nunca mudam
por ação de um usuário final. `SARAK_THEME_CATALOG` identifica o catálogo; use
`sarakLoadAllThemePresets()` quando precisar carregar os presets completos. **A sua tabela nunca
guarda os originais.**

"Alterar" um tema da lib, na prática, significa **criar um tema novo, derivado**, com um `id` livre
diferente — o painel parte de `SARAK_BOOT_THEMES` ou de qualquer tema embarcado e o usuário
ajusta valores; ao salvar, o que chega em `theme.onSave` já é essa cópia derivada, com identidade
própria. Não existe operação "editar tema embarcado" — o resultado sempre nasce como um `SarakThemeEntry`
novo, do seu lado.

**Tema seu que o painel só duplica.** Um tema que o seu sistema não deixa o usuário alterar (a marca, por exemplo) entra em
`customThemes` com `readOnly: true`. O painel o trata como os da lib: oferece **Duplicar** (que cria um tema novo, derivado) e não
oferece **Salvar** nem **Apagar**, então `onSave` e `onDelete` nunca recebem o id dele. Sem `readOnly`, o tema seu segue editável e
apagável como antes.

## 4. O escopo é do sistema, não do usuário

A lib **nunca teve conceito de usuário**. `onSave` recebe o design; `onLoad` não recebe argumento
nenhum. Não existe `userId` em nenhuma das duas portas de persistência de tema.

**Consequência que precisa ficar explícita: quem trocar o tema, troca para todo mundo que
compartilha aquele estado.** A tabela nasce **sem coluna de identidade** — nem de usuário, nem de
sessão. Se o seu produto precisar de preferência **individual** de tema no futuro, isso é uma
decisão de produto sua, de fora da lib: a query ganha um `WHERE`/uma chave a mais, e nada acima
dela muda. Até lá, o tema aplicado é uma propriedade do sistema (ou do tenant, se você usa
`tenantId` — ADR-009), não da pessoa logada.

## 5. Como ligar — exemplo copiável

```tsx
import { SarakUIProvider } from '@sarak/lib-ui-core';

function App({ temasSalvos, estadoAplicado }: {
  temasSalvos: SarakThemeEntry[];          // devolvidos do SEU backend, ver §1.2
  estadoAplicado: { design: SarakThemePayload; activeThemeId?: string } | undefined; // ver §1.1
}) {
  return (
    <SarakUIProvider
      customThemes={temasSalvos}
      options={{
        persistence: {
          // 'hybrid' (default) mantém o localStorage como CACHE local, além de
          // chamar onSave/onLoad — é o que evita o flash de tema errado no
          // primeiro paint, porque o boot lê o cache síncrono ANTES de esperar
          // a resposta assíncrona do seu backend. 'remote' existiria para
          // quando o seu backend é a única fonte de verdade — mas paga esse
          // flash a cada boot, porque não há mais cache local para o primeiro
          // paint. Fique em 'hybrid' a menos que tenha um motivo concreto para
          // o contrário (ADR-009 §2.2).
          strategy: 'hybrid',
          onSave: async (design, activeThemeId) => {
            const response = await fetch('/api/tema/estado', {
              method: 'PUT',
              body: JSON.stringify({ design, activeThemeId }), // §1.1 — guarde os dois, byte a byte
            });
            if (!response.ok) throw new Error(`Falha ao salvar tema: HTTP ${response.status}`);
          },
          onLoad: async () => {
            const res = await fetch('/api/tema/estado');
            return (await res.json()).estadoAplicado;
          },
        },
        theme: {
          onSave: async (theme, operation) => {
            const response = await fetch(
              operation === 'replace'
                ? `/api/tema/definicoes/${encodeURIComponent(theme.id)}`
                : '/api/tema/definicoes',
              {
                method: operation === 'replace' ? 'PUT' : 'POST',
                body: JSON.stringify(theme), // §1.2 — o SarakThemeEntry inteiro, byte a byte
              },
            );
            if (!response.ok) throw new Error(`Falha ao salvar tema: HTTP ${response.status}`);
          },
          onDelete: async (id) => {
            const response = await fetch(`/api/tema/definicoes/${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Falha ao apagar tema: HTTP ${response.status}`);
          },
        },
      }}
    >
      <App />
    </SarakUIProvider>
  );
}
```

**Contrato de falha das portas.** Uma porta de gravação precisa rejeitar sua Promise quando a
operação falha. `fetch` não rejeita por respostas HTTP 4xx/5xx: confira `response.ok` e lance um
erro, como no exemplo. Resolver a Promise depois de uma resposta de falha comunica sucesso à
biblioteca; não capture nem engula esse erro. A rejeição de `persistence.onSave` deixa o tema em tela,
mostra o aviso localizado e permite nova tentativa quando outra mudança for aplicada.

## 6. O primeiro paint

Num navegador **sem cache** (primeira visita, ou depois de limpar dados do site), `'hybrid'` — o
default, §5 — ainda depende de `onLoad` resolver: não há `localStorage` para o boot ler de forma
síncrona. O tema padrão pinta primeiro, e o persistido entra alguns instantes depois, quando a
resposta chega. **Isto não é bug, e a lib não tem como consertar sozinha:** para o primeiro paint
já sair certo, o dado precisa existir **antes de o JS rodar** — e quem põe dado no documento antes
do JS é quem **serve o documento**. A lib nunca serve documento nenhum (ADR-003).

**Isto custa uma vez por navegador**, não uma vez por sessão: o `localStorage` que `'hybrid'` grava
depois da primeira carga funciona como cache para todas as visitas seguintes daquele navegador.

Três saídas, cada uma com o trade explícito:

| Saída | O que ganha | O que custa |
|---|---|---|
| Injetar o design no HTML servido, pintar o fundo no HTML e passar em `config` | **Zero flash, zero espera** — o fundo aparece antes do JavaScript e o Provider começa com o mesmo design | Exige que o **seu servidor** conheça o tema antes de responder e renderize o fundo usando `design.colorBgBody` |
| `options.persistence.strictBackendSync: true` | Zero flash — nunca pinta o tema errado | Troca o flash por **tela vazia** enquanto `onLoad` corre (`SarakUIProvider.tsx:189-190`) |
| Aceitar o flash | Zero esforço | Uma troca de tema visível, **uma vez por navegador** |

### A precedência — `config` × `onLoad` × cache × semente

Medida em `useDesignManager.ts:68` (a semente) e `:93-104` (a leitura inicial):

```
getSeedConfig()  =  { ...masterDefaults, ...temaDoCatálogo, ...config }

prop `activeThemeId` controlada? → esse id vence
`onLoad` devolveu um id?          → usa o id remoto e atualiza o cache em `hybrid`
cache local tem id?               → usa o id do cache até a resposta remota
nenhuma fonte acima?              → usa o id da semente
```

O padrão mantém a compatibilidade: com cache local, o cache vence `config`; sem cache, `config`
vence a semente. Quando o host injeta o design de boot como fonte da verdade, defina
`persistence.preferConfigOverCache: true`: o `config` pinta já no primeiro render e o cache antigo
não o substitui. Um `onLoad` posterior ainda vence esse design e, em `hybrid`, atualiza o cache.

### O `config` que é o design gravado do usuário — `persistence.configIsSavedDesign`

Por padrão o `config` é o **valor do host**: vence a paleta e o tom e não é gravado como escolha. Quem devolve o design gravado do usuário
como `config` (o white label: cada organização personaliza o sistema e o servidor injeta o gravado no HTML) tem, nesse padrão, as escolhas
que vieram no `config` descartadas na troca de tema: a paleta mantida, o "Manter minha paleta" e as paletas salvas somem do que a lib grava.

Declare que o `config` é o design gravado com `configIsSavedDesign: true`. Com ela, o que veio no `config` conta como escolha do usuário,
sobrevive à troca de tema e é gravado em `onSave` junto com o resto das escolhas (sempre esparso: só o que difere do tema).

```tsx
<SarakUIProvider
  config={designGravadoDaOrganizacao}   // o que o seu `onSave` recebeu da última vez
  initialTheme={idGravado}
  options={{ persistence: { configIsSavedDesign: true, onSave, onLoad } }}
/>
```

**A regra:** ligue quando o `config` for o que o usuário gravou; **não ligue** quando for um valor fixo do host (a cor que o sistema impõe),
porque ligada a opção deixa de tratá-lo como imposição e o grava como escolha.

## 7. Modelagem de referência

`docs/schema/postgres.sql` e `docs/schema/sqlite.sql` trazem o DDL comentado, nos dois dialetos.
Ambos modelam a mesma decisão: **duas tabelas**, porque §1 já estabeleceu que são duas entidades —
uma lista de temas nomeados (`sarak_theme_definitions`) e um estado corrente, singular por
tenant (`sarak_applied_theme_state`), que pode não apontar para nenhuma linha da primeira.

Os dois arquivos são **referência, não requisito**: nenhum código deste repositório os executa, os
importa ou depende deles — são documentação, cobertos pelo gate de contrato que garante que os
nomes de API citados aqui (`persistence.onSave`, `persistence.onLoad`, `theme.onSave`,
`customThemes`, `saveTheme`) continuam existindo na superfície pública da lib.
