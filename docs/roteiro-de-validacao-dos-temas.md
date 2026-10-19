# Roteiro de validação visual dos temas

Use este roteiro na revisão de uma release candidate que altera temas, tokens ou a vitrine. A coleção e os ids vêm do catálogo gerado no checkout (`SARAK_THEME_CATALOG`); não mantenha uma lista paralela de temas neste roteiro.

## Cobertura

Para cada preset do catálogo, examine as quatro combinações produzidas por `npm run themes:showcase`:

| Modo efetivo | Desktop | Celular |
| --- | --- | --- |
| Nativo do tema | validar | validar |
| Oposto ao nativo | validar | validar |

Na primeira passada, use `npm run build` antes da vitrine. Confira que as fontes do pacote são servidas de `dist/fonts` e que a vitrine não fixa `type` em `SarakChartEngine`, para que `chartType` do tema seja aplicado.

## Inspeção de cada captura

1. **Identidade e tipografia:** compare cor, família, escala, peso, quebra dos títulos e largura do conteúdo. Confirme que a família efetiva carregou; fallback silencioso não conta como aprovação.
2. **Fundo e superfícies:** veja gradiente, textura, ruído, vinheta e imagem global. Confira que o recorte da imagem mantém a composição e que textura fixa continua legível nos dois modos. Texturas de cartão devem aparecer com a opacidade escolhida.
3. **Cartões e material:** avalie raio, contorno, sombra, vidro, brilho, hover e conteúdo do cabeçalho/rodapé. Observe as bordas sobre o corpo da página, inclusive no modo oposto.
4. **Ações e formulários:** confira botão primário e secundário, foco, hover, estados desabilitados, campos, seleções e alternadores. Verifique contraste de texto e ícone.
5. **Navegação e cromo:** teste item ativo, ícone, busca, identidade, widgets e preferências visíveis. O estilo de navegação é configuração funcional do consumidor; a variação visual dos temas não deve depender dele.
6. **Dados:** observe séries, eixos, grade, legenda e dica do gráfico. A paleta emitida pode derivar as séries seguintes da cor âncora; não espere que replique literalmente as cores de status.
7. **Estado e leitura:** percorra badges de sucesso, aviso, erro e informação, além de estados vazios, texto secundário e desabilitado.
8. **Celular:** confirme que não há rolagem horizontal inesperada, que títulos e tabelas cabem, que os controles são tocáveis e que modal, navegação e conteúdo respeitam a altura da tela.
9. **Movimento e foco:** teste hover, transições, indicador de foco e modo de movimento reduzido. A animação do fundo não deve aumentar a área rolável.

Compare o mesmo tema entre os modos: a cor e as superfícies podem mudar, mas família tipográfica, geometria e direção visual devem permanecer reconhecíveis. Textura e `cardTextureType` são eixos estáticos; confirme que a contraparte muda somente tokens que carregam modo.

## Registro de achados para a release candidate

Abra um registro para cada defeito reproduzível. Anexe a captura da vitrine e, quando necessário, a captura real do navegador com as fontes carregadas.

```text
Release candidate:
Tema (id do catálogo):
Modo efetivo / modo nativo:
Dispositivo e viewport:
Rota ou superfície observada:
Tokens envolvidos (se conhecidos):
Passos para reproduzir:
Esperado:
Observado:
Severidade: bloqueia release | importante | cosmético
Evidência (caminho da captura):
Resultado: aprovado | reprovado | não aplicável
```

No resumo da RC, informe quantos temas foram examinados, se todas as quatro combinações de cada preset foram cobertas, os defeitos bloqueadores e os itens que ficaram sem evidência. Não marque como aprovada uma combinação que não foi inspecionada.
