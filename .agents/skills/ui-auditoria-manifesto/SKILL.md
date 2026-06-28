---
name: ui-auditoria-manifesto
description: Skill de conferência estática do JSON do manifesto. Vasculha chaves órfãs, loops infinitos e vazamentos de segurança (Safe Eval). Use ao auditar layouts. NÃO acione proativamente.
---

# Skill: Auditoria de Manifesto (JSON Linter)

Atua como um Linter estático e Gatekeeper de Segurança para os JSONs da Engine Declarativa, garantindo que o Desenvolvedor ou as próprias IAs importadoras não injetaram códigos hostis ou lógicas corrompidas na interface.

## Quando usar
- Quando um Manifesto JSON for muito complexo (múltiplos *renderFor* e *renderIf*) e precisar de validação para ter certeza que não quebrará o `<SarakManifestRenderer />`.
- Ao revisar a construção de uma tela (Review) antes de enviar para o ambiente produtivo de um sistema consumidor.
- Use APENAS sob demanda. NÃO acione proativamente.

## Workflow (Conferência Estática Funcional)

Ao ser instruído para auditar um Manifesto JSON, siga a sequência:

1. **Validação Estrutural (Schema e Nós)**
   - Cheque se todo objeto de interface (Nó) do JSON possui a propriedade mandatória `type`.
   - No bloco de `actions`, assegure-se de que os tipos listados são nativos e suportados pelo Dispatcher da Sarak (ex: `api_call`, `mutate_state`, `navigate`, `trigger_toast`). Tipos inventados travarão a página.
2. **Segurança do Safe Evaluator (Crítico)**
   - Vasculhe cirurgicamente os blocos `"{{ }}"` buscando por strings proibidas que representem injeção de script.
   - **Bloqueio Imediato:** Qualquer presença de `<script>`, `<style>`, ou tentativas de invocar `window.*` e `document.*` dentro das condicionais ou pipes do JSON deve ser vetada. A Engine exige que o JSON seja burro e dependa apenas da DataStore.
3. **Mapeamento de Chaves Órfãs**
   - Se um laço `"renderIf"` checar a variável `{{user.role}}`, garanta que o nó importador saiba que a chave `user` deve existir na `DataStore`, prevenindo um *undefined check* obscuro.
4. **Ciclos e Loops (RenderFor)**
   - Valide se os nós engatilhados com `"renderFor"` estão corretamente estruturados, evitando que eles empilhem listas infinitas de chaves sem o operador de indexação.

## Regras
- A auditoria deve ser meramente estática (como a leitura humana/algorítmica de um texto). Você nunca deve tentar injetar o JSON num navegador local durante esse processo.
- Reporte infrações em três níveis: **INFO** (órfãos), **WARNING** (falhas visuais) e **CRITICAL** (injeções XSS e Safe Eval hostil).

## Referências
- Spec 11 (`11-engine-declarativa-e-manifestos.md`): Contém a explicação oficial de como a Conferência Funcional opera.
