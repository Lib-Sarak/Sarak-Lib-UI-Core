# Regras e Limites (O que NÃO Fazer)

- **NUNCA** execute queries SQL manuais (ex: `CREATE TABLE`) para criar as tabelas da Sarak UI. A arquitetura Plug & Play exige o uso exclusivo das Bridges (`setupUIDatabase` ou `setup_ui_db()`).
- **NUNCA** altere o código interno da biblioteca `Sarak-Lib-UI-Core` durante a importação. A skill foca apenas em alterar o sistema consumidor.
- **NÃO** instale a Bridge em dois lugares do mesmo projeto. Se houver um backend Python e um frontend Next.js, instale a ponte de banco de dados apenas no Backend (Python) e deixe o Frontend (Next.js) apenas com o Provider visual.
- **NUNCA** deixe de importar o arquivo `sarak.css` junto com o Provider no arquivo de layout.
