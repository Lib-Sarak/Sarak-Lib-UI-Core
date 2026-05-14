# Implementação e Aplicação de Temas: Sarak Design Engine

Este documento explica como o Sarak UI Core processa os dados do Design Engine e os transforma em uma interface visual ativa.

---

## 1. O Objeto de Estado do Design

O estado do design é um objeto JSON plano onde as chaves são os `id` dos tokens e os valores são as escolhas do usuário ou presets.

**Exemplo de Estado:**
```json
{
  "h1Size": 48,
  "colorPrimary": "#00f2ff",
  "cardRadius": 16,
  "motionEaseMain": "cubic-bezier(0.4, 0, 0.2, 1)"
}
```

---

## 2. Como o Tema é Aplicado (Injeção no DOM)

O sistema utiliza o hook `useDesignVariables` (ou o componente `DesignProvider`) para realizar o mapeamento entre o Estado e o CSS.

### O Processo de Injeção:
1.  O sistema percorre o `MASTER_DESIGN_MAP`.
2.  Para cada token encontrado, ele busca o valor atual no Estado.
3.  Ele identifica as `cssVars` vinculadas ao token.
4.  Ele injeta as variáveis no estilo inline do elemento raiz (geralmente a `main` ou `body` dentro do escopo `.sarak-design-scope`).

**Resultado no HTML:**
```html
<div class="sarak-design-scope" style="--sarak-h1-size: 48px; --sarak-color-primary: #00f2ff; ...">
  <!-- Todo o sistema aqui dentro consome essas variáveis -->
</div>
```

---

## 3. Presets e Persistência

Presets são simplesmente conjuntos salvos do objeto de estado mencionado no item 1. 

- **Aplicação de Preset:** Substitui o estado atual pelo estado do preset. O React re-renderiza o provedor e as variáveis CSS são atualizadas instantaneamente em todo o sistema (Real-time sync).
- **Exportação:** O objeto de estado pode ser exportado como JSON para ser usado em outros ambientes ou salvo em banco de dados.

---

## 4. Integração com IA (Agentic Ready)

O sistema foi desenhado para ser manipulado por agentes de IA. Como cada parâmetro visual é um token atômico com ID e limites claros (`constraints`), uma IA pode enviar comandos de ajuste via API:

**Comando de IA Sugerido:**
`applyConfig({ "cardRadius": 32, "cardInnerGlowWidth": 2 })`

Isso permite a criação de interfaces via chat de forma totalmente segura e validada.

---

## 5. Como Consumir o Tema em Novos Módulos

Se você está criando um novo módulo/componente e quer que ele seja afetado pelo Design Engine:

1.  **Use Variáveis CSS**: Em vez de `color: #fff`, use `color: var(--sarak-text-main)`.
2.  **Tokens Existentes**: Verifique se já existe um token que controla o que você precisa (ex: quinas, sombras, cores de status).
3.  **Escopo**: Certifique-se de que seu componente está renderizado dentro da classe CSS `.sarak-design-scope`.

---

> [!TIP]
> Para depurar se um tema está sendo aplicado corretamente, inspecione o elemento raiz no navegador e veja se as variáveis `--sarak-*` estão presentes no atributo `style`.
