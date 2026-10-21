# Relatório do importador Sarak-Lib-Login (login-completo e login-provedores), 2026-10-20

Transcrito como entregue pelo revisor dos repositórios do login, medido na lib em `18834352` sem editá-la. É **alegação**: o
que virou trabalho na lib foi conferido pelo revisor da lib e está no registro da §5.1 da plan. Caminhos `modules/…`,
`deploy/…` e `packages/…` são dos repositórios do login. Não repete o que o ERP já levou.

## Achados da lib

| Achado | Medição / evidência | Por que é da lib | Peso |
|---|---|---|---|
| `SarakAuthScreen` sempre mostra o formulário de e-mail e senha — não há login só por provedor externo | `src/components/atomic/Templates/SarakAuthScreen.tsx:41-77` e `AuthForm.tsx` sem prop para esconder o formulário; no login-provedores a entrada só redireciona ao provedor OIDC e não pode usar a tela | a tela de autenticação é da lib | essencial |
| Não há como usar CSP estrita: a lib injeta `<style>` em tempo de execução sem *nonce* e sem opção de desligar, embora exporte `./sarak.css` | `SarakUIProvider.tsx:4` e `hooks/useSarakBuildSeal.ts:4` (`injectSarakStyles`); nenhuma opção `nonce` em `src`; os dois sistemas mantêm `style-src 'self' 'unsafe-inline'` | a injeção é do Provider | essencial |
| A porta `theme.onSave` está documentada de três jeitos | `docs/persistencia-de-tema.md:68` (um argumento) × o exemplo da §5 (`(theme, operation)`); a `09` §4.6 não cita `operation`, "Novo tema" nem "Duplicar"; as ações do painel só aparecem numa entrada antiga de `docs/migracoes.md`, não na `## 8.0.0` | é o contrato que o importador implementa | essencial |
| Não há seletor de organização (tenant) no cromo | a `05` §2.2 só oferece slots; os dois sistemas mantêm o próprio | sistema multi-tenant é o caso comum | melhoria |
| A spec 13 lista `@tanstack/react-virtual` como peer obrigatório | `specs/specs/13-instalacao-e-atualizacao.md:66-68` × `package.json` (opcional desde `04c46593`) | a spec contradiz o pacote | melhoria |
| `SarakAuthScreenProps` ainda tem `role`/`density`/`importance` e JSDoc de manifesto | `SarakAuthScreen.tsx:74-76` | resto da limpeza da 8.0.0 | melhoria |
| A tabela de/para diz "26 removidos + um renomeado" sem dizer qual | `docs/migracoes.md:15` | o importador não sabe qual linha tem substituto direto | melhoria |
| Padrão dos widgets do cromo contraditório | `09` §4.7 ("não oferecidos") × `05` §2.2.2 e `migracoes.md` ("pinned") | duas specs dizem o contrário | melhoria |
| O exemplo §1.2 do guia passa `SARAK_BOOT_THEMES` em `customThemes` | `useThemeCollection` ignora id de tema embarcado em `customThemes` | exemplo que não faz o que parece | melhoria |
| Testar em jsdom exige contornos em todo importador | o CSS injetado com `@layer` não parseia (os dois sistemas silenciam no `onConsoleLog`) e o Design Engine exige `matchMedia` (polyfill em 3 arquivos de teste) | um *setup* de teste exportado pela lib resolve para todos | melhoria |
| A nota antiga cita `getLocalComponent(...)` como caminho de override | removido na 8.0.0; a `05` §2.2.2 diz `window.__SARAK_OVERRIDES__` | doc desatualizada | melhoria |
| Não há CHANGELOG; há entradas sem versão em `migracoes.md` | quem está num commit entre tags não sabe o que vale para ele | o histórico de versões é da lib | melhoria |

## Lições da importação

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Ainda vale? |
|---|---|---|---|
| `97b1720` (2026-09-17): o kit nasceu com `github:Lib-Sarak/Sarak-Lib-UI-Core`, sem ref; o lock fixou `d6a1bd4b` e a versão nunca subiu | o guia não pedia tag | §1/§2.6 do guia e START-HERE | não — a lib manda instalar pela tag |
| `35d69fb` e `fb77125`: o lock alternou `git+ssh` ↔ `git+https` para o mesmo commit | o npm normaliza a URL do git conforme a forma da dependência e a credencial | §2.6–2.8: recomendar `github:dono/repo#tag` e avisar do efeito no lock | sim |
| A 6.3.0 chamava terceiros por padrão (Google Fonts, vídeo, fotos): o importador abriu exceção de host e de CSP | o design padrão dependia de rede | §3.9/§6 | não — a 8.0.0 embute as fontes e não traz mídia de terceiro |
| O aplicado gravava 1,5 s depois de qualquer mudança, inclusive no boot (até 16 `PUT` seguidos) | autosave sem distinguir boot de edição | `persistencia-de-tema.md` | não — "o boot não grava" na 8.0.0 |
| Tema apagado ficava no seletor até recarregar | não havia `deleteTheme` | `09` | não — `deleteTheme`/`onDelete` na 8.0.0 |
| Teste do importador conferia classe Tailwind do `SarakBadge` e quebra com a forma nova de status | o importador testou o markup da lib | o guia: teste componente da lib por papel e texto, nunca por classe | sim |
| O importador copia o vocabulário de tokens para validar temas no servidor; subir a lib exige reconciliar (27 tokens saíram) | o schema muda por major sem lista legível por máquina do que saiu | `migracoes.md`: tokens removidos e renomeados em forma de dado | sim |
| Tabela, paginação, cartão das telas públicas, estados e tela de entrada feitos à mão | o kit do consumidor (`sarak-ui/`) nunca foi copiado nem consultado | a instalação devia apontar para ele (aviso no install ou no `sarak-ui check`) | sim, em parte |
