# Workflow de Execução: Sarak-UI-Import

Siga estes passos rigorosamente para instalar o Sarak-Lib-UI-Core em qualquer sistema.

## Passo 1: Identificação do Ecossistema
1. Utilize a ferramenta `list_dir` na raiz do projeto consumidor.
2. Procure por `package.json` (indica projeto Node.js/Next.js).
3. Procure por `requirements.txt` ou `app.py` (indica backend Python).
4. Se o projeto for Fullstack (ex: Next.js + Python API na mesma pasta), identifique qual serviço se conecta ao Banco de Dados Principal e aplique a integração de banco de dados **apenas nele**.

## Passo 2: Instalação da Dependência Visual (Frontend)
1. Se houver `package.json`, adicione `@sarak/lib-ui-core` nas dependências apontando para o pacote local (ex: `"file:../../Biblioteca/Sarak-Lib-UI-Core"` ou via repositório).
2. Adicione o `SarakUIProvider` no layout raiz do frontend (`app/layout.tsx` ou `src/App.tsx`).
   ```tsx
   import { SarakUIProvider } from '@sarak/lib-ui-core';
   import '@sarak/lib-ui-core/sarak.css';

   export default function App() {
       return (
           <SarakUIProvider
               // RECOMENDADO: Injeção de dependência para uploads híbridos
               // Sem isso, a UI bloqueará mídias > 2MB e converterá em Base64.
               onMediaUpload={async (file) => {
                   // Exemplo: const url = await uploadToS3(file);
                   // return url;
                   return "";
               }}
           >
               <SuaAplicacao />
           </SarakUIProvider>
       );
   }
   ```

## Passo 3: Injeção da Inicialização de Banco de Dados (Bridges)
O módulo Sarak UI necessita criar o schema `ui_core` e a tabela `custom_themes` no banco de dados. **NUNCA crie essas tabelas manualmente.** Use as Bridges.

### Se o Backend for Node.js (ex: Next.js)
1. Localize ou crie o arquivo `instrumentation.ts` na raiz do Next.js.
2. Certifique-se de que o `instrumentationHook` está habilitado no `next.config.ts`.
3. Adicione o import da Node Bridge:
   ```typescript
   import { setupUIDatabase } from '@sarak/lib-ui-core/backend/node/database';
   
   export async function register() {
       if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.DATABASE_URL) {
           await setupUIDatabase(process.env.DATABASE_URL);
       }
   }
   ```

### Se o Backend for Python (ex: FastAPI)
1. Certifique-se de que a pasta raiz do módulo Sarak esteja acessível no `sys.path`.
2. No arquivo de startup (ex: `app.py`), importe a função de setup da ponte Python:
   ```python
   from sarak_ui_core.core.database import setup_ui_db
   # Passe a Engine do SQLAlchemy para inicializar:
   setup_ui_db(engine)
   ```

## Passo 4: Criação da Pasta Obrigatória `Sarak-UI/` (Contrato Duplo)

**Esta é a etapa mais crítica.** Todo sistema que importa o módulo UI deve possuir uma pasta `Sarak-UI/` (preferencialmente dentro de `src/`, mas aceita-se dentro de `frontend/`). Esta pasta centraliza **todo** o acoplamento visual com o Sarak-Lib-UI-Core.

### Estrutura Obrigatória

```text
MeuSistema/
└── src/
    └── Sarak-UI/
        ├── sarak.manifest.json  # [Obrigatório] O Cérebro (Configurações, ícone, endpoints)
        ├── Painel.tsx           # [Obrigatório] O Corpo (O Adapter Injetor de CSS)
        ├── index.ts             # [Obrigatório] O Contrato de Exportação (Barrel)
        └── components/          # [Opcional] Extensões visuais específicas
```

### 4.1: Criar `manifest.ts`

Define a identidade do módulo no ecossistema. Deve conter obrigatoriamente `id`, `label`, `icon`, e opcionalmente `category`, `priority`, `endpoints`, `visualContracts`.

```typescript
export const MeuModuloManifest = {
    id: "meu-modulo",
    label: "Meu Módulo",
    icon: "LayoutDashboard",
    category: "Negócios",
    version: "1.0.0",
    priority: 10,
    endpoints: {
        // endpoints da API do módulo
    },
    visualContracts: [
        // contratos visuais para renderização dinâmica (opcional)
    ]
};
```

### 4.2: Criar `Painel.tsx`

O componente mestre que envelopa a tela principal do módulo na fôrma inteligente `SarakAnalyticalPage` (`centeredOnDesktop={true}`). 

**Lei Arquitetural 1 (Padrão Adapter e Injeção de CSS):** O `Painel.tsx` **NUNCA DEVE** fatiar ou alterar o código fonte interno do componente original do módulo. O componente original é intocável. O `Painel.tsx` deve envelopar o componente no `mainContent` e atuar como um **Injetor de CSS**. Se for necessário esconder descrições em mobile, domar títulos colossais ou colocar barras de rolagem internas em listas, tudo isso DEVE ser feito no `Painel.tsx` através de pseudo-seletores no Tailwind (Ex: `className="max-sm:[&_h1]:!text-4xl max-sm:[&_.description]:line-clamp-2"`).

**Lei Arquitetural 2 (Container Queries):** Para suportar a renderização em Drawers ou diferentes layouts do Shell Global, todo o layout interno do módulo (grid, flexbox) **DEVE OBRIGATORIAMENTE** utilizar Container Queries do Tailwind (ex: `@md:grid-cols-2` ao invés de `md:grid-cols-2`). Garanta que a raiz do seu componente principal possua a classe `@container` para que seus filhos reajam ao tamanho da fôrma.

```tsx
import React from 'react';
import { SarakAnalyticalPage } from '@sarak/lib-ui-core';
import MeuComponentePrincipal from '../components/MeuComponentePrincipal';

const Painel: React.FC<any> = (props) => {
    return (
        <SarakAnalyticalPage 
            centeredOnDesktop={true}
            // [Obrigatório e Exclusivo] mainContent: Envelopa o componente inteiro.
            // Aqui é feita a INJEÇÃO DE CSS para domar comportamentos responsivos.
            mainContent={
                <div className="max-sm:[&>div]:!p-4 max-sm:[&_h1]:!text-4xl">
                    <MeuComponentePrincipal {...props} />
                </div>
            }
        />
    );
};

export default Painel;
```

**Importante:** Historicamente existiam props como `navBar` e `sidePanel` no `SarakAnalyticalPage`, mas seu uso foi depreciado em prol do Contrato Mínimo e responsividade delegada ao Container Query do módulo.

### 4.3: Criar `index.ts`

O ponto de exportação final. **DEVE** espalhar (spread) as propriedades do manifesto na raiz do objeto para compatibilidade com `registerSarakModule()`.

```typescript
import { MeuModuloManifest } from './manifest';
import Painel from './Painel';

export const UI = {
    ...MeuModuloManifest,  // ← SPREAD obrigatório (NÃO aninhar em .manifest)
    component: Painel
};

export default UI;
```

### 4.4: Exportar no `index.ts` raiz do módulo

```typescript
// Exportação Estrita do Frontend
export { default as SarakUI } from './Sarak-UI';
```

## Passo 5: Registro e Linkagem do Tailwind V4 (Sistema Host)

No sistema que consome os módulos (como o `Sarak-MyService`), existem duas obrigações críticas.

### 5.1: Escaneamento do Tailwind (Obrigatório)
Se o Host usa Tailwind V4, os estilos injetados nos painéis NÃO FUNCIONARÃO a menos que o compilador os enxergue.
Vá até o arquivo `index.css` (ou global) do Host e adicione a tag `@source` apontando para o módulo que acabou de importar:

```css
@import "tailwindcss";
@import "@sarak/lib-ui-core/dist/sarak.css";

/* Master Scan: Escaneamento Local */
@source "../../Caminho-Para-O-Modulo/src/**/*.tsx";
```

### 5.2: Registro Lógico no Host
No código do sistema host (`main.tsx` ou configuração equivalente), registre o módulo:

```typescript
import { registerSarakModule } from '@sarak/lib-ui-core';
import { SarakUI as MeuModuloUI } from '@meu-pacote';

// Wrapper de segurança para registro
const registerSarakModuleSafe = (mod: any) => {
    const effectiveMod = mod?.default || mod;
    if (effectiveMod && effectiveMod.id) {
        registerSarakModule(effectiveMod);
    }
};

registerSarakModuleSafe(MeuModuloUI);
```

## Passo 6: Utilizando Smart Layouts para Responsividade Automática
Ao construir a tela principal do módulo consumido (o `Painel.tsx`), utilize a "Fôrma Inteligente" do Sarak para garantir mutação de layout perfeita em Celulares e Tablets, sem escrever media queries.

**Regras de Responsabilidade:**
- Controle visual do conteúdo: Fica no `.tsx` usando `SarakHidden` ou o hook `useSarakDevice()`.
- Controle da Casca (Menu Top/Side): Fica no `manifest.json` do sistema host.

## Passo 7: Apresentação e Confirmação do Usuário (HITL)

```markdown
## ✅ Plano de Execução — Importação do Sarak UI

**O que será modificado:** [lista de arquivos ex: package.json, layout.tsx, instrumentation.ts]
**Ecossistema Detectado:** [Node.js ou Python]
**Bridge Utilizada:** [bridge-node ou bridge-python]
**Pasta Sarak-UI criada:** [sim/não — com lista de arquivos]

⚠️ Confirma a execução desta injeção?
```
**Regra:** Aguarde a confirmação do usuário antes de realizar as alterações reais nos arquivos.

## Passo 8: Registro
Após a aprovação e execução bem-sucedida, compile os resultados para a documentação e registre no `skill-registro-sessao`.
