# Extensibilidade de layout — imagens, animações e conteúdo custom (guia do consumidor)

> Referência da **Spec 48** (slots do cromo) + do que o Design Engine **já fazia** (fundo/atmosfera global).
> Princípio: **a lib dá a REGIÃO, o consumidor dá o CONTEÚDO.** Nenhum slot presume o que vai
> dentro — imagem, `<video>`, Lottie, canvas, componente animado, faixa promocional, o que for.

## Os DOIS níveis de "adicionar imagem/animação"

| | **(a) Fundo/atmosfera GLOBAL por tema** | **(b) Conteúdo por REGIÃO (slots)** |
| --- | --- | --- |
| Onde aparece | atrás de **toda a aplicação** | numa **região do cromo** (topo, rodapé, sidebar, camada de fundo do cromo) |
| Como se define | **dado** (tokens do tema / CustomizationPanel) | **props `ReactNode`** no `SarakAppChrome` |
| Quem troca | quem troca o **tema** (atinge todas as telas) | o **código do app** que monta o cromo |
| Use quando | quer ambiente/marca d'água/plano de fundo do produto inteiro | quer um banner, rodapé, cabeçalho de sidebar, logo animado, arte só do cromo |

Os dois **convivem**: o fundo global fica atrás de tudo; o slot `decoration` é uma camada
decorativa **escopada ao cromo**, que complementa (nunca substitui) o fundo global.

---

## (a) Fundo/atmosfera GLOBAL por tema — já existe, é dado

O Design Engine emite os tokens de mídia/atmosfera e o `SarakBackgroundRenderer` (montado
pelo `SarakUIProvider`, zero-config) desenha o fundo da aplicação inteira. **Não se escreve
componente para isso** — preenche-se o tema (Configuração, não Expansão).

```tsx
import { SarakUIProvider, SARAK_REFERENCE_THEMES } from '@sarak/lib-ui-core';

const MEUS_TEMAS = SARAK_REFERENCE_THEMES.map((t) => ({
  ...t,
  design: {
    ...t.design,
    globalBackgroundImageUrl: '/midia/fundo.webm', // imagem OU vídeo (animação)
    globalBackgroundOpacity: 0.35,
    globalBackgroundBlur: 4,
    texture: 'aurora',          // textura/atmosfera procedural (sem arquivo)
    bgNoiseAnimation: true,     // ruído animado
  },
}));

<SarakUIProvider customThemes={MEUS_TEMAS} initialTheme={MEUS_TEMAS[0].id}>
  <App />
</SarakUIProvider>
```

- **Animação sem arquivo:** `texture` (catálogo grande — `aurora`, `stars`, `waves`, `nebula`, …),
  `bgNoiseAnimation`, `bgNoiseDensity`, `noiseIntensity` — tudo procedural, custo zero de asset.
- **Vídeo:** a URL é tratada como vídeo quando termina em `.webm`/`.mp4` (ou contém `video`) —
  renderiza `<video autoplay loop muted playsinline>`.
- O fundo global é **fixo, atrás de tudo e sem captura de toque**; ele se auto-protege de
  contraste (overlay condicional por luminância da mídia).
- **Modo Embarcado** (`mode: 'embedded'`): overlays de página inteira ficam desligados por
  desenho — a lib não é dona da página do host. Nesse modo, use os **slots** (nível b).
- Tokens relacionados (schema vivo, `getAllDesignTokens()`): `globalBackgroundImageUrl`,
  `globalBackgroundOpacity`, `globalBackgroundBlur`, `globalBackgroundBlendMode`, `texture`,
  `textureOpacity`, `atmosphereNoiseOpacity`, `bgNoiseAnimation`, `bgGradientMode`.

---

## (b) Conteúdo por REGIÃO — os slots do `SarakAppChrome` (Spec 48)

Oito props opcionais, todas `ReactNode`. **Ausente = a região não é renderizada** (sem espaço
morto); nenhuma é obrigatória e nada do contrato anterior (`brand`, `topbarActions`,
`children`) mudou.

```tsx
<SarakAppChrome
  brand={{ name: 'Meu Sistema' }}
  navItems={NAV}
  onNavigate={(href) => window.location.assign(href)}

  logo={<LogoAnimado />}                                  {/* precede brand.logoUrl */}
  topbarStart={<BuscaGlobal />}
  topbarEnd={<TrocarTema />}                              {/* alias de topbarActions */}
  sidebarHeader={<CardDoUsuario />}
  sidebarFooter={<span>v{versao}</span>}
  banner={<img src="/promo.gif" alt="Campanha de julho" />}
  footer={<Rodape />}
  decoration={<video src="/arte.webm" autoPlay loop muted playsInline />}
>
  <MinhaTela />
</SarakAppChrome>
```

### Mapa das regiões

| Slot | Desktop — sidebar | Desktop/tablet — topbar | Celular |
| --- | --- | --- | --- |
| `logo` | topo da sidebar (ao lado do `brand.name`) | início da topbar | barra compacta |
| `topbarStart` | degrada para o **topo da sidebar** | início da barra, após a marca | barra compacta (comprime) |
| `topbarEnd` (`topbarActions`) | degrada para o **rodapé da sidebar** | fim da barra | fim da barra compacta |
| `sidebarHeader` | topo da sidebar (abaixo da marca) | — (não há sidebar) | **drawer** (topo) |
| `sidebarFooter` | rodapé da sidebar | — (não há sidebar) | **drawer** (rodapé) |
| `banner` | faixa **full-width**, primeira do cromo | idem | idem (só mais estreita) |
| `footer` | faixa **full-width**, última do cromo | idem | idem |
| `decoration` | camada **atrás** do cromo | idem | idem |

Regra única, sem caso especial por dispositivo: **`banner` é a primeira faixa do cromo e
`footer` a última, ambas full-width**; a barra de navegação (topbar/sidebar/hambúrguer) e o
conteúdo ficam entre elas. Nada some ao trocar de dispositivo — o que não cabe **migra**
(regiões de sidebar → drawer) ou **comprime** (`topbarStart`/`topbarEnd`).

### Regras do contrato

- **Zero-config e aditivo:** todos opcionais; `brand`/`topbarActions`/`children` seguem
  idênticos. `topbarEnd` é o nome novo de `topbarActions` (mesmo lugar); passando os dois,
  `topbarEnd` vence.
- **Precedência do logo:** `logo` (ReactNode) tem precedência sobre `brand.logoUrl` (imagem
  estática). O `brand.name` continua ao lado.
- **Acessibilidade:** `decoration` é ornamento — sai da árvore de acessibilidade
  (`aria-hidden`) e **não captura foco nem toque** (`pointer-events: none`). Os demais slots
  entram na ordem natural de foco do documento, na ordem em que aparecem no layout.
- **Responsivo por padrão (Spec 40.3):** as faixas são `w-full min-w-0` (acompanham a largura
  disponível, não estouram) e as regiões de sidebar migram para o drawer no celular.
- **Zero hardcode:** as regiões medem por token (`--sarak-layout-gap-sm` no
  `sidebarHeader`/`sidebarFooter`) e não impõem fundo/borda às faixas — a estética é do
  conteúdo do consumidor, que deve usar os tokens públicos `var(--sarak-*)` para responder
  à troca de tema da central.
- **Sem lógica de negócio na lib:** o slot é `ReactNode` puro; a lib não sabe (nem pergunta)
  o que há dentro.
- **Âncoras estáveis:** cada região expõe `data-sarak-slot="<nome>"` — use para teste ou CSS
  próprio sem depender da estrutura interna do cromo.

### Qual nível usar?

- Quer **ambiente do produto inteiro** (fundo, textura, marca d'água, vídeo de fundo), que muda
  junto com o tema → **(a) tema**.
- Quer **uma faixa, um rodapé, um cabeçalho de menu, um logo animado, uma arte só no cromo** →
  **(b) slots**.
- Quer os dois → use os dois; o `decoration` fica na frente do fundo global e atrás do conteúdo.

> Relacionados: [`temas-cromo-e-multidispositivo.md`](./temas-cromo-e-multidispositivo.md)
> (temas completos, cromo e contrato de responsividade) e
> [`identidade-do-host.md`](./identidade-do-host.md) (título/favicon/marca são sempre do importador).
