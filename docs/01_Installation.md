# 🏁 Sarak Installation & Setup Guide (v11.0)

Este guia orienta engenheiros sobre como importar e integrar a biblioteca soberana **`@sarak/lib-ui-core`** em seus projetos e sistemas host.

---

## 1. Importação do Pacote

Como o ecossistema Sarak é composto por ativos modulares soberanos, você pode adicionar a biblioteca diretamente de repositórios remotos do GitHub ou localmente para fins de desenvolvimento.

### Instalação via NPM (GitHub Remote)
Adicione a dependência no seu arquivo `package.json` apontando para a release ou branch de release estável:

```bash
npm install git+https://github.com/sarak-engine/Sarak-Lib-UI-Core.git#semver:^2.2.0
```

### Instalação em Modo Desenvolvimento (Local Linking)
Se você estiver estendendo a biblioteca localmente, utilize o mecanismo de link para propagação imediata de compilação para o serviço consumidor:

```bash
# Na pasta da biblioteca Sarak-Lib-UI-Core:
npm run build
npm link

# Na pasta do seu serviço consumidor (ex: Sarak-MyService):
npm link @sarak/lib-ui-core
```

---

## 2. Configuração de Dependências

O motor visual da Sarak necessita que o host forneça as dependências de runtime essenciais. Garanta que o seu projeto host possua as seguintes dependências instaladas:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.294.0"
  }
}
```

---

## 3. Configuração do Compilador TypeScript

Para garantir a paridade de tipagem com os contratos visuais de descoberta (`VisualContract`), o arquivo `tsconfig.json` do host deve suportar a resolução de caminhos de módulos modernos:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ScriptHost", "ES2022"],
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "jsx": "react-jsx"
  }
}
```

---

## 4. Próximos Passos

1.  Projete a interface do seu sistema de forma declarativa e modular seguindo o guia de **[Contratos Visuais e Manifesto](./02_Manifest_Contracts.md)**.
2.  Implemente o bootstrap do provedor e da casca de interface utilizando o guia de **[Integração de Sistema](./03_System_Integration.md)**.
