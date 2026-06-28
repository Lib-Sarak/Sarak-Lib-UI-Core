---
tipo: "spec"
titulo: "Revisão e Gestão de Brand (Logo, Cores e Brandbook)"
dominio: "Design Engine / Branding"
status: "🔴 Planejamento Inicial"
prioridade: "Alta"
tags: ["spec", "branding", "upload", "colors", "logo"]
relacionados: ["01-painel-customizacao-temas", "12-expansao-midias-atmosfera"]
---

# 1. Visão Geral e Objetivo

Um dos pilares de um Design Engine voltado para produtos B2B (ou white-label) é a capacidade de absorver a identidade visual do cliente de forma nativa. 

Esta spec tem como objetivo definir o fluxo arquitetural para que o usuário consiga efetivamente realizar o upload e a aplicação do **Logo da Empresa**, de sua **Paleta de Cores Oficial** e das diretrizes do seu **Brandbook** diretamente no Sarak UI Core.

# 2. Requisitos de Negócio (O Fluxo do Usuário)

A interface de Customização do Design Engine deverá oferecer uma seção dedicada a "Brand & Identidade". Os três pilares de interação são:

## 2.1. Upload de Logo
O usuário deve ser capaz de fazer upload da logomarca da sua empresa.
- **Variantes Light/Dark:** O sistema deve suportar (ou gerar inteligentemente) uma versão da logo para fundos claros e outra para fundos escuros, se necessário.
- **Mapeamento de Token:** A URL final da imagem deverá ser atrelada a uma variável estrutural do payload, como `globalBrandLogoUrl`.
- **Hospedagem:** O upload fará uso da mesma infraestrutura de *Object Storage* definida na Spec 12 (Expansão de Mídias).

## 2.2. Injeção da Paleta de Cores
O usuário deve conseguir inserir sua paleta institucional.
- **Input Manual (Hex):** Definição direta das cores Primária, Secundária e de Superfície.
- **Mapeamento Direto:** Esses valores devem sobrescrever instantaneamente os tokens do motor de cores (`colorPrimary`, `colorSecondary`), propagando o brand para botões, links e estados ativos de toda a biblioteca.
- **Geração de Escala Automática (Opcional/Avançado):** Se o usuário fornecer apenas uma "Cor Primária", o Design Engine deverá calcular automaticamente os tons mais claros e mais escuros (tons 50 a 900) caso o motor de temas demande.

## 2.3. Integração de Brandbook e Tipografia
O usuário deve ter uma maneira de alinhar o sistema às regras do seu Brandbook.
- **Seleção Tipográfica:** Definição da fonte primária (ex: `Inter`, `Roboto`) que mapeará para a propriedade `globalFontFamily`.
- **Upload de Arquivo (IA/LLM Context):** Permitir o upload do Brandbook em PDF. No futuro, um Agente LLM de Design (relacionado à Spec 07) poderá ler este PDF e extrair autonomamente as cores exatas, os espaçamentos recomendados e a tipografia para preencher o Payload JSON sem esforço manual.

# 3. Desafio Arquitetural (Design as Data)

Seguindo a *Regra Zero* da Sarak UI Core (Design as Data), o módulo de "Upload de Brand" **não** deve injetar tags `<style>` avulsas ou forçar imagens na tela.

Toda a interação do usuário nesta tela deve resultar estritamente na mutação do **Theme Payload (JSON)**. 
- O arquivo de logo virará uma URL string no payload.
- A paleta virará strings de HEX no payload.
- A tipografia virará o nome da fonte no payload.

A engine do SarakUIProvider cuidará de distribuir essa identidade visual para os Átomos de forma reativa e padronizada.

# 4. Critérios de Aceite para Futura Implementação
- [ ] Existência de formulário/interface dedicada para upload de Logo e imputação de Cores Primárias.
- [ ] O logo upado é salvo no Storage (Bucket) e sua URL é injetada no rascunho (Draft) do Tema atual.
- [ ] A alteração de uma Cor Primária no módulo de Brand atualiza instantaneamente as variáveis CSS `--sx-color-primary` no Gêmeo Digital.
- [ ] Preparação estrutural (campo de arquivo ou texto) para upload de regras do Brandbook.
