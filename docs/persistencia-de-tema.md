# Persistência de tema no seu backend — o contrato do dado (opcional)

> Referência do contrato firmado nos ADR-003, ADR-009 e ADR-011. Este documento descreve **o que
> guardar**, caso você decida guardar. Ele não ativa nada sozinho.

## 0. Nada disto é obrigatório

**Sem nenhuma porta configurada, a lib funciona exatamente como sempre funcionou:** a seleção do
usuário vai para `localStorage`, e ponto. A lib nunca fala com um backend próprio — não tem
endpoint, não tem driver de banco, não pergunta nada a ninguém (ADR-003).

Este documento existe porque, quando **você** decide que o seu sistema precisa sincronizar tema
entre dispositivos ou guardar num banco seu, os tipos públicos (`SarakThemePayload`, `ThemeEntry`,
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

O **design corrente**, completo, exatamente como o motor de tokens o resolveu. Chamado a cada
commit do design persistido (debounced), com dois argumentos:

```ts
onSave?: (design: SarakThemePayload, activeThemeId?: string) => Promise<void> | void
```

- `design` — o payload completo. **Pode não corresponder a nenhum tema salvo.** O usuário ajusta
  tokens individuais no painel sem clicar em "Salvar tema" — o estado aplicado muda a cada ajuste,
  o tema salvo (se algum) não.
- `activeThemeId` — o id do tema que estava efetivamente no ar no instante do save (plan-42).
  **Opcional de verdade:** vem `undefined` sempre que não há nenhum tema resolvido ainda. Pode
  apontar tanto para um tema embarcado da lib (`'minimalist-airy'`, por exemplo) quanto para um
  tema salvo pelo importador — a lib não distingue as duas origens neste campo.

`onLoad` é o inverso — devolve o `design` a aplicar no boot. **Não recebe nenhum argumento**: a lib
nunca pede identidade de usuário, porque não tem esse conceito (§4).

### 1.2 Os temas criados — `options.theme.onSave`

Quando o usuário clica **"Salvar"** no painel para nomear e guardar um tema novo (ADR-011):

```ts
onSave?: (theme: ThemeEntry) => Promise<void> | void
```

```ts
interface ThemeEntry {
  id: string;              // livre, definido no momento do salvamento (slug do nome)
  name?: string;           // rótulo exibido nas listas
  design?: Record<string, unknown>;
  contraparte?: Partial<SarakDesignState>; // variante do modo oposto (claro/escuro), opcional
}
```

**Não existe porta de leitura nem de apagar.** A leitura já é a prop `customThemes` — você devolve
a lista de temas guardados nela no próximo boot, e eles entram na sessão junto dos embarcados.
Apagar é decisão sua, na sua fonte; a lib nunca chama nada para remover.

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

Os temas embarcados (hoje 23 — o número exato é derivado, veja `npm run audit` → `auditor_presets`)
são **código**: vêm dentro do pacote, iguais para todo consumidor, e nunca mudam por ação de um
usuário final. **A sua tabela nunca guarda os originais.**

"Alterar" um tema da lib, na prática, significa **criar um tema novo, derivado**, com um `id` livre
diferente — o painel parte de `SARAK_REFERENCE_THEMES` (ou de qualquer tema embarcado) e o usuário
ajusta valores; ao salvar, o que chega em `theme.onSave` já é essa cópia derivada, com identidade
própria. Não existe operação "editar tema embarcado" — o resultado sempre nasce como um `ThemeEntry`
novo, do seu lado.

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
  temasSalvos: ThemeEntry[];          // devolvidos do SEU backend, ver §1.2
  estadoAplicado: SarakThemePayload | undefined; // devolvido do SEU backend, ver §1.1
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
            await fetch('/api/tema/estado', {
              method: 'PUT',
              body: JSON.stringify({ design, activeThemeId }), // §1.1 — guarde os dois, byte a byte
            });
          },
          onLoad: async () => {
            const res = await fetch('/api/tema/estado');
            return (await res.json()).design;
          },
        },
        theme: {
          onSave: async (theme) => {
            await fetch('/api/tema/definicoes', {
              method: 'PUT',
              body: JSON.stringify(theme), // §1.2 — o ThemeEntry inteiro, byte a byte
            });
          },
        },
      }}
    >
      <App />
    </SarakUIProvider>
  );
}
```

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
| Injetar o design no HTML servido e passar em `config` | **Zero flash, zero espera** — o tema certo já está no primeiro paint | Exige que o **seu servidor** conheça o tema antes de responder a página. É o conserto de verdade, não uma correção de sintoma |
| `options.persistence.strictBackendSync: true` | Zero flash — nunca pinta o tema errado | Troca o flash por **tela vazia** enquanto `onLoad` corre (`SarakUIProvider.tsx:189-190`) |
| Aceitar o flash | Zero esforço | Uma troca de tema visível, **uma vez por navegador** |

### A precedência — `config` × `localStorage` × semente

Medida em `useDesignManager.ts:68` (a semente) e `:93-104` (a leitura inicial):

```
getSeedConfig()  =  { ...masterDefaults, ...temaDoCatálogo, ...config }   // config.ts:68

localStorage tem valor?  →  { ...getSeedConfig(), ...JSON.parse(localStorage) }   // :100 — o CACHE vence
localStorage vazio?      →  getSeedConfig()                                       // :103 — CONFIG vence
```

**Num navegador novo (sem cache), `config` manda no primeiro paint** — é a saída da primeira linha
da tabela acima. Com cache presente, o `localStorage` vence o `config` injetado, e isso **está
certo**: o cache costuma carregar o valor mais recente, e `onLoad` (quando configurado) corrige
por cima se não for. Mas quem injeta `config` esperando que ele **sempre** vença — inclusive depois
que o usuário já visitou o site antes — vê um comportamento que parece aleatório se não souber
desta ordem.

## 7. Modelagem de referência

`docs/schema/postgres.sql` e `docs/schema/sqlite.sql` trazem o DDL comentado, nos dois dialetos.
Ambos modelam a mesma decisão: **duas tabelas**, porque §1 já estabeleceu que são duas entidades —
uma lista de temas nomeados (`sarak_theme_definitions`) e um estado corrente, singular por
tenant (`sarak_applied_theme_state`), que pode não apontar para nenhuma linha da primeira.

Os dois arquivos são **referência, não requisito**: nenhum código deste repositório os executa, os
importa ou depende deles — são documentação, cobertos pelo gate de contrato que garante que os
nomes de API citados aqui (`persistence.onSave`, `persistence.onLoad`, `theme.onSave`,
`customThemes`, `saveTheme`) continuam existindo na superfície pública da lib.
