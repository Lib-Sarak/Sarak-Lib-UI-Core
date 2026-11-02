---
tipo: "plan"
titulo: "Adicionar painel arrastável, mapa, assinatura, tour, carrossel e exportação Excel"
objetivo: "Fazer a lib oferecer painel de widgets arrastáveis, mapa, campo de assinatura, tour guiado, carrossel e exportação Excel, carregados sob demanda e sem peso no boot do consumidor"
dominio: "Componentes / Recursos avançados"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "rc.5", "dashboard", "mapa", "assinatura"]
relacionados: ["[[anexos/rc5-contrato]]", "[[10-seguranca-e-acessibilidade]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

A lib cobre também os recursos que os sistemas ainda não pediram, mas costumam pedir, sem custar nada a quem não os usa.

# 2. Contexto

Decisão do dono em 2026-11-02: estes itens entram, mesmo sem uso nos sistemas varridos, para antecipar demanda.

**Três restrições vêm das regras da lib:**
- **Peso:** o boot não cresce. Cada peça fica atrás de carga sob demanda, com a dependência em `peerDependencies` opcional, como PDF e gráficos, e com `SarakOptionalPeerFallback` quando faltar.
- **A lib não faz rede** ([[10-seguranca-e-acessibilidade]] §3.2), e o mapa precisa de blocos de mapa. Não há provedor padrão: o consumidor passa `tileUrl`, e o componente entra na allowlist do gate de rede da `plan-151`, com motivo.
- **Assinatura não tem validade jurídica por si:** a peça devolve imagem e traços, e quem registra data, autor e prova é o consumidor. A documentação diz isso.

# 3. Escopo

## 3.1 Dentro
- Componentes novos em `src/components/atomic/`, com testes e lazy no barril.
- `package.json`: peers opcionais.
- `src/core/i18n/`, `docs/migracoes.md`, `browser-tests/`, `gates/allowlists/`.

## 3.2 Fora
- Dependência obrigatória nova. Provedor de mapa embutido ou chave de API. Geocodificação.
- Edição inline e visões salvas: `plan-152`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | superfície |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | rede, teclado, conteúdo externo |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6.1 | contêiner, toque |
| Código | `src/components/atomic/DataDisplay/SarakDataTable/` | exportação |
| **Skill** | `ui-novo-componente` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | componente · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree. Meça `npm run boot:measure`, e declare no resumo cada peer proposto e o motivo da escolha. Prefira o que a lib já declara como peer (`react-grid-layout`, `@dnd-kit`). Se precisar de peer novo, pare e reporte antes de instalar.
2. **`SarakDashboardGrid`:** widgets arrastáveis e redimensionáveis; `layout` + `onLayoutChange`, com a persistência no consumidor. Teclado para mover e redimensionar. Modo só leitura. Colapsa a uma coluna em contêiner estreito.
3. **`SarakMap`:** `tileUrl`, `center`, `zoom`, `markers`, `onMarkerClick`, atribuição obrigatória, sem rede antes de receber `tileUrl`. Sem peer ou sem URL, mostra o fallback.
4. **`SarakSignaturePad`:** canvas próprio, sem peer, com mouse, toque e caneta; limpar, desfazer; devolve PNG e traços. Tem alternativa acessível: digitar o nome.
5. **`SarakTour`:** passos com alvo, destaque, próximo, voltar, pular; foco preso, Esc e posição por contêiner. Reaproveita `SarakSpotlight` e a pilha de camadas da `plan-146`. Quem lembra que o usuário já viu é o consumidor.
6. **`SarakCarousel`:** sem autoplay por padrão, setas, pontos, gesto, teclado, e respeita movimento reduzido.
7. **Exportação Excel:** `exportXlsx` ao lado da CSV, com peer opcional carregado só no clique; respeita formato, moeda e colunas visíveis; bloqueia fórmula vinda de dado (célula iniciada com `=`, `+`, `-`, `@`).
8. Spec de navegador por peça, nos dois modos e em contêiner estreito. `npm run boot:measure` de novo. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Boot do consumidor sem crescimento — `boot:measure`.
- [ ] Peer ausente mostra fallback — teste por peça.
- [ ] Mapa sem nenhuma requisição antes de `tileUrl` — navegador.
- [ ] Painel arrastável e tour funcionam por teclado — navegador.
- [ ] Assinatura por mouse e toque, com alternativa acessível — navegador.
- [ ] Excel sem injeção de fórmula — teste.
- [ ] Prévia em HTML para o dono.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo. O `SarakMap` entra na allowlist do gate de rede.

- Filtro dos arquivos novos, `boot:measure` e `check-audit-baseline.mjs --with-tsc`.
- A prévia aberta; o veredito fecha com a aprovação do dono.

# 8. Destino da síntese

**Destino:** `specs/specs/10-seguranca-e-acessibilidade.md` §3.2: o mapa é a exceção de rede, sempre por URL do consumidor.

---

# 9. Resumo da execução

---

# 10. Veredito
