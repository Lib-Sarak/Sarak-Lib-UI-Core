---
tipo: "spec"
titulo: "Component Registry e Resolver (type → Componente)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados / Fundação)"
status: "🔴 A Implementar"
prioridade: "Crítica"
tags: ["spec", "logic", "registry", "resolver"]
relacionados: ["20-manifest-schema-e-gramatica-no", "27-error-boundaries-e-fallbacks", "30-contrato-importador-renderer"]
---

# 1. Visão Geral
Define o **mapa de resolução** entre o `type` de um nó do manifesto (ex.: `"SarakCard"`) e o componente React real. É a ponte entre a camada lógica (que lê o JSON) e a camada visual (os átomos das Specs 10–15). Sem um Registry explícito, o Renderer não saberia materializar nós, e tipos desconhecidos derrubariam a árvore.

# 2. Regras de Negócio
- **Regra 1: Registry Tipado e Fechado por Padrão:** Existe um `Record<ComponentType, React.ComponentType<...>>` cobrindo os átomos/templates oficiais da Sarak. `ComponentType` é uma **união de string-literais** (derivável dos componentes exportados), garantindo autocomplete e barrando `type` inválido em tempo de tipo — espelhando a filosofia "a Interface dita a Realidade".
- **Regra 2: Resolução com Fallback Seguro:** `type` desconhecido **não** lança fatal: resolve para um componente de Fallback visual e registra o `path`/`id` do nó no console (integra Spec 27). A árvore restante permanece intacta.
- **Regra 3: Passagem Restrita de Props:** Apenas `props` (e valores interpolados já resolvidos) chegam ao componente; diretivas (Spec 20) nunca são repassadas.
- **Regra 4: Registro de Customizados pelo Importador:** O consumidor pode registrar componentes próprios via API tipada (`registerComponent(type, Component)`), sem fork da biblioteca, respeitando o contrato de props.
- **Regra 5: Carregamento Tardio (Lazy) dos Pesados:** Componentes caros (`SarakDataGrid`, `SarakPDFViewer`, charts) são resolvidos via `React.lazy`/dynamic import para não inflar o bundle base.

# 3. Critérios de Aceite
- [ ] Um nó `type: "SarakCard"` resolve para o componente correto e recebe apenas suas `props`.
- [ ] Um nó `type: "Inexistente"` renderiza o Fallback e loga o nó culpado, sem quebrar a página.
- [ ] Um componente customizado registrado pelo importador é resolvido como os nativos.
- [ ] O `ComponentType` rejeita, em tempo de compilação, um `type` fora do conjunto conhecido.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** resolver tipos conhecidos para os componentes corretos.
- [ ] **Deve** devolver o Fallback (não lançar) para tipo desconhecido, registrando o identificador do nó.
- [ ] **Deve** incorporar um componente registrado dinamicamente pelo importador.

## Testes de Contrato (API)
- [ ] **Deve** exportar `registerComponent` e o tipo `ComponentType` no `src/index.ts`.

## Testes E2E (Integração)
- [ ] Renderizar um manifesto que mistura átomos nativos e um componente customizado registrado, confirmando coexistência e isolamento de falha em tipo inválido.
