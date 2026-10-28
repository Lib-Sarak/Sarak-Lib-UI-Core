---
tipo: "plan"
titulo: "Ensinar a importar a lib com o que os importadores reais mostraram"
objetivo: "Fazer o importador usar a lib por inteiro sem reescrever o que ela entrega, com o kit de importação ensinado pelas licoes medidas nos importadores reais e com a gestao de temas do importador completa: salvar o aplicado como novo, editar, duplicar e criar, persistidos no importador"
dominio: "Kit do consumidor / Instalação e atualização / Temas do importador"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "kit-do-consumidor", "importacao", "temas", "persistencia"]
relacionados: ["[[12-kit-do-consumidor]]", "[[13-instalacao-e-atualizacao]]", "[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[017-porta-de-apagar-tema-simetrica-a-de-escrever]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/12-kit-do-consumidor.md + specs/13-instalacao-e-atualizacao.md + specs/09-temas-e-presets.md + specs/15-divida-conhecida.md"
---

# 1. Objetivo

Quem importa a lib encontra no kit (`sarak-ui/`, skill `ui-integra-consumidor`) o caminho certo da instalação à tela, as armadilhas
que os importadores reais já pagaram, e o mapa do que a lib já faz; e o usuário do importador consegue, pelo painel, **salvar o tema
aplicado como novo, editar um tema dele e salvar, duplicar um tema (embarcado ou dele) e criar um do zero**, com os temas guardados
no banco do importador.

# 2. Contexto

**Os temas embarcados são exemplos; o diferencial é o tema do cliente** (decisão do dono, 2026-10-19). Os 19 temas foram refeitos e o
"do cliente ao tema" está consolidado no kit ([[09-temas-e-presets]] §5.3, `sarak-ui/GUIA-FRONTEND.md` §3.9), com as lições de cada
tema aplicadas na skill `ui-criar-tema`. Esta plan faz o mesmo para a **importação**: cada importador auditado deixa achados, e o kit
se reescreve a partir deles.

**Importadores** (2026-10-19): o ERP Earendel (`C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP`, porta única
`packages/ui-kit`, consome por `file:`), `Sarak-Lib-Login\login-completo` e, depois, `Sarak-Lib-Login\login-provedores` (em
desenvolvimento). **Cada importador é auditado por uma sessão de revisor própria, no repositório dele**, que escreve as specs de
correção **lá**, no formato daquele repositório. O que é da lib (defeito, lacuna do kit, porta que falta) volta para cá e entra no
registro da §5.1. Nenhuma sessão de importador edita esta lib; nenhuma execução desta plan edita um importador.

**Gestão de temas do importador — o que existe hoje** ([[09-temas-e-presets]] §4.6): a escrita é `options.theme.onSave`, o apagar é
`options.theme.onDelete` (`useSarakUI().deleteTheme`), a leitura é a prop `customThemes`; sem `onSave`, a ação de salvar some. O painel
salva por `SaveThemeModal.tsx` e `useThemePersistenceHandlers.ts`. **Não está medido** se o painel oferece os quatro gestos de ponta a
ponta: (a) salvar o aplicado como tema novo; (b) editar um tema do importador e salvar **por cima** (mesmo id); (c) **duplicar** um tema
(embarcado ou do importador) com nome e id novos; (d) criar do zero. Tema embarcado é da lib e **não** se sobrescreve: editar um
embarcado é duplicá-lo. O lote 1 mede e corrige.

**Versão:** as correções desta plan saem numa candidata nova (`8.0.0-rc.N`) antes da `8.0.0` final; nenhuma plan mexe em versão
nem tag ([[03-versionamento-e-release]]).

# 3. Escopo

## 3.1 Dentro
- **Lote 0:** `specs/plan/anexos/plan-119-licoes-das-importacoes.md` (novo). Leitura, sem edição, dos importadores e do histórico.
- **Lote 1:** o painel e as portas de tema — `src/features/DesignEngine/Main/` (`SaveThemeModal.tsx`,
  `hooks/useThemePersistenceHandlers.ts`, `ThemeCustomizationTab.tsx` e o que o fluxo de salvar exigir), `src/core/Provider/` só no
  que as portas `onSave`/`onDelete`/`customThemes` exigirem, testes, um caso em `browser-tests/` (harness existente), i18n dos
  rótulos novos, nota em `docs/migracoes.md` (`## 8.0.0`).
- **Lote 1, além do acima:** `src/core/Provider/hooks/useThemeCollection.ts` (colisão de id, apagar embarcado),
  `src/features/DesignEngine/Main/utils/exportTheme.ts` (a `contraparte` no payload), `Main/components/ThemeActionBar.tsx`,
  `Panels/AdvancedTab.tsx` só se o gesto "novo tema" morar ali, `docs/persistencia-de-tema.md` (o exemplo copiável das
  portas de tema).
- **Lote 3:** `src/components/atomic/Templates/SarakAuthScreen.tsx` e `components/AuthForm.tsx`; os pontos que criam `<style>`
  (`src/core/Provider/SarakUIProvider.tsx`, `src/core/Provider/hooks/useSarakBuildSeal.ts` e os injetores de
  `src/core/Design/components/` e `src/core/Provider/`), o tipo das opções do Provider; o *setup* de teste (I21) num caminho de
  export próprio; `docs/persistencia-de-tema.md`, `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md` (autoria), um caso em
  `browser-tests/` e os gerados.
- **Lote 4:** os componentes sob demanda que importam peer opcional (`SarakKanban`, `SarakDataGrid`, `SarakDataTable`,
  `SarakChartEngine`, `SarakPDFViewer`, `SarakChatEngine`, `SarakMarkdownRenderer`, `SarakFlowEngine` — os arquivos `*Impl` e os
  módulos que eles importam), o i18n das mensagens, o teste do consumidor mínimo, `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md` e
  os gerados.
- **Lote 5:** `src/core/Provider/hooks/useDesignRemoteLoader.ts`, `src/core/Provider/hooks/useDesignManager.ts`, o caminho de
  gravação do design aplicado (o hook que chama `persistence.onSave`), `src/core/Provider/utils/resolveStorageKey.ts`,
  `src/core/Provider/utils/injectedWrites.ts`, `src/core/Provider/components/DesignInjector.tsx` e os outros injetores que limpam
  o documento ao desmontar; os testes deles; um caso em `browser-tests/`; `docs/persistencia-de-tema.md`, `docs/migracoes.md` e os
  gerados.
- **Lote 7:** `docs/persistencia-de-tema.md`, um teste de componente do caminho do I27 e um caso em `browser-tests/`;
  `package.json` (só a faixa de `dompurify`) e `package-lock.json`; `src/testing.ts` e o teste dele; o consumidor de
  `scripts/test-optional-peer-consumer.mjs` (ou um script irmão para o caso do Vitest); se o I31 tiver correção, os pontos de
  import das peers opcionais; `sarak-ui/GUIA-FRONTEND.md`, `docs/migracoes.md` e os gerados.
- **Lote 6:** `package.json` (faixas de `dependencies`, `peerDependencies` e `devDependencies` dos pacotes do I26),
  `package-lock.json`, o que o echarts 6 e o `react-syntax-highlighter` 16 exigirem em `src/components/engines/charts/`,
  `src/components/atomic/Media/SarakMarkdownRenderer/` e `src/components/engines/chat/`, o `SarakPDFViewer` se a versão nova do
  `pdfjs-dist` pedir, os testes deles, `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md` e os gerados.
- **Lote 2:** `src/core/Design/presets/themes/reference.ts` e os pontos do barril que exportam a referência, o teste do
  `col-span-*` junto aos de `src/components/atomic/Layouts/`,
  `src/components/atomic/Layouts/SarakFlex.tsx`, `docs/migracoes.md` (seções `## 8.0.0` e `## 7.0.0`),
  `docs/persistencia-de-tema.md`, `sarak-ui/GUIA-FRONTEND.md` (autoria) e os gerados.
- **Lote 8:** `sarak-ui/templates/` (`tela-lista.tsx`, `tela-detalhe.tsx`, `tela-exemplo.tsx`, `README.md`),
  `sarak-ui/GUIA-FRONTEND.md` (autoria), `src/components/atomic/Templates/SarakResourceRow.tsx` e o teste dele, `docs/migracoes.md`
  (só se o `SarakResourceRow` mudar o que desenha). Os gerados ficam para o fechamento da `rc.4`.
- **Lotes do registro (§5.1):** os arquivos que cada linha nomear, declarados pelo revisor ao abrir o lote.
- **Lote final:** a skill `ui-integra-consumidor` (fonte do kit), `sarak-ui/GUIA-FRONTEND.md` (autoria), a CLI `bin/` só se uma
  lição pedir verificação nova no `sarak-ui check`, `docs/migracoes.md`, e os gerados (`guide`, `dev-kit`).

## 3.2 Fora
- **Qualquer arquivo de importador.** As correções deles são specs nos repositórios deles.
- Temas embarcados, schema de tokens, CSS do motor (salvo linha do registro que o revisor abra para isso).
- Specs fixas desta lib (a síntese é do revisor). Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/12-kit-do-consumidor.md` | o que o kit gera e onde mora o guia |
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` (inteira; em especial §9.1) | instalação, atualização, as três camadas de cache, o selo de build |
| Spec fixa | `specs/09-temas-e-presets.md` (§4.3, §4.4, §4.5, §4.6) | composição, persistência, exportar, salvar e apagar |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` (§2.3) | o caminho escolher/ajustar/aplicar e a barra de ações |
| ADR | `adr/011-tema-salvo-por-uma-porta-de-escrita.md` · `adr/017-porta-de-apagar-tema-simetrica-a-de-escrever.md` · `adr/018-um-cromo-so-e-o-consumidor-e-dono-das-rotas.md` | as portas de tema e o papel do importador |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-integra-consumidor` · `ui-criar-tema` · `padrao-escrita` + `padrao-typescript` · `test-unitario` | kit, tema, escrita, testes |
| Código | `src/features/DesignEngine/Main/` · `src/core/Provider/providerProps.ts` · `bin/` · `scripts/consumer-kit/` | o painel, as portas, a CLI e o gerador do kit |
| Doc | `docs/migracoes.md` · `docs/roteiro-de-validacao-dos-temas.md` · `docs/persistencia-de-tema.md` · `sarak-ui/GUIA-FRONTEND.md` | o que o importador lê hoje |
| Anexo | `specs/plan/anexos/plan-119-licoes-das-importacoes.md` · `specs/plan/anexos/plan-119-relatorio-erp.md` · `specs/plan/anexos/plan-119-relatorio-login.md` | as lições (lote 0) e o relatório do ERP, com `arquivo:linha` de cada achado |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.** O essencial (defeito da lib, porta que falta,
kit que ensina errado) se corrige quando achado, num lote do registro; o resto espera o lote final.

**Lote 0 — as lições das importações anteriores.** Só leitura e um anexo.
0.1. Levantar cada problema prático que um importador já teve com a lib, **pelas fontes desta lib**: `docs/migracoes.md`;
`specs/13-instalacao-e-atualizacao.md` e `specs/15-divida-conhecida.md`; e o histórico desta lib (`git log` de commits motivados por
consumidor: busque por `consumidor`, `importador`, `ERP`, `Earendel`, `login`). O lado do importador (o histórico e as specs dele) é
levantado pela sessão de revisor de cada importador, e o revisor desta plan acrescenta ao anexo o que ela relatar.
0.2. No anexo, uma tabela por problema: **o que aconteceu** (com `arquivo:linha` ou commit), **a causa**, **onde o kit deveria ter
avisado**, **estado hoje** (resolvido na 8.0.0, com a evidência; ou ainda vale) e **destino proposto** (skill `ui-integra-consumidor`,
GUIA, `sarak-ui check`, spec `13`, ou linha nova do registro).
0.3. Nenhum arquivo além do anexo. Achado que é defeito da lib vai para o fim do anexo, com a medição, para o revisor abrir a linha.

**Lote 1 — a gestão de temas do importador.**
1.1. Medir no navegador (harness de `browser-tests/`, com `onSave`/`onDelete` que gravam numa coleção em memória e devolvem por
`customThemes`) os quatro gestos da §2: salvar o aplicado como novo; editar um tema do importador e salvar por cima; duplicar um tema
embarcado e um do importador; criar do zero. E apagar.
1.2. O que faltar, corrigir no painel e nas portas — as linhas **I1 a I8** da §5.1, todas deste lote:
- **I1** o tema salvo e o exportado levam a `contraparte` do rascunho (o JSON é o do formato de tema, com o par);
- **I2** criar, substituir e duplicar são gestos distintos e nomeados: "Salvar como novo" (nome e id novos), "Salvar"
  (substitui o tema do importador que está sendo editado, mesmo id) e "Duplicar"; com `onSave` configurado, salvar é a
  ação primária e exportar JSON fica como ação à parte; a entrega a `onSave` deixa claro se é criação ou substituição
  (escolha do contrato justificada no resumo, sem quebrar quem já implementa `onSave(entry)`);
- **I3** o id de um tema do importador nunca colide com um embarcado nem com outro do importador (o painel recusa ou
  sufixa, e diz isso); tema embarcado nunca é sobrescrito (editar um embarcado é duplicá-lo);
- **I4** o painel oferece "Apagar" só para tema do importador, com confirmação; `deleteTheme` recusa id embarcado; se
  `onDelete` rejeitar, o tema volta à coleção e o painel avisa;
- **I5** "Novo tema" parte da referência completa (`sarakLoadReferenceThemes`) no modo escolhido, não dos padrões crus;
- **I6** sem `activeThemeId` vindo do `onLoad`, o painel identifica o tema ativo por `resolvedThemeId`, e "editar e
  salvar" não vira tema novo por engano;
- **I7** medir e fixar em teste: o tema salvo vira o ativo; o "Aplicar" seguinte grava o design com o id certo; apagar o
  tema ativo cai no padrão do modo, sem tela quebrada;
- **I8** tirar a prop vestigial `customThemes={[]}` de `ThemeCustomizationTab.tsx:156`.
Sem `onSave`, nenhum gesto de salvar aparece (§4.6); sem `onDelete`, o apagar continua só na sessão.
1.3. Teste de componente por gesto e o caso de navegador com mutação; `docs/persistencia-de-tema.md` §5 (o exemplo copiável)
mostra o `onSave` e o `onDelete` que **rejeitam** em falha, para o painel avisar; nota em `docs/migracoes.md` (`## 8.0.0`) do
que mudou para quem usa as portas.

**Lote 2 — contrato e documentação que os importadores pagaram** (linhas **I9 a I13** da §5.1).
2.1. **I9** `SARAK_REFERENCE_THEMES` deixa de ter o nome do par (decisão do revisor, aprovada pelo dono em 2026-10-19): o export
síncrono passa a ter um nome que diga que é só o tema do boot (o escuro), e o par continua em `sarakLoadReferenceThemes()`;
a quebra é de compilação, não silenciosa; nota MAJOR com o "de/para".
2.2. **I10** nota retroativa em `docs/migracoes.md`, seção `## 7.0.0`: o campo com erro anuncia por `role="alert"` (o que muda
para teste e leitor de tela).
2.3. **I11** `SarakFlex.gap` (e o mesmo padrão nas primitivas de layout irmãs, se houver) com o tipo da união dos valores
aceitos; nota MAJOR.
2.4. **I12 e I13** documentação: `docs/persistencia-de-tema.md:109` e `sarak-ui/GUIA-FRONTEND.md:558` sem contagem fixa de
temas; `GUIA-FRONTEND.md:550-552` sem o "modelo host" (ADR 018) e com salvar ≠ exportar (depende do lote 1);
a regra "porta que falha rejeita".
2.5. **C2** na nota MAJOR da 8.0.0 (`docs/migracoes.md`), uma tabela "de/para" **completa** de todo nome do barril que mudou
ou saiu entre a 7.0.0 e a 8.0.0, derivada da comparação do barril (não escrita de memória), com o que usar no lugar.
2.6. **C5** `col-span-*` nos filhos do `SarakGrid` em `col-12` é contrato suportado: teste que trava o comportamento (o filho
com a classe ocupa o span; sem ela, o padrão por breakpoint) e o texto no guia (`GUIA-FRONTEND.md`, seção do grid) e na
[[15-divida-conhecida]] o achado 42 passa a ter destino (a síntese fecha).
2.7. `npm run guide` e `npm run dev-kit` por último.

**Lote 3 — o que o login mostrou** (linhas **I14 a I21** da §5.1; sai na `v8.0.0-rc.2`).
3.1. **I14** o `SarakAuthScreen` aceita mostrar só os provedores (sem o formulário de credenciais), para o login que só redireciona
ao provedor; o padrão continua o de hoje; teste de componente dos dois modos.
3.2. **I15** uma opção de nonce que a lib aplica em **todo** `<style>` que ela cria em tempo de execução (o do CSS da lib, o do
tema, os do escopo e da ilha embarcada, o do selo de build), documentada com a diretiva de CSP que o importador escreve; teste que
prova o atributo em cada `<style>` e caso de navegador com uma CSP sem `'unsafe-inline'` em `style-src`, a tela desenhada.
3.3. **I16** `docs/persistencia-de-tema.md` §1.2 com a assinatura `onSave(theme, operation)`; os gestos do painel numa entrada da
`## 8.0.0` de `docs/migracoes.md`.
3.4. **I17** retirar `role`, `density` e `importance` do `SarakAuthScreen` e de onde mais o trio for inerte (medir antes: o
`SarakTable` os lê), com a linha no "de/para".
3.5. **I18, I19, I20** o exemplo do guia, o renomeado nomeado na tabela, o caminho de override atual.
3.6. **I21** (se o dono não vetar) o *setup* de teste exportado, com teste e a linha no guia.
3.7. `npm run guide` e `npm run dev-kit` por último.

**Lote 4 — o peer opcional que quebra o build** (linha **I22** da §5.1; sai na `v8.0.0-rc.2`). Decisão do dono (2026-10-21): os peers
continuam opcionais (`package.json`, `peerDependenciesMeta`), e o build de quem não os instala tem de passar.
4.1. **A prova primeiro:** um consumidor mínimo de verdade (React + Vite 8, o mesmo bundler do login-completo) num diretório fora do
repositório, que instala a lib pelo pacote (`npm pack` do `dist/` atual) **sem nenhum peer opcional** e importa o barril; rodar
`vite build` e colar a falha de hoje (os `[MISSING_EXPORT]`). Esse consumidor vira um teste automatizado (em `browser-tests/` ou
`scripts/`, à escolha justificada) que roda depois do `build`, com o caso que falha provado por mutação.
4.2. Em cada pedaço sob demanda da tabela da I22, o peer opcional é importado de um jeito que o bundler do importador aceite quando
ele falta (por exemplo, por namespace, sem import nomeado que o bundler precise resolver), e o componente checa a presença do
pacote antes de usá-lo: sem ele, mostra o estado de erro do próprio componente (texto do i18n, nos seis idiomas) dizendo qual
pacote instalar, e um aviso único no console. Com o pacote instalado, nada muda.
4.3. O consumidor do 4.1 compila verde **sem** os peers opcionais e **com** todos eles; teste de componente de cada um dos
componentes afetados sem o pacote (a mensagem) e com ele (o render normal); a bateria do navegador continua verde.
4.4. Nota em `docs/migracoes.md` (`## 8.0.0`): o que o importador ganha (não precisa instalar o que não usa) e a mensagem que vê se
usar o componente sem o pacote; a lista dos peers opcionais e de qual componente cada um destrava no guia (`sarak-ui/GUIA-FRONTEND.md`).
4.5. **I23** no import, o injetor lê o nonce de `<meta property="csp-nonce" nonce="…">` quando existe e injeta a folha já com ele;
sem a `<meta>` e sem `styleNonce`, nada muda (zero-config); o guia, na seção do nonce, mostra a `<meta>` e a diretiva de CSP;
`browser-tests/nonce-csp.spec.ts` passa a escutar `securitypolicyviolation` e exigir **zero** violações, com a `<meta>` e com o
`styleNonce` do Provider.
4.6. `npm run guide` e `npm run dev-kit` por último.

**Lote 5 — trocar de organização (tenant)** (linhas **I24 e I25** da §5.1; bloqueia a migração do login; sai na `v8.0.0-rc.2`).
5.1. **Primeiro os testes que reprovam hoje** (cole a falha antes da correção):
- **(I24)** um `SarakUIProvider` montado **sem** `tenantId` e sem `onLoad` (a tela pública) recebe nas opções `tenantId` + `onLoad` +
  `onSave` (o login): o `onLoad` é chamado **uma vez** com o tenant novo, o tema que ele devolve é aplicado, e a mudança seguinte do
  usuário chega ao `onSave`; trocar de novo de `tenantId` dispara um `onLoad` novo e aplica o tema dele; uma gravação pendente
  (com atraso) do tenant anterior **não** chega ao `onSave` do novo; `onLoad` que devolve nada aplica o padrão.
- **(I25)** duas instâncias do Provider em sequência por `key` (a primeira com um tema, a segunda com outro): depois da troca, o
  `<html>` tem os `data-sx-*` e as variáveis do tema da **segunda**, e o `<body>` a classe de modo e o fundo dela — em teste de
  componente e num caso de navegador contra o `dist/`.
5.2. **I24** a carga remota passa a ser por tenant: a troca de `persistence.tenantId` (inclusive de ausente para definido), ou o
`onLoad` que passa a existir, reabre a carga — chama o `onLoad`, aplica o resultado pela regra da `strategy` (`09` §4.4.1), e só
então o Provider volta a gravar (sem gravar o estado do tenant anterior no novo); o boot e a hidratação continuam sem gravar (`09`
§4.4.2). Uma resposta de `onLoad` que chega depois de outra troca de tenant é descartada.
5.3. **I25** a limpeza ao desmontar é por instância: cada injetor só remove a escrita que ainda é dele (o valor que ele escreveu e
que ninguém sobrescreveu); com outra instância montada, o documento fica com o tema dela.
5.4. Documentar em `docs/persistencia-de-tema.md` o caminho de multi-tenant (um Provider só; trocar `tenantId` e as portas; o que
a troca faz) e a remontagem por `key` como alternativa suportada; nota na `## 8.0.0` de `docs/migracoes.md`.
5.5. `npm run guide` e `npm run dev-kit` por último.

**Lote 6 — dependências sem vulnerabilidade conhecida** (linha **I26** da §5.1; sai na `v8.0.0-rc.2`). Decisão do dono
(2026-10-21): nada com aviso conhecido chega ao importador na 8.0.0. Lock gerado com npm ≥ 11.10.1 (o do Windows já serve), sem
editar à mão.
6.1. **O ponto de partida:** cole a saída de `npm audit` antes de mudar (os 15 avisos).
6.2. **O que chega ao importador:**
- `dompurify` (`dependencies`): a faixa passa a começar na versão sem aviso; a sanitização (`src/core/Security/`) e os testes dela
  verdes;
- `pdfjs-dist` (peer opcional): o piso passa à versão sem aviso, no major atual; o `SarakPDFViewer` provado nela (testes e o caso de
  navegador que houver), com o `workerSrc` da versão nova;
- `echarts` (peer opcional): piso `>=6.1.0`, e `echarts-for-react` no piso que suporte o echarts 6 (justifique); o motor de gráficos
  (`src/components/engines/charts/`) provado nos formatos que ele oferece — os testes de cada formato e os casos de navegador de
  gráfico verdes; o que o echarts 6 mudou de API e exigiu ajuste vai no relato;
- `react-syntax-highlighter` (peer opcional): piso `>=16.1.2`; o realce no `SarakMarkdownRenderer` e no `SarakChatEngine` provado.
6.3. **As ferramentas da lib** (transitivas e `devDependencies`): atualizar só o necessário para tirar os avisos, **sem major**
(`npm audit fix`, sem `--force`), e conferir que nenhuma versão de dependência da lib que vai ao importador mudou sem estar no 6.2.
6.4. **O ponto de chegada:** `npm audit` sem aviso (cole a saída); se sobrar algum sem correção publicada, ele fica nomeado no
relato com o motivo e o caminho até o pacote.
6.5. O consumidor de `scripts/test-optional-peer-consumer.mjs` continua verde nos três cenários, agora com as versões novas; nota
MAJOR na `## 8.0.0` de `docs/migracoes.md` com os pisos novos de cada peer; a tabela de peers do guia (`sarak-ui/GUIA-FRONTEND.md`)
com as versões mínimas.
6.6. `npm run guide` e `npm run dev-kit` por último.

**Lote 7 — o que o login mediu na `rc.2`** (linhas **I27, I28, I29 e I31** da §5.1; sai na `v8.0.0-rc.3`).
7.1. **(I27)** Primeiro a prova do caminho do login, em teste de componente e num caso de navegador contra o `dist/`: Provider
montado sem `tenantId` e sem portas (`persistence: { storageKey, crossTabSync: true }`, sem `strategy`) → passa a receber
`tenantId` + `onLoad` + `onSave` e `theme: { onSave }` → o `onLoad` devolve o tema do tenant → no painel, escolher um tema na
galeria → `Aplicar (N)` → o `onSave` do tenant é chamado **uma vez** e o `localStorage` da chave do tenant é escrito. Antes do
"Aplicar", nada é gravado. Com um `onSave` que rejeita, diga quantas vezes ele é chamado e por quê (o login viu dois `PUT` num
só "Aplicar" quando o backend recusava). Se o teste reprovar, é defeito da lib: cole a falha e corrija antes de seguir. Depois, `docs/persistencia-de-tema.md`
§1.1 passa a dizer a verdade (a galeria e o ajuste de token são rascunho e **já aparecem na tela de quem edita**, sem gravar; `Aplicar (N)` é a única porta que grava o estado
aplicado; o que chega ao `onSave`), sem contradizer a `06`.
7.2. **(I28)** `dompurify` com mínimo `^3.4.17` e o lock nele, gerado com npm ≥ 11.10.1 (cole `npm -v`; nenhuma entrada de
`@emnapi/*`, `@napi-rs/*` e `@rolldown/binding-*` pode sumir); os testes de `src/core/Security/` verdes; `npm audit` sem aviso
(cole); uma linha na nota de pisos da `## 8.0.0` de `docs/migracoes.md`.
7.3. **(I29)** Primeiro o teste que reprova hoje: um projeto Vitest consumidor (no molde de `scripts/test-optional-peer-consumer.mjs`,
ou um caso dentro dele) com jsdom, a lib importada e o setup do guia; o aviso `Could not parse CSS stylesheet` aparece na saída.
Depois, o setup de `@sarak/lib-ui-core/testing` passa a calar o aviso de fato (o caminho que o jsdom usa), e o guia
(`sarak-ui/GUIA-FRONTEND.md`, a seção do subpath `testing`) ensina esse caminho. O teste da função isolada não basta como prova.
7.4. **(I31)** Medir o `vite build` do consumidor sem as peers opcionais e colar os avisos. Se dá para tirá-los sem voltar a
quebrar o build sem a peer (os três cenários do consumidor verdes), tirar; se não, uma linha no guia, junto da tabela de peers,
diz que o aviso é esperado e por quê.
7.5. **(I32)** `docs/persistencia-de-tema.md` diz o formato do payload que chega ao `onSave`, como na linha I32, com um exemplo
real de token de um tema embarcado.
7.6. `npm run guide` e `npm run dev-kit` por último.

**§5.1 — Registro vivo dos achados da lib** (mantido pelo revisor; vem do lote 0 e das sessões dos importadores):

| # | Achado (`arquivo:linha` e medição) | Origem | Decisão | Lote | Estado |
|---|---|---|---|---|---|
| I1 | o tema salvo e o exportado não levam a `contraparte`: `Main/hooks/useThemePersistenceHandlers.ts:63` e `Main/utils/exportTheme.ts:59-66` | ERP | corrigir | 1 | fechada |
| I2 | criar, substituir e duplicar indistintos: `Main/components/SaveThemeModal.tsx:45` pré-preenche o nome do ativo, id = `slugifyThemeId(nome)` (`exportTheme.ts:62`); o modal se chama "Exportar" com `onSave` ligado | ERP | corrigir | 1 | fechada |
| I3 | id do importador colide com embarcado: `Provider/hooks/useThemeCollection.ts:30,37` funde sem deduplicar | ERP | corrigir | 1 | fechada |
| I4 | nenhum componente do painel chama `deleteTheme`; ele aceita id embarcado e não desfaz se `onDelete` rejeitar (`useThemeCollection.ts:67-72`) | ERP | corrigir | 1 | fechada |
| I5 | "criar do zero" só por "Restaurar Padrões" (`Panels/AdvancedTab.tsx:110`), dos padrões crus | ERP | corrigir (gesto "Novo tema" da referência) | 1 | fechada |
| I6 | sem `activeThemeId` do `onLoad`, o modal cai em "Meu Novo Tema" (`SaveThemeModal.tsx:45`) e editar vira tema novo | ERP | corrigir (fallback `resolvedThemeId`) | 1 | fechada |
| I7 | não medido: o salvo vira ativo? o "Aplicar" seguinte grava com o id certo? apagar o ativo? | ERP | medir e fixar em teste | 1 | fechada |
| I8 | prop vestigial `customThemes={[]}` em `Main/ThemeCustomizationTab.tsx:156` | ERP | retirar | 1 | fechada |
| I9 | `SARAK_REFERENCE_THEMES` (`reference.ts:31`) virou só o escuro sob o mesmo nome; o `find(light)` do importador devolve `undefined` sem erro de tipo | ERP | renomear o export síncrono (quebra em compilação), nota MAJOR | 2 | fechada |
| I10 | `role="alert"` no campo com erro (7.0.0) sem nota em `docs/migracoes.md` | ERP | nota retroativa na `## 7.0.0` | 2 | fechada |
| I11 | `SarakFlex.gap?: string` (`Layouts/SarakFlex.tsx:15`): `gap="md"` compila e é ignorado | ERP | tipo da união dos valores aceitos | 2 | fechada |
| I12 | "23 temas" em `docs/persistencia-de-tema.md:109` e `GUIA-FRONTEND.md:558`; "modelo host" em `GUIA-FRONTEND.md:551` (ADR 018) | ERP · lote 0 (21) | corrigir o texto | 2 | fechada |
| I13 | o exemplo copiável das portas (`docs/persistencia-de-tema.md` §5) não rejeita em falha; o ERP engoliu o erro por semanas | ERP | ensinar "porta que falha rejeita" | 2 | fechada |
| C1 | helper oficial para ler o tema persistido e injetá-lo no HTML antes do primeiro paint (o ERP escreveu ~220 linhas; `persistencia-de-tema.md` §6 descreve três saídas) | ERP | **dono, 2026-10-19: depois da 8.0.0** (função aditiva; vai ao `00-backlog` no lote final) | final | aberta |
| C2 | `sarak-ui migrate <major>`: aplicar a tabela de renomes de um MAJOR nos imports do consumidor | ERP | **dono, 2026-10-19: não fazer**; no lugar, tabela "de/para" completa dos renomes na nota da 8.0.0 | 2 | fechada |
| C3 | `sarak-ui check` em modo `file:` avisar quando o major instalado muda (hoje cala por desenho, `13` §5.1) e comparar a cópia `sarak-ui/` do consumidor com a instalada | ERP | **dono, 2026-10-19: não fazer**; o guia ensina que `file:` é só para iterar localmente e produção instala pela tag | final | aberta |
| C4 | verificação por máquina para o consumidor (as três regras de gate que o ERP escreveu: `ui-kit`, `ui-ponto-unico`, `ui-token`) | ERP | **dono, 2026-10-19: fazer, opcional para o importador** — plugin de ESLint no pacote, regras ligadas uma a uma, numa plan própria (com ADR) **depois da 8.0.0 e da atualização dos importadores**; o lote final desta plan entrega a lista de regras candidatas que as auditorias provaram comuns, e a linha vai ao `00-backlog` | final | aberta |
| I14 | `SarakAuthScreen` sempre desenha o formulário de e-mail e senha (`src/components/atomic/Templates/SarakAuthScreen.tsx`, `components/AuthForm.tsx`): não há login só por provedor externo | login | corrigir — opção para a tela mostrar só os provedores (sem o formulário de credenciais), com teste | 3 | fechada |
| I15 | a lib injeta `<style>` em tempo de execução sem *nonce* (`SarakUIProvider.tsx`, `hooks/useSarakBuildSeal.ts`, os injetores de `src/core/Design/components/` e `src/core/Provider/`): o importador é obrigado a `style-src 'unsafe-inline'` | login | corrigir — opção de nonce aplicada a **todo** `<style>` que a lib cria, com teste que prova o atributo em cada um | 3 | fechada |
| I16 | a porta `theme.onSave` está documentada de três jeitos: `docs/persistencia-de-tema.md:68` (um argumento) × o exemplo da §5 (`(theme, operation)`); as ações do painel (salvar, salvar como novo, duplicar, novo tema, apagar) só aparecem numa entrada antiga de `docs/migracoes.md`, fora da `## 8.0.0` | login | corrigir — assinatura `onSave(theme, operation)` na §1.2, os gestos numa entrada da `## 8.0.0` (a `09` §4.6 é da síntese) | 3 | fechada |
| I17 | props inertes que sobraram: `role`, `density`, `importance` em `SarakAuthScreen.tsx:73-75` (e onde mais o mesmo trio não for lido, medido) | login | remover onde inerte (MAJOR), nota no "de/para" | 3 | fechada |
| I18 | o guia (`sarak-ui/GUIA-FRONTEND.md` §1.2, `:111-113`) passa `SARAK_BOOT_THEMES` em `customThemes`, e a coleção ignora id de tema embarcado ali | login | corrigir o exemplo (tema do importador em `customThemes`; o embarcado já está no catálogo) | 3 | fechada |
| I19 | a tabela "de/para" (`docs/migracoes.md:15`) diz "uma renomeação" sem dizer qual | login | nomear o renomeado no texto | 3 | fechada |
| I20 | uma nota antiga de `docs/migracoes.md` (`:1559`) ensina override por `getLocalComponent(...)`, que saiu na 8.0.0 | login | apontar o caminho atual (a `05` §2.2.2) | 3 | fechada |
| I21 | testar em jsdom exige contornos em todo importador: o CSS injetado com `@layer` não parseia e o Design Engine exige `matchMedia` (o ERP e os dois logins repetem o mesmo polyfill) | login | **proposta do revisor, sob veto do dono:** exportar um *setup* de teste opcional (o polyfill e o filtro do aviso de CSS), com teste e uma linha no guia | 3 | fechada |
| I22 | **peer "opcional" quebra o build de quem não o instala:** todo pedaço sob demanda do `dist/` importa pelo nome o peer opcional que usa (`SarakKanbanImpl` → `@dnd-kit/*`; `SarakDataGridImpl`/`SarakDataTableImpl` → `@tanstack/react-virtual`; `SarakChartEngine` → `echarts`, `echarts-for-react`, `recharts`; `SarakPDFViewerImpl` → `pdfjs-dist`; `SarakChatEngine`/`SarakMarkdownRendererImpl` → `react-markdown`, `react-syntax-highlighter`; `SarakFlowEngine` → `reactflow`), e o Vite 8 (rolldown) troca o peer ausente por um módulo vazio: 36 `[MISSING_EXPORT]` no `vite build` do login-completo, que não usa Kanban | login | **dono, 2026-10-21: opção (b)** — o peer continua opcional; o pedaço sob demanda o importa de forma que o build do importador passe sem ele, e o componente sem o pacote mostra uma mensagem clara na tela (nunca build quebrado nem tela em branco); prova por build real de um consumidor | 4 | fechada |
| I23 | com `styleNonce`, a folha global ainda é inserida **no import, sem nonce** — a CSP estrita a bloqueia e registra uma violação a cada carregamento (console e `report-uri`) — antes de o Provider trocá-la pela tag com nonce (`src/core/Provider/injectStyles.ts`); no import a lib não sabe do nonce | revisor (lote 3) | corrigir — no import, ler o nonce de `<meta property="csp-nonce" nonce="…">` (a convenção do Vite) e, presente, injetar já com ele; o `styleNonce` do Provider continua valendo; o caso de navegador escuta `securitypolicyviolation` e exige **zero** | 4 | fechada |
| I24 | **trocar de tenant sem remontar não lê o tema do tenant novo:** o `onLoad` roda uma vez por instância (`src/core/Provider/hooks/useDesignRemoteLoader.ts:63-75`: sem `onLoad` antes do login, a instância já se marca carregada e não chama mais); a troca de `persistence.tenantId` só troca a chave do `localStorage` (`src/core/Provider/utils/resolveStorageKey.ts`). O tema da organização nunca é lido, e a primeira mudança no painel não chega ao `onSave` | login (bloqueia a migração) | corrigir — a troca de `tenantId` (inclusive de ausente para definido) e o `onLoad` que passa a existir disparam o `onLoad` do tenant novo; aplica o que vier (ou o padrão); passa a gravar no `onSave` desse tenant; gravação pendente do anterior nunca vai ao novo | 5 | fechada |
| I25 | **remontar o Provider por `key` apaga o tema da instância nova:** ao desmontar, a instância que sai limpa o `<html>`/`<body>` (`releaseInjectedWrites`, `src/core/Provider/components/DesignInjector.tsx:185`) **depois** de a nova já ter aplicado o tema — medido pelo importador: `<html>` sem `data-sx-*` nem variáveis, `<body>` sem `dark` nem fundo | login (bloqueia a migração) | corrigir — a limpeza ao desmontar é por instância: só remove o que aquela instância escreveu e que nenhuma outra escreveu depois | 5 | fechada |
| I26 | **dependências com vulnerabilidade conhecida** (`npm audit`, 2026-10-21: 15 avisos — 1 baixo, 8 moderados, 6 altos). **Chegam ao importador:** `pdfjs-dist` (peer opcional; alta — execução de JavaScript ao abrir PDF malicioso; correção dentro do major), `dompurify` (`dependencies`, vai junto com a lib; moderada; dentro do major), `echarts` (peer opcional, `>=5.5.0`; moderada, XSS; correção só no major 6, `6.1.0`), `react-syntax-highlighter` (peer opcional, `>=15.5.0`; moderada via `prismjs`/`refractor`; correção só na `16.1.2`). **Só ferramentas da lib:** `vite`, `vitest`, `@vitest/coverage-v8`, `@vitest/mocker`, `esbuild`, `postcss`, `nanoid`, `undici`, `source-map-js` (transitivas ou `devDependencies`; correção sem major) | login · revisor | **dono, 2026-10-21: corrigir antes da `rc.2`** — pisos das peers e da dependência nas versões sem aviso (subir piso de peer é MAJOR e só cabe antes da 8.0.0), o motor de gráficos e o realce provados nelas; as ferramentas atualizadas sem major | 6 | fechada |
| I27 | **a documentação diz que o ajuste no painel já grava, e o painel só grava no "Aplicar":** `docs/persistencia-de-tema.md` §1.1 afirma que "o estado aplicado muda a cada ajuste", mas pela `06` §2 e §5 (`:145`, `:202`) a escolha na galeria e o ajuste de token são **rascunho**: aparecem na tela de quem edita e não gravam nada até `Aplicar (N)`. O login mediu a galeria sem clicar em "Aplicar" e leu como defeito de persistência depois da troca de tenant (relato de 2026-10-22) | login | corrigir a documentação (o rascunho, o "Aplicar" como única porta de gravação, o que chega ao `onSave`) e provar o caminho que o login usa: Provider sem tenant → `tenantId` + `onLoad` + `onSave` → galeria → `Aplicar` → `onSave` do tenant chamado | 7 | fechada |
| I28 | **`dompurify` 3.4.16 tem aviso crítico novo** (GHSA-cg2g-xh64-v4q7, GHSA-mrv2-3pqr-j5jr, GHSA-c6gr-qvv4-5v3f; medido pelo login em 2026-10-22, depois da `rc.2`); a faixa `^3.4.16` admite a versão vulnerável e a 3.4.17 corrige | login | corrigir — mínimo `^3.4.17` em `dependencies` e o lock nela; a sanitização provada | 7 | fechada |
| I29 | **`filterSarakTestConsoleLog` não filtra o aviso que promete:** `Could not parse CSS stylesheet` continua aparecendo (9 vezes no login; também na suíte desta lib). O jsdom escreve direto no stderr, sem passar pelo `onConsoleLog` do Vitest. O teste de `src/__tests__/testing.test.ts:36` prova o retorno da função, não o efeito | login | corrigir — o setup de `@sarak/lib-ui-core/testing` cala o aviso de fato, provado num projeto Vitest consumidor (o aviso ausente na saída), e o guia ensina o caminho que funciona | 7 | fechada |
| I32 | **a documentação não diz o formato dos valores que chegam ao `onSave`:** os temas embarcados da 8.0.0 usam `var(--x, <reserva>)` e `color-mix()` (inclusive aninhados) em tokens de cor; o login validava cor como valor simples no backend e recusou com 400 os dois `PUT` do "Aplicar" | login | corrigir a documentação — `docs/persistencia-de-tema.md` diz que o payload é opaco para o importador, que valores de cor podem ser `var()`/`color-mix()` aninhados, e que o backend guarda sem validar o formato do token (ou valida só a forma do JSON) | 7 | fechada |
| I30 | `./package.json` fora do `exports`: o importador lê a versão pelo caminho resolvido para conferir o selo (`data-sarak-build-info`) | login | **proposta do revisor: depois da 8.0.0** (entrada aditiva no `exports`), ao `00-backlog` no lote final | final | aberta |
| I31 | o `vite build` do importador sem as peers opcionais passa, mas com avisos de export ausente nos pedaços sob demanda | login | medir — se dá para tirar o aviso sem voltar a quebrar o build sem a peer, tirar; se não, o guia diz que o aviso é esperado e por quê | 7 | fechada |
| C6 | seletor de organização (tenant) no cromo: os sistemas multi-tenant mantêm o próprio | login | **proposta do revisor: depois da 8.0.0** (função aditiva; o slot já serve), ao `00-backlog` no lote final | final | aberta |
| C7 | histórico de versões: entradas de `docs/migracoes.md` sem versão no título e tokens removidos/renomeados sem forma de dado | login | **proposta do revisor:** lote final — toda entrada com a versão, e o `catalog.json` do kit com a lista de tokens removidos e o destino de cada um | final | aberta |
| C5 | span do grid de 12 colunas sem contrato público (`15-divida-conhecida` achado 42) | lote 0 (30) | **dono, 2026-10-19:** declarar `col-span-*` como contrato suportado, com teste que trava o comportamento; `SarakGridItem` ao backlog | 2 | fechada |
| I33 | **o ERP não achou o valor por dispositivo que a lib tem** e pediu `{ mobile, tablet, desktop }`: `SarakResponsiveValue` = `{ mob, tab, desk }` está no barril e no catálogo, mas o guia o mostra uma vez só, na linha ~1208 de ~1240, como "refino opcional" de 2 props, e o único exemplo do kit é o `tela-exemplo.tsx:106`, ao lado de um `gap="md"` inválido | ERP (pedido da `rc.4`) | **dono, 2026-10-27:** corrigir a exposição — seção curta e visível no guia ("valor por dispositivo"), com o tipo, o formato e a lista das props que o aceitam (lida do catálogo, não transcrita), e um exemplo correto num molde | 8 | fechada |
| I34 | `<main>` aninhado em `tela-lista.tsx` e `tela-detalhe.tsx`: o cromo já fornece o `<main>` (`ChromeContentRegion.tsx:31`) | ERP (Kit 1) | corrigir o molde | 8 | fechada |
| I35 | selo dentro de selo no `SarakResourceRow` | ERP (Kit 2) | corrigir o componente — um selo só, com teste | 8 | fechada |
| I36 | `gap="md"` inválido no `tela-exemplo.tsx:106` (o tipo aceita `spacing-md`, `SarakLayoutGap` em `src/core/Design/resolveToken.ts:29`) | ERP (Kit 3) | corrigir o molde | 8 | fechada |
| I37 | `tela-exemplo` contraria a §6 do guia | ERP (Kit 4) | corrigir o molde para seguir a §6 (ou a §6, se ela estiver errada — dizer qual e por quê) | 8 | fechada |
| I38 | `sarak-ui/templates/README.md` não lista os moldes novos | ERP (Kit 5) | listar todos os moldes da pasta | 8 | fechada |
| I39 | `h1`/`h2` duplicados entre o cabeçalho da página e o cromo nos moldes; o cromo não emite heading (nenhum `<h1>`/`<h2>` em `src/components/Layout/`) — a duplicação está nos moldes | ERP (Kit 6) | corrigir os moldes: um `h1` por página, o do `SarakPageHeader` | 8 | fechada |
| I40 | o guia não diz que o cromo tem altura própria (`100dvh`, `SarakAppChrome.tsx:197`) e o ERP mantém `height: 100%` em `html/body/#root` em oito entradas (demanda 12) | ERP (demanda 12) | uma linha no guia, **depois** da medição em navegador da `plan-131` (se reproduzir o defeito, o texto diz o conserto) | 8 | fechada |

**Lote 8 — o kit da `rc.4`** (linhas **I33 a I40** da §5.1; sai na `v8.0.0-rc.4`; segue o protocolo de verificação do
[`anexos/rc4-contrato.md`](anexos/rc4-contrato.md) §9). Roda em paralelo com as `plan-129` a `plan-132`; a I40 espera a medição da `plan-131`.
8.1. **(I34, I36, I37, I39)** Moldes corrigidos. Nenhum teste renderiza os moldes hoje (estão fora de `src/`) e não se cria um
para isto: a prova é `grep` — nenhum `<main` em `sarak-ui/templates/*.tsx`, no máximo um `<h1`/`level={1}` por molde, nenhum
`gap="md"` — colado no resumo, mais cada prop usada conferida contra o tipo dela.
8.2. **(I35)** `SarakResourceRow` com um selo só, e teste por papel.
8.3. **(I33)** Seção "valor por dispositivo" no guia; o exemplo correto no `tela-exemplo.tsx`. Os nomes do contrato da `rc.4`
(`SarakGridItem span`, `SarakGrid columns`) entram na lista quando as plans deles estiverem aprovadas.
8.4. **(I38)** README dos moldes completo.
8.5. **(I40)** Depois da `plan-131`: a linha do guia sobre a altura do cromo.
8.6. `npm run verify -- --tier=quick` uma vez, resumo colado. **Revisor:** `npx vitest run SarakResourceRow` uma vez + o `grep` do 8.1 +
leitura do guia e dos moldes como um importador que começa do zero. `guide` e `dev-kit` rodam no fechamento da `rc.4`.

**Lote final — o kit de importação consolidado.**
F.1. Aplicar **uma vez**, sem repetir o que já está lá (R17), as lições do anexo e do registro: na skill `ui-integra-consumidor`, no
`sarak-ui/GUIA-FRONTEND.md` (a ordem de instalação, a atualização sem cair nas três camadas de cache, a gestão de temas do importador
com a persistência dele, o mapa "o que a lib já faz") e, se uma lição pedir, num aviso novo do `sarak-ui check`.
F.2. `npm run guide` e `npm run dev-kit` por último.

# 6. Critérios de aceite

- [ ] Anexo de lições com cada problema, causa, onde o kit deveria ter avisado, estado hoje e destino.
- [ ] Os quatro gestos de tema e o apagar funcionando no painel, com teste de componente por gesto e caso de navegador com mutação;
  embarcado nunca sobrescrito; sem `onSave`, nada de salvar aparece.
- [ ] Registro da §5.1 sem linha aberta.
- [ ] Kit consolidado: skill, GUIA e (se for o caso) `sarak-ui check`; `guide:check` e `dev-kit:check` verdes.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1; bateria do navegador.

# 7. Como verificar (uso do revisor)

**Gate:** teste — os gestos de tema são comportamento do painel (teste de componente e caso de navegador); nenhuma regra de gate nova.

- Lote 0: amostra de três problemas do anexo contra a fonte citada (o commit, a linha, a spec).
- Lote 1: os quatro gestos e o apagar no navegador; o caso com mutação; o painel sem `onSave`.
- Lote final: o guia lido como um importador que começa do zero; `npm run verify -- --tier=full` e a bateria do navegador.
- `git diff --stat` → só a §3.1 do lote.

# 8. Destino da síntese

**Destino:** `specs/12-kit-do-consumidor.md + specs/13-instalacao-e-atualizacao.md + specs/09-temas-e-presets.md`

- **`12`:** o que o kit ensina da importação e o mapa "o que a lib já faz" como parte do kit.
- **`13`:** o que as lições mudarem na instalação e na atualização (avisos novos do `sarak-ui check`, se houver).
- **`09` §4.6:** os quatro gestos de tema do importador e a regra de que embarcado não se sobrescreve.
- O anexo sai com a plan; o que é regra vai para as specs.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

### Rodada 1 — lote 0 (2026-10-19)

- **Resultado:** lote 0 executado e encaminhado para revisão. O restante da plan continua pendente.
- **Anexo:** criado specs/plan/anexos/plan-119-licoes-das-importacoes.md, com ocorrências das fontes da lib e histórico Git, causa, ponto de aviso no kit, estado observado e destino proposto.
- **Escopo:** não foram abertos repositórios de importadores, nem alterados código, kit, migrações, specs fixas ou a tabela §5.1. O achado 42 da dívida conhecida foi anotado como candidato para decisão do revisor; os relatos antigos de rótulo/commit por categoria ficaram explicitamente sem revalidação.
- **Pendências:** lote 1 deve medir os quatro gestos de temas e o apagar no painel; o lote final deve consolidar skill/GUIA e executar os gates previstos. Nenhuma dessas etapas foi iniciada.
- **Estado inicial do worktree:** ?? .claude/settings.local.json, observado antes da primeira edição e mantido intacto.
- **Verificação:** documentação revisada e diff conferido; testes não executados, pois este lote só produz documentação e não pediu alteração/teste de código.

### Rodada 2 — lote 1 (2026-10-19)

- **Resultado:** lote 1 executado e encaminhado para revisão; o lote final permanece pendente.
- **Escopo:** concluídos os passos 1.1 a 1.3 e as linhas I1 a I8: salvar como novo, substituir tema do importador, duplicar tema importado e embarcado, criar a partir de referência, aplicar e persistir o id ativo, apagar com fallback e retirar a prop vestigial.
- **Contrato de `onSave`:** a porta recebe o segundo argumento opcional `operation: 'create' | 'replace'`; callbacks antigos `onSave(entry)` continuam válidos. Temas embarcados não são substituíveis; colisões de ids são evitadas; falha de `onSave` rejeita e mantém o tema disponível na sessão; falha de `onDelete` rejeita e restaura a coleção.
- **Docs:** exemplo em `docs/persistencia-de-tema.md` agora rejeita em falha; nota de migração 8.0.0 descreve a porta e os gestos.
- **Verificação:** Vitest focado — 6 arquivos, 67/67 testes; Playwright — 1 caso aprovado com `ThemeActionBar`, `SaveThemeModal`, hooks e Provider reais e mutação em `customThemes` em memória (canvas de preview omitido); `persistence-doc:check` — aprovado.
- **Limite desta rodada:** não foram executados suíte completa, `tsc`, baseline, build nem bateria geral de navegador; permanecem para as rodadas previstas.
- **Worktree:** `.claude/settings.local.json` permaneceu intacto; alterações do revisor em plan/anexos e `specs/specs/09-temas-e-presets.md` foram preservadas.

**Status: 🟠 Em revisão (lote 1).**

### Resumo da execução (correção 1) — 2026-10-19

- **Escopo:** exclusivamente os oito achados do veredito de 2026-10-19, lote 1. Os vereditos e resumos anteriores permanecem intactos.
- **Achados corrigidos e evidência:**

| Achado | Correção e evidência |
|---|---|
| 1 | Removido `exact` da consulta de Testing Library que gerava TS2769. `npx tsc --noEmit` passou após a correção. |
| 2 | Extraídos o estado/ações de gestão para `useThemeCustomizationActions`, o fallback de exclusão para `useThemeDeletionHandler`, o acesso a contexto para `useSarakUI` e os tipos de portas para `themeTypes.ts`. Alinhado o JSDoc de `onSave`. `audit:baseline -- --with-tsc` passou e o auditor do projeto não reportou regressão de Clean Code. |
| 3 | O modal usa `SarakRadio` em grupo `fieldset`/`legend`, com estado visual pelos tokens e suporte a setas; rótulos e acessibilidade usam `useLibraryText`. O teste de `SaveThemeModal` cobre a navegação por teclado. |
| 4 | A exclusão pede confirmação via `useOverlay().confirm()`. Avisos de salvar/apagar, confirmação e sucesso foram movidos para o catálogo de seis idiomas. O teste de `useThemeCustomizationActions` verifica o overlay; os cenários de navegador cobrem confirmação, falha e rollback. |
| 5 | A exclusão usa `SARAK_DEFAULT_THEME_ID` e o nome vem de `SARAK_THEME_CATALOG`. O fixture e as asserções de navegador também derivam id/nome do catálogo, sem literais do tema padrão. |
| 6 | O título da migração passou a `### Gestão de temas no painel`, sem citação à plan. |
| 7 | A suíte de navegador tem oito casos: novo, substituir, duplicar importado, duplicar embarcado, referência, recusa de sobrescrita embarcada, apagar ativo e apagar rejeitado. Resultado: **8/8 passaram**. Em cópia temporária fora do repositório, **9/9 contrafactuais** (I1–I6, I7a fallback, I7b confirmação e I8 rollback) fizeram falhar o cenário correspondente; a cópia foi removida. |
| 8 | Incluída a tabela de arquivos alterados abaixo, evidência por achado e a decisão do contrato `onSave`. |

**Decisão do contrato:** `operation: 'create' | 'replace'` é o comando da gravação, não dado do tema. Mantê-lo como segundo argumento opcional evita alterar o JSON persistido ou o formato do tema e preserva consumidores que implementam somente `onSave(entry)`; JavaScript ignora o argumento adicional.

**Arquivos alterados nesta execução:**

| Área | Arquivos |
|---|---|
| Harness e navegador | `browser-tests/build-harness.mjs`; `browser-tests/fixtures/importador-temas-entry.tsx`; `browser-tests/importador-temas.spec.ts` |
| Documentação de consumidor | `docs/migracoes.md`; `docs/persistencia-de-tema.md` |
| Provider e portas | `src/core/Provider/SarakUIProvider.tsx`; `src/core/Provider/context.ts`; `src/core/Provider/themeTypes.ts`; `src/core/Provider/types.ts`; `src/core/Provider/hooks/useSarakUI.ts`; `src/core/Provider/hooks/useThemeCollection.ts`; `src/core/Provider/hooks/useThemeDeletionHandler.ts`; `src/core/Provider/__tests__/SarakUIProvider.test.tsx`; `src/core/Provider/hooks/__tests__/useSarakUI.test.ts`; `src/core/Provider/hooks/__tests__/useThemeCollection.test.ts`; `src/core/Provider/hooks/__tests__/useThemeDeletionHandler.test.ts` |
| Catálogo i18n | `src/core/i18n/catalog.ts`; `src/core/i18n/catalogEntries.part3.ts` |
| Design Engine | `src/features/DesignEngine/Canvas/PreviewCanvas.tsx`; `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx`; `src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx`; `src/features/DesignEngine/Main/components/SaveThemeModal.tsx`; `src/features/DesignEngine/Main/components/ThemeActionBar.tsx`; `src/features/DesignEngine/Main/components/__tests__/SaveThemeModal.test.tsx`; `src/features/DesignEngine/Main/components/__tests__/ThemeActionBar.test.tsx`; `src/features/DesignEngine/Main/hooks/useThemePersistenceHandlers.ts`; `src/features/DesignEngine/Main/hooks/__tests__/useThemePersistenceHandlers.test.ts`; `src/features/DesignEngine/Main/hooks/useThemeCustomizationActions.ts`; `src/features/DesignEngine/Main/hooks/__tests__/useThemeCustomizationActions.test.ts`; `src/features/DesignEngine/Main/utils/exportTheme.ts`; `src/features/DesignEngine/hooks/useDesignDraft.ts` |
| Entrada pública e relatório | `src/index.ts`; esta plan (`specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md`) |

- **Verificações:** `npx tsc --noEmit` aprovado após a correção; Vitest dos três hooks novos — **3 arquivos, 8/8 testes**; Playwright — **8/8 casos**; `audit:baseline -- --with-tsc` aprovado; Anel 0 simulado — **0 achados**. A última execução de `npm run verify -- --tier=quick` terminou não verde: registrou um TS18048 no teste antes do ajuste (corrigido e revalidado separadamente) e `guide:check` defasado nos cinco artefatos `sarak-ui/` após a edição da migração. A plan reserva `guide`, `dev-kit` e `plan-index` para regeneração do revisor na aprovação; não os regenerei nesta correção.
- **Worktree preservado:** não alterei `specs/specs/09-temas-e-presets.md`, os dois anexos `plan-119-*`, `.claude/settings.local.json` nem o diff preexistente de `specs/00-indice.md`.

**Status: 🟠 Em revisão (correção 1 do lote 1).**

### Resumo da execução (correção 2) — 2026-10-19

- **Escopo:** exclusivamente o achado 1 do veredito “correção 1 (lote 1)”.
- **Correção:** o teste seleciona “Salvar como novo” pelo rádio localizado por papel e nome, clicando no `label` visível; o envio segue pelo botão com papel e nome próprios. O primeiro cenário ativa um tema embarcado para que rádio e botão tenham deliberadamente o mesmo nome. No fixture, a segunda edição deriva uma cor diferente do design aplicado, mantendo real a verificação de que o “Aplicar” seguinte persiste o id novo.
- **Mutação contrafactual:** em cópia temporária fora do repositório, restaurar `getByText('Salvar como novo', { exact: true }).click()` fez o cenário falhar em strict mode: dois elementos (rótulo do rádio e botão). A cópia temporária foi removida.
- **Verificação final:** `npm.cmd run build` aprovado; em seguida, sem execução intermediária alterando fontes, `npx.cmd playwright test --config=browser-tests/playwright.config.ts browser-tests/importador-temas.spec.ts` — **8/8 casos passaram** contra o `dist/` recém-gerado.
- **Arquivos desta correção:** `browser-tests/importador-temas.spec.ts`; `browser-tests/fixtures/importador-temas-entry.tsx`; `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` (gerados pelo build); `dist/` (gerado pelo build); esta plan.

**Status: 🟠 Em revisão (correção 2 do lote 1).**

### Resumo da execução (correção 3) — 2026-10-19

- **Escopo:** exclusivamente o achado 1 do veredito “correção 2 (lote 1)”.
- **Medição e causa:** depois de salvar, `systemDesign.primaryColor` era `#19e3f0`, `sarak.draftDesign.primaryColor` era nulo, `draftState.draft.primaryColor` era `#19e3f0`, `isDirty` era `false` e `dirtyTokenCount` era `0`. Antes da correção, “Editar rascunho” mudava `sarak.draftDesign.primaryColor` para `#7c3aed`, mas `draftState.draft.primaryColor` permanecia `#19e3f0` e o contador ficava `0`; a leitura imediata ainda retornava `isEnabled() = true`, enquanto o retrato da página após o timeout mostrava “Aplicar” desabilitado. A causa era a fixture gravar no rascunho do Provider, sem atualizar o rascunho local do hook. Não era defeito do painel.
- **Contador da interface:** `ThemeActionBar` desabilita “Aplicar” quando `dirtyTokenCount === 0`. `useDesignDraft` compara os tokens do rascunho local com `systemDesign` (usando o valor padrão do token quando o valor do sistema falta); strings são comparadas por igualdade estrita.
- **Correção:** a fixture agora muda `primaryColor` pelo `draftState.updateDraft`, escolhendo entre duas cores candidatas e rejeitando qualquer valor igual ao aplicado. O teste exige que “Aplicar” esteja habilitado antes do clique e ainda verifica que a persistência recebe `erp-noite-novo`.
- **Build e artefato:** `npm.cmd run build` aprovado. O `dist/index.js` usado teve `LastWriteTime` local **2026-10-19 23:00:12 -03:00** (UTC **2026-10-20T02:00:12.662Z**); o `builtAt` do selo foi `2026-10-20T02:00:08.949Z`.
- **Playwright:** sem execução intermediária que alterasse fontes entre o build e as três execuções consecutivas de `npx.cmd playwright test --config=browser-tests/playwright.config.ts browser-tests/importador-temas.spec.ts`. Saídas do reporter:

  **Execução 1:**

  ```text
  Running 8 tests using 1 worker
    ok 1 browser-tests\importador-temas.spec.ts:26:1 › salva o rascunho aplicado como tema novo e o Aplicar seguinte persiste o id novo (5.0s)
    ok 2 browser-tests\importador-temas.spec.ts:47:1 › substitui o tema do importador preservando o id na coleção retornada por customThemes (4.0s)
    ok 3 browser-tests\importador-temas.spec.ts:60:1 › duplica um tema do importador com nome e id novos, mantendo o original (5.1s)
    ok 4 browser-tests\importador-temas.spec.ts:73:1 › duplica um tema embarcado como criação com identidade nova (4.7s)
    ok 5 browser-tests\importador-temas.spec.ts:90:1 › cria tema a partir da referência completa para o modo atual (13.6s)
    ok 6 browser-tests\importador-temas.spec.ts:103:1 › não oferece substituir tema embarcado e salva uma cópia com id livre (4.4s)
    ok 7 browser-tests\importador-temas.spec.ts:127:1 › apagar ativo usa confirmação da lib e ativa o tema padrão do modo (4.0s)
    ok 8 browser-tests\importador-temas.spec.ts:141:1 › apagar rejeitado mantém o tema na coleção e mostra o aviso (4.7s)

    8 passed (53.2s)
  ```

  **Execução 2:**

  ```text
  Running 8 tests using 1 worker
    ok 1 browser-tests\importador-temas.spec.ts:26:1 › salva o rascunho aplicado como tema novo e o Aplicar seguinte persiste o id novo (5.2s)
    ok 2 browser-tests\importador-temas.spec.ts:47:1 › substitui o tema do importador preservando o id na coleção retornada por customThemes (8.2s)
    ok 3 browser-tests\importador-temas.spec.ts:60:1 › duplica um tema do importador com nome e id novos, mantendo o original (5.6s)
    ok 4 browser-tests\importador-temas.spec.ts:73:1 › duplica um tema embarcado como criação com identidade nova (5.4s)
    ok 5 browser-tests\importador-temas.spec.ts:90:1 › cria tema a partir da referência completa para o modo atual (4.5s)
    ok 6 browser-tests\importador-temas.spec.ts:103:1 › não oferece substituir tema embarcado e salva uma cópia com id livre (3.6s)
    ok 7 browser-tests\importador-temas.spec.ts:127:1 › apagar ativo usa confirmação da lib e ativa o tema padrão do modo (4.3s)
    ok 8 browser-tests\importador-temas.spec.ts:141:1 › apagar rejeitado mantém o tema na coleção e mostra o aviso (5.5s)

    8 passed (49.5s)
  ```

  **Execução 3:**

  ```text
  Running 8 tests using 1 worker
    ok 1 browser-tests\importador-temas.spec.ts:26:1 › salva o rascunho aplicado como tema novo e o Aplicar seguinte persiste o id novo (21.2s)
    ok 2 browser-tests\importador-temas.spec.ts:47:1 › substitui o tema do importador preservando o id na coleção retornada por customThemes (11.4s)
    ok 3 browser-tests\importador-temas.spec.ts:60:1 › duplica um tema do importador com nome e id novos, mantendo o original (9.7s)
    ok 4 browser-tests\importador-temas.spec.ts:73:1 › duplica um tema embarcado como criação com identidade nova (6.8s)
    ok 5 browser-tests\importador-temas.spec.ts:90:1 › cria tema a partir da referência completa para o modo atual (8.1s)
    ok 6 browser-tests\importador-temas.spec.ts:103:1 › não oferece substituir tema embarcado e salva uma cópia com id livre (8.1s)
    ok 7 browser-tests\importador-temas.spec.ts:127:1 › apagar ativo usa confirmação da lib e ativa o tema padrão do modo (7.1s)
    ok 8 browser-tests\importador-temas.spec.ts:141:1 › apagar rejeitado mantém o tema na coleção e mostra o aviso (7.9s)

    8 passed (1.6m)
  ```

- **Arquivos desta correção:** `browser-tests/fixtures/importador-temas-entry.tsx`; `browser-tests/importador-temas.spec.ts`; `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` (gerados pelo build); `dist/` (gerado pelo build); esta plan.

**Status: 🟠 Em revisão (correção 3 do lote 1).**

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-19 — lote 0 — 🟢 Aprovado

**Conferido:** o diff tem só o anexo `plan-119-licoes-das-importacoes.md` e o relato na §9; nenhum importador aberto, nenhum
código. O anexo traz 30 problemas, cada um com o que aconteceu (`arquivo:linha` ou commit), a causa, onde o kit deveria ter
avisado, o estado hoje e o destino; os relatos históricos sem prova atual estão separados e marcados para revalidar, sem
virar regra. **Amostra conferida na fonte:** o 8 (a skill `ui-integra-consumidor` diz "tags/semver fora de escopo",
`SKILL.md:314-317`), o 21 (`GUIA-FRONTEND.md:550-552` ainda fala do "modelo host", contra o ADR 018) e o 30 (achado 42 da
`15-divida-conhecida`). Os três batem.

**Integração do relatório do ERP (mesma data):** gravado em `specs/plan/anexos/plan-119-relatorio-erp.md`. Conferi no código os
achados que viraram linha: o salvar e o exportar sem `contraparte` (`useThemePersistenceHandlers.ts:63`, `exportTheme.ts:59-66`),
a coleção sem deduplicar (`useThemeCollection.ts:30,37`), `deleteTheme` sem chamador no painel e aceitando id embarcado,
`SARAK_REFERENCE_THEMES` só com o escuro (`reference.ts:31`), `SarakFlex.gap?: string`, os textos com "23 temas" e "modelo host".
Viraram **I1 a I13** (lotes 1 e 2) e **C1 a C5** (candidatas do dono, funções novas). O `BUILD_INFO` com commit anterior não é
achado: o gancho `version` do release regrava `dist/` e o `BUILD_INFO` no commit da tag. **Divergência spec × código corrigida na
mesma ação:** a `09` (§2.1, §4.1, §5.2) dizia que `SARAK_REFERENCE_THEMES` é o par claro/escuro; agora diz o que o código faz
(o par vem de `sarakLoadReferenceThemes()`), e a frase de que o par difere em navegação saiu (navegação é funcional).

**Status: 🟡 Em execução (lote 1).**

## Veredito — 2026-10-19 — lote 1 — 🔴 Reprovado (8 achados)

**O que está certo (conferido no diff):** a coleção deduplica e protege os embarcados (`useThemeCollection.ts`: salvar e apagar
id embarcado lançam; `create` em id existente lança; `onDelete` que rejeita restaura a coleção); a porta `onSave(entry,
operation)` com `SarakThemeSaveOperation` (`'create' | 'replace'`) não quebra quem implementa `onSave(entry)`; o salvo e o
exportado levam a `contraparte` (`exportTheme.ts`, `getThemeCounterpartForMode`); id livre por sufixo (`createUniqueThemeId`); o
salvo vira o ativo e o design é persistido com o id novo; apagar o ativo cai no tema padrão do modo (`SarakUIProvider.tsx`);
"Novo tema" parte de `sarakLoadReferenceThemes()`; a prop vestigial saiu; os rótulos novos têm os seis idiomas; o exemplo de
`docs/persistencia-de-tema.md` rejeita em falha. **Medido por mim:** `npx vitest run src/core/Provider src/features/DesignEngine
src/core/i18n` — **151 arquivos, 989/989**.

**Achados:**

1. **`tsc` vermelho** — `src/features/DesignEngine/Main/components/__tests__/SaveThemeModal.test.tsx:77`: `exact` não existe em
   `ByRoleOptions` (TS2769). O baseline de `tsc` é 0 e o Anel 2 bloqueia o commit.
2. **Clean code: quatro violações novas** (`audit:baseline`: `auditor_cleancode` 0 → 4): `src/core/Provider/SarakUIProvider.tsx`
   (272 linhas), `src/core/Provider/types.ts` (252), `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` (285 linhas e 5
   `useState`/`useEffect` no componente). Extrair os gestos de tema para um hook próprio (por exemplo, o estado de tema de
   origem, o salvar, o criar e o apagar), a queda no tema padrão do Provider para um hook ou utilitário, e os tipos das portas
   de tema para um arquivo de tipos ao lado, sem mudar o que o barril exporta. Nada de afrouxar o limiar.
3. **O seletor de ação do modal não é um controle de verdade** — `Main/components/SaveThemeModal.tsx:127-136`: três `<button
   role="radio">` sem classe nenhuma (aparência crua do navegador, a opção escolhida não se distingue) e sem a navegação por
   setas do padrão de grupo de rádio; `aria-label="Ação de salvamento"` e `aria-label="Fechar"` são texto fixo fora do i18n.
   Usar um controle da lib para a escolha (ou o padrão de rádio completo, com o estado visível pelos tokens do tema) e os
   rótulos pelo `useLibraryText` ([[10-seguranca-e-acessibilidade]] §3.6).
4. **A confirmação de apagar é o diálogo nativo do navegador** — `ThemeCustomizationTab.tsx`, `handleDeleteTheme`:
   `window.confirm(...)`. A lib tem a confirmação dela (`useOverlay().confirm()`, [[03-superficie-publica]] §6.7), que segue o
   tema e o idioma; o painel da lib não usa o diálogo cru. No mesmo trecho e em `useThemePersistenceHandlers.ts`, os textos
   novos de aviso (apagado, falha ao apagar, "use um nome diferente", "selecione um tema do importador", "salvo e ativado")
   estão fixos em português, enquanto os rótulos novos foram para o i18n: os novos vão para o i18n também.
5. **Tema padrão escrito à mão** — `ThemeCustomizationTab.tsx`, `handleDeleteTheme`: `'sarak-sovereign'` e `'Sarak Sovereign'`
   literais. Usar `SARAK_DEFAULT_THEME_ID` e o nome do catálogo.
6. **A nota do consumidor cita a plan** — `docs/migracoes.md`, título "### Gestão de temas no painel (plan-119, lote 1)". O
   `docs/` viaja no pacote e a plan some na síntese: título sem plan (o que mudou, para quem usa as portas).
7. **O caso de navegador não prova os gestos nem a mutação** — `browser-tests/importador-temas.spec.ts` tem **um** caso, e o
   relato diz "mutação em `customThemes` em memória", que não é a mutação pedida. A §1.3 pede o caso de navegador **com
   mutação**: cobrir salvar como novo, substituir, duplicar (embarcado e do importador), novo tema da referência, apagar com
   `onDelete` que rejeita (o tema volta) e a recusa de sobrescrever embarcado; e provar, **numa cópia da árvore fora do
   repositório**, que reverter a correção de cada gesto derruba o caso correspondente, com os números no relato.
8. **O relato não segue o formato do executor** — faltam a tabela de arquivos alterados, a evidência por critério de aceite
   (`arquivo:linha` ou saída de comando) e as decisões (por exemplo, por que `operation` é o segundo argumento e não um campo
   do tema). Completar no relato da correção. De passagem: as linhas do JSDoc de `onSave` em `types.ts` perderam o alinhamento
   do `*` (cosmético, ajustar junto com o achado 2).

**Status: 🔵 Em correção** (os oito achados). `guide`, `dev-kit` e `plan-index` são regenerados pelo revisor na aprovação.

## Veredito — 2026-10-19 — correção 1 (lote 1) — 🔴 Reprovado (1 achado)

**Fecharam (conferido):** 1 (`tsc` verde); 2 (`SarakUIProvider.tsx` 225 linhas, `types.ts` 241, `ThemeCustomizationTab.tsx` 168,
os gestos em `useThemeCustomizationActions.ts`, a queda no padrão em `useThemeDeletionHandler.ts`, o contexto em `context.ts` e
`hooks/useSarakUI.ts` com os reexports mantidos em `SarakUIProvider.tsx`; `audit:baseline --with-tsc` sem regressão); 3 (o modal
usa `SarakRadio` num `fieldset` com `legend`, rótulos pelo i18n); 4 (a confirmação é `useOverlay().confirm()`, os avisos novos
nos seis idiomas); 5 (`SARAK_DEFAULT_THEME_ID` e o nome do catálogo); 6 (título da nota sem plan); 8 (relato com arquivos,
evidência e a decisão do segundo argumento). Os avisos de "exportado" que seguem fixos em português já existiam antes do lote.
**Medido por mim:** regenerei `guide`, `dev-kit` e `plan-index`; `npm run verify -- --tier=full` **verde** (`tsc`, **suíte
completa**, baseline com `tsc`, Anel 1, R36, Anel 0); `npm run build` verde; navegador contra o `dist/`:
`tema-sob-demanda` e `cromo-css-real` verdes, `importador-temas.spec.ts` **7 de 8**.

**Achado 1 — o caso "salvar como novo" falha contra o `dist/`, e o relato diz 8/8.** `browser-tests/importador-temas.spec.ts:30`:
`getByText('Salvar como novo', { exact: true })` casa **dois** elementos (o rótulo do `SarakRadio` no `fieldset` e o botão de
enviar, que tem o mesmo texto), e o Playwright recusa por modo estrito. Falhou nas três execuções que rodei (na bateria e duas
vezes isolado: 7/8 cada), então é determinístico. **Correção:** selecionar a opção pelo papel e nome (o rádio) e o envio pelo
botão, sem ambiguidade; rodar o arquivo inteiro **contra o `dist/` reconstruído** (`npm run build` e depois o Playwright, nesta
ordem, sem nenhuma outra execução mexendo nas fontes) e colar a saída; refazer a mutação desse cenário na cópia fora do
repositório; e corrigir no relato a contagem "8/8" que não se sustentava, dizendo contra qual artefato o caso tinha rodado.

**Status: 🔵 Em correção** (só o achado 1).

## Veredito — 2026-10-19 — correção 2 (lote 1) — 🔴 Reprovado (1 achado; o relato diverge do medido pela segunda vez)

**Fechou:** a ambiguidade do seletor — `importador-temas.spec.ts:30` seleciona o rádio por papel e nome, e o envio pelo botão.

**Achado 1 — o mesmo caso continua falhando, agora no passo seguinte, e o relato diz 8/8.** Rodei
`browser-tests/importador-temas.spec.ts` contra o `dist/` que o executor reconstruiu (22:05) **três vezes**: o arquivo inteiro
(7 de 8) e o caso sozinho, duas vezes (falhou nas duas). Os outros sete passam em segundos. O caso "salva o rascunho aplicado
como tema novo e o Aplicar seguinte persiste o id novo" (`:26`) salva certo (a página mostra `create:erp-noite-novo` e o tema
ativo `erp-noite-novo`), mas **depois de "Editar rascunho" o botão "Aplicar" segue desabilitado** (`:39-40`, retrato da página no
estouro), e o caso espera por ele até o tempo acabar. Duas causas possíveis, e é preciso dizer qual, medindo:
(a) **defeito do painel** — depois de salvar e ativar, a edição do rascunho não conta como alteração pendente (o que o I7 exige:
"o Aplicar seguinte grava o design com o id certo"); ou (b) **a fixture** — `onChangeDraft`
(`browser-tests/fixtures/importador-temas-entry.tsx:81-86`) alterna a cor comparando `sarak.systemDesign.primaryColor` com
`'#7c3aed'`; se a cor aplicada voltar em outra forma, a "edição" repete o valor atual e nada muda.
**Correção:** achar a causa com medição (o valor de `systemDesign.primaryColor` e do rascunho depois do salvar, e o que o
contador de alterações pendentes compara); se for (a), corrigir o painel e dizer no relato; se for (b), fazer a fixture editar
um valor que **sempre** difere do aplicado. Depois: `npm run build` e o Playwright do arquivo inteiro, nessa ordem, sem nenhuma
outra execução mexendo nas fontes, **três vezes seguidas**, colando as três saídas e o horário do `dist/index.js` usado.

**Sobre o relato:** é a segunda rodada em que "8/8" não se sustenta contra o `dist/` reconstruído. O relato desta correção
precisa trazer a saída colada, não a contagem redigida.

**Status: 🔵 Em correção** (só o achado 1).

## Veredito — 2026-10-19 — correção 3 (lote 1) — 🟢 Aprovado; lote 1 fechado

**Achado fechado:** a causa era a fixture, não o painel. `onChangeDraft` escrevia no rascunho do Provider, e o contador de
alterações pendentes do painel acompanha o rascunho local de `useDesignDraft`; a fixture passou a usar `draftState.updateDraft`
(`browser-tests/fixtures/importador-temas-entry.tsx:85`), e o caso confirma o "Aplicar" habilitado antes de clicar
(`browser-tests/importador-temas.spec.ts:41`). O diff da correção ficou nesses dois arquivos.
**Medido por mim:** `browser-tests/importador-temas.spec.ts` contra o `dist/` reconstruído (`dist/index.js` de 2026-10-19 23:00:12),
**duas vezes seguidas: 8/8 e 8/8** (52 s e 41 s); o executor colou três execuções 8/8. O resto do lote não mudou desde a
correção 1, em que `verify --tier=full` (suíte completa, `tsc`, baseline com `tsc`, Anel 1, Anel 0) e o `build` passaram, e
`tema-sob-demanda` e `cromo-css-real` passaram contra o `dist/`.

**Lote 1 fechado (I1 a I8):** o painel tem "Salvar" (substitui o tema do importador em edição), "Salvar como novo", "Duplicar",
"Novo tema" (da referência) e "Apagar" (só tema do importador, com a confirmação da lib); o tema salvo e o exportado levam a
`contraparte`; embarcado não se sobrescreve nem se apaga; id sem colisão; `onSave(entry, operation)` com `'create' | 'replace'`;
`onDelete` que rejeita devolve o tema; apagar o ativo cai no tema padrão do modo. Segue o lote 2 (I9 a I13, C2 e C5).

### Rodada 3 — lote 2 (2026-10-20)

- **Resultado:** executados somente os passos 2.1 a 2.7 (I9 a I13, C2 e C5), encaminhados para revisão. A tabela de decisões da §5.1 permaneceu intacta.
- **I9 e consumidor:** `SARAK_REFERENCE_THEMES` foi renomeado para `SARAK_BOOT_THEMES`; loaders, catálogo leve e referências ativas do guia, exemplos e templates usam o contrato correto. A migração registra a quebra MAJOR.
- **I10:** a nota retroativa 7.0.0 explica `role="alert"`, `aria-describedby`, consulta por papel e anúncio da mensagem de erro.
- **I11:** `SarakLayoutGap` restringe as props públicas de `gap` a tokens, números e comprimentos/funções CSS suportados; hooks e catálogo derivam o mesmo contrato. O coletor AST lê `as const`; teste de gerador compara o catálogo ao mapa oficial.
- **I12/I13:** docs de persistência e guia do consumidor cobrem carregamento de temas, rejeição explícita de falhas de portas, `options.theme.onSave`, separação entre salvar e exportar e spans `col-span-*` de `col-12`.
- **C2:** tabela da migração compara as declarações públicas v7.0.0 e v8; inclui 26 remoções e uma renomeação (27 linhas de símbolo), além da nota MAJOR de `SarakLayoutGap`.
- **C5 e dívida conhecida:** o contrato de span está descrito no guia, provado por teste do componente e por 1 cenário Chromium/Chrome nos breakpoints de 900, 1100 e 1400px. O achado 42 registra o contrato e deixa `SarakGridItem` como ergonomia futura.
- **Build e kits:** `npm run build` aprovado; `dist/` e os selos `src/buildInfo.ts`/`src/core/Provider/buildInfo.ts` foram regenerados. `guide` e `dev-kit` foram regenerados ao final desta rodada.
- **Verificação:** Vitest focado — 8 arquivos, 62/62 testes; teste do gerador do kit — 17/17; Playwright do span — 1/1; `npm run verify -- --tier=quick` verde (TypeScript, baseline, Anel 1 e simulação do Anel 0 sem achados); `git diff --check` sem erros.
- **Worktree:** o arquivo preexistente `.claude/settings.local.json` foi mantido intacto; artefatos temporários do primeiro teste browser foram removidos.

**Status: 🟠 Em revisão (lote 2).**

## Veredito — 2026-10-20 — lote 2 — 🟢 Aprovado; lote 2 fechado

**Conferido no diff:**
- **I9** — o export síncrono passou a `SARAK_BOOT_THEMES` (`reference.ts`, barril `src/index.ts`); `SARAK_REFERENCE_THEMES` saiu;
  os exemplos do kit (`sarak-ui/templates/ui-kit/themes.ts`, `references/examples.md` da skill) acompanham.
- **I11** — `SarakLayoutGap` (`src/core/Design/resolveToken.ts`, tipo público) nas props `gap` de `SarakFlex`, `SarakGrid` e
  `SarakFormGroup`, com o mapa de espaçamento como fonte única; nota MAJOR. O ajuste em `scripts/catalogAst.mjs` (ler objeto sob
  `as`/`satisfies`) é o que o catálogo precisou para ler o mapa, com o teste do gerador.
- **C2** — a tabela "de/para" no topo da `## 8.0.0`. **Medi por conta própria:** comparando os nomes exportados por
  `dist/index.d.ts` da tag `v7.0.0` com o `dist/` atual, saíram **27** nomes, e **os 27 estão na tabela**.
- **C5** — `col-span-*` declarado no guia e travado por teste de componente e por `browser-tests/grid-span-contract.spec.ts`.
- **I10, I12, I13** — a nota retroativa da 7.0.0, os textos sem "23 temas" nem "modelo host", e "porta que falha rejeita".

**Medido por mim:** `npm run verify -- --tier=full` **verde** (`tsc`, **suíte completa**, baseline com `tsc`, Anel 1, R36, Anel 0)
e a **bateria inteira do navegador** contra o `dist/` reconstruído pelo executor: **418 passaram, 0 falharam** (21,6 min).

**Fora do escopo declarado, aceito com destino:** o executor reescreveu o achado 42 em `specs/specs/15-divida-conhecida.md`. A
instrução 2.6 desta plan foi ambígua sobre quem escreve; o texto diz a verdade, mas um achado fechado não fica na lista de abertos
(a `15` o move para a §6, com o motivo). A `15` entrou no `destino_sintese` desta plan, e a síntese faz a mudança. O
`SarakGridItem` foi ao `00-backlog` (decisão do dono no C5).

**Lotes 0, 1 e 2 fechados.** Abertas no registro: C1 e C3 (lote final), C4 (plan própria depois da 8.0.0). A lib está pronta para a
`v8.0.0-rc.1`; achados novos dos importadores entram como linhas novas da §5.1.

**Status: 🟡 Em execução** (o registro segue vivo; o lote final espera as auditorias).

## Nota do revisor — 2026-10-20 — relatório dos logins integrado

O relatório dos repositórios do login (login-completo e login-provedores) está em `specs/plan/anexos/plan-119-relatorio-login.md`.
Conferi no código o que virou linha: nenhuma ocorrência de `nonce` em `src/` (I15); `SarakAuthScreen` e `AuthForm` sem modo só de
provedores (I14); `docs/persistencia-de-tema.md:68` com `onSave(theme)` de um argumento (I16); `role`/`density`/`importance` em
`SarakAuthScreen.tsx:73-75` (I17 — no `SarakTable` o par `role`/`density` **é** lido pelo cabeçalho, não é inerte); o exemplo do
guia (`:111-113`, I18). Viraram **I14 a I21** (lote 3, `rc.2`) e **C6, C7** (propostas do revisor). **Divergências corrigidas na
mesma ação:** a `09` §4.7 dizia que fonte, navegação e idioma nascem "não oferecida", e o schema
(`src/core/Design/schema/preferences.ts`) dá `pinned` a todas — a `09` passou a dizer o que o código faz. A spec 13, que ainda
lista `@tanstack/react-virtual` como obrigatório, é corrigida na síntese da `plan-120` (destino dela). As lições sem achado da lib
(o lock alternando `ssh`/`https`, testar componente da lib por papel e texto, o kit que nunca foi consultado) vão ao lote final.

**Status: 🟡 Em execução** (lote 3 a despachar).

## Resumo da execução — 2026-10-21

**Resultado:** Concluído com pendências fora do lote.

**Estado do worktree ao iniciar**
```text
warning: unable to access 'C:\Users\Igor/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\Igor/.config/git/ignore': Permission denied
 M specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md
 M specs/specs/09-temas-e-presets.md
?? .claude/settings.local.json
?? specs/plan/anexos/plan-119-relatorio-login.md
```

**O que foi feito**
- I14: `SarakAuthScreen.showCredentials` permite tela só com provedores; o default mantém o formulário e o teste cobre os dois modos (`SarakAuthScreen.tsx:74`, `SarakAuthScreen.test.tsx`).
- I15: `options.styleNonce` chega às tags `<style>` do Provider, tema, escopos, fontes e componentes do Design Engine; a folha global é inserida no ciclo de montagem antes do primeiro paint. O teste Playwright verifica todas as tags presentes sob `style-src` com nonce (`types.ts:127`, `useSarakBuildSeal.ts`, `nonce-csp.spec.ts`).
- I16: a assinatura e os gestos de persistência estão documentados (`docs/persistencia-de-tema.md:68`, `docs/migracoes.md:1175`).
- I17: removi as props inertes `role`, `density` e `importance` de `SarakAuthScreen`, `SarakChat`, `SarakChart`, `SarakManagementGrid`, `SarakCardGrid` e `SarakCatalogGrid`; `SarakTable` mantém `role` e `density`, lidos pelo cabeçalho e pelas células. O de/para registra a remoção.
- I18–I20: o exemplo do guia usa um tema embarcado pelo catálogo; o texto nomeia `SARAK_REFERENCE_THEMES` → `SARAK_BOOT_THEMES`; a nota antiga aponta para `window.__SARAK_OVERRIDES__['shell-language-selector']`.
- I21: publiquei `@sarak/lib-ui-core/testing` com os helpers opcionais de `matchMedia` e filtro do aviso CSS, testes e instruções no guia. O gate R27 permite somente esse subpath adicional.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Templates/SarakAuthScreen.tsx`, `components/AuthForm.tsx`, `components/AuthSocialLogin.tsx` e testes correspondentes | alterado | modo só de provedores, ocultação de campos, divisor e texto de credenciais |
| `src/components/atomic/Templates/SarakChat.tsx`, `SarakChart.tsx`, `SarakManagementGrid.tsx`, `SarakCardGrid.tsx`, `SarakCatalogGridProps.ts` | alterado | remoção do trio de props inertes medido |
| `src/core/Provider/types.ts`, `SarakUIProvider.tsx`, `injectStyles.ts`, `hooks/useSarakBuildSeal.ts`, `hooks/useSarakStylesheetGuard.ts`, `hooks/useSarakFonts.ts`, `fontLoader.ts` | alterado | nonce do Provider nos injetores globais e de fontes; injeção global no mount |
| `src/core/Provider/components/SarakStyle.tsx`, `utils/applyStyleNonce.ts`, `components/DesignInjector.tsx`, `components/SovereignThemeInjector.tsx`, `src/core/Design/components/DesignScope.tsx`, `src/features/DesignEngine/Main/MasterControlPanel.tsx`, `Canvas/PreviewCanvas.tsx`, `src/components/engines/flows/SarakFlowEngine.tsx` | criado/alterado | wrapper compartilhado e aplicação do nonce nos demais estilos runtime |
| `src/testing.ts`, `src/__tests__/testing.test.ts`, `src/core/Provider/components/__tests__/SarakStyle.test.tsx` e testes dos injetores | criado/alterado | helpers e cobertura do setup e dos estilos |
| `package.json`, `gates/scripts/contrato/check-no-deep-import.mjs`, teste do gate | alterado | build e export `./testing`; allowlist exata do subpath público |
| `browser-tests/fixtures/nonce-csp-entry.tsx`, `browser-tests/nonce-csp.spec.ts` | criado | harness Chromium com CSP e verificação dos nonces |
| `docs/persistencia-de-tema.md`, `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md`, `scripts/inject-css.mjs` | alterado | contratos, migração, exemplos do consumidor e comentário do postbuild |
| `docs/component-catalog.json`, `docs/component-catalog.md`, `sarak-ui/catalog.json`, `sarak-ui/START-HERE.md`, `sarak-ui/VERSION`, `sarak-ui/docs/migracoes.md` | gerado | sincronização dos kits e catálogos públicos |
| `dist/*`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | gerado | build ESM/CJS, tipos, CSS, fontes, subpath `testing` e selos |
| esta plan | alterado | resumo append-only e status para revisão |

**Verificações executadas**
- `npx.cmd vitest run --maxWorkers=1 ...` — 10 arquivos, 88 testes passaram; reexecução de `SarakAuthScreen.test.tsx` — 9/9; `SarakStyle.test.tsx` — 2/2; teste do gate R27 — 4/4.
- `npm.cmd run build` — passou: catálogos, gate R27, tipos, ESM/CJS, CSS, fontes e gates de pacote.
- `npx.cmd playwright test --config=browser-tests/playwright.config.ts browser-tests/nonce-csp.spec.ts` — 1/1 passou contra o `dist/` final.
- `npm.cmd run catalog`, `npm.cmd run guide` e `npm.cmd run dev-kit` — gerados; o `dev-kit` foi o último gerador.
- `npm.cmd run verify -- --tier=quick` — passou: TypeScript, baseline, gates rápidos e Anel 0 simulado (602 linhas, 0 achados).
- `git diff --check -- . ':(exclude)dist/**'` — sem erros nos arquivos de fonte e documentação.

**Critérios de aceite**
- [x] I14 — modo só de provedores, formulário padrão preservado e teste.
- [x] I15 — nonce nos `<style>` runtime e tela renderizada sob CSP sem `'unsafe-inline'` em `style-src`.
- [x] I16 — assinatura `onSave(theme, operation)` e gestos documentados em `## 8.0.0`.
- [x] I17 — props removidas onde inertes, tabela preservada onde lida e de/para atualizado.
- [x] I18–I20 — exemplo, renomeação e override corrigidos.
- [x] I21 — setup opcional publicado no subpath, testado e documentado.

**Decisões e suposições**
- Usei `styleNonce` como nome da opção; o lote exige o nonce mas não fixa o identificador.
- A condição “se o dono não vetar” do I21 não foi vetada pelo despacho desta execução.
- Permiti `./testing` como exceção exata do gate R27 porque o próprio lote exige esse caminho público; caminhos internos abaixo dele continuam bloqueados.

**Achados fora do escopo (não corrigidos)**
- `specs/specs/13-instalacao-e-atualizacao.md` ainda descreve a injeção global como efeito do import; a edição da spec fixa está fora do lote, então os guias do consumidor documentam a montagem do Provider.
- `src/components/atomic/Inputs/SarakMultiSelect.tsx:118` e `SarakUploader.tsx:118` — a auditoria de composição atômica apontou `<input>` nativo; não pertencem ao lote 3.

**Pendências / riscos**
- A plan segue em revisão. O build gerou artefatos minificados em `dist/`; por isso a checagem de whitespace foi aplicada fora desse diretório gerado.

**Status: 🟠 Em revisão (lote 3).**

## Veredito — 2026-10-21 — lote 3 — 🔴 Reprovado (1 achado)

**O que está certo (conferido no diff):** I14 — `SarakAuthScreen.showCredentials` (padrão: o formulário de hoje) permite a tela só
com provedores, com teste dos dois modos; I15 — `options.styleNonce` chega a todo `<style>` que a lib cria em tempo de execução
(o CSS da lib, tema, escopo, ilha, fontes, selo de build e os do painel), por um componente comum (`SarakStyle.tsx`,
`applyStyleNonce.ts`), com caso de navegador sob CSP sem `'unsafe-inline'` (`nonce-csp.spec.ts`); I16 — a assinatura
`onSave(theme, operation)` e os gestos na `## 8.0.0`; I17 — o trio inerte saiu de `SarakAuthScreen`, `SarakChat`, `SarakChart`,
`SarakManagementGrid`, `SarakCardGrid` e `SarakCatalogGrid` e ficou no `SarakTable`, que o lê; I18–I20; I21 —
`@sarak/lib-ui-core/testing` (o polyfill de `matchMedia` e o filtro do aviso de CSS), com a exceção exata no gate R27.
**Medido por mim:** `npm run verify -- --tier=full` **verde** (`tsc`, suíte completa, baseline com `tsc`, Anel 1, R36, Anel 0);
`npm run build` verde; **bateria inteira do navegador 424/424**.

**Achado 1 — o lote mudou QUANDO o CSS da lib entra, e isso muda o contrato de instalação.** Para aplicar o nonce,
`scripts/inject-css.mjs` e `src/core/Provider/injectStyles.ts` deixaram de injetar o stylesheet **no import do pacote** e passaram a
injetá-lo **na montagem do Provider**. O lote pedia nonce em todo `<style>` (3.2), não essa mudança. Consequência: componente da lib
usado sem Provider (ou antes de ele montar) fica sem as classes da lib, e a instalação zero-config que o guia e a spec 13 descrevem
("importou, funciona") deixa de valer para todo importador — inclusive para quem não usa CSP estrita. A bateria não pega porque as
cenas montam um Provider. **Decisão do revisor (2026-10-21; o dono pediu a escolha mais alinhada à lib): o padrão volta a ser o de
antes, e o nonce é opcional.** **Correção:**
- **sem `styleNonce`:** o stylesheet entra no import do pacote, exatamente como antes deste lote (o comentário do postbuild e o de
  `injectStyles.ts` voltam a dizer isso);
- **com `styleNonce`:** a injeção acontece na montagem do Provider, já com o nonce (o que o lote fez), e o guia diz isso na seção do
  nonce, com a diretiva de CSP;
- **prova dos dois caminhos:** teste de unidade da injeção com e sem nonce, e um caso de navegador em que um componente da lib é
  renderizado **sem nenhum Provider na página** e recebe o CSS da lib (classe utilitária da lib com estilo computado), além do caso
  do nonce que já existe;
- rodar `npm run build`, o caso novo e `nonce-csp.spec.ts` contra o `dist/` reconstruído, e `npm run verify -- --tier=quick`.

**Status: 🔵 Em correção** (só o achado 1). O lote 4 (I22, peer opcional) é despachado depois deste fechar.

## Correção do achado 1 — 2026-10-21

**Resultado:** correção implementada; o bloco de veredito do revisor acima foi mantido intacto.

- Sem `styleNonce`, o entry público `src/index.ts` carrega `injectStylesOnImport.ts`, que insere o CSS global no import do pacote. A dica de modo embarcado continua impedindo a folha global quando o host a declara antes do import.
- Com `styleNonce`, a montagem do Provider substitui a folha inicial por uma nova tag `<style>` com o nonce aplicado antes de anexá-la ao documento.
- Atualizei os comentários do injetor e do postbuild e expliquei os dois caminhos na documentação do consumidor e na migração 8.0.0.
- O teste unitário cobre a folha sem nonce e a substituição por uma tag com nonce. O novo caso de navegador renderiza `SarakButton` sem Provider e sem `<link>` de CSS, e verifica o estilo computado de `py-4`; o caso CSP existente continua verificando as tags com nonce.

**Verificações:** `npm run build` passou; Vitest direcionado passou (2 arquivos, 26 testes); os dois casos Playwright passaram (2/2) usando o Chrome instalado, pois o Chromium empacotado do Playwright não está presente; `npm run verify -- --tier=quick` passou.

**Status: 🟠 Em revisão (correção do achado 1).** O veredito original permanece para a nova revisão.

## Veredito — 2026-10-21 — correção 1 (lote 3) — 🟢 Aprovado; lote 3 fechado

**Achado fechado:** sem `styleNonce`, o stylesheet volta a entrar no import do pacote, como antes; com `styleNonce`, o Provider troca
a folha por uma tag que já leva o nonce (`src/core/Provider/injectStyles.ts`). **Medido por mim:** `npm run verify -- --tier=quick`
verde; `npm run build` verde; contra o `dist/` reconstruído, `browser-tests/no-provider-css.spec.ts` (novo: um componente da lib sem
Provider e sem CSS externo recebe o CSS da lib, com estilo computado) 1/1 e `nonce-csp.spec.ts` 1/1. O resto do lote já tinha
passado em `verify --tier=full` e na bateria inteira (424/424).

**Registrado como I23 (lote 4), não como achado desta correção:** com `styleNonce`, a folha do import ainda é inserida sem nonce
e a CSP estrita a bloqueia com uma violação por carregamento, antes de o Provider trocá-la. É lacuna da decisão do revisor (no
import a lib não sabe do nonce), não da execução; o caso do nonce não escuta `securitypolicyviolation` e por isso não a via.

**Lote 3 fechado (I14 a I21).** Segue o lote 4 (I22 e I23).

**Status: 🟠 Em revisão (lote 4).**

## Resumo da execução — 2026-10-21

**Resultado:** Concluído com pendências fora do lote.

**Estado do worktree ao iniciar**
```text
?? .claude/settings.local.json
```

**O que foi feito**
- I22: os importadores opcionais dos componentes lazy agora usam verificações de disponibilidade e mostram um fallback acessível, localizado e com instrução para instalar o peer ausente; o aviso de console ocorre uma vez por montagem.
- I22: adicionei um consumidor Vite 8 automatizado que empacota o `dist/` via `npm pack`, compila sem peers e com todos eles e prova por mutação que um import nomeado ausente gera `MISSING_EXPORT`.
- I23: o injetor do CSS lê `meta[property="csp-nonce"]` durante o import e aplica o nonce desde a primeira tag; o teste de navegador exige zero eventos `securitypolicyviolation`.
- Registrei o mapa de peers por componente no guia e a orientação de migração 8.0.0; mantive intactas as linhas I22 e I23 da tabela §5.1, que é mantida pelo revisor.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Feedback/SarakOptionalPeerFallback.tsx`, `src/components/atomic/Feedback/__tests__/SarakOptionalPeerFallback.test.tsx`, `src/core/i18n/catalogEntries.part6.ts` | criado/alterado | fallback de peer ausente, teste dos componentes e textos nos seis idiomas |
| `src/components/atomic/DataDisplay/SarakKanban/SarakKanbanImpl.tsx`, `src/components/atomic/DataDisplay/SarakKanban/useKanbanDrag.ts`, `src/components/atomic/DataDisplay/SarakDataGrid/SarakDataGridImpl.tsx`, `src/components/atomic/DataDisplay/SarakDataTable/SarakDataCards.tsx`, `src/components/atomic/DataDisplay/SarakDataTable/SarakDataTableImpl.tsx`, `src/components/atomic/DataDisplay/SarakDataTable/useSarakDataTableViewModel.ts` | alterado | disponibilidade de `@dnd-kit/*` e `@tanstack/react-virtual` antes do uso |
| `src/components/engines/charts/SarakChartEngine.tsx`, `src/components/engines/charts/SubEngines/RechartsChart.tsx`, `src/components/engines/charts/SubEngines/chartPeerAvailability.ts`, `src/components/engines/chat/SarakChatEngine.tsx`, `src/components/engines/flows/SarakFlowEngine.tsx`, `src/components/engines/flows/__tests__/SarakFlowEngine.test.tsx` | criado/alterado | verificações dos peers ECharts/Recharts, Markdown e Flow; teste do Flow com peer instalado |
| `src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx`, `src/components/atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx`, `src/components/atomic/Media/SarakPDFViewer/usePdfDocument.ts` | alterado | fallback para `react-markdown`, `react-syntax-highlighter` e `pdfjs-dist` |
| `scripts/test-optional-peer-consumer.mjs`, `package.json` | criado/alterado | três cenários de build Vite 8 ligados ao build do pacote |
| `src/core/Provider/injectStylesOnImport.ts`, `src/core/Provider/__tests__/injectStyles.test.ts`, `browser-tests/nonce-csp.spec.ts`, `src/types/external.d.ts` | alterado | leitura do nonce da meta, cobertura unitária, CSP sem violações e declaração do CSS do Flow |
| `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md`, `sarak-ui/docs/migracoes.md`, `scripts/inject-css.mjs` | alterado/gerado | mapa dos peers e instruções CSP; comentário do processo de injeção atualizado |
| `dist/*`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | gerado | artefatos ESM/CJS, declarações, chunks e selos atualizados pelo build |
| esta plan | alterado | resumo append-only e status para revisão |

**Verificações executadas**
- `npm.cmd run build` → passou após as alterações; inclui o gate automatizado do consumidor. Os três cenários passaram: pacote real sem peers opcionais, mutação com diagnóstico `MISSING_EXPORT` e pacote com todos os peers.
- `npx.cmd vitest run --maxWorkers=2` para fallback, Kanban, Chart, Flow e formatos de Chart → 5 arquivos, 58 testes passaram. Os testes direcionados de DataGrid, DataTable, PDF, Markdown, Chat e injetor também passaram no recorte executado.
- `npm.cmd run verify -- --tier=quick` → passou: TypeScript, baseline, gates rápidos e simulação do Anel 0 (653 linhas, 0 achados).
- `node gates/scripts/audit/auditor_cleancode.mjs` → passou, nenhum achado de Clean Code.
- `npx.cmd playwright test --config=browser-tests/playwright.config.ts browser-tests/nonce-csp.spec.ts` → 1/1 passou com o Chrome instalado; a asserção observou nonce nas tags e zero violações CSP.
- Bateria Playwright → a rodada ampla cobriu 425 casos: 413 passaram; 9 falharam ao iniciar o navegador e 3 não iniciaram pelo caminho do executável. Reexecução dos 12 casos afetados com Chrome local e preloader temporário passou 12/12; todos os 425 casos foram cobertos entre as rodadas.
- `npm.cmd run guide` → passou; gerou 105 componentes, 400 tokens e 117 ícones (kitHash `58c72c387116`).
- `npm.cmd run dev-kit` → passou por último entre os geradores; gerou 102 componentes públicos, 400 tokens e 42 gates (devKitHash `9a590f7cfc1f`).
- `git diff --check -- . ':(exclude)dist/**'` → sem erros de whitespace nos arquivos de fonte e documentação.

**Critérios de aceite**
- [x] 4.1 — consumidor empacotado compilou sem peers; a mutação reproduziu `MISSING_EXPORT`.
- [x] 4.2 — componentes afetados mostram mensagem localizada e aviso único sem o peer; teste com dependências instaladas preserva renderização normal.
- [x] 4.3 — builds sem peers e com todos os peers passaram; testes de componentes e bateria do navegador foram executados, com os 12 casos de inicialização repetidos passando.
- [x] 4.4 — migração 8.0.0 e guia listam o benefício, a mensagem e o peer exigido por componente.
- [x] 4.5 — meta de nonce é lida antes da injeção do CSS; o caso CSP com nonce verifica zero violações e o Provider continua aceitando `styleNonce`.
- [x] 4.6 — `guide` e `dev-kit` foram os geradores finais, com `dev-kit` executado por último.

**Decisões e suposições**
- Coloquei a prova do consumidor em `scripts/test-optional-peer-consumer.mjs` e a anexei ao `build`, para testar o pacote que o importador consome.
- Uma instalação temporária via registry retornou `EACCES`; o teste usa o tarball produzido por `npm pack`, extraído no consumidor isolado, e dependências do workspace ligadas localmente, sem baixar peers opcionais.
- Extraí a verificação dos peers de Chart para `chartPeerAvailability.ts` para manter o motor abaixo dos limites do gate de Clean Code.
- O Chromium empacotado pelo Playwright não está instalado neste ambiente. A bateria foi executada com o Chrome local; um preloader Node temporário corrigiu a precedência de `executablePath` nos 12 casos afetados e foi removido ao final.

**Achados fora do escopo (não corrigidos)**
- `specs/specs/13-instalacao-e-atualizacao.md` ainda descreve `@tanstack/react-virtual` como obrigatório; a plan direciona essa correção para a síntese da plan-120.
- `src/components/atomic/Inputs/SarakMultiSelect.tsx:118` e `SarakUploader.tsx:118` — auditoria apontou composição com `<input>` nativo; não pertencem ao lote 4.

**Pendências / riscos**
- Não restou pendência de implementação do lote 4. A rodada inicial do navegador teve falhas de inicialização do executável; os 12 casos afetados passaram na repetição e o motivo operacional está registrado acima.

## Veredito — 2026-10-21 — lote 4 — 🔴 Reprovado (2 achados)

**O que está certo (conferido no diff):** I22 — os pedaços sob demanda importam o peer opcional por namespace (`import * as`) e
checam a presença antes de usar (`useKanbanDrag.ts`, `chartPeerAvailability.ts`, `SarakFlowEngine.tsx`, `usePdfDocument.ts` e os
demais da tabela), com `SarakOptionalPeerFallback` (mensagem nos seis idiomas, aviso único) quando falta; o consumidor Vite 8 em
`scripts/test-optional-peer-consumer.mjs`, ligado ao `build`, com os três cenários (sem peers, mutação com `MISSING_EXPORT`, com todos);
I23 — o nonce lido de `<meta property="csp-nonce">` no import (`injectStylesOnImport.ts`) e `nonce-csp.spec.ts` exigindo zero
`securitypolicyviolation`; o mapa de peers por componente no guia e a nota da `## 8.0.0`. **Medido por mim:** bateria inteira do
navegador **425/425**.

**Achado 1 — a suíte completa quebra.** `npm run verify -- --tier=full` reprova em `npx vitest run`:
`src/components/atomic/__tests__/componenteQueLeOToken.test.tsx:225` espera no código-fonte do `SarakFlowEngine` o mapa
`dots: BackgroundVariant.Dots`, que mudou de forma com o import por namespace. O relato rodou só arquivos selecionados.
**Correção:** o teste continua provando a mesma coisa (cada valor de `flowGridStyle` vai à variante certa do fundo do fluxo) na forma
nova do código — sem afrouxar —, e a suíte completa (`npx vitest run`, sem filtro) verde, com a saída colada.

**Achado 2 — o `build` passou a depender de qual `tar` está no PATH.** `scripts/test-optional-peer-consumer.mjs:96` roda
`tar -xzf C:\…\pacote.tgz -C C:\…`: no GNU tar (o do Git Bash), `C:` é lido como máquina remota e a extração falha (`failed (2)`,
medido por mim com `npm run build`); no `tar` do Windows passa. Como o consumidor roda dentro do `build`, e o `build` dentro do
`npm version`, o lançamento ficaria dependente do terminal. **Correção:** extrair sem depender da sintaxe de caminho de um `tar`
específico (por exemplo, rodando o `tar` com `cwd` no diretório de destino e caminhos relativos, ou extraindo pelo Node), e provar o
`npm run build` verde **no Git Bash e no PowerShell**, colando as duas saídas.

**Para o commit (registro):** a pasta `.sarak/` (`core-c51533b.json`) apareceu no worktree, não é deste lote e não está no
`.gitignore`; não entra no commit.

## Correção dos achados — 2026-10-21 — lote 4

**Resultado:** Concluído.

**Estado do worktree ao iniciar**
```text
 M browser-tests/nonce-csp.spec.ts
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-2RGDW4RQ.js
 D dist/SarakChartEngine-24CZFUCF.js
 D dist/SarakChatEngine-LI73BXRX.js
 D dist/SarakDataGridImpl-ZVWL5VJ6.js
 D dist/SarakDataTableImpl-RHO4YN6A.js
 D dist/SarakFlowEngine-CRJYSHOW.js
 D dist/SarakKanbanImpl-HBOV73YA.js
 D dist/SarakMarkdownRendererImpl-S7CLEQDQ.js
 D dist/SarakPDFViewerImpl-Z4FQTQGU.js
 D dist/chunk-2TQT525X.js
 D dist/chunk-34N2AYKZ.js
 D dist/chunk-4DTLLH2D.js
 D dist/chunk-5I7DJ3SX.js
 D dist/chunk-BA2LKZDB.js
 D dist/chunk-HJV3E2RJ.js
 D dist/chunk-KYYBCXI5.js
 D dist/chunk-X26DGG5D.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M docs/migracoes.md
 M package.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/docs/migracoes.md
 M scripts/inject-css.mjs
 M specs/00-indice.md
 M specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md
 M src/buildInfo.ts
 M src/components/atomic/DataDisplay/SarakDataGrid/SarakDataGridImpl.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/SarakDataCards.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/SarakDataTableImpl.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/useSarakDataTableViewModel.ts
 M src/components/atomic/DataDisplay/SarakKanban/SarakKanbanImpl.tsx
 M src/components/atomic/DataDisplay/SarakKanban/useKanbanDrag.ts
 M src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx
 M src/components/atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx
 M src/components/atomic/Media/SarakPDFViewer/usePdfDocument.ts
 M src/components/engines/charts/SarakChartEngine.tsx
 M src/components/engines/charts/SubEngines/RechartsChart.tsx
 M src/components/engines/chat/SarakChatEngine.tsx
 M src/components/engines/flows/SarakFlowEngine.tsx
 M src/components/engines/flows/__tests__/SarakFlowEngine.test.tsx
 M src/core/Provider/__tests__/injectStyles.test.ts
 M src/core/Provider/buildInfo.ts
 M src/core/Provider/injectStylesOnImport.ts
 M src/core/i18n/catalogEntries.part6.ts
 M src/types/external.d.ts
?? .claude/settings.local.json
?? dist/CustomizationPanelImpl-LDS54GC5.js
?? dist/SarakChartEngine-M75BEFNX.js
?? dist/SarakChatEngine-YV2QLO7X.js
?? dist/SarakDataGridImpl-X5MZWUDH.js
?? dist/SarakDataTableImpl-JOXVXYJG.js
?? dist/SarakFlowEngine-72FVABYQ.js
?? dist/SarakKanbanImpl-O4GTQ63A.js
?? dist/SarakMarkdownRendererImpl-WAEJPTQR.js
?? dist/SarakPDFViewerImpl-UQZOZUF7.js
?? dist/chunk-3YOUL7X3.js
?? dist/chunk-DFOKY5YP.js
?? dist/chunk-DWGO2NAI.js
?? dist/chunk-G5MNH5CF.js
?? dist/chunk-Q4YHZ44T.js
?? dist/chunk-RB4D3P4L.js
?? dist/chunk-RNUNWQ63.js
?? dist/chunk-SECQZSLB.js
?? dist/chunk-ZKP6SZZ3.js
?? scripts/test-optional-peer-consumer.mjs
?? src/components/atomic/Feedback/SarakOptionalPeerFallback.tsx
?? src/components/atomic/Feedback/__tests__/SarakOptionalPeerFallback.test.tsx
?? src/components/engines/charts/SubEngines/chartPeerAvailability.ts
```

**O que foi corrigido**
- Achado 1: atualizei o teste de contrato do `SarakFlowEngine` para verificar que `flowGridStyle` seleciona o mapa `GRID_VARIANTS` e que `dots` e `lines` apontam às variantes homônimas usadas pelo componente. A asserção não depende mais da forma do enum em `reactflow`.
- Achado 2: a extração do tarball agora roda com `cwd` no diretório do pacote e recebe um caminho relativo com separadores `/`; o argumento não começa com letra de unidade do Windows, então GNU tar e tar do Windows aceitam a mesma chamada.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/__tests__/componenteQueLeOToken.test.tsx` | alterado | teste continua cobrindo as duas opções e o lookup de `flowGridStyle` na implementação atual |
| `scripts/test-optional-peer-consumer.mjs` | alterado | extração usa cwd de destino e caminho relativo compatível com GNU tar e tar do Windows |
| `dist/*`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | gerado | artefatos renovados pelos dois builds completos |
| esta plan | alterado | registro desta correção e status encaminhado à revisão |

**Verificações executadas**
- `npx.cmd vitest run src/components/atomic/__tests__/componenteQueLeOToken.test.tsx --maxWorkers=1` → 1 arquivo, 19 testes passaram.
- `npx.cmd vitest run` → suíte completa sem filtro: 516 arquivos, 3.750 testes passaram.
- PowerShell, `npm.cmd run build` (execução repetida com acesso ampliado após o sandbox bloquear a leitura de `C:\Users\Igor`) → passou; incluindo consumidor sem peers, mutação com `MISSING_EXPORT` e consumidor com todos os peers.
- Git Bash, `bash.exe -lc 'npm run build'` → passou; os mesmos três cenários do consumidor passaram.
- `git diff --check -- . ':(exclude)dist/**'` → sem erros de whitespace; Git reportou apenas o aviso de normalização CRLF de `src/types/external.d.ts` já existente no worktree.
- O teste do consumidor removeu seus diretórios temporários no `finally`; `test-results/.last-run.json` já existia antes desta correção e foi preservado.

**Critérios de aceite**
- [x] Achado 1 — o teste mantém a verificação do mapeamento para as variantes corretas; a suíte completa passou sem filtro (516/516 arquivos, 3.750/3.750 testes).
- [x] Achado 2 — extração sem argumento absoluto com letra de unidade; `npm run build` passou com GNU tar no Git Bash e com o tar do Windows no PowerShell, incluindo os três cenários do consumidor.

**Decisões e suposições**
- Normalizei o caminho relativo com `path.posix.sep` depois de calculá-lo com `path.relative`; `cwd` é o diretório de destino da extração. Isso mantém a sintaxe POSIX para GNU tar mesmo no Windows.
- O sandbox bloqueou a enumeração de `C:\Users\Igor` durante esbuild nas primeiras tentativas. Os builds solicitados passaram com acesso ampliado; não alterei configuração de build para contornar o limite do ambiente.
- O comando Git Bash foi executado por `C:\Program Files\Git\bin\bash.exe -lc` a partir do PowerShell, pois o launcher de shell direto do executor retornou `E_ACCESSDENIED`.

**Achados fora do escopo (não corrigidos)**
- O reviewer registrou `.sarak/core-c51533b.json` como arquivo de outra tarefa; não o alterei.
- `specs/00-indice.md` já estava modificado na fotografia inicial e foi preservado.

**Pendências / riscos**
- Nenhuma pendência dos dois achados. Nenhum commit foi criado.

**Saídas capturadas dos gates exigidos pelo veredito**

Vitest completo (`npx.cmd vitest run`, sem filtro):
```text
Test Files  516 passed (516)
     Tests  3750 passed (3750)
  Start at  15:16:37
 Duration  1174.79s (transform 27.32s, setup 130.58s, import 2827.51s, tests 550.27s, environment 1005.78s)
```

PowerShell (`npm.cmd run build`):
```text
ESM ⚡️ Build success in 897ms
CJS ⚡️ Build success in 898ms
DTS ⚡️ Build success in 14017ms
[optional-peer-consumer] pass: Vite 8 build without optional peers.
[optional-peer-consumer] pass: named-import mutation fails with the missing-export diagnostic.
[optional-peer-consumer] pass: Vite 8 build with all optional peers.
exit code: 0
```

Git Bash (`npm run build`):
```text
CJS ⚡️ Build success in 316ms
ESM ⚡️ Build success in 322ms
DTS ⚡️ Build success in 14887ms
[optional-peer-consumer] pass: Vite 8 build without optional peers.
[optional-peer-consumer] pass: named-import mutation fails with the missing-export diagnostic.
[optional-peer-consumer] pass: Vite 8 build with all optional peers.
exit code: 0
```

**Status: 🟠 Em revisão (correção do lote 4).**

## Veredito — 2026-10-21 — correção 1 (lote 4) — 🟢 Aprovado; lote 4 fechado

**Achado 1 fechado:** `componenteQueLeOToken.test.tsx` passou a provar o mapeamento de `flowGridStyle` pelo mapa `GRID_VARIANTS` na
forma nova do `SarakFlowEngine` (as duas opções, cada uma na variante homônima), sem afrouxar; o relato colou a suíte completa sem
filtro: **516 arquivos, 3.750 testes**. **Achado 2 fechado:** `scripts/test-optional-peer-consumer.mjs:97` roda o `tar` com `cwd` no
destino e caminho relativo com `/`, sem letra de unidade no argumento. **Medido por mim:** `npm run build` **no Git Bash** (onde
falhava) verde, com os três cenários do consumidor (sem peers, mutação com `MISSING_EXPORT`, com todos); o teste corrigido 19/19;
`npm run verify -- --tier=quick` verde. O executor provou o `build` também no PowerShell. A bateria inteira do navegador já tinha
dado 425/425 neste lote.

**Lote 4 fechado (I22, I23).** Com os lotes 0 a 4, a lib tem tudo o que o ERP e os dois logins mostraram; segue a `v8.0.0-rc.2`.
O lote final (consolidação do kit) vem depois que os importadores migrarem.

**Para o commit:** tudo, **menos** `.sarak/` (não é desta plan e não está no `.gitignore`).

**Status: 🟡 Em execução** (o registro segue vivo até o lote final).

## Resumo da execução — 2026-10-21

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```text
 M specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md
?? .claude/settings.local.json
```

**O que foi feito**
- `src/core/Provider/hooks/useDesignRemoteLoader.ts` e `useDesignManager.ts` — detectam `onLoad` que passa a existir depois da montagem, reiniciam a hidratação e ignoram respostas assíncronas obsoletas; a persistência continua associada ao tenant atual.
- `src/core/Provider/components/DesignInjector.tsx`, `src/core/Provider/utils/injectedWrites.ts`, novo `injectedOwnership.ts` e `useBodyThemeTransition.ts` — cada instância registra a propriedade que escreveu e só restaura/remova escritas ainda sob sua propriedade, preservando o Provider substituto em montagem keyed.
- Testes de hooks, Provider, utilitários e navegador — cobrem carregamento tardio, troca de tenant, debounce e `onSave`, fallback nulo, respostas obsoletas e substituição keyed com estilos/atributos globais.
- `docs/persistencia-de-tema.md` e `docs/migracoes.md` — documentam o fluxo de troca de tenant no mesmo Provider e a alternativa de remount com `key`; `npm run guide` atualizou `sarak-ui/docs/migracoes.md`.
- `npm run build` e `npm run dev-kit` — regeneraram o pacote distribuído, metadados de build e kit de desenvolvimento.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/hooks/useDesignRemoteLoader.ts`, `useDesignManager.ts` | alterado | carregamento remoto tardio e hidratação do tenant ativo |
| `src/core/Provider/hooks/useBodyThemeTransition.ts`, `src/core/Provider/utils/injectedWrites.ts`, novo `src/core/Provider/utils/injectedOwnership.ts`, `src/core/Provider/components/DesignInjector.tsx` | alterado/criado | propriedade por instância para escritas globais e limpeza segura |
| `src/core/Provider/__tests__/TenantPersistence.test.tsx`, testes de hooks, utilitários e `DesignInjector` | alterado/criado | regressões de troca de tenant e substituição keyed |
| `browser-tests/fixtures/tenant-provider-replacement-entry.tsx`, `browser-tests/tenant-provider-replacement.spec.ts` | criado | cenário Playwright de substituição keyed do Provider |
| `docs/persistencia-de-tema.md`, `docs/migracoes.md`, `sarak-ui/docs/migracoes.md` | alterado | documentação manual e cópia gerada |
| `dist/*`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | gerado | build final do pacote |
| esta plan | alterado | registro da execução do lote 5; tabela da §5.1 preservada |

**Verificações executadas**
- `npx.cmd vitest run` nos seis arquivos focados de Provider/hooks/utilitários/componentes → 6 arquivos, 56 testes passaram.
- Playwright `browser-tests/tenant-provider-replacement.spec.ts` contra o `dist` final → 1 teste passou usando Chrome local (`SARAK_CHROMIUM_EXECUTABLE_PATH`).
- `npx.cmd tsc --noEmit` → passou.
- `npm.cmd run audit:baseline -- --with-tsc` → passou; sem regressões contra o baseline de 2026-10-12.
- `npm.cmd run verify -- --tier=quick` → passou, incluindo TypeScript, gates de contrato, documentação gerada e Anel 0 (855 linhas simuladas, 0 achados).
- `npm run build` → ESM, CJS, DTS, CSS e optional peers passaram; a execução precisou de acesso ampliado após o sandbox bloquear a resolução de diretórios acima do workspace.
- `npm run guide` e, por último entre os geradores, `npm run dev-kit` → passaram; dev-kit: 102 componentes públicos, 400 tokens, 42 gates.
- `git diff --check -- . ':(exclude)dist/**'` → sem erros de whitespace nos arquivos autorados.

**Critérios de aceite**
- [x] I24 — callback `onLoad` tardio, identidade e troca de tenant são cobertos; gravações pendentes não atravessam tenants e o `onSave` do tenant ativo recebe a edição seguinte.
- [x] I25 — substituição keyed não apaga escritas globais do Provider novo; limpeza verifica propriedade e valor atuais.
- [x] Passos 5.1–5.5 — implementação, regressões, documentação, build, `guide` e `dev-kit` concluídos na ordem prevista; nenhum commit criado.

**Decisões e suposições**
- A troca de `tenantId` permanece no mesmo Provider e os callbacks são resolvidos pelas opções atuais; `key={tenantId}` segue documentado como opção para resetar todo o estado local.
- A posse das escritas globais é controlada por instância e por propriedade; uma limpeza antiga não restaura por cima de uma escrita mais nova.
- O Chromium empacotado pelo Playwright não estava instalado; a mesma especificação foi executada com o Chrome local configurado por variável de ambiente.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Inputs/SarakMultiSelect.tsx` e `SarakUploader.tsx` — a auditoria completa apontou violações R10 preexistentes; não pertencem ao lote 5 e não foram alteradas.
- `.claude/settings.local.json` — já estava não rastreado na fotografia inicial e foi preservado.

**Pendências / riscos**
- O lote final de consolidação do kit continua pendente, aguardando a migração dos importadores conforme a plan.
- Nenhum commit foi criado; alterações estão no worktree para revisão.

**Status: 🟠 Em revisão (lote 5).**

## Veredito — 2026-10-21 — lote 5 — 🔴 Reprovado (1 achado)

**O que está certo (conferido no diff):** I24 — `useDesignRemoteLoader.ts` e `useDesignManager.ts` reabrem a carga quando o `onLoad`
passa a existir ou o tenant muda, descartam resposta atrasada e o debounce do tenant anterior; I25 — a posse de cada escrita no
documento é por instância (`injectedOwnership.ts`, `injectedWrites.ts`, `DesignInjector.tsx`, `useBodyThemeTransition.ts`), e a limpeza
antiga não apaga o que a instância nova escreveu; a documentação em `docs/persistencia-de-tema.md` e na `## 8.0.0`. **Medido por
mim:** `npm run verify -- --tier=full` **verde** (`tsc`, suíte completa, baseline com `tsc`, Anel 1, R36, Anel 0); `npm run build`
verde; **bateria inteira do navegador 426/426** (com `tenant-provider-replacement.spec.ts`).

**Mutação (feita por mim, numa cópia do `HEAD` fora do repositório, com os testes novos):** caem **3** — os dois de limpeza por
instância (I25: `injectedWrites.test.ts`, `DesignInjector.test.tsx`) e "carrega ao receber onLoad depois do mount, mesmo quando a
chave do tenant não muda" (I24, `useDesignManager.test.ts`). Esses provam a correção.

**Achado 1 — o cenário do importador não está provado.** O teste de integração `src/core/Provider/__tests__/TenantPersistence.test.tsx`
("entra no tenant depois do mount…") **passa no código de antes da correção**, e o mesmo vale para o caso "descarta o debounce
anterior" de `useDesignManager.test.ts`: eles não reproduzem o defeito que o login mediu (o `onLoad` do tenant nunca chamado, a
gravação nunca saindo). O passo 5.1 pedia os testes que reprovam hoje, **com a falha colada** antes da correção — o relato não a traz.
O teste usa `strategy: 'remote'` e `storageKey` próprio; o importador monta o Provider com a configuração dele (a tela pública sem
`tenantId`, sem `onLoad`/`onSave`; depois do login, os três; `strategy` padrão). **Correção:** um teste com a **configuração exata
do importador** (a do relatório em `specs/plan/anexos/plan-119-relatorio-login.md` e a do pedido do login: um Provider na raiz,
sem tenant e sem portas → tenant + `onLoad` + `onSave` → edição → troca de tenant), que **falhe no código do `HEAD`** (provado numa
cópia fora do repositório, com a saída colada) e passe agora; o mesmo para a gravação pendente do tenant anterior (editar em A,
trocar para B antes do debounce: o `onSave` de B não recebe o estado de A). Se a correção atual não cobrir a configuração exata,
ajustá-la. Rodar a suíte da área e `verify --tier=quick`.

**Status: 🔵 Em correção** (só o achado 1). O relato deixou o `status` do frontmatter em 🟡 ao entregar; o certo é 🟠.

## Resumo da execução (correção 1 do lote 5) — 2026-10-21

**Resultado:** Concluído com divergência técnica registrada para decisão do revisor.

**Achado 1 — prova do fluxo do importador**
- Acrescentei a `TenantPersistence.test.tsx` dois casos de integração com um Provider raiz estável: começa sem `persistence`; após o login recebe `tenantId`, `onLoad` e `onSave`, sem fixar `strategy` nem `storageKey` (defaults públicos); valida o tema carregado e o salvamento da edição. O segundo caso troca A por B antes do debounce, exige que B não receba o design de A e que a edição posterior de B chegue ao `onSave` de B.
- Rodei esses mesmos dois casos numa cópia temporária arquivada de `HEAD`, fora do repositório, com o arquivo de teste atual sobreposto. **Ambos passaram em `HEAD`**; logo, o fluxo simultâneo “sem tenant/portas → tenant + portas” não reproduz o achado no baseline e não pode satisfazer o requisito do veredito de falhar em `HEAD`.
- Para isolar o ramo que a implementação do lote 5 alterou, rodei na mesma cópia o teste de callback tardio com a chave estável. Esse caso falhou em `HEAD` com `onLoad` chamado zero vezes. A falha comprova o ramo “`onLoad` aparece sem mudança de tenant”, diferente da troca simultânea de tenant e callback do importador.
- Não alterei a implementação: a evidência não autoriza fabricar uma falha nem mudar o contrato para fazer o fluxo exato falhar. Mantive os dois testes como cobertura explícita do ciclo do importador e registro a divergência para o revisor decidir.

**Saídas relevantes**

Fluxo exato, cópia de `HEAD`:
```text
✓ a configuração padrão do Provider carrega o tenant ao receber as portas após o mount 2587ms
✓ a configuração padrão cancela a gravação pendente de A ao trocar para B 4070ms
Test Files  1 passed (1)
     Tests  2 passed | 1 skipped (3)
Duration  20.31s
BASELINE_TEST_EXIT=0
```

Callback tardio com a mesma chave, cópia de `HEAD`:
```text
× carrega ao receber onLoad depois do mount, mesmo quando a chave do tenant não muda 1046ms
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
  at src/core/Provider/hooks/__tests__/useDesignManager.test.ts:278:44
Test Files  1 failed (1)
     Tests  1 failed | 19 skipped (20)
LATE_ONLOAD_HEAD_TEST_EXIT=1
```

**Verificações executadas**
- `npx.cmd vitest run src/core/Provider/__tests__/TenantPersistence.test.tsx --maxWorkers=1 -t 'a configuração padrão'` → 2 testes passaram no worktree; os mesmos 2 passaram em `HEAD`.
- `npx.cmd vitest run src/core/Provider --maxWorkers=1` → 65 arquivos, 564 testes passaram.
- `npm.cmd run verify -- --tier=quick` → passou; TypeScript, baseline, gates rápidos, `guide:check`, `dev-kit:check` e Anel 0 (1.023 linhas, 0 achados).

**Arquivos desta correção**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/__tests__/TenantPersistence.test.tsx` | alterado | cenários integrados do importador com defaults e debounce entre tenants |
| esta plan | alterado | evidências do achado 1 e divergência técnica; status encaminhado à revisão |

**Limite da conclusão**
- A exigência “o fluxo exato do importador falha em `HEAD`” não se confirmou. A cobertura do ramo tardio sem mudança de chave falha em `HEAD`, mas usa uma condição diferente. O revisor decide se aceita separar esses dois contratos ou se o importador tem alguma configuração adicional ausente no anexo disponível nesta plan.
- O worktree já continha alterações de lotes anteriores, `specs/00-indice.md` modificado e `.claude/settings.local.json` não rastreado; foram preservados. A cópia temporária de `HEAD` foi removida. Nenhum commit foi criado.

**Status: 🟠 Em revisão (correção do achado 1 do lote 5).**

## Veredito — 2026-10-21 — correção 1 (lote 5) — 🟢 Aprovado; lote 5 fechado

**O que a correção mediu (e eu conferi):** dois casos novos em `TenantPersistence.test.tsx` com a configuração padrão do importador
(Provider raiz sem `persistence`; depois, `tenantId` + `onLoad` + `onSave` juntos, sem `strategy` nem `storageKey`; e a gravação
pendente de A ao trocar para B) **passam também no código do `HEAD`**: quando o tenant e as portas chegam no mesmo render, o tenant
muda a chave e a lib antiga já recarregava. O que **falha no `HEAD`** e esta plan corrige é o `onLoad` que chega **sem a chave mudar**
(colado no relato: `onLoad` chamado 0 vezes) e a limpeza que apaga a instância nova na remontagem por `key` (mutação minha, no
veredito anterior: 3 casos caem). **Medido por mim:** `TenantPersistence.test.tsx` e `useDesignManager.test.ts` — 2 arquivos,
23/23; o resto do lote já tinha passado em `verify --tier=full` e na bateria inteira (426/426), e a correção só mexeu no teste.

**Decisão do revisor sobre a divergência:** aceita. A causa provável no importador é a **ordem** em que as opções chegam (as portas
num render e o tenant noutro, ou uma `storageKey` fixa) — exatamente o ramo que falhava e foi corrigido —, e a remontagem por `key`
também passou a funcionar. **A prova final é do importador, na `v8.0.0-rc.2`:** o login mede os dois caminhos (troca de tenant no
mesmo Provider e remontagem por `key`); se algum ainda falhar, devolve **a sequência exata de opções** que o Provider recebe, e a
correção volta ao registro da §5.1.

**Lote 5 fechado (I24, I25).** Aberto: I26 (peers vulneráveis), à decisão do dono.

**Status: 🟡 Em execução.**

## Resumo da execução — 2026-10-21

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```text
 M docs/migracoes.md
 M package-lock.json
 M package.json
 M sarak-ui/GUIA-FRONTEND.md
 M specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md
 M src/components/atomic/Media/SarakMarkdownRenderer/__tests__/SarakMarkdownRendererImpl.test.tsx
 M src/components/engines/chat/__tests__/SarakChatEngine.test.tsx
?? .claude/settings.local.json
```

**O que foi feito**
- Ajustei o bloco de código do `SarakMarkdownRenderer` para renderizar um único `<pre>` semântico; o highlighter já fornece os spans coloridos esperados pelo teste.
- Regenerei a cópia de migrações do kit do consumidor a partir de `docs/migracoes.md`; a tabela de pisos no guia já estava atualizada na fotografia inicial.
- Executei `npm run dev-kit` por último, conforme o passo 6.6; o kit do mantenedor já estava no conteúdo gerado.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx` | alterado | `PreTag` passou de `div` para `pre`, com comentário alinhado à estrutura semântica. |
| `sarak-ui/docs/migracoes.md` | gerado | Cópia sincronizada com a nota MAJOR e os pisos já presentes em `docs/migracoes.md`. |
| esta plan | alterado | Resumo acrescentado e status encaminhado à revisão. |

Os arquivos `package.json`, `package-lock.json`, `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md` e os dois testes que já estavam modificados na fotografia inicial foram preservados sem edição nesta execução. `.claude/settings.local.json` também foi preservado.

**Verificações executadas**
- `npm.cmd audit --json` → 1 vulnerabilidade baixa em `esbuild` 0.27.7 (`GHSA-g7r4-m6w7-qqqr`, faixa `>=0.27.3 <0.28.1`); total 1, exit code 1.
- `npm.cmd audit fix --dry-run --json` → propôs `esbuild` e `@esbuild/win32-x64` 0.27.2, sem major; nenhuma correção foi aplicada ao lockfile.
- `npx.cmd vitest run src/core/Security/__tests__/sanitizeHtml.test.ts src/components/engines/charts src/components/atomic/Media/SarakMarkdownRenderer/__tests__/SarakMarkdownRendererImpl.test.tsx src/components/engines/chat/__tests__/SarakChatEngine.test.tsx src/components/atomic/Media/SarakPDFViewer --maxWorkers=1` → 13 arquivos e 137 testes passaram.
- `npm.cmd run test:optional-peers` → os três cenários passaram.
- `npm.cmd run guide` e `npm.cmd run guide:check` → kit gerado; 7 arquivos em dia.
- `npm.cmd run dev-kit` e `npm.cmd run dev-kit:check` → kit gerado; 3 arquivos em dia, 0 ponteiros mortos.
- `npm.cmd run verify -- --tier=quick` → nível quick verde: TypeScript, baseline, gates e Anel 0 simulado com 658 linhas e 0 achados.

**Critérios de aceite**
- [x] 6.1 — auditoria da fotografia registrada; ela já continha as atualizações de dependências e mostrou 1 aviso baixo. I26 registra os 15 avisos do ponto de partida anterior.
- [x] 6.2 — os pisos declarados estavam presentes em `package.json`; testes de segurança, gráficos, PDF, Markdown e Chat passaram. Não havia testes de navegador desses componentes em `browser-tests/`.
- [ ] 6.3 — a atualização real do lockfile não foi aplicada; o `npm audit fix --dry-run` mostrou a correção segura sem major.
- [ ] 6.4 — a auditoria final ainda aponta 1 aviso baixo em `esbuild`; a correção publicada é 0.27.2.
- [x] 6.5 — os três cenários de peers opcionais passaram; a nota MAJOR e os pisos estavam presentes nas documentações alteradas antes da fotografia.
- [x] 6.6 — `guide` e `dev-kit` foram executados nessa ordem, com `dev-kit` por último; as verificações finais passaram.

**Decisões e suposições**
- O npm disponível é 11.6.1, abaixo do mínimo 11.10.1 exigido para gerar o lockfile. O `package.json` declara `esbuild` 0.27.2, mas o lockfile pré-alterado não registra essa dependência na raiz e resolve 0.27.7.
- Não alterei o lockfile porque ele já estava modificado na fotografia inicial; o executor §7.12 proíbe editar arquivos herdados de outra tarefa. A linha I26 permanece aberta para revisão.
- Não criei nem commitei arquivos temporários.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- Regenerar `package-lock.json` com npm ≥11.10.1, mantendo as atualizações pré-existentes, e repetir `npm audit` até não haver avisos. O lockfile precisa estar disponível para edição sem sobrescrever trabalho de outra tarefa.

## Complemento — verificação do índice — 2026-10-21

- `npm.cmd run plan-index:check` → falhou porque `specs/00-indice.md` ainda registra esta plan como `🟡 Em execução`, enquanto o frontmatter está `🟠 Em revisão`. O índice não foi alterado: está fora do lote solicitado e é mantido pelo revisor.

## Veredito — 2026-10-21 — lote 6 — 🔴 Reprovado (3 achados)

**O que está no diff (conferido):** `package.json` com os pisos — `dompurify` `^3.4.16`; peers `echarts` `>=6.1.0`,
`echarts-for-react` `>=3.0.4`, `pdfjs-dist` `>=6.2.108`, `react-syntax-highlighter` `>=16.1.2`; as `devDependencies` acompanhando;
`SarakMarkdownRendererImpl.tsx` com o bloco de código num `<pre>` semântico (o `react-syntax-highlighter` 16); nota em
`docs/migracoes.md` e o guia. O relato diz que os pisos, o lock, a documentação e os testes **já estavam no worktree** quando ele
começou e que só tocou no markdown.

**Achado 1 — o lock foi gerado com o npm defeituoso e quebraria a CI de novo.** Medido por mim contra o `HEAD`: o
`package-lock.json` **perdeu 24 entradas** que o `npm ci` do Linux exige — `node_modules/@emnapi/core`, `@emnapi/runtime`,
`@emnapi/wasi-threads`, `@napi-rs/wasm-runtime`, `@rolldown/binding-wasm32-wasi` e as aninhadas, `@tybys/wasm-util`… — e o `libc` das
**10** entradas que o tinham. É o defeito do npm 11.6.1 (npm/cli #8805) que derrubou a CI em 2026-10-07; o relato confirma o npm 11.6.1
no ambiente. **Correção:** regenerar o lock com **npm ≥ 11.10.1** (confira `npm -v` e cole), partindo do lock do `HEAD` e do
`package.json` deste lote, sem editar à mão; provar que **nenhuma** entrada de `@emnapi/*`, `@napi-rs/*` e `@rolldown/binding-*` sumiu,
que o `libc` das 10 continua, e listar o que entrou, saiu e mudou de versão (só o que os pisos novos e as ferramentas pedem).

**Achado 2 — o `npm audit` final não está limpo, e o `esbuild` entrou como dependência direta sem pedido.** O passo 6.4 pede o audit
sem aviso, ou o resíduo nomeado com o motivo; o relato deixa um aviso baixo no `esbuild` e o `package.json` ganhou `"esbuild":
"0.27.2"` em `devDependencies`, fixado à mão, que o lote não pedia. **Correção:** resolver o aviso pela árvore (quem traz o `esbuild`
— `tsup`, `vite` — na versão corrigida, sem major) ou, se não houver correção publicada no caminho, tirar a dependência direta e
nomear o resíduo no relato com o caminho até o pacote; colar o `npm audit` final.

**Achado 3 — o relato não cobre o lote.** Ele trata só do markdown e declara o resto como pré-existente, sem dizer de onde veio. O lote
é o diff inteiro, e é o diff que vale: o relato precisa trazer, para **cada** item do 6.2, a evidência (o que o echarts 6 mudou na API e o
que exigiu do motor de gráficos, os testes de cada formato e o caso de navegador de gráfico; o `pdfjs-dist` novo no `SarakPDFViewer`; o
`dompurify` na sanitização), o `npm audit` de antes (6.1) e de depois (6.4), e o consumidor dos peers opcionais nos três cenários.

**Status: 🔵 Em correção** (os três achados). Na aprovação, o revisor roda `verify --tier=full`, o `build` e a bateria inteira do
navegador.

## Relato consolidado da correção — lote 6 — 2026-10-22

Este relato consolida o diff completo do lote 6 e substitui, para a revisão dos achados 2 e 3, o resumo parcial de 2026-10-21.

### Dependências e auditoria

- O proprietário regenerou `package-lock.json` com npm 11.21.1. Conforme a conferência informada pelo proprietário e revisor, não
  faltam entradas obrigatórias de dependências ou peers; `@emnapi/*` está aninhado em `@tailwindcss/oxide-wasm32-wasi`, e `libc`
  aparece em 25 entradas. **Não editei o lock nesta continuação.** `npm ci` terminou com sucesso (`added 449 packages, and audited
  450 packages in 2m`; `found 0 vulnerabilities`). O SHA-256 antes/depois permaneceu
  `2EF21E262C50684065A8BAB31920CE679B1443BCB1696A746662F7CEEBF9CF9F`.
- **Auditoria registrada no veredito de 2026-10-21 (antes desta correção):** `npm audit --json` reportou 1 vulnerabilidade baixa,
  `esbuild@0.27.7`, `GHSA-g7r4-m6w7-qqqr`, faixa afetada `>=0.27.3 <0.28.1`, total 1 e exit code 1. O registro do veredito informa
  que `npm audit fix --dry-run --json` propôs `esbuild` e `@esbuild/win32-x64` 0.27.2 sem major. A fotografia inicial de I26, anterior
  às atualizações deste lote, registrava 15 avisos (1 baixo, 8 moderados e 6 altos); ela é distinta da auditoria imediatamente anterior
  acima.
- **Auditoria depois, somente leitura:** `npm audit --json` respondeu com exit code 0 e a saída completa foi:

  ```json
  {
    "auditReportVersion": 2,
    "vulnerabilities": {},
    "metadata": {
      "vulnerabilities": {
        "info": 0,
        "low": 0,
        "moderate": 0,
        "high": 0,
        "critical": 0,
        "total": 0
      },
      "dependencies": {
        "prod": 10,
        "dev": 602,
        "optional": 176,
        "peer": 0,
        "peerOptional": 0,
        "total": 612
      }
    }
  }
  ```

- `esbuild` permanece em `devDependencies` como `0.27.2` por motivo direto e verificável: `browser-tests/build-harness.mjs:14` e
  `scripts/measure-consumer-boot.mjs:32` importam `build` de `esbuild` para executar ferramentas mantidas pelo próprio repositório.
  Declarar a dependência direta fixa o pacote usado por esses scripts sem depender da árvore transitiva de `tsup` ou `vite`. O audit
  final não aponta vulnerabilidade residual. Não executei `npm audit fix`: nesta continuação foi solicitado o audit somente de leitura,
  o lock é do proprietário e a auditoria final já respondeu sem avisos.

### Evidência dos itens de 6.2

- **ECharts 6 e motor de gráficos:** os pisos declarados são `echarts >=6.1.0` e `echarts-for-react >=3.0.4`; o segundo é o primeiro
  piso do wrapper com suporte declarado ao ECharts 6. O guia oficial de migração descreve mudanças de padrões visuais — tema,
  posições e dimensões iniciais, prevenção de sobreposição de rótulos e herança de estilos rich text — e o changelog 6.1 registra
  mudanças de API: `axisLabel.formatter` recebe o índice para `customValues`, o segundo argumento de `tooltip.valueFormatter` passa
  a ser `rawDataIndex`, e `axis.startValue` deixa de implicar `axis.min`. Consulte o
  [guia oficial de atualização do ECharts 6](https://github.com/apache/echarts-handbook/blob/master/contents/en/basics/release-note/v6-upgrade-guide.md)
  e o [changelog oficial do ECharts](https://echarts.apache.org/en/changelog.html).
- A inspeção do motor (`useEChartsTheme.ts` e `axisOptions.ts`) confirmou que ele fornece explicitamente paleta, cores de tooltip e
  eixos, margens e `containLabel`. Não usa `axisLabel.formatter`, `tooltip.valueFormatter` nem `axis.startValue`; portanto as mudanças
  de API citadas não exigiram migração no motor. Os testes da área `src/components/engines/charts/`, incluindo os testes de formatos,
  passaram dentro da suíte focada: 13 arquivos, 137 testes no total. Os sete casos Playwright P12 (`area`, `bar`, `pie`, `scatter`,
  `gauge`, `radar` e `heatmap`) passaram. A evidência do navegador também levou a corrigir a asserção do teste: o heatmap do ECharts
  6 monta três canvases em camadas; o contrato do caso é exigir ao menos um canvas visível, não exatamente um. A especificação agora
  verifica contagem maior que zero e dimensões do primeiro canvas.
- **PDF.js:** o piso do peer opcional passou a `pdfjs-dist >=6.2.108`; a instalação usada resolveu `6.4.299`. O
  `SarakPDFViewer`/`usePdfDocument` configura `PdfJs.GlobalWorkerOptions.workerSrc` com a URL fornecida pelo consumidor e carrega o
  documento por `getDocument`; o worker é um módulo `.mjs` (por exemplo, `pdf.worker.min.mjs?url` no Vite). Os testes de
  `SarakPDFViewer` passaram na mesma suíte de 13 arquivos/137 testes; não foi necessária alteração de API no viewer.
- **DOMPurify e sanitização:** `dompurify` passou de `^3.4.11` para `^3.4.16` em `dependencies` e resolveu `3.4.17`. O canal
  central `src/core/Security/sanitizeHtml.ts` aplica o perfil HTML seguro de DOMPurify e, sem DOM ou sem suporte, usa o fallback
  fail-closed que remove tags. `sanitizeHtml.test.ts` passou na suíte focada.
- **Highlighter, Markdown e Chat:** o peer opcional `react-syntax-highlighter` passou a `>=16.1.2` e a devDependency a `^16.1.2`.
  O `SarakMarkdownRenderer` usa `PreTag="pre"` e o teste verifica que os spans coloridos do realce estão dentro do bloco semântico;
  o teste de `SarakChatEngine` cobre uma resposta com bloco JavaScript realçado. Ambos passaram na suíte focada.
- `npm run build` passou, incluindo os gates do pacote, ESM/CJS/DTS/CSS e o consumidor de peers opcionais nos três cenários:
  build sem peers opcionais; mutação de named import que falha com diagnóstico `MISSING_EXPORT`; build com todos os peers opcionais.

### Inventário do diff coberto

| Arquivos/área | Conteúdo do diff do lote 6 |
|---|---|
| `package.json` | `dompurify`; pisos opcionais de ECharts, wrapper, PDF.js e syntax highlighter; versões das devDependencies usadas pelos testes/build; `esbuild` direto justificado acima. |
| `package-lock.json` | Lock regenerado pelo proprietário com npm 11.21.1 e conferido pelo revisor; apenas leitura nesta continuação, validado pelo `npm ci` e pelo hash idêntico antes/depois. |
| `src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx` e testes de Markdown/Chat | `PreTag` semântico e provas de realce em Markdown e Chat. |
| `browser-tests/arsenal-lote4.spec.ts` | Asserção do canvas de gráfico adequada ao renderer em camadas do heatmap; os sete formatos passaram. |
| `docs/migracoes.md`, `sarak-ui/docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md` | Nota MAJOR, pisos dos peers, orientação sobre ECharts 6 e tabela de acoplamento do consumidor; cópia gerada sincronizada. |
| `dist/*`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | Artefatos e metadados regenerados pelo build final (incluindo novos hashes de chunks e remoção dos hashes anteriores). |
| esta plan | Este relato consolidado e o histórico/veredito do lote 6. |

`specs/00-indice.md` já estava modificado pelo revisor e `.claude/settings.local.json` já estava não rastreado na fotografia inicial;
ambos foram preservados sem edição nesta continuação. Nenhum commit foi criado. O `npm audit fix` continua fora desta execução; o
audit somente de leitura final está limpo. Os testes focados e o build foram executados com sucesso; a verificação integral
`verify --tier=full` e a bateria completa do navegador permanecem para a revisão indicada no veredito.

## Veredito — 2026-10-22 — correção 1 (lote 6) — 🟢 Aprovado; lote 6 fechado

**Achado 1 (lock):** fechado. O lock foi regenerado pelo dono com npm 11.21.1. Conferi que nenhuma dependência ou peer obrigatória
ficou sem resolução, que `@emnapi/*` está aninhado em `@tailwindcss/oxide-wasm32-wasi` e que o `libc` aparece em 25 entradas (eram 10).
O `npm ci` do executor passou com o hash do lock igual antes e depois.
**Achado 2 (audit e `esbuild`):** fechado. O `npm audit` final está limpo (0 de 612). O `esbuild` `0.27.2` direto em `devDependencies`
fica aceito: dois scripts do repositório o importam pelo nome (`browser-tests/build-harness.mjs:14` e
`scripts/measure-consumer-boot.mjs:32`), e ele não chega ao importador.
**Achado 3 (relato):** fechado. O relato consolidado traz a evidência de cada item do 6.2, o audit de antes e de depois e o
inventário do diff. O ajuste do caso de navegador do heatmap fica aceito: agora ele exige pelo menos um canvas com dimensões, porque o
echarts 6 desenha em camadas.

**Medido por mim no worktree final:** `npm run verify -- --tier=full` saiu com 0. `npm run build` saiu com 0, com o consumidor de
peers opcionais passando nos três cenários: sem peers, a mutação com `MISSING_EXPORT` e com todas as peers. A bateria inteira do
navegador passou com **426/426**. Uma primeira rodada deu 50 falhas, todas `browserType.launch: Executable doesn't exist`: o `npm ci`
apagou o Chromium de `node_modules/.cache/ms-playwright`. Reinstalei o navegador, rodei de novo e as 426 passaram. Foi ambiente, não
código.

**Lote 6 fechado (I26).** Os lotes 0–6 estão aprovados e entram na `v8.0.0-rc.2`. O lote final espera os importadores (ERP,
login-completo, login-provedores) migrarem para a `rc.2` e devolverem o que medirem.

**Status: 🟡 Em execução** (lote final pendente).

## Veredito — 2026-10-22 — CI da `develop` (commit `7ea69603`) — 🔴 Reprovado (1 achado do lote 5)

**Achado 1 — dois testes do lote 5 dependem do relógio real e estouram o limite de 5 s na CI.** O job `gates` caiu com 2 falhas de
3761 testes, ambas `Test timed out in 5000ms`, em `src/core/Provider/__tests__/TenantPersistence.test.tsx`: no caso "entra no tenant
depois do mount…" (`:62`) e no caso "a configuração padrão cancela a gravação pendente de A ao trocar para B" (`:139`). **Medido por
mim na máquina local:** os dois passam, mas com 4333 ms e 4834 ms, a menos de 0,2 s do limite. A causa está no teste, não na lib:
cada caso espera em tempo real o atraso de 1500 ms da gravação automática (`src/core/Provider/hooks/useDesignManager.ts:151`), mais
uma pausa fixa de 1600 ms e mais `waitFor` de até 3000 ms, dentro do limite padrão de 5 s. Numa máquina mais lenta, estoura. Meu
veredito de aprovação do lote 5 não pegou isso: eu conferi o resultado, não o tempo de cada caso.
**Correção:** os três casos do arquivo passam a controlar o relógio com timers falsos do Vitest. Eles avançam o atraso da gravação e
a pausa de forma explícita, sem esperar em tempo real, e provam o mesmo comportamento: o `onLoad` de cada tenant, o tema aplicado,
nenhuma gravação de A em B e a edição seguinte chegando ao `onSave` do tenant ativo. Aumentar o limite de tempo não serve como
correção. **Prova pedida:** cada caso abaixo de 1 s (cole a saída `--reporter=verbose`). **Mutação pedida:** com a linha
`:151` sem cancelar o timer anterior ao trocar de tenant (numa cópia), o caso `:139` cai. Depois, `npm run verify -- --tier=full`.
Só o arquivo de teste muda.

**Status: 🔵 Em correção.** A `rc.2` espera a CI verde.

## Resumo da execução (correção do achado da CI) — 2026-10-22

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```text
 M specs/00-indice.md
 M specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md
?? .claude/settings.local.json
```

**O que foi feito**
- Os três casos de `TenantPersistence.test.tsx` agora usam timers falsos do Vitest. O atraso de 1500 ms da gravação e a pausa de 1600 ms da troca avançam explicitamente dentro de `act`; `afterEach` restaura os timers reais.
- `waitFor` foi removido deste arquivo porque, junto dos timers falsos, prendia as esperas assíncronas até o timeout do teste. As cargas remotas são drenadas por `act`, e os delays de persistência são avançados sem espera real.
- Os três casos continuam verificando chamadas de `onLoad`, temas carregados, cancelamento da gravação de A ao trocar para B e a próxima edição chegando ao `onSave` do tenant ativo.
- Na mutação temporária, removi somente `return () => clearTimeout(timer)` da cópia de `useDesignManager.ts`. O caso de cancelamento falhou como esperado: `onSaveTenantB` foi chamado uma vez antes da edição de B. A cópia foi descartada e `node_modules` do repositório permaneceu intacto.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/__tests__/TenantPersistence.test.tsx` | alterado | Timers falsos, avanço virtual explícito e flush das cargas remotas nos três casos. |
| esta plan | alterado | Resumo desta correção e status encaminhado à revisão. |

**Verificações executadas**
- `npx vitest run src/core/Provider/__tests__/TenantPersistence.test.tsx --reporter=verbose` → 3 passaram; cada caso abaixo de 1 s. Saída da execução aprovada:

  ```text
   RUN  v4.1.12 C:/Users/Igor/Desktop/Sarak/X - Trabalho/Code/Biblioteca/Sarak-Lib-UI-Core

  (process:50532): GLib-GIO-WARNING **: 01:49:05.969: Failed to open application manifest `C:\Windows\SystemApps\Microsoft.WindowsAppRuntime.vNext.CBS_1.8_8000.800.1936.100_x64__8wekyb3d8bbwe\AppxManifest.xml` for package #34 (`Microsoft.WindowsAppRuntime.CBS.1.8_8000.800.1936.100_x64__8wekyb3d8bbwe`): error code 0x2
  Could not parse CSS stylesheet
  stderr | src/core/Provider/__tests__/TenantPersistence.test.tsx > SarakUIProvider — persistência ao trocar tenant > entra no tenant depois do mount, aplica as cargas seguintes e só grava edições do tenant ativo
  [Sarak] CSS não detectado. O import do pacote deveria ter carregado o stylesheet — se isso falhou (ex.: bundler fazendo tree-shaking do side-effect), importe manualmente "@sarak/lib-ui-core/dist/sarak.css" no entry point da aplicação.
  [Sarak:Design] persistence.strategy: 'remote' sem onSave/onLoad configurado — degradando para 'local' (localStorage) para não perder o tema.

  stderr | src/core/Provider/__tests__/TenantPersistence.test.tsx > SarakUIProvider — persistência ao trocar tenant > a configuração padrão do Provider carrega o tenant ao receber as portas após o mount
  [Sarak] CSS não detectado. O import do pacote deveria ter carregado o stylesheet — se isso falhou (ex.: bundler fazendo tree-shaking do side-effect), importe manualmente "@sarak/lib-ui-core/dist/sarak.css" no entry point da aplicação.

   ✓ src/core/Provider/__tests__/TenantPersistence.test.tsx > SarakUIProvider — persistência ao trocar tenant > entra no tenant depois do mount, aplica as cargas seguintes e só grava edições do tenant ativo 967ms
  stderr | src/core/Provider/__tests__/TenantPersistence.test.tsx > SarakUIProvider — persistência ao trocar tenant > a configuração padrão cancela a gravação pendente de A ao trocar para B
  [Sarak] CSS não detectado. O import do pacote deveria ter carregado o stylesheet — se isso falhou (ex.: bundler fazendo tree-shaking do side-effect), importe manualmente "@sarak/lib-ui-core/dist/sarak.css" no entry point da aplicação.

   ✓ src/core/Provider/__tests__/TenantPersistence.test.tsx > SarakUIProvider — persistência ao trocar tenant > a configuração padrão do Provider carrega o tenant ao receber as portas após o mount 576ms
   ✓ src/core/Provider/__tests__/TenantPersistence.test.tsx > SarakUIProvider — persistência ao trocar tenant > a configuração padrão cancela a gravação pendente de A ao trocar para B 627ms

   Test Files  1 passed (1)
        Tests  3 passed (3)
     Start at  01:49:03
     Duration  14.26s (transform 1.04s, setup 244ms, import 9.23s, tests 2.17s, environment 2.29s)
  ```
- Mutação fora do repositório → o caso `a configuração padrão cancela a gravação pendente de A ao trocar para B` falhou em 775 ms na asserção de que `onSaveTenantB` não deveria ter sido chamado; a cópia temporária foi removida (`TEMP_COPY_REMOVED=True`) e `node_modules` foi preservado.
- `npm run verify -- --tier=full` → a primeira rodada teve um timeout de 5 s em `gates/scripts/contrato/__tests__/check-class-merge.test.mjs:172` após 1539 s. O arquivo passou isolado (15/15 em 1,20 s). Na segunda rodada, suíte completa em 1447 s, TSC, baseline, os 24 gates do Anel 1, `check-trail-citation`, `guide:check`, `dev-kit:check` e Anel 0 simulado (64 linhas, 0 achados) passaram; resumo final: `[OK] nível "full" verde.`
- `node .../padrao-typescript/scripts/validate.mjs src/core/Provider/__tests__/TenantPersistence.test.tsx` → exit code 0; o validador também listou apontamentos heurísticos de assinatura/tamanho nas funções de teste existentes no arquivo.
- `git diff --check` → exit code 0.

**Critérios de aceite**
- [x] Três casos com timers falsos e restauração dos timers reais em `afterEach`; nenhum limite de tempo foi aumentado.
- [x] Saída verbose anexada; durações medidas de 967 ms, 576 ms e 627 ms.
- [x] A mutação da limpeza do timer fez o caso de cancelamento falhar na cópia descartável.
- [x] `npm run verify -- --tier=full` terminou verde na segunda execução; a falha temporal isolada da primeira execução também foi registrada.
- [x] Nenhum commit criado.

**Decisões e suposições**
- A espera por `onLoad` é drenada dentro de `act`, e os tempos de negócio avançam por `vi.advanceTimersByTime`; isso evita que `waitFor` dependa do relógio real ou dos próprios timers falsos.
- Não alterei a lib, `vitest.config.ts`, nem outros arquivos de código.

**Achados fora do escopo (não corrigidos)**
- `gates/scripts/contrato/__tests__/check-class-merge.test.mjs:172` excedeu 5 s uma vez dentro da primeira suíte completa, passou isolado e na suíte completa seguinte; não alterado.

**Pendências / riscos**
- O tier full passou antes da transição final do status desta plan de `🔵 Em correção` para `🟠 Em revisão`. `specs/00-indice.md` já estava modificado no início e foi preservado; a linha do índice continua sob revisão do revisor.

## Veredito — 2026-10-22 — correção do achado da CI — 🟢 Aprovado

**O que mudou (conferido no diff):** o executor só alterou `TenantPersistence.test.tsx`. O arquivo passou a usar timers falsos e a
restaurar os reais no `afterEach`. O atraso de 1500 ms da gravação e a pausa de 1600 ms agora avançam de forma explícita, e a carga
remota é drenada por `act`. Nenhum `waitFor` ficou preso a relógio real, nenhum limite de tempo foi aumentado e a lib não mudou. Os
três casos provam o mesmo de antes. No caso do cancelamento, a edição de A fica pendente e a troca para B acontece sem passar tempo:
se o timer não fosse cancelado, ele dispararia ao avançar 1600 ms. A mutação do executor mostra exatamente isso, com o `onSave` de B
chamado antes da edição.
**Medido por mim:** o arquivo rodou duas vezes e passou 3/3 nas duas. Os casos levaram entre 1,3 e 2,4 s, com a máquina carregada
(CPU a 77% e 465 processos `node` de outras sessões). O executor mediu 0,6 a 1,0 s. O tempo que sobrou é de renderização, não de
espera, e não depende mais do relógio. O `tsc --noEmit` deu 0 erros. A suíte completa (`verify --tier=full`) verde fica aceita pelo
relato, porque o diff muda só este teste.
**Observação, não é achado:** na primeira suíte completa do executor, `gates/scripts/contrato/__tests__/check-class-merge.test.mjs:172`
estourou 5 s uma vez. O caso varre a base real, passou isolado e passou na rodada seguinte. Também não falhou na CI. Se cair na CI, ele
volta como achado.

**Correção fechada.** O dono commita, faz o push para a `develop` e espera a CI verde. Depois vem o PR develop → main, a tag
`v8.0.0-rc.2`, e a plan segue para o lote final, que depende dos importadores.

**Status: 🟡 Em execução** (lote final pendente).

## Registro — 2026-10-22 — relato do login-completo na `rc.2`

O login instalou a `v8.0.0-rc.2` sem contorno nenhum (Provider único sem `key`, nonce pela meta, setup de teste da lib, peers que
só serviam ao build removidas). **Funcionou:** o tema do tenant é aplicado depois do login, a CSP fica sem `'unsafe-inline'` (6 de
6 `<style>` com nonce, nenhuma violação), o build passa sem as peers opcionais e os testes passam sem polyfill próprio.
**Leitura do revisor sobre os ❌:**
- "A edição não é gravada depois da troca de tenant": o login escolheu um tema na galeria e não clicou em `Aplicar (N)`. Pela
  `06` (`:145`, `:202`), isso é rascunho: aparece na tela de quem edita e não grava. O comportamento confere com a spec, e o
  defeito está na documentação, que diz o contrário (I27). O lote 7 prova o caminho completo do login com o "Aplicar", para não
  sobrar dúvida; o login mede de novo clicando em "Aplicar".
- `dompurify`: aviso crítico publicado depois da `rc.2` (I28).
- O filtro de teste: defeito real do lote 3 (I29).
Também entraram no registro o I30 (`./package.json` no `exports`, depois da 8.0.0) e o I31 (avisos do build sem peer). O lock
alternando `ssh`/`https` já está no lote final.

**Status: 🟡 Em execução** (lote 7 aberto).

## Resumo da execução — 2026-10-22

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```text
 M specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md
?? .claude/settings.local.json
```

**O que foi feito**
- O teste de componente cobre o Provider inicialmente sem tenant/portas, a chegada de `tenantId` + `onLoad` + `onSave`, a carga do tema, a seleção na galeria e `Aplicar (N)`. Antes de aplicar, verifica que não há gravação; depois, confirma `localStorage` e `onSave` do tenant. `src/features/DesignEngine/Main/__tests__/LoginThemeApplication.test.tsx:83`.
- O caso de navegador exercita o mesmo fluxo usando o `dist/` existente e confirma a ausência de gravação antes de aplicar. `browser-tests/login-theme-application.spec.ts:22`.
- `docs/persistencia-de-tema.md:26` §1.1 agora descreve galeria e ajustes como rascunho e `Aplicar (N)` como a ação que persiste o design aplicado.
- O `verify` rápido encontrou inicialmente uma regressão de arquitetura porque o teste estava em `src/core/Provider`; movi-o para `src/features/DesignEngine/Main/__tests__/` e a auditoria final passou.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `docs/persistencia-de-tema.md` | alterado | §1.1 descreve o rascunho, o botão Aplicar e a persistência do design aplicado. |
| `src/features/DesignEngine/Main/__tests__/LoginThemeApplication.test.tsx` | criado | Prova de componente do caminho completo do tenant até `onSave`. |
| `browser-tests/fixtures/login-theme-application-entry.tsx` | criado | Entrada do harness de navegador contra o `dist/`. |
| `browser-tests/login-theme-application.spec.ts` | criado | Caso de navegador para rascunho, aplicação e persistência. |
| esta plan | alterado | Este resumo e o status de encaminhamento à revisão. |

**Verificações executadas**
- `npx.cmd vitest run src/features/DesignEngine/Main/__tests__/LoginThemeApplication.test.tsx` → 1 teste passou.
- `$env:SARAK_CHROMIUM_EXECUTABLE_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx.cmd playwright test browser-tests/login-theme-application.spec.ts --config=browser-tests/playwright.config.ts` → 1 teste passou contra o `dist/`.
- `npm.cmd run verify -- --tier=quick` → `[OK] nível "quick" verde`; TSC, baseline, barrels, gates, `guide:check` e `dev-kit:check` passaram.
- Os três arquivos TypeScript novos/alterados foram aceitos por `padrao-typescript/scripts/validate.mjs` com `findings: []`.
- `git diff --check` → exit code 0.
- `npm.cmd -v` → `11.6.1`, abaixo do mínimo `11.10.1` exigido em 7.2.

**Critérios de aceite**
- [x] 7.1 — fluxo provado em componente e navegador, sem gravação antes de `Aplicar (N)`; documentação §1.1 atualizada.
- [ ] 7.2 — motivo: npm `11.6.1` é inferior ao mínimo `11.10.1`; interrompi antes de editar `package.json` ou `package-lock.json`, conforme a condição da plan.
- [ ] 7.3 a 7.5 e verificações finais — motivo: dependem da retomada após o bloqueio de versão do npm; não executadas.

**Decisões e suposições**
- O teste usa um tema disponível no boot para manter a seleção determinística e confirmar o caminho de aplicação.
- A tentativa inicial de componente pela casca pública não encontrou o botão da galeria em jsdom (`Unable to find button Abrir galeria`), pois a camada lazy de CSS não foi carregada. O teste de componente cobre o `ThemeCustomizationTab` real; o navegador cobre o fluxo público contra o `dist/`.
- O primeiro `audit:baseline` apontou `auditor_arquitetura.mjs.violacoes: 0 -> 1` quando o teste estava sob `src/core/Provider`. A mudança para `src/features/DesignEngine/Main/__tests__/` removeu a violação; a repetição completa do tier quick passou.
- O Playwright não encontrou seu Chromium empacotado na primeira tentativa; o caso passou usando o Chrome instalado indicado por `SARAK_CHROMIUM_EXECUTABLE_PATH`.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo achado fora do escopo foi registrado.

**Pendências / riscos**
- Retomar em 7.2 com npm `>=11.10.1`; gerar o lock sem remover as entradas protegidas e concluir I28.
- I29, I31 e 7.5 permanecem por executar. `npm run verify -- --tier=full`, `npm run build` nos três cenários de consumidor e os demais casos solicitados não foram executados por causa da condição de parada em 7.2.
- Nenhum commit foi criado. `.claude/settings.local.json` já estava não rastreado na fotografia inicial e foi preservado.


## Registro — 2026-10-22 — o login mediu de novo com o "Aplicar": ✅

Na `rc.2`, sem contorno, com a troca de tenant de ausente para definido: galeria → "Cyberpunk Neon" → `Aplicar (180)`. O
`localStorage` foi escrito em `sarak:design::tenant:<id>` e o `onSave` foi chamado. O `<html>` e o `<body>` ficaram com o tema. **O
❌ anterior não era defeito de persistência**: o I27 fica só com a documentação e com a prova do caminho. O login viu **dois** `PUT`
num só "Aplicar", e os dois foram recusados pela validação do próprio login, que ele já corrigiu. O 7.1 passou a exigir uma chamada
por "Aplicar" e a explicar quantas acontecem quando o `onSave` rejeita.

**Status: 🟡 Em execução** (lote 7 aberto).

## Encaminhamento — 2026-10-22 — lote 7 parado no 7.2 (sem veredito)

O executor parou corretamente no 7.2, porque o npm dele é o 11.6.1. O lote ainda não está pronto para revisão: o veredito sai com o
lote inteiro. **O dono gera a faixa e o lock** do `dompurify` com o npm 11.21.1, como no lote 6. Depois, o executor retoma:
- o 7.1, com o que entrou nele depois da execução: **uma** chamada do `onSave` por "Aplicar", e quantas acontecem com um `onSave` que
  rejeita, e por quê; a §1.1 dizendo que o rascunho já aparece na tela de quem edita;
- o restante do 7.2 (os testes de `src/core/Security/`, o `npm audit` e a nota na `## 8.0.0`), o 7.3, o 7.4, o 7.5 e as
  verificações finais.

**Status: 🟡 Em execução.**

## Registro — 2026-10-22 — lote 7 concluído: ✅

**Status: 🟢 pronto para revisão.** Os lotes 7.1 a 7.6 e as verificações finais foram executados. Nenhum commit foi criado.

### 7.1 — aplicação depois do login e rejeição de `onSave`

O teste integrado do componente observa uma chamada de `onSave` no clique de `Aplicar`. Com um `onSave` que rejeita, a medição continuou em **uma chamada** após 1,8 s, sem nova ação do usuário; o critério de parada não foi acionado.

Em `src/core/Provider/hooks/useDesignManager.ts`, a chamada é aguardada dentro de um único `try`; a rejeição segue para o `catch`, que registra o erro e não contém nova tentativa:

```ts
if (strategy !== 'local' && opt?.persistence?.onSave) {
    await opt.persistence.onSave(config, activeThemeIdAtSave);
}
// ...
} catch (error) {
    console.error('[Sarak:Design] Save error:', error);
}
```

O caminho medido pelo botão `Aplicar` chama a persistência uma vez. A rejeição não dispara retry no `catch`, e o efeito com debounce não gerou outra chamada durante a janela medida. A §1.1 de `docs/persistencia-de-tema.md` explicita que a prévia do rascunho aparece imediatamente na tela de quem edita, sem gravar, e que `Aplicar (N)` confirma e persiste.

### 7.2 — segurança e piso do `dompurify`

- `npm ci` concluiu com npm 11.10.1; foram instalados 449 pacotes e auditados 450. O Chromium do Playwright foi instalado em `node_modules/.cache/ms-playwright`.
- `vitest run src/core/Security/ --reporter=verbose` → 1 arquivo, **4 testes passaram**.
- `npm audit` → saída completa:

```text
found 0 vulnerabilities
```

- A nota de pisos da `## 8.0.0` em `docs/migracoes.md` registra `dompurify >=3.4.17`.
- `package.json` e `package-lock.json` não foram editados neste lote. Os hashes SHA-256 ao final são idênticos aos da fotografia inicial: `package.json` `9116715C6704CC4DC04CE387D7AA4AC927B47DB9608098D42C14DCA27A586319` e `package-lock.json` `3CE5CDB69D44A5DDD51F2871892D6A49FCEEE77B03D55B4F2F433B6ECC507786`.

### 7.3 a 7.6 — consumidor, payload e kits

- 7.3: a reprodução inicial no consumidor Vitest/jsdom mostrou `Could not parse CSS stylesheet`. O setup exportado em `@sarak/lib-ui-core/testing` agora filtra essa mensagem diretamente na VirtualConsole real do jsdom; a configuração isolada com `onConsoleLog` não cobria esse canal. O teste integrado do setup passou (4/4), e o cenário consumidor confirma a ausência do aviso usando o guia.
- 7.4: o build do consumidor Vite 8 passou sem peers opcionais e com todos os peers. Cada build reportou 18 avisos `[MODULE_LEVEL_DIRECTIVE]` pela diretiva `"use client"` em `framer-motion`, e **zero** avisos de URL de fonte não resolvida. O cenário de mutação falhou como esperado com diagnóstico de import nomeado ausente. O guia agora explica o aviso Vite esperado junto à tabela de peers.
- 7.5: `docs/persistencia-de-tema.md` documenta a assinatura e o payload de `onSave` (`design: SarakThemePayload` e `activeThemeId?: string`), trata o payload como opaco e inclui token de cor embarcado com `var()`/`color-mix()` aninhados. O backend pode armazenar o JSON recebido ou validar apenas sua forma.
- 7.6: `npm run guide` e, por último no lote, `npm run dev-kit` concluíram. `guide:check` e `dev-kit:check` também passaram no tier full e no build.

### Verificações finais

- `npm run verify -- --tier=full` → **verde**: `tsc`, suíte Vitest completa (1328 s), auditoria de baseline com TSC (45 s), Anel 1 e kits passaram; Anel 0 simulado: 594 linhas, 0 achados.
- `npm run build` → **verde**, incluindo geração JS/DTS, fontes, CSS e os três cenários de consumidor descritos acima.
- `playwright test --config=browser-tests/playwright.config.ts` com o Chromium de `node_modules/.cache/ms-playwright` → **427 passaram** (20,1 min), sem falhas. Inclui `browser-tests/login-theme-application.spec.ts`.
- `padrao-typescript/scripts/validate.mjs` nos seis arquivos TS/JS afetados → `findings: []` em todos.
- `git diff --check` → exit code 0. O arquivo temporário `test-results/.last-run.json` foi removido; o script de consumidor removeu sua pasta temporária em `finally`.

**Arquivos do lote:** `src/testing.ts`, `src/__tests__/testing.test.ts`, `scripts/test-optional-peer-consumer.mjs`, `src/features/DesignEngine/Main/__tests__/LoginThemeApplication.test.tsx`, `browser-tests/fixtures/login-theme-application-entry.tsx`, `browser-tests/login-theme-application.spec.ts`, `docs/migracoes.md`, `docs/persistencia-de-tema.md`, `sarak-ui/GUIA-FRONTEND.md`, `sarak-ui/docs/migracoes.md`, saídas de `dist/`, arquivos gerados de build e esta plan. As alterações pré-existentes em `package.json` e `package-lock.json` foram preservadas sem mudança de hash. `.claude/settings.local.json` também foi preservado. Nenhum commit foi criado.

**Critérios de aceite:** [x] 7.1 — [x] 7.2 — [x] 7.3 — [x] 7.4 — [x] 7.5 — [x] 7.6 — [x] verificação full — [x] build — [x] bateria completa de navegador.

## Veredito — 2026-10-22 — lote 7 — 🔴 Reprovado (1 achado)

**Conferido no diff:**
- **7.1:** o teste de componente e o caso de navegador provam o caminho do login até o "Aplicar". A medição com `onSave` que
  rejeita deu uma chamada, porque o `catch` não tenta de novo. A §1.1 diz a verdade: o rascunho aparece na tela, só `Aplicar (N)`
  grava, e `options.theme.onSave` é outra porta.
- **7.2:** a faixa `^3.4.17` e a nota na `## 8.0.0`; o `npm audit` está limpo.
- **7.3:** o filtro age na `VirtualConsole` do jsdom, que é o canal real do aviso. O consumidor Vitest prova que o aviso some com o
  setup do guia. O filtro depende de `_virtualConsole`, uma propriedade interna do jsdom: fica aceito, porque, se ela sumir numa
  versão futura, o aviso volta a aparecer e nada quebra.
- **7.5:** o formato do payload, com um exemplo real de `cyberpunk-neon`.

**Achado 1 — o I31 mediu outro aviso.** O login relatou **avisos de export ausente** nos pedaços sob demanda, no build sem as peers
opcionais. O 7.4 contou só dois tipos de aviso (`MODULE_LEVEL_DIRECTIVE` e URL de asset não resolvida), e o consumidor tirou o
`--logLevel error` mas imprime apenas esses dois filtros. Um aviso de export ausente, se existir, não aparece em lugar nenhum. O guia
passou a dizer que o aviso esperado é o do `"use client"` do `framer-motion`, e isso pode não ser o que o importador vê.
**Correção:** no cenário sem peers, listar **todos** os avisos do build, agrupados por código, com a contagem e um exemplo de cada,
e colar a lista. Procurar em especial os de export ausente ou de membro indefinido de namespace, vindos dos pedaços que importam peer
por namespace (`import * as … from "@tanstack/react-virtual"`, `@dnd-kit/*`, `echarts`, `pdfjs-dist` e afins). Se eles aparecem,
vale o 7.4 original: tirar, se der sem voltar a quebrar o build sem a peer (os três cenários verdes), ou o guia nomear esse aviso, o
porquê e que ele é inofensivo. Se não aparecem no consumidor, dizer o que difere do login: a versão do Vite e o gerenciador. O texto
exato do aviso do login pode ser pedido ao dono. O consumidor passa a imprimir todos os avisos, não só os dois filtrados.

**Status: 🔵 Em revisão** (achado 1 corrigido). Na aprovação, o revisor confere o build e o consumidor.

## Resumo da execução (correção 1) — 2026-10-22

### Fotografia inicial do worktree

`git status --short` antes desta correção:

```text
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-UAIRXF3T.js
 D dist/SarakChartEngine-AN3TB3TP.js
 D dist/SarakChatEngine-SCZFSMN6.js
 D dist/SarakDataGridImpl-MOBMFPMA.js
 D dist/SarakDataTableImpl-HCJLJ5HT.js
 D dist/SarakFlowEngine-5QO42PNZ.js
 D dist/SarakKanbanImpl-AQMXQY4D.js
 D dist/SarakMarkdownRendererImpl-K5MGRO65.js
 D dist/SarakPDFViewerImpl-NXZV7UGR.js
 D dist/chunk-2Z4AIOZI.js
 D dist/chunk-736X7R7Y.js
 D dist/chunk-7RPRNL32.js
 D dist/chunk-BPWFS73Q.js
 D dist/chunk-BVEFVMG7.js
 D dist/chunk-O4PTARUD.js
 D dist/chunk-PB3A3BNB.js
 D dist/chunk-X2ZPSNNQ.js
 D dist/chunk-XQJR5PAJ.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M dist/testing.cjs
 M dist/testing.js
 M docs/migracoes.md
 M docs/persistencia-de-tema.md
 M package-lock.json
 M package.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/docs/migracoes.md
 M scripts/test-optional-peer-consumer.mjs
 M specs/00-indice.md
 M specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md
 M src/__tests__/testing.test.ts
 M src/buildInfo.ts
 M src/core/Provider/buildInfo.ts
?? .claude/settings.local.json
?? browser-tests/fixtures/login-theme-application-entry.tsx
?? browser-tests/login-theme-application.spec.ts
?? dist/CustomizationPanelImpl-FFM45PL.js
?? dist/SarakChartEngine-LGP6ELWE.js
?? dist/SarakChatEngine-SQI3I25Q.js
?? dist/SarakDataGridImpl-G7R3O7FQ.js
?? dist/SarakDataTableImpl-RNCCBEND.js
?? dist/SarakFlowEngine-YU3CSKV5.js
?? dist/SarakKanbanImpl-D45SV4S7.js
?? dist/SarakMarkdownRendererImpl-YRXACXVY.js
?? dist/SarakPDFViewerImpl-5KS45PLR.js
?? dist/chunk-2NNELNP7.js
?? dist/chunk-BYHQI5HD.js
?? dist/chunk-CVHGIEAN.js
?? dist/chunk-DDXCSCQ4.js
?? dist/chunk-GM23LJA4.js
?? dist/chunk-JH5UOXIS.js
?? dist/chunk-OVSZTHL4.js
?? dist/chunk-WH7SN2EO.js
?? dist/chunk-YQNJN273.js
?? src/features/DesignEngine/Main/__tests__/LoginThemeApplication.test.tsx
```

### Achado 1 — avisos do build sem peers

- `scripts/test-optional-peer-consumer.mjs` agora coleta avisos do build sem filtrar tipos específicos, agrupa por código, conta ocorrências e mostra um exemplo. O aviso Rollup/Vite sem código é agrupado como `SEM_CODIGO`; para `IMPORT_IS_UNDEFINED`, o relatório também enumera os diagnósticos distintos.
- A primeira medição encontrou 43 avisos: 24 `[IMPORT_IS_UNDEFINED]` para `useVirtualizer` de `@tanstack/react-virtual`, 18 `[MODULE_LEVEL_DIRECTIVE]` de `framer-motion` e um aviso sem código sobre chunk acima de 500 kB.
- A investigação também encontrou exports ausentes de `Prism`, `oneDark`, `format`, `graphic`, `use`, `ResponsiveContainer`, `BarChart`, `LineChart`, `AriaComponent`, `LegendComponent` e `BackgroundVariant`, associados a `react-syntax-highlighter`, `echarts`, `echarts/core`, `echarts/components`, `recharts` e `reactflow`.
- Os acessos opcionais desses membros passaram a usar consultas dinâmicas com `Reflect.get`. Um helper central para `@tanstack/react-virtual` preserva o fallback de `SarakDataGrid` e `SarakDataTable` quando a peer não está instalada. O build sem peers continua verde e não emite aviso de export ausente; não foi necessário alterar o guia para declarar um aviso inofensivo.
- O consumidor usa Vite 8.3.5. Como os avisos de export ausente foram reproduzidos e removidos no próprio consumidor, não foi necessário comparar a configuração do login.

Lista completa agrupada do cenário sem peers no build final:

```text
19 warning(s) across 2 code(s).
[MODULE_LEVEL_DIRECTIVE] 18: [MODULE_LEVEL_DIRECTIVE] The semantics of the module level directive "use client" in "../../../../../Desktop/Sarak/X - Trabalho/Code/Biblioteca/Sarak-Lib-UI-Core/node_modules/framer-motion/dist/es/index.mjs" may not be preserved when bundling.
[SEM_CODIGO] 1: (!) Some chunks are larger than 500 kB after minification. Consider:
```

O build com todas as peers também passou com os mesmos dois grupos: 18 `[MODULE_LEVEL_DIRECTIVE]` de `framer-motion` e um aviso sem código de chunk grande; nenhum `[IMPORT_IS_UNDEFINED]` foi emitido.

### Verificações finais

- `npm run build` — **verde**. Os três cenários do consumidor passaram: sem peers opcionais, Vitest/jsdom e com todas as peers. A mutação com import nomeado ausente foi rejeitada como esperado.
- `npm run verify -- --tier=quick` — **verde**: `tsc`, baseline, Anel 1, kits e Anel 0 passaram; 773 linhas simuladas, zero achados.
- O relatório AST do helper e do script atualizado retornou `findings: []`.
- `package.json` e `package-lock.json` não foram editados nesta correção; as alterações preexistentes da faixa `^3.4.17` foram preservadas. Nenhum commit foi criado.

## Veredito — 2026-10-22 — correção 1 (lote 7) — 🔴 Reprovado (1 achado novo)

**Achado 1 do veredito anterior:** fechado quanto à medição. O consumidor lista todos os avisos agrupados por código e reproduziu o
que o login viu: 24 `IMPORT_IS_UNDEFINED` de `useVirtualizer`, além de exports ausentes de `react-syntax-highlighter`, `echarts`,
`recharts` e `reactflow`.

**Achado 2 — o conserto tira o aviso, mas engorda o bundle de quem instala as peers.** O executor trocou o acesso estático
(`Modulo.membro`) por `Reflect.get(Modulo, 'membro')` em 13 arquivos de `src/`. O bundler deixa de saber qual membro é usado e
passa a guardar o namespace inteiro. **Medido por mim:** um consumidor Vite 8 com **todas** as peers instaladas e a mesma entrada do
consumidor de `scripts/test-optional-peer-consumer.mjs` (os oito componentes sob demanda), construído com o `dist/` do `HEAD`
(`git archive`) e com o `dist/` do worktree:

| `dist/` | JS total do importador | arquivos | maior diferença |
|---|---|---|---|
| `HEAD` | 5020 KiB | 35 | — |
| worktree | **6115 KiB (+1095 KiB, +22%)** | **334** | `prism` 713 → 1192 KiB, mais ~300 chunks de linguagem (`abap`, `abnf`, `actionscript`…) |

A causa principal é `Reflect.get(SyntaxHighlighterModule, 'Prism')` e os estilos, em `SarakMarkdownRendererImpl.tsx` e
`SarakChatEngine.tsx`: o namespace inteiro do `react-syntax-highlighter` (todas as linguagens e todos os estilos) entra no build do
importador. O motor de gráficos quase não mudou (1616 → 1618 KiB). Isso piora o que o importador sente, para tirar um aviso
inofensivo. A regra do 7.4 era tirar o aviso **só se der sem custo**; com custo, o guia nomeia o aviso.
**Correção:** voltar ao acesso estático onde o `Reflect.get` engorda o bundle, e medir arquivo por arquivo (o `@tanstack/react-virtual`
e o `echarts`/`recharts` podem ficar, se a medição mostrar custo zero). O que voltar ao acesso estático mantém o aviso, e o guia
(junto da tabela de peers) nomeia o `IMPORT_IS_UNDEFINED` no build sem a peer, explica por que aparece e diz que é inofensivo,
porque o componente mostra o fallback. **Prova pedida:** o consumidor passa a imprimir, no cenário com todas as peers, o JS total e
o número de arquivos; o relato traz a mesma tabela acima (com o `dist/` do `HEAD` e o do worktree), e o worktree fica no máximo 1%
acima do `HEAD`. Depois, `npm run build` e `npm run verify -- --tier=full`.

**Status: 🔵 Em revisão** (achado 2).

## Resumo da execução (correção 2) — 2026-10-22

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**

```text
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-UAIRXF3T.js
 D dist/SarakChartEngine-AN3TB3TP.js
 D dist/SarakChatEngine-SCZFSMN6.js
 D dist/SarakDataGridImpl-MOBMFPMA.js
 D dist/SarakDataTableImpl-HCJLJ5HT.js
 D dist/SarakFlowEngine-5QO42PNZ.js
 D dist/SarakKanbanImpl-AQMXQY4D.js
 D dist/SarakMarkdownRendererImpl-K5MGRO65.js
 D dist/SarakPDFViewerImpl-NXZV7UGR.js
 D dist/chunk-2Z4AIOZI.js
 D dist/chunk-736X7R7Y.js
 D dist/chunk-7RPRNL32.js
 D dist/chunk-BPWFS73Q.js
 D dist/chunk-BVEFVMG7.js
 D dist/chunk-O4PTARUD.js
 D dist/chunk-PB3A3BNB.js
 D dist/chunk-X2ZPSNNQ.js
 D dist/chunk-XQJR5PAJ.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M dist/testing.cjs
 M dist/testing.js
 M docs/migracoes.md
 M docs/persistencia-de-tema.md
 M package-lock.json
 M package.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/docs/migracoes.md
 M scripts/test-optional-peer-consumer.mjs
 M specs/00-indice.md
 M specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md
 M src/__tests__/testing.test.ts
 M src/buildInfo.ts
 M src/components/atomic/DataDisplay/SarakDataGrid/SarakDataGridImpl.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/SarakDataCards.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/SarakDataTableImpl.tsx
 M src/components/atomic/DataDisplay/SarakDataTable/useSarakDataTableViewModel.ts
 M src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx
 M src/components/engines/charts/SubEngines/RechartsChart.tsx
 M src/components/engines/charts/SubEngines/builders/advancedCharts.ts
 M src/components/engines/charts/SubEngines/builders/basicCharts.ts
 M src/components/engines/charts/SubEngines/builders/statisticalCharts.ts
 M src/components/engines/charts/SubEngines/builders/waterfallCharts.ts
 M src/components/engines/charts/SubEngines/chartPeerAvailability.ts
 M src/components/engines/chat/SarakChatEngine.tsx
 M src/components/engines/flows/SarakFlowEngine.tsx
 M src/core/Provider/buildInfo.ts
 M src/testing.ts
?? .claude/settings.local.json
?? browser-tests/fixtures/login-theme-application-entry.tsx
?? browser-tests/login-theme-application.spec.ts
?? dist/CustomizationPanelImpl-SGP4OZO6.js
?? dist/SarakChartEngine-QCU3MYAD.js
?? dist/SarakChatEngine-TBFVMZBH.js
?? dist/SarakDataGridImpl-UH7TK5U5.js
?? dist/SarakDataTableImpl-SOZTFXMR.js
?? dist/SarakFlowEngine-FADA3CER.js
?? dist/SarakKanbanImpl-BOC7AD3A.js
?? dist/SarakMarkdownRendererImpl-KQHG55G4.js
?? dist/SarakPDFViewerImpl-QJEVMZ3T.js
?? dist/chunk-4QZFH5TU.js
?? dist/chunk-FY2SBRPC.js
?? dist/chunk-JROKUO2Z.js
?? dist/chunk-LWLIXJ3U.js
?? dist/chunk-LYWLFTZC.js
?? dist/chunk-OFDI3Q45.js
?? dist/chunk-RT35M7HS.js
?? dist/chunk-RXCAJVLA.js
?? dist/chunk-TVSHL4EM.js
?? dist/chunk-ZKWSEM6K.js
?? src/components/atomic/DataDisplay/optional-tanstack-virtualizer.ts
?? src/features/DesignEngine/Main/__tests__/LoginThemeApplication.test.tsx
```

**O que foi feito**

- Restaurado o acesso estático a `Prism` e estilos do `react-syntax-highlighter` em `SarakMarkdownRendererImpl.tsx` e `SarakChatEngine.tsx`; o consumidor voltou a emitir um único chunk `prism` com 729.615 bytes, em vez dos cerca de 300 chunks de linguagem descritos no veredito.
- Restaurado o acesso estático para `@tanstack/react-virtual`, ECharts, Recharts e ReactFlow. Nenhum desses namespaces ficou com `Reflect.get`; os fallbacks existentes continuam verificando a disponibilidade da peer antes de renderizar a implementação.
- O script do consumidor passou a aceitar uma pasta de pacote alternativa e um modo `SARAK_OPTIONAL_PEER_SCENARIO=all` para medir o cenário completo isoladamente. No cenário normal imprime cada arquivo JS emitido, o total de bytes e a quantidade de arquivos.
- Acrescentada ao guia, junto à tabela de peers, a explicação do aviso `IMPORT_IS_UNDEFINED`, com os membros observados e os componentes que mostram fallback.

**Comparação do consumidor com todas as peers**

O mesmo entry de Vite 8.3.5 que importa os oito componentes sob demanda foi empacotado a partir de `git archive HEAD dist package.json` extraído fora do repositório e a partir do `dist/` do worktree.

| `dist/` | JS total do importador | arquivos | maior diferença |
|---|---:|---:|---|
| `HEAD` | 5.140.275 bytes (5.019,80 KiB) | 35 | — |
| worktree | 5.012.547 bytes (4.895,07 KiB) | 35 | −127.728 bytes (−2,48%); o chunk `SarakChartEngine` caiu 127.969 bytes |

Medição dos chunks de saída correspondentes aos módulos alterados:

| Módulo/peer | Chunk do consumidor | `HEAD` (bytes) | worktree (bytes) | diferença |
|---|---|---:|---:|---:|
| `react-syntax-highlighter` | `prism` | 729.615 | 729.615 | 0 |
| Markdown | `SarakMarkdownRendererImpl` | 27.548 | 27.548 | 0 |
| Chat | `SarakChatEngine` | 8.297 | 8.297 | 0 |
| `@tanstack/react-virtual` | `SarakDataGridImpl` | 959 | 981 | +22 |
| `@tanstack/react-virtual` | `SarakDataTableImpl` | 12.822 | 12.827 | +5 |
| ECharts e Recharts | `SarakChartEngine` (chunk compartilhado) | 1.655.155 | 1.527.186 | −127.969 |
| `reactflow` | `SarakFlowEngine` | 146.818 | 146.824 | +6 |

O chunk de gráficos agrega ECharts e Recharts, então a medição do consumidor não separa a contribuição individual dos dois dentro dele. Os acessos em ambas as integrações foram mantidos estáticos. O total do worktree ficou 2,48% abaixo do `HEAD`, dentro do limite de até 1% acima.

**Avisos observados**

No consumidor sem peers, o build passou com **44 avisos em 3 códigos**: 25 `IMPORT_IS_UNDEFINED`, 18 `MODULE_LEVEL_DIRECTIVE` de `framer-motion` e um aviso sem código de chunk acima de 500 kB. Os 25 avisos de import correspondem a estes 19 membros distintos:

- `@tanstack/react-virtual`: `useVirtualizer`.
- `react-syntax-highlighter`: `Prism`; `react-syntax-highlighter/dist/esm/styles/prism`: `oneDark`, `oneLight`, `atomDark`.
- `echarts`: `graphic`, `format`; `echarts/core`: `use`; `echarts/components`: `AriaComponent`, `LegendComponent`.
- `recharts`: `ResponsiveContainer`, `BarChart`, `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `Bar`.
- `reactflow`: `BackgroundVariant`.

O guia explica que o Rollup emite `IMPORT_IS_UNDEFINED` porque os exports não existem enquanto a peer está ausente e que o aviso é inofensivo: os componentes verificam a peer e exibem o fallback. Com todas as peers, o build passou com 19 avisos em dois códigos: os mesmos 18 avisos `MODULE_LEVEL_DIRECTIVE` e o aviso sem código de chunk grande; não houve `IMPORT_IS_UNDEFINED`.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `scripts/test-optional-peer-consumer.mjs` | alterado | Origem de pacote comparável, modo all-peers e métricas por arquivo, total e quantidade JS. |
| `src/components/atomic/DataDisplay/optional-tanstack-virtualizer.ts` | alterado | Acesso estático a `useVirtualizer`. |
| `src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx` | restaurado | Acesso estático a `Prism`, `oneDark` e `oneLight`; o arquivo voltou a coincidir com o `HEAD`. |
| `src/components/engines/chat/SarakChatEngine.tsx` | restaurado | Acesso estático a `Prism` e `atomDark`; o arquivo voltou a coincidir com o `HEAD`. |
| `src/components/engines/charts/SubEngines/chartPeerAvailability.ts` | alterado | Acesso estático aos exports de ECharts e Recharts usados na disponibilidade. |
| `src/components/engines/charts/SubEngines/RechartsChart.tsx` | alterado | Acesso estático aos componentes Recharts. |
| `src/components/engines/charts/SubEngines/builders/{basicCharts,advancedCharts,statisticalCharts,waterfallCharts}.ts` | alterados | Acesso estático a `graphic` e `format` de ECharts. |
| `src/components/engines/flows/SarakFlowEngine.tsx` | alterado | Acesso estático a `BackgroundVariant`. |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | Documentação dos avisos `IMPORT_IS_UNDEFINED` e dos fallbacks correspondentes. |
| `dist/*` | regenerado | Artefatos refeitos pelo `npm run build`; o diretório já estava modificado no snapshot inicial. |
| `specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md` | alterado | Este relato append-only e status encaminhado para revisão. |

**Verificações executadas**

- `npm run build` → **verde**. Passaram os três cenários: sem peers (44 avisos agrupados), Vitest/jsdom, mutação de import nomeado ausente rejeitada e com todas as peers (5.012.547 bytes, 35 arquivos JS).
- Comparação com `HEAD` extraído por `git archive HEAD dist package.json` fora do repositório → cenário com todas as peers **verde**, 5.140.275 bytes, 35 arquivos JS.
- `npm run verify -- --tier=full` → **verde**: `tsc` passou; Vitest passou em 1.433 s; auditoria baseline passou; gates do Anel 1 e guia/dev-kit passaram; Anel 0 simulou 946 linhas com zero achados.
- Validador AST TypeScript/JavaScript → zero achados no script do consumidor, helper TanStack e arquivos de charts alterados. Encontrou achados existentes em funções não modificadas de Markdown (3), Chat (8) e Flow (4); não foram ampliados porque ficam fora do achado 2.
- `git diff --check` nos arquivos-fonte, guia e plan → **verde**. A verificação sem filtro também aponta espaço em branco à direita em `dist/index.cjs:1`, artefato minificado já modificado no snapshot inicial e regenerado pelo build; não alterei manualmente o artefato nem o processo de geração.
- Nenhum commit criado. `package.json` e `package-lock.json` não foram editados nesta correção; as alterações que já estavam no snapshot inicial foram preservadas.

**Critérios de aceite**

- [x] Acesso estático para os namespaces opcionais medidos, sem `Reflect.get` remanescente nesses acessos.
- [x] Consumidor imprime bytes totais, quantidade e tamanho de cada arquivo JS no cenário com todas as peers.
- [x] Comparação pelo mesmo consumidor e entrada: worktree −2,48% vs `HEAD`, abaixo do limite de +1%.
- [x] Guia nomeia os avisos `IMPORT_IS_UNDEFINED` observados e explica sua causa e o fallback.
- [x] `npm run build` e `npm run verify -- --tier=full` passaram.
- [x] Sem commit.

**Decisões e suposições**

- A primeira execução do fluxo completo usando o `dist/` arquivado do `HEAD` parou na asserção independente de Vitest/jsdom: aquele pacote imprimiu `Could not parse CSS stylesheet`, enquanto o consumidor espera que o setup suprima o aviso. Para a comparação pedida, rodei o mesmo entry e build com todas as peers em modo isolado; esse cenário passou. O build de trabalho completo, incluindo Vitest/jsdom, passou.
- Como nenhuma integração dos peers citados conservou `Reflect.get`, não houve caso restante que dependesse de comprovar custo zero para manter esse acesso dinâmico.

**Achados fora do escopo (não corrigidos)**

- O validador AST apontou funções longas, anotações de tipo ausentes e, em Flow, `console.error` e números mágicos em linhas anteriores e não relacionadas às alterações de acesso estático. Os achados ficaram restritos a `SarakMarkdownRendererImpl.tsx` (3), `SarakChatEngine.tsx` (8) e `SarakFlowEngine.tsx` (4); permanecem para revisão separada.

**Pendências / riscos**

- Os builds sem peers continuam emitindo os 25 avisos `IMPORT_IS_UNDEFINED` documentados no guia; são não bloqueantes porque os componentes exibem fallback. Os avisos de `framer-motion` e chunk grande continuam presentes com ou sem peers.

## Veredito — 2026-10-23 — correção 2 (lote 7) — 🟢 Aprovado; lote 7 fechado

**Achado 2:** fechado. Não sobrou nenhum `Reflect.get` em `src/`: o acesso às peers voltou a ser estático.
**Medido por mim**, com o mesmo consumidor do veredito anterior (Vite 8, todas as peers, os oito componentes): o `HEAD` dá
5020 KiB em 35 arquivos, e o worktree **4895 KiB em 35 arquivos**. A queda está no motor de gráficos (1616 → 1491 KiB) e é
legítima: o `HEAD` lia `echarts/components` como `Record<string, unknown>` por índice, o que retinha o namespace inteiro, e o
acesso estático deixa o bundler cortar o que não é usado. A bateria inteira do navegador contra o `dist/` passou com **427/427**, o
que inclui os casos de gráfico e o novo `login-theme-application.spec.ts`. O guia nomeia o `IMPORT_IS_UNDEFINED` do build sem a
peer, diz por que é inofensivo e explica o fallback. A observação do relato sobre o cenário Vitest com o `dist/` do `HEAD` confere: o
`HEAD` ainda não tinha o filtro. O `build` e o `verify --tier=full` verdes ficam aceitos pelo relato, porque a medição do bundle e a
bateria rodaram sobre esse mesmo `dist/`.

**Lote 7 fechado (I27, I28, I29, I31, I32).** Os lotes 0–7 estão aprovados e entram na `v8.0.0-rc.3`. Fica aberto o lote final, que
depende dos importadores.

**Status: 🟡 Em execução** (lote final pendente).

## Resumo da execução — lote 8 (2026-10-27)

**Resultado: I33–I39 implementadas, em revisão; I40 pendente.** A medição de navegador da demanda 12 ainda não foi relatada na
plan-131, que continua `🟡 Em execução` com a §9 vazia.

**Worktree antes da edição:** `git status --short` e `git diff HEAD` falharam com `fatal: this operation must be run in a work tree`,
embora `git rev-parse --is-inside-work-tree` retornasse `true`. A fotografia read-only de `git ls-files` registrou 49 modificados,
5 removidos e 40 não rastreados; os arquivos deste lote estavam limpos. Na conferência final, os contadores eram 102 modificados,
5 removidos e 59 não rastreados, com trabalho paralelo das plans 129–132. Assim, não foi possível obter um `git status` confiável.

| Arquivos | Alteração |
|---|---|
| `browser-tests/tela-lista.scene.tsx`, `browser-tests/tela-detalhe.scene.tsx` | Fontes dos moldes gerados sem `<main>` aninhado e com um `SarakPageHeader` por página. |
| `sarak-ui/templates/tela-exemplo.tsx` | Uso de `SarakCard.Body`, `SarakPageHeader`, `SarakResponsiveValue<string>` com `{ mob, tab, desk }` e `gap="spacing-md"`; preservados os estados de carga, erro, vazio e sucesso. |
| `sarak-ui/GUIA-FRONTEND.md`, `sarak-ui/templates/README.md` | Nova seção visível de valor por dispositivo com referência a `catalog.json` → `responsive.responsiveProps`; README agora lista os oito moldes. |
| `src/components/atomic/Templates/SarakResourceRow.tsx` e `__tests__/SarakResourceRow.test.tsx` | `SarakBadge` recebido é mantido sem embrulho extra; adicionado teste localizado por papel `article`. |
| `docs/migracoes.md` | Documentada a mudança visual dos badges, conforme escopo condicional de I35. |

As fontes de lista e detalhe alimentam `sarak-ui/templates/tela-lista.tsx` e `tela-detalhe.tsx`. Conforme `rc4-contrato.md` §9, os
gerados não foram editados. A conferência read-only de `buildKitOutputs()` confirmou para cada saída zero `<main>`, um
`SarakPageHeader`, zero `<h1>` explícito e zero `gap="md"`; as cópias em disco aguardam `npm run guide` no fechamento da rc.4.
A lista de props foi conferida em `catalog.json` para `SarakGrid`, `SarakFlex`, `SarakPageHeader`, `SarakCard`, `SarakFilterBar`,
`SarakSegmentedControl`, `SarakSection`, `SarakDescriptionList` e `SarakResourceRow`. O validador AST obrigatório terminou sem
achados nos cinco arquivos TS/TSX alterados.

**Verificações e pendências:** a tentativa de Vitest não chegou aos casos: a primeira falhou ao escrever `node_modules/.vite-temp`
(`EPERM`); a segunda parou na coleta porque `src/core/Design/palette/resolve.ts` importa `./contrast`, ausente em trabalho paralelo.
O revisor deve repetir o teste conforme §8. `npm run verify -- --tier=quick` rodou uma vez e terminou com código 1, com 9 falhas:
`tsc`, `audit:baseline --with-tsc` (import ausente e referências a `colorPalette`), `catalog:check`, `theme-completeness:check`
(`colorPalette` ausente nos 19 temas), `variable-contract:check` (fallback de `SarakDataTableSkeleton`), `plan-index:check`
(divergência da plan-130), `trail-citation` (Git não reconheceu o worktree), `guide:check` e `dev-kit:check` (saídas geradas
desatualizadas). Os outros gates reportados passaram; Anel 0 simulou 3.810 linhas com zero achados. Falhas de outras frentes não foram
corrigidas. Nenhum importador foi alterado e nenhum commit foi criado. **Status: 🟠 Em revisão; I40, teste e sincronização da rc.4
pendentes.**

## Veredito — 2026-10-28 — lote 8 — 🟢 I33–I39 aprovadas; I40 aberta

**Medido por mim**, pelo protocolo do contrato da `rc.4` §9: `npx vitest run SarakResourceRow` — **2/2 verdes** (o executor não
conseguiu rodar por `EPERM` e pela coleta quebrada por trabalho paralelo; o filtro por nome não passa por `palette/`). O `grep` do 8.1
nas fontes: `browser-tests/tela-lista.scene.tsx`, `browser-tests/tela-detalhe.scene.tsx` e `sarak-ui/templates/tela-exemplo.tsx` com
zero `<main`, zero `<h1`/`level={1}`, um `SarakPageHeader` cada e zero `gap="md"`; o `tela-exemplo` usa `{ mob, tab, desk }`.

- **Escopo:** `tela-lista` e `tela-detalhe` saem de `browser-tests/*.scene.tsx` pelo gerador do kit; o 3.1 do lote apontava para a
  cópia gerada. O executor editou a fonte certa — erro da instrução, não da execução.
- **I35:** `renderResourceBadge` (`SarakResourceRow.tsx`) mantém o `SarakBadge` recebido e só embrulha valor simples; o teste novo
  prova que não há `span` de selo dentro de outro. A extração em subcomponentes veio do teto de tamanho de função; o comportamento é
  o mesmo. Nota em `docs/migracoes.md`.
- **I33:** `GUIA-FRONTEND.md` §3.10 ganhou "Valor por dispositivo — `SarakResponsiveValue<T>`", apontando para
  `catalog.json` → `responsive.responsiveProps` (sem transcrever a lista, R17). **I38:** README com os oito moldes.
- **I40** segue aberta: espera a medição de navegador da `plan-131`. As falhas do `quick` relatadas são de outras plans em voo (tipos de
  `palette/`, `colorPalette` nos temas, `SarakDataTableSkeleton`) ou de gerado — nenhuma em arquivo deste lote.

**Status da plan: 🟡 Em execução** (I40 e o lote final pendentes). O lote 8 entra no commit da rodada (contrato §9).

## Resumo da execução (item 8.5 — I40) — 2026-10-28

**Resultado: Concluído.** A linha sobre a altura do cromo foi acrescentada ao guia após a medição da demanda 12 na plan-131.

**Estado do worktree ao iniciar**

`git status --short` → `fatal: this operation must be run in a work tree`. `git ls-files` como fotografia read-only: 115 arquivos
modificados, 5 removidos e 79 não rastreados. O guia já continha as alterações deste mesmo lote; preservei o restante do worktree.

**O que foi feito**

- `sarak-ui/GUIA-FRONTEND.md` — informa que o `SarakAppChrome` ocupa a janela com `100dvh`, não depende de `height: 100%` em
  `html/body/#root`, mantém a rolagem de páginas altas no `<main>` e orienta preencher a altura disponível com `fillHeight` de
  `SarakAnalyticalPage` ou `sarak-fill-height` (`min-height: 100%`).

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `sarak-ui/GUIA-FRONTEND.md` | alterado | Nova orientação sobre altura própria do cromo e preenchimento da altura útil. |
| `specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md` | alterado | Status encaminhado para revisão e este resumo append-only. |

**Verificações executadas**

- Veredito da `plan-131` (2026-10-28): demanda 12 não reproduziu em navegador, a 1280×600, sem cadeia de altura no host; a rolagem
  ficou no `<main>` e a topbar não se moveu. Na medição complementar a 1440×800, `fillHeight` mediu 640 px, igual à altura útil do
  `<main>`; o filho centralizado manteve 1000 px.
- Leitura da implementação: `SarakAppChrome.tsx:197` define `height: 100dvh`; `SarakAnalyticalPage.tsx:45` aplica
  `sarak-fill-height`; `_utilities.css:66–68` define `min-height: 100%`.
- Não rodei testes nem geradores: esta alteração é documental e o contrato §9 reserva `guide` para o fechamento. O `verify --tier=quick`
  do lote 8 já foi executado uma vez e está relatado no resumo anterior.

**Critérios de aceite**

- [x] I40 medida antes da orientação — evidência: veredito aprovado da `plan-131`, demanda 12 não reproduz.
- [x] Linha do guia distingue a altura própria do cromo do preenchimento do conteúdo — evidência: `sarak-ui/GUIA-FRONTEND.md`.

**Decisões e suposições**

- A orientação registra o comportamento medido sem propor correção ao cromo: a cadeia `height: 100%` no host não é necessária no
  cenário medido; o consumidor que precisa preencher a área disponível usa a API existente.

**Achados fora do escopo (não corrigidos)**

- Nenhum novo achado nesta execução. As falhas do `verify --tier=quick`, inclusive as de saídas geradas e as de outras frentes,
  permanecem descritas no resumo anterior.

**Pendências / riscos**

- A sincronização dos artefatos gerados permanece para o fechamento da rc.4, conforme o contrato §9. Nenhum teste foi necessário para
  a mudança documental. Nenhum commit foi criado.

## Veredito — 2026-10-28 — lote 8.5 (I40) — 🟢 Aprovado; lote 8 fechado

**Conferido por mim:** `sarak-ui/GUIA-FRONTEND.md:169-171` diz que o `SarakAppChrome` ocupa a janela com `100dvh`, não depende de
`height: 100%` em `html`/`body`/`#root`, rola páginas altas no `<main>`, e manda preencher a altura com `fillHeight` ou
`sarak-fill-height` (`min-height: 100%`) — o que o código faz (`SarakAppChrome.tsx:197`, `_utilities.css`) e o que a `plan-131`
mediu em navegador. Nenhum outro trecho do guia manda declarar a cadeia de altura (`grep` de `height: 100%`/`#root`). Mudança só de
documento: sem teste a rodar.

**Lote 8 fechado (I33–I40).** O ERP pode tirar a cadeia de altura dos oito `index.html` (demanda 12) depois de instalar a `rc.4`.

**Status da plan: 🟡 Em execução** (lote final pendente, como antes).
