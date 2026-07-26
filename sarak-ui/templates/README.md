# Templates — esqueletos copiáveis

Código **genérico e estável** para você copiar, renomear e adaptar. Eles mostram a **forma**;
a lista do que existe está sempre no `../catalog.json` (regra nº 1).

| Arquivo | Copie para | Serve à topologia |
| --- | --- | --- |
| `main.tsx` | `src/main.tsx` do seu app | todas (1–4) |
| `ui-kit/themes.ts` | `packages/ui-kit/themes.ts` (ou equivalente) | 2, 3, 4 |
| `ui-kit/nav.ts` | `packages/ui-kit/nav.ts` | 2, 3, 4 |
| `ui-kit/index.ts` | `packages/ui-kit/index.ts` | 2, 3, 4 |
| `tela-exemplo.tsx` | `src/telas/MinhaTela.tsx` | todas |
| `componente-proprio.tsx` | `src/componentes/MeuPainel.tsx` | todas |

**No monolito (topologia 1)** você não precisa do `ui-kit/`: ponha `themes.ts` e `nav.ts` direto
em `src/` — a forma é a mesma, muda só onde o arquivo mora.

**O que estes arquivos deliberadamente NÃO fazem:** listar componentes, tokens ou ícones. Isso
envelheceria. Eles usam poucos nomes, estáveis, e apontam para o catálogo — confira lá antes de
trocar qualquer um.
