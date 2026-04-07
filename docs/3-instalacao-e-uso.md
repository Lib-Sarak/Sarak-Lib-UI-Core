# 🚀 Instalação e Uso Prático

A **Sarak-Lib-UI-Core** segue o modelo de consumo direto via GitHub, eliminando a dependência de um registro NPM privado.

## 📦 Instalação

Como a biblioteca é **Source-Driven**, instale-a apontando para o repositório oficial. Utilize o comando abaixo no terminal do seu projeto (App ou Microsserviço):

```bash
# Sincronização Sarak v5.4.1
npm install github:Lib-Sarak/Sarak-Lib-UI-Core --force
```

> [!NOTE]
> O uso do `--force` garante que o Vite limpe o cache de pré-build e reconheça as novas variáveis de design injetadas.

## 🏗️ Configuração do Provider

Para que as personalidades visuais e o motor de escala funcionem, você deve envolver sua aplicação com o `SarakUIProvider`.

### Exemplo de Uso (Next.js / Vite)

```tsx
import { SarakUIProvider } from '@sarak/lib-ui-core';
import '@sarak/lib-ui-core/sarak-base.css'; // Importante: Importe o CSS base

export default function App({ children }) {
  return (
    <SarakUIProvider>
       {children}
    </SarakUIProvider>
  );
}
```

## 🛠️ Peer Dependencies (Obrigatório)
Para evitar duplicação de bibliotecas e conflitos de contexto, certifique-se de que seu projeto tenha estas dependências instaladas:
- `react` e `react-dom` (v18+)
- `framer-motion` (Para as animações de entrada)
- `lucide-react` (Para o conjunto de ícones padrão)

---
[Anterior: Arquitetura Federada](./2-arquitetura-federada.md) | [Próximo: Catálogo de Personalidades](./4-catalogo-de-personalidades.md)
