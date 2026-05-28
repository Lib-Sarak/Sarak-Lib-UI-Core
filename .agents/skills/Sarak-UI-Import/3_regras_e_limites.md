# Regras e Limites (O que NÃO Fazer)

- **NUNCA** execute queries SQL manuais (ex: `CREATE TABLE`) para criar as tabelas da Sarak UI. A arquitetura Plug & Play exige o uso exclusivo das Bridges (`setupUIDatabase` ou `setup_ui_db()`).
- **NUNCA** altere o código interno da biblioteca `Sarak-Lib-UI-Core` durante a importação. A skill foca apenas em alterar o sistema consumidor.
- **NÃO** instale a Bridge em dois lugares do mesmo projeto. Se houver um backend Python e um frontend Next.js, instale a ponte de banco de dados apenas no Backend (Python) e deixe o Frontend (Next.js) apenas com o Provider visual.
- **NUNCA** deixe de importar o arquivo `sarak.css` junto com o Provider no arquivo de layout.
- **NUNCA** exporte o manifesto aninhado dentro de uma propriedade `.manifest`. O objeto exportado por `Sarak-UI/index.ts` DEVE ter `id`, `label`, `icon` na raiz do objeto (use spread: `...Manifest`). Sem isso, o `registerSarakModule()` rejeitará o módulo silenciosamente.
- **NUNCA** registre componentes visuais avulsamente via `safeRegister('id', Componente)`. Todo componente visual deve ser encapsulado dentro do `Painel.tsx` e exportado como um único pacote `SarakUI`.
- **NUNCA** omita a pasta `Sarak-UI/` no sistema consumidor. Esta pasta é o contrato obrigatório entre o módulo e o Sarak-Lib-UI-Core.
- **NÃO** passe apenas `mainContent` para o `SarakAnalyticalPage` esperando responsividade visível. A diferença entre dispositivos só se manifesta quando `navBar` e/ou `sidePanel` também são fornecidos.
