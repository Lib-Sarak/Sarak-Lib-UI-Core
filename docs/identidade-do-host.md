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
<title>ERP Earendel — Propostas</title>
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
