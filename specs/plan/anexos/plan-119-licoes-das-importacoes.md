# Lote 0 — lições das importações anteriores

Levantamento feito apenas pelas fontes desta lib indicadas pela plan: migrações, specs, kit, ADRs e histórico Git desta lib. Nenhum repositório de importador foi aberto. “Estado atual” descreve o HEAD observado pelas fontes carregadas; não presume publicação como 8.0.0.

## Instalação, atualização e resolução da dependência

### 1. Instalar fora do projeto quando falta package.json

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| Sem package.json no diretório de trabalho, o npm instalou 289 pacotes no ancestral (specs/specs/13-instalacao-e-atualizacao.md:44-58; sarak-ui/GUIA-FRONTEND.md:89-97). | O npm procurou o projeto acima do diretório corrente. | Antes da instalação, no pré-requisito do guia e no comando de instalação. | Resolvido como instrução: GUIA e spec mandam inicializar o projeto antes de instalar. | Manter o alerta na skill ui-integra-consumidor e no GUIA. |

### 2. Inicialização da CLI sem TTY

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O relatório da rodada 1 registra que a ajuda/inicialização sem TTY terminou com exit 0 sem criar arquivos (commit 7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223). | O fluxo interativo foi chamado sem terminal e o resultado sem arquivos era ambíguo. | Antes de sarak-ui init, explicar quando usar terminal interativo e como reconhecer que nada foi gerado. | A spec 13:163-175 documenta a proteção de não-TTY; a skill ui-integra-consumidor:258-266 cobre o caso. | Manter instrução na skill e diagnóstico na spec 13; aviso CLI somente se o check atual ainda não apontar o caso. |

### 3. Instalar dependências depois do init

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| Em outra tentativa, npm run dev não encontrou dependências porque o segundo npm install impresso pela CLI foi pulado (commit 7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223). | A sequência gerada não foi concluída pelo operador. | Mostrar init → npm install → iniciar o app como um único fluxo explícito. | A skill ui-integra-consumidor:267-278 instrui o npm install posterior. O GUIA ainda deve exibir a sequência completa em um só lugar. | Alinhar GUIA e skill. |

### 4. Usar gerenciador diferente do lockfile

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| Uma instalação real falhou quando o comando do kit usou gerenciador diferente do lockfile (specs/specs/13-instalacao-e-atualizacao.md:342-371). | Comandos fixos de npm não respeitavam o gerenciador escolhido pelo projeto. | No passo de instalação e antes de copiar comandos de atualização. | Resolvido no fluxo documentado: GUIA:224-242 instrui identificar e usar o gerenciador do projeto; spec 13 descreve a validação. | Preservar na GUIA e na skill. |

### 5. Monorepo com manifesto e lockfile em níveis distintos

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O comando de verificação falhava em monorepo porque procurava package.json e lockfile no mesmo diretório (specs/specs/13-instalacao-e-atualizacao.md:310-321). | A resolução dos arquivos assumia projeto simples. | Na seção de monorepo, explicar como a CLI localiza o lockfile. | Resolvido na CLI documentada: a busca do lockfile sobe a árvore; GUIA:263-266. | Manter exemplo/aviso no GUIA e na spec 13. |

### 6. Dependência file: desatualizada e cache confundindo a comparação

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| Uma cópia local file: do consumidor ficou velha; a primeira comparação não revelou isso porque caminhos com hardlinks pareciam iguais (specs/specs/13-instalacao-e-atualizacao.md:268-307). | Link vivo e cópia instalada são modos diferentes; comparar apenas identidade/metadata do arquivo dava sinal enganoso. | No fluxo de atualização local, distinguir link de cópia e mostrar como conferir caminho e conteúdo instalado. | Resolvido no diagnóstico descrito na spec 13 e no GUIA:263-266: a CLI identifica link vivo versus cópia velha. | Manter no GUIA e na skill ui-integra-consumidor. |

### 7. Atualização sem limpar as três camadas de cache na ordem certa

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| Após atualizar a lib, versões antigas podiam continuar visíveis pelo store do gerenciador, cache do Vite ou cache do navegador (specs/specs/13-instalacao-e-atualizacao.md:393-444). | São caches independentes; limpar só um não garante que o app carregue o pacote atualizado. | No procedimento de atualização, com sequência para dependência, servidor de desenvolvimento e navegador. | Spec 13 e skill ui-integra-consumidor:374-424 têm diagnóstico e ordem; GUIA:270-301 explica atualização, mas não reúne o procedimento detalhado. | Consolidar a sequência no GUIA §2.8 e manter o diagnóstico na skill. |

### 8. Semver por tag Git descrito incorretamente como fora de escopo

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| A dependência pode usar #semver: sobre tags Git (docs/migracoes.md:2656-2683), mas a skill diz que tags/semver estão fora do escopo (ui-integra-consumidor:314-325). | O texto da skill ficou atrás do mecanismo e das instruções atuais. | Na escolha de versão e atualização, explicar Git por SHA, faixa por tag quando configurada e o caminho local file:. | A capacidade está em migrações e a GUIA alerta sobre Git; a skill contém orientação contraditória ainda válida. | Corrigir skill e alinhar GUIA; sem aviso CLI sem necessidade medida. |

## Layout responsivo e superfície da lib

### 9. Grid estreito e col-12 sem controle explícito de span

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| No ERP, layout com col-12 produziu colunas/truncamento inadequados em contêiner estreito; o grid passou a usar comportamento responsivo padrão (docs/migracoes.md:1973-2005, 2026-2030). | O layout anterior dependia de colunas fixas; o uso em contêiner pequeno exigiu adaptação. | No mapa do grid, mostrar o padrão responsivo e as opções de controle fino. | O padrão foi corrigido. Continua aberto o contrato de span: specs/specs/15-divida-conhecida.md:91, achado 42, registra que não há prop pública nem SarakGridItem. | GUIA para o padrão; achado 42 ao fim deste anexo para decisão do revisor. |

### 10. Container queries sem ancestral container

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| Componentes usados no ERP fora de SarakShell não respondiam à largura disponível (docs/migracoes.md:2174-2221). | Container query precisa de ancestral com container-type; sem ele, a regra não casa. | Ao explicar composição fora do shell, indicar quais componentes plantam o container e quando envolver o conteúdo. | Resolvido na lib: os componentes citados receberam @container próprio; migração explica limite e solução. | Incluir no mapa de responsividade do GUIA. |

### 11. Tema inicial escondia o tema contraparte

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| Um consumidor que usava initialTheme não encontrava a contraparte pelo activeThemeId cru e caía em fallback (specs/specs/09-temas-e-presets.md:237-251). | A prop inicial é uma semente; o id resolvido pode vir de outro caminho. | No exemplo de composição, usar resolvedThemeId e explicar initialTheme versus seleção controlada. | Resolvido/documentado em spec 09; GUIA já ensina a derivar a contraparte (sarak-ui/GUIA-FRONTEND.md:448-470, 541-549). | Preservar na skill ui-criar-tema e GUIA. |

### 12. Persistência de design sem id do tema aplicado

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O importador salvava o design sem saber qual tema estava ativo (docs/migracoes.md:2136-2163). | persistence.onSave recebia só o design, sem activeThemeId. | No exemplo de persistência, mostrar o segundo argumento opcional. | Resolvido: migração documenta o parâmetro e a skill ui-integra-consumidor:109-117 o usa; GUIA:553-556 não mostra esse argumento. | Atualizar exemplo do GUIA e manter o contrato na skill/spec 09. |

### 13. Temas vazando entre tenants

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| Um consumidor multi-tenant compartilhava dados de tema entre tenants (docs/migracoes.md:2310-2363). | A chave de persistência era comum na mesma origem sem escopo por tenant. | Na persistência multi-tenant, exigir chaveamento por tenant e explicar estratégia remota/híbrida. | Resolvido na lib: tenantId compõe a chave efetiva e aciona recarga; migração e skill ui-integra-consumidor:112-117 documentam. GUIA:553-561 não cobre isolamento. | Acrescentar exemplo ao GUIA; manter na skill e spec 09. |

### 14. Preferências de navegação misturadas com tema global

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| No consumidor, uma configuração de navegação do servidor era reescrita por preferência do usuário (docs/migracoes.md:1543-1584). | Preferências por usuário e tema compartilhado eram persistidos no mesmo canal. | No mapa de persistência, separar preferência pessoal de tema do produto. | Resolvido: existe porta options.preferences; GUIA §6.8 (sarak-ui/GUIA-FRONTEND.md:875-894) e skill ui-integra-consumidor:141-146 já separam os dois. | Manter em GUIA e skill. |

### 15. Personalização/exportação confundida com salvar tema runtime

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O relato histórico diz que “Save as New” foi descoberto pelo uso da UI (commit 7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223); hoje o kit diz que o painel apenas exporta JSON (GUIA:535-552) e a skill que salvar equivale a exportar (ui-integra-consumidor:159-161). | O kit não distingue exportar preset de persistir tema runtime do importador. | No mapa de capacidades, explicar customThemes, options.theme.onSave e que o salvar depende de onSave. | A lib suporta save/delete runtime conforme ADR 011 e spec 09:470-492; sem onSave a ação some, conforme spec 06:318-320. O kit está contraditório/desatualizado. | Corrigir skill e GUIA no lote final, após medição do lote 1. |

### 16. Apagar tema customizado precisava de operação simétrica

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| Um usuário do login ocultou manualmente tema removido; o fluxo precisava informar a camada que persiste a coleção (ADR 017:16-42; docs/migracoes.md:959-969). | A lista persistida pertence ao consumidor; a lib precisava de porta opcional de remoção. | No exemplo de persistência, mostrar useSarakUI().deleteTheme(id) e options.theme.onDelete. | Resolvido na lib, ADR e migração; a skill cobre a porta, mas o GUIA ainda não a apresenta. | Acrescentar ao mapa runtime do GUIA; preservar na skill ui-integra-consumidor. |

### 17. Reset apagava dados alheios da origem

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O Factory Hard Reset chamava localStorage.clear() e removia chaves não pertencentes à lib (docs/migracoes.md:2582-2601). | O reset operava em toda a origem em vez de limitar-se às chaves da lib. | Nas notas de atualização, chamar atenção para o comportamento corrigido e orientar leitura das migrações ao atualizar. | Resolvido segundo a migração: o reset agora apaga apenas chaves da lib. | Manter nota em migrações; referenciá-la no procedimento de upgrade. |

### 18. Identidade padrão da lib substituía marca do consumidor

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O Provider substituía título/cromo do importador por “Sarak OS” (docs/migracoes.md:2808-2847). | Branding padrão preenchido pela lib era aplicado como identidade configurada pelo consumidor. | No mapa do Provider, distinguir defaults neutros de identidade explícita do produto. | Resolvido segundo migração: identidade da lib não aparece quando o consumidor não a configurou. | GUIA, mapa “o que a lib já faz”. |

### 19. Card genérico expunha campos do domínio LLM no ERP

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| Um card usado no ERP recebia campos de domínio LLM sem o consumidor pedir (docs/migracoes.md:2851-2865). | O mapeamento padrão carregava semântica específica de catálogo de modelos. | No mapa do componente, mostrar pares genéricos e configuração do consumidor. | Resolvido segundo migração: o mapping deixou de impor esses campos. | GUIA, mapa de componentes e exemplos neutros. |

### 20. Tipos públicos exigiam contornos estruturais no consumidor

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O consumidor precisava obter tipos por ComponentProps e Parameters para compor Provider e portas (docs/migracoes.md:2085-2132). | Tipos úteis não estavam expostos diretamente. | No mapa da API, apontar tipos públicos exportados e evitar imports internos. | Resolvido segundo migração: tipos foram expostos pelo barril público. | GUIA, mapa da superfície pública. |

### 21. GUIA ainda orienta um modo de host removido

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O GUIA orienta usar módulo nativo “em host model” (sarak-ui/GUIA-FRONTEND.md:550-552), enquanto ADR 018:16-48 registra a remoção do modo host e da exigência de registro de módulos. | Instrução histórica não acompanhou a simplificação do contrato. | No trecho de integração e Provider, retirar o caminho obsoleto e ensinar o contrato atual de rotas do consumidor. | Ainda vale: GUIA contradiz ADR 018. | Corrigir o GUIA no lote final. |

## Achados históricos que precisam de revalidação

### 22. Rótulo de ação não correspondia ao esperado

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O relatório da rodada 2 diz que SarakActionCard.label não produziu o texto esperado (“Ver contrato”); apareceu “EXECUTAR” (commit 74c7293d3c28358dc0e33a8f80f823f47e13f268). | Causa não comprovada pelas fontes carregadas; o contrato pode ter mudado desde o relato. | Se revalidado, no mapa da API e exemplo do componente. | Não confirmado no estado atual; não registrar como defeito sem reproduzir. | Revalidar pelo consumidor/revisor antes de alterar GUIA ou abrir linha no registro. |

### 23. Etapa histórica de commit de categoria

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O relatório da rodada 2 registra uma etapa de commit por categoria no painel (commit 74c7293d3c28358dc0e33a8f80f823f47e13f268). | Relato de fluxo antigo; não prova o comportamento atual. | Nenhum aviso até revalidar. | Spec 06:318-320 descreve a ação de salvar e a condição onSave; o fluxo antigo não foi confirmado como vigente. | Não transportar ao kit; revalidar somente se o lote 1 encontrar o fluxo. |

### 24. Os quatro gestos de gestão de temas não foram medidos ponta a ponta

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| A plan registra que não foi medido se o painel permite salvar o aplicado como novo, editar tema do importador no mesmo id, duplicar embarcado/customizado e criar do zero; apagar também precisa ser exercitado. | Documentação de portas não prova o fluxo completo de interface e persistência. | No mapa de capacidades, prometer apenas o que o painel demonstra, condicionado a onSave/onDelete. | Em aberto para o lote 1; este lote não executa navegador nem altera código. | Medir conforme §5, depois consolidar skill/GUIA no lote final. |

## Outros achados do relatório histórico sem revalidação no estado atual

### 25. Validação do antigo formulário declarativo não bloqueava envio vazio

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O relatório da rodada 1 registra que o formulário antigo aceitava envio vazio apesar da validação declarada (commit 7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223). | O mecanismo de manifesto/formulário daquele fluxo não aplicava a regra de validação ao envio. | Nenhum aviso atual até confirmar que o mesmo mecanismo ainda faz parte do kit. | Relato ligado ao motor declarativo antigo; as fontes carregadas não demonstram que esse fluxo exista hoje. | Não transportar como regra do kit; só reabrir se uma importação atual reproduzir o comportamento. |

### 26. Aviso de id/UUID ausente no fluxo antigo

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O relatório da rodada 1 registra ausência de aviso para id/UUID no fluxo de configuração antigo (commit 7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223). | O contrato do formulário antigo não validava nem explicava esse identificador. | Nenhum até saber se o contrato atual ainda exige esse campo. | Não confirmado no fluxo do kit atual. | Revalidar apenas se o mesmo formulário/manifesto permanecer na integração; caso contrário, descartar como legado. |

### 27. Aviso de campo de cor no navegador no fluxo antigo

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O relatório da rodada 1 registra um aviso relacionado ao campo de cor do navegador (commit 7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223). | O relato não discrimina o comportamento exato nem a causa técnica. | Nenhum sem reprodutor e descrição mais precisa. | Não confirmado pelas fontes atuais; preservar como anotação histórica, não como defeito. | Revalidar em nova importação somente se o campo continuar no fluxo. |

### 28. Bundle medido em 3,9 MB

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O relatório da rodada 1 anotou bundle de 3,9 MB (commit 7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223). | O relatório não atribui causa nem informa uma medição atual comparável. | No mapa de build somente se uma medição atual confirmar impacto relevante ao consumidor. | Histórico sem re-medição no lote 0; não é evidência de tamanho atual. | Medir no lote do kit antes de decidir entre orientação, sarak-ui check ou registro vivo. |

### 29. Empacotamento de arquivos fonte

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O relatório da rodada 1 apontou arquivos fonte expostos no pacote publicado (commit 7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223). | O pacote incluía conteúdo além do necessário ao consumidor, segundo o relato histórico. | No procedimento de instalação e no mapa do que entra no pacote, se o tarball atual confirmar a exposição. | docs/migracoes.md:2409 declara a lista publicada atual como dist, bin, docs e sarak-ui, mas o lote 0 não inspecionou o tarball para confirmar. | Conferir empacotamento no lote final; não classificar como resolvido nem aberto sem essa prova. |
## Achado da lib candidato ao registro vivo da §5.1

### 30. Não há contrato público para span fino do grid de 12 colunas

| O que aconteceu | Causa | Onde o kit deveria ter avisado | Estado hoje | Destino proposto |
|---|---|---|---|---|
| O consumidor não tem SarakGridItem nem prop pública span; usa classe própria col-span-* sem contrato publicado (specs/specs/15-divida-conhecida.md:91, achado 42). | A superfície pública documenta o template, mas não declara mecanismo público de span. | No mapa do grid, declarar alcance do contrato e workaround hoje suportado, se o dono decidir mantê-lo. | O achado permanece sem decisão na dívida conhecida; deve ser levado ao revisor, sem editar §5.1 neste lote. | Linha candidata nova no registro §5.1, sujeita à decisão do revisor: publicar span ou declarar explicitamente a classe do consumidor. |
