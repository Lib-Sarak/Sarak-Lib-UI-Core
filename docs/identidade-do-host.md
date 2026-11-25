# Identidade da página — o consumidor é o dono

> Referência do contrato firmado na **Spec 47**. Vale para nome da aba (`<title>`),
> favicon e strings de marca exibidas no cromo.

## 1. A regra

**A identidade da página é SEMPRE do importador.** A Sarak-Lib-UI-Core nunca impõe a
própria marca: por padrão (zero-config) ela **não escreve** `document.title`, **não
troca** o favicon e **não exibe** nome de marca nenhum. O que estiver no `index.html`
do consumidor permanece exatamente como ele escreveu — antes e depois do React montar.

É **opt-in, não opt-out**: a lib só toca nesses elementos quando o consumidor fornece
o valor. Sem valor, ela não age.

```html
<!-- index.html do consumidor: esta é a fonte da verdade por padrão -->
<title>Meu Sistema — Propostas</title>
<link rel="icon" href="/favicon.ico" />
```

```tsx
// Zero-config: o título acima sobrevive à montagem. A lib não interfere.
<SarakUIProvider>
  <App />
</SarakUIProvider>
```

## 2. Como o consumidor assume o controle (opcional)

Há duas portas para nomear a página. Ambas são do consumidor; a lib só resolve a
precedência entre elas.

| Porta | Onde | Quando usar |
|---|---|---|
| `options.branding.initial.tabName` | `<SarakUIProvider options={{ branding: { initial: { tabName } } }}>` | Você quer controlar **especificamente o nome da aba** |
| `config.systemName` | `<SarakUIProvider config={{ systemName }}>` (ou no tema) | Você quer um **nome do sistema** que também apareça no cromo (sidebar/topbar) |

```tsx
// Título da aba controlado pela lib, com o valor do consumidor.
<SarakUIProvider options={{ branding: { initial: { tabName: 'Minha Empresa — Propostas' } } }}>
  <App />
</SarakUIProvider>

// Nome do sistema: alimenta o título E o rótulo de marca do cromo.
<SarakUIProvider config={{ systemName: 'Minha Empresa' }}>
  <App />
</SarakUIProvider>
```

**Precedência:** `branding.tabName` > `config.systemName`. Do mais específico
(nome da aba) para o mais genérico (nome do sistema). Se nenhum for fornecido, a lib
não escreve o título — ponto.

**Fonte única:** um só efeito no Provider decide `document.title`. Não existem dois
caminhos disputando o valor (era assim antes da Spec 47, e o resultado dependia da
ordem de execução dos effects).

### Favicon

```tsx
// Só troca se você fornecer. `logoBase64` aceita data URI ou URL.
<SarakUIProvider options={{ branding: { initial: { logoBase64: '/logo-da-marca.png' } } }}>
  <App />
</SarakUIProvider>
```

Sem `logoBase64`, o `<link rel="icon">` do host fica intocado.

## 3. Por modo de consumo

| Modo | Comportamento default |
|---|---|
| **App** (`mode: 'app'`, default) | Preserva o `<title>`/favicon do host. Só escreve se o consumidor fornecer `tabName`/`systemName`/`logoBase64`. |
| **Embarcado** (`mode: 'embedded'`, Spec 24) | **Nunca** toca em título/favicon — nem com valor fornecido. A ilha não é dona da página. |

## 4. Campos de branding

```ts
interface SarakBrandingState {
  companyName?: string;   // identidade — ausente por padrão
  loginName: string;      // rótulo de UI (não é marca) — default genérico
  tabName?: string;       // identidade — ausente por padrão
  logoBase64: string | null; // identidade — ausente por padrão
}
```

Os campos de **identidade** nascem ausentes de propósito. `loginName` é apenas o
rótulo da tela de acesso (default `'Acesso ao Sistema'`) — texto genérico, não marca.

> **Nota de migração:** até a Spec 47 os defaults eram `companyName: 'Sarak OS'` e
> `tabName: 'Sarak OS'`, o que fazia a aba do consumidor piscar do título dele para a
> marca da lib ao montar. Se o seu app dependia (intencionalmente ou não) desse valor,
> passe o nome que você quer por uma das duas portas acima. Nenhuma capacidade foi
> removida — só o default que vazava.

## 5. White label — a marca é da organização

Num sistema white label cada organização tem nome, logo, nome da aba e texto de login próprios. O importador guarda, o administrador edita
no painel, e a lib mostra. A lib não faz requisição nenhuma e não tem marca padrão: tudo passa pelas portas abaixo.

**Marca × tema.** A marca é da organização; o tema é estilo. Por isso a marca fica numa tabela própria, e trocar de tema não a toca.

**Os campos** (`SarakBrandingState`), editados no painel de customização (e pelo atalho "Usar minha marca"):

| Campo | O que é |
|---|---|
| `companyName` | nome exibido no cromo |
| `tabName` | título da aba |
| `loginName` | texto da tela de acesso |
| `logoBase64` | logo no cromo e favicon; aceita data URI **ou URL** |

**O fluxo completo:**

1. Carregue a marca da organização **antes do primeiro render** e passe em `options.branding.initial`.
2. Grave em `options.branding.onChange` (recebe o estado inteiro da marca).
3. Envie o logo por `onMediaUpload` (prop do `SarakUIProvider`), devolvendo a **URL do storage** em vez de guardar base64 na linha.
4. **Não passe `brand` fixo** ao `SarakAppChrome`: sem ele, o cromo mostra a marca gravada. `brand={{ name, logoUrl }}` continua valendo e vence
   campo a campo; o slot `logo` vence a imagem.

**Por organização.** A tabela tem a chave da organização e `options.persistence.tenantId` leva essa chave. Quando o `tenantId` muda, a marca é
semeada de novo a partir de `options.branding.initial` (sem chamar `onChange`: é carga, não edição). Com o mesmo `tenantId`, uma mudança de
`initial` não reescreve o que o usuário editou. Carregue a marca da organização nova antes de trocar o `tenantId`.

**Precedência:**

- na barra do cromo: `brand` > marca gravada > `systemName`/`logoUrl` do design (campo a campo; string vazia conta como ausente);
- no título da aba: `tabName` > `systemName`;
- favicon: só com logo.

**Modo embarcado** (`mode: 'embedded'`) não escreve título nem favicon.

**Primeiro quadro.** O servidor pode injetar a marca no HTML junto com o tema, para a aba e a barra já nascerem com a marca certa.

**Tema personalizado pela organização.** Quando a organização personaliza o tema (paleta, "Manter minha paleta", paletas salvas) e o servidor
injeta o design gravado dela como `config` do `SarakUIProvider`, ligue `options.persistence.configIsSavedDesign: true`. Sem ela, o `config` é
o valor do host e a troca de tema descarta essas escolhas. Veja `docs/persistencia-de-tema.md` (§6).

**O que a lib não faz:** nenhuma requisição, nenhum default de marca. Sem marca gravada e sem `brand`, o cromo fica sem nome.

### Exemplo completo

Tabela sugerida (nomes genéricos):

| Coluna | Tipo |
|---|---|
| `organization_id` | chave da organização |
| `company_name` | texto |
| `tab_name` | texto |
| `login_name` | texto |
| `logo_url` | texto (URL do storage) |

Rotas: `GET /api/organizations/:id/brand` devolve a linha; `PUT /api/organizations/:id/brand` grava a marca inteira (nas mesmas colunas que o `GET` devolve).

```tsx
import { useEffect, useState } from 'react';
import { SarakUIProvider, SarakAppChrome, type SarakBrandingState } from '@sarak/lib-ui-core';

type Brand = { company_name: string; tab_name: string; login_name: string; logo_url: string | null };

const toState = (row: Brand): Partial<SarakBrandingState> => ({
  companyName: row.company_name,
  tabName: row.tab_name,
  loginName: row.login_name,
  logoBase64: row.logo_url,
});

// A conversão inversa: o `onChange` entrega o estado em camelCase, a tabela guarda em snake_case.
const toRow = (state: SarakBrandingState): Brand => ({
  company_name: state.companyName ?? '',
  tab_name: state.tabName ?? '',
  login_name: state.loginName,
  logo_url: state.logoBase64,
});

export function Root({ organizationId }: { organizationId: string }) {
  // A marca carregada guarda a organização a que pertence.
  const [loaded, setLoaded] = useState<{ organizationId: string; initial: Partial<SarakBrandingState> } | null>(null);

  useEffect(() => {
    fetch(`/api/organizations/${organizationId}/brand`)
      .then((r) => r.json())
      .then((row) => setLoaded({ organizationId, initial: toState(row) }));
  }, [organizationId]);

  // O Provider só monta quando a marca carregada é a da organização atual: no render em que `organizationId`
  // muda, `loaded` ainda é a da anterior, e o `tenantId` novo nunca chega com a marca antiga.
  if (!loaded || loaded.organizationId !== organizationId) return null;

  return (
    <SarakUIProvider
      options={{
        persistence: { tenantId: organizationId },
        branding: {
          initial: loaded.initial,
          onChange: async (brand) => {
            await fetch(`/api/organizations/${organizationId}/brand`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(toRow(brand)),
            });
          },
        },
      }}
      onMediaUpload={async (file) => {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch(`/api/organizations/${organizationId}/brand/logo`, { method: 'POST', body });
        return (await res.json()).url; // URL do storage, não base64
      }}
    >
      {/* sem `brand`: o cromo mostra a marca gravada */}
      <SarakAppChrome navItems={[]}>
        <Telas />
      </SarakAppChrome>
    </SarakUIProvider>
  );
}
```
