# Migrações (breaking changes do contrato público)

Registro das mudanças que quebram o contrato de quem já importa a `@sarak/lib-ui-core`,
com o "antes" e o "depois" lado a lado. Uma entrada por mudança, mais recente primeiro.

---

## Identidade da página — a lib parou de impor a própria marca (Spec 47)

**O que mudou.** O `DEFAULT_BRANDING` do Provider trazia `companyName: 'Sarak OS'` e
`tabName: 'Sarak OS'`. Como o guard a jusante era `if (branding?.tabName)` e o default
era sempre truthy, **todo consumidor tinha o `<title>` do seu `index.html` sobrescrito
por "Sarak OS"** assim que o React montava — a aba piscava do nome do produto dele para
a marca da lib. O mesmo default vazava para o rótulo de marca do cromo (sidebar/topbar),
via `useSarakUI().systemName`.

Agora os campos de **identidade** nascem ausentes e a escrita é **opt-in**: sem valor
fornecido pelo consumidor, a lib não toca em `document.title` nem no favicon.

**Antes**

```tsx
// index.html: <title>Meu ERP</title>
<SarakUIProvider><App /></SarakUIProvider>
// → aba exibe "Sarak OS"
```

**Depois**

```tsx
// index.html: <title>Meu ERP</title>
<SarakUIProvider><App /></SarakUIProvider>
// → aba exibe "Meu ERP" (a lib não interfere)

// Para a lib gerenciar o título, forneça o valor:
<SarakUIProvider options={{ branding: { initial: { tabName: 'Meu ERP — Propostas' } } }}>
```

**Mudança de tipo.** Em `SarakBrandingState`, `companyName` e `tabName` passaram de
obrigatórios para opcionais (`companyName?: string`, `tabName?: string`), refletindo que
podem legitimamente não existir. Quem **escreve** branding não é afetado
(`options.branding.initial` já era `Partial<>`); quem **lê** `useSarakUI().branding`
precisa tratar `undefined`.

**Nenhuma capacidade foi removida** — só o default que vazava. `loginName` segue
obrigatório com default genérico (`'Acesso ao Sistema'`): é rótulo de UI, não marca.

Contrato completo em [`identidade-do-host.md`](./identidade-do-host.md).

---

## `SarakCardGrid.mapping` — fim dos campos de domínio LLM (Spec 42)

**O que mudou.** O `SarakCoreCard` — a variante `"classic"`, que é a **default** do
`SarakCardGrid` quando o autor não declara `variant` — carregava um catálogo de modelos
de IA embutido: painel fixo "Custo In (1M)" / "Custo Out (1M)", "Janela de Contexto"
calculando `contexto / 1000` em tokens, bloco "Tokenizer", cabeçalho "Descrição Técnica",
botão "Ver Specs" e subtítulo default `"Modelo"`. Um ERP que renderizasse contratos
recebia, sem pedir, a interface de um catálogo de LLMs.

Isso saiu. A Sarak não conhece domínio nenhum e **não formata valor de negócio**: o
painel virou uma lista genérica de pares rótulo/valor **já formatados pelo consumidor**.
É a mesma solução aplicada ao `SarakActionCard` na Spec 30.

**Campos removidos do tipo público `SarakCardGridProps['mapping']`:** `price_in`,
`price_out`, `context`. (O `SarakCoreCard` também deixou de ler `tokenizer` e `price`.)

**Antes**

```tsx
<SarakCardGrid
    endpoint="/api/v1/modelos"
    mapping={{
        title: 'name',
        subtitle: 'vendor',
        price_in: 'price_in',       // a lib fazia `$${Number(v).toFixed(4)}`
        price_out: 'price_out',     // idem
        context: 'context_window',  // a lib fazia `${v / 1000}k tokens`
        tokenizer: 'tokenizer_id',
        description: 'tech_description',
    }}
/>
```

**Depois** — o item traz um array de pares prontos; a lib só desenha:

```tsx
// O consumidor formata (moeda, unidade, arredondamento) no seu próprio código,
// no servidor ou num `map` antes de renderizar:
const item = {
    name: 'GPT-X',
    vendor: 'OpenAI',
    tech_description: 'Modelo multimodal de alta capacidade.',
    specs: [
        { label: 'Custo In (1M)', value: '$2.5000' },
        { label: 'Custo Out (1M)', value: '$10.0000' },
        { label: 'Janela de Contexto', value: '128k tokens' },
        { label: 'Tokenizer', value: 'o200k_base' },
    ],
};

<SarakCardGrid
    endpoint="/api/v1/modelos"
    mapping={{
        title: 'name',
        subtitle: 'vendor',
        description: 'tech_description',
        details: 'specs',                       // ← o painel inteiro vem daqui
        description_label: 'Descrição Técnica',  // rótulo literal, opcional
        expand_label: 'Ver Specs',               // default: "Ver mais"
    }}
/>
```

**Outros textos fixos que viraram dado** (todos opcionais; ausente = sem cabeçalho):

| Antes (fixo no componente) | Depois (chave literal do `mapping`) | Default |
| --- | --- | --- |
| `"Modelo"` (subtítulo) | `subtitle` (caminho) | vazio |
| `"Ver Specs"` / `"Fechar"` | `expand_label` / `collapse_label` | `"Ver mais"` / `"Fechar"` |
| `"Descrição Técnica"` | `description_label` | sem cabeçalho |
| `"Input Capacities"` | `input_caps_label` | sem cabeçalho |
| `"Output Capacities"` | `output_caps_label` | sem cabeçalho |

> **Chave literal × caminho:** a maioria dos valores do `mapping` é o *caminho* de um
> campo do item (`'user.name'`); as chaves marcadas como *literal* no catálogo
> (`icon`, `*_label`) são o texto/nome em si — mesma convenção que o `icon` já usava.

**Efeitos colaterais visíveis**, mesmo para quem não usava os campos removidos:

- O botão expansível só é renderizado quando há `mapping.description` — antes ele
  aparecia sempre e podia abrir um painel vazio.
- Os chips de `input_caps`/`output_caps` não têm mais ícone por palavra-chave
  (`vision`/`web`/`chat` eram domínio de LLM); todos usam o mesmo ícone neutro.
- O painel de detalhes some por completo quando não há `details` — antes exibia
  `"N/A"`/`"Desconhecida"`.

**Ganho colateral:** `SarakCardGridProps` passou a ser **exportado publicamente** (estava
fora do barril justamente porque o tipo carregava o domínio LLM).
