# Relatório do importador ERP Earendel (sessão de revisor do ERP, 2026-10-19)

Transcrito como entregue pelo revisor do ERP, por leitura do checkout da lib (HEAD `4cbd726a`) e do repositório do ERP. É
**alegação**: cada linha que vira trabalho na lib foi conferida pelo revisor da lib e está no registro da §5.1 da plan. Os
caminhos `packages/…`, `modules/…` e `tools/…` são do ERP.

## Tabela 1 — Achados da lib

| Achado (arquivo:linha) | Medição / evidência | Por que é da lib | Peso |
|---|---|---|---|
| O "Salvar" do painel não entrega a `contraparte`: `Main/hooks/useThemePersistenceHandlers.ts:63` chama `saveTheme({ id, name, design })`; `Main/utils/exportTheme.ts:59-66` (`buildThemeExportPayload`) também não a emite | `GUIA-FRONTEND.md:527-532` mostra o JSON com `contraparte`; o código não o produz; o tema salvo/exportado perde o par claro/escuro | só a lib sabe a contraparte do rascunho | essencial |
| O painel não distingue criar, substituir e duplicar: `SaveThemeModal.tsx:45` pré-preenche o nome do ativo; `exportTheme.ts:62` id = `slugifyThemeId(nome)` | mesmo nome → mesmo id → substitui sem aviso; modal "Exportar Tema (JSON)" (`:72`) mesmo com `onSave`; botão "Exportar" (`ThemeActionBar.tsx:8`); "Salvar" secundário; `onSave(entry)` não diz se cria ou substitui | UI do painel e contrato da porta | essencial |
| Id do usuário colide com embarcado: `Provider/hooks/useThemeCollection.ts:30` e `:37` sem deduplicar | salvar "Sarak Sovereign" gera `sarak-sovereign`; as duas entradas coexistem; o host devolve o id em `customThemes` | a invariante "tema da lib é imutável" (`09` §4.4.2) é da lib | essencial |
| Não existe o gesto "Apagar": `deleteTheme` (`useThemeCollection.ts:67`) não é chamado por nenhum componente do painel | `onDelete` inalcançável; `deleteTheme` aceita id embarcado e não desfaz se `onDelete` rejeitar (`:67-72`) | painel e Provider | essencial |
| "Criar do zero" só como efeito colateral ("Restaurar Padrões", `Panels/AdvancedTab.tsx:110`) | o guia §3.9 manda partir de uma referência completa | falta "Novo tema" a partir de `sarakLoadReferenceThemes` | melhoria |
| Falha do `onSave` do host engolida (ERP `themePersistence.ts:83-95`) | `saveTheme` funde antes e não desfaz; o aviso só aparece se a porta rejeitar; `docs/persistencia-de-tema.md` §5 não rejeita nem trata erro | a regra "rejeite para o painel avisar" não está no exemplo copiável | melhoria |
| Sem `activeThemeId` no retorno do `onLoad`, o painel perde o nome do ativo | `SaveThemeModal.tsx:45` cai em "Meu Novo Tema"; editar e salvar cria outro | consequência no painel; fallback: `resolvedThemeId` | melhoria |
| `SARAK_REFERENCE_THEMES` mudou de sentido mantendo o nome (`reference.ts:31`, só o escuro) | ERP `themes.ts:28-31` faz `find(light) ?? [0]`; o "claro" nasce escuro, sem erro de tipo | mudança de semântica sob o mesmo nome | melhoria (alta) |
| `SarakInput` com `error` passou a `role="alert"` (7.0.0) sem nota em `docs/migracoes.md` | quebrou `Templates.test.tsx` do ERP; 0 ocorrências na nota | nota de migração é da lib | melhoria |
| `SarakFlex.gap?: string` (`Layouts/SarakFlex.tsx:15`) | `gap="md"` compila e é ignorado (aviso no console) | o tipo deveria ser a união dos valores válidos | melhoria |
| Textos desatualizados: `docs/persistencia-de-tema.md:109` e `GUIA-FRONTEND.md:558` ("23 temas"); `GUIA-FRONTEND.md:551` (modelo host) | leitura direta | documentação do kit | melhoria |
| `dist/BUILD_INFO.json` com `baseCommit` de um commit anterior | `package.json` ainda 7.0.0 | o `dist/` da tag precisa ser o do commit final | essencial na liberação |
| `Main/ThemeCustomizationTab.tsx:156` passa `customThemes={[]}` ao `PreviewCanvas` | prop vestigial | código da lib | melhoria (baixa) |
| A confirmar: depois de salvar, o tema vira o ativo? o "Aplicar" seguinte grava o design novo com `activeThemeId` antigo? o que `resolvedThemeId` faz quando o ativo é apagado? | não medido | comportamento do Provider | a confirmar |

## Tabela 2 — Lições da importação

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Ainda vale? |
|---|---|---|---|
| `pnpm install` travava varrendo a pasta-fonte da lib; o ERP passou a usar `.tgz` (commit `eec48ab`, 2026-07-24) | `file:` para a pasta-fonte inteira em vez do pacote | GUIA §1.1 e §2.6: com pnpm, `file:` só com tarball de `npm pack` ou `github:#tag` | parcial (`13` §2.1 recomenda `github:`, o GUIA não) |
| `tools/prepare-ui-library.mjs` (221 linhas), estágio no `Dockerfile`, passos no `run.cmd` para extrair uma tag por `git archive` (commit `051f495`) | `file:` segue a árvore de trabalho, não uma versão; Docker/CI precisam de versão fixa | GUIA §2.3/§2.4: receita "Docker e CI" com `github:…#vX.Y.Z` | sim |
| `node_modules` voltou à 7.0.0 sozinho, `tsc` vermelho, lock reescrito a cada `pnpm install` | o link reflete o HEAD do dia; o major saiu antes da migração; `sarak-ui check` cala no modo `file:` por desenho (`13` §5.1) | `sarak-ui check`: avisar quando o major instalado muda, ou citar `migracoes.md` | sim |
| `packages/ui-kit/sarak-ui/VERSION` parado em 3.0.0 com a lib em 6.3.0/7.0.0 | o kit é cópia; adotado à mão em monorepo sem `init`; `refresh` nunca rodou | GUIA §2.8 e START-HERE: sem `init`, criar o script `refresh`; o `check` comparar a cópia `sarak-ui/` do consumidor com a instalada | parcial |
| Worker do PDF próprio no ERP (commit `4469b1f`, `DEMANDAS.md` 8) | o `SarakPDFViewer` resolve o worker a partir do `dist/`; com `file:` fora da raiz o Vite recusa servir | documentação do componente: `workerSrc` obrigatório quando a lib está fora do projeto | a reconferir |
| Tipos derivados à mão (TS2459) | tipos públicos fora do barril | gate de tipos públicos | resolvido (`public-types:check`) |
| Injeção do tema no HTML (~220 linhas, commit `03446ea`) | o tema persistido chegava depois do primeiro paint | `persistencia-de-tema.md` §6 | parcial: documentado, sem helper oficial |
| `onSave` disparando no boot (achado 86 do ERP) | o Provider gravava ao montar | doc de `persistence.onSave` | resolvido na 8.0.0 |
| Conteúdo cobrindo a topbar (achado 85 do ERP): `#root` sem altura | contrato de altura do `SarakAppChrome` fora do guia | GUIA §1.2 e §6.8 | provavelmente resolvido (7.0.0) |
| `Templates.test.tsx` vermelho na 7.0.0 | `role="alert"` sem nota | `docs/migracoes.md` | sim, como lição de processo |
| O ERP recusou copiar GUIA e skill e escreveu três regras de gate próprias (`DEMANDAS.md` 1 a 7) | o kit mandava copiar e não entregava verificação por máquina | START-HERE | parcial: falta a verificação por máquina para o consumidor |
| Mais de 100 nomes renomeados num MAJOR (7.0.0); o ERP ficou na 6.3.0 | migração manual sem codemod | GUIA §2.8: `sarak-ui migrate <major>` | sim |
| Com pnpm 11, todo `pnpm run` instala e reescreve o lock por causa do `file:` | o `file:` é re-resolvido a cada verificação | GUIA §2.6 | sim, enquanto houver `file:` |
