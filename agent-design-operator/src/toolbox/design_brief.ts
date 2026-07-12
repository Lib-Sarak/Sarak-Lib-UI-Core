import { ProviderInterface } from '../core/providers/provider_interface.js';
import { GLOBAL_SYSTEM_CONSTRAINTS } from '../config/shared/global_prompts.js';

/**
 * Etapa 1 da arquitetura (revisão da Spec 02): traduz o pedido do usuário — e,
 * no futuro, conteúdo extraído de site/PDF/imagem pelas Specs 05/06 (o
 * parâmetro `referenceContent` é o ponto de extensão pra isso; nenhuma
 * ingestão é implementada aqui) — numa descrição em PROSA do resultado visual
 * esperado, sem nenhum token técnico. É o "entendimento": desacopla a leitura
 * da referência do conhecimento do catálogo, que só entra na Etapa 2.
 */
export async function generateDesignBrief(
    userPrompt: string,
    identity: string,
    rules: string,
    provider: ProviderInterface,
    temperature: number,
    maxTokens: number,
    model: string,
    referenceContent?: string
): Promise<string> {
    const systemPrompt =
        `${GLOBAL_SYSTEM_CONSTRAINTS}\n\n` +
        `[AGENT IDENTITY]\n${identity}\n\n` +
        `[REGRA ABSOLUTA DESTA CHAMADA]\n` +
        `Você é o intérprete de intenção visual do Design Agent. Sua única tarefa é traduzir o\n` +
        `pedido do usuário num "Design Brief": uma descrição em PROSA, curta (3-6 frases), do\n` +
        `resultado visual esperado.\n\n` +
        `É TERMINANTEMENTE PROIBIDO:\n` +
        `- Citar qualquer nome de chave/token técnico (ex: "primaryColor", "cardBorderRadius").\n` +
        `- Escrever JSON, colchetes \`[\` \`]\` ou chaves \`{\` \`}\`.\n` +
        `- Listar valores numéricos exatos de pixel/cor hexadecimal — descreva a IMPRESSÃO\n` +
        `  ("cantos quase retos", "acentos ciano neon com brilho forte"), não o valor técnico.\n\n` +
        `Cubra, quando fizer sentido pro pedido: paleta/temperatura de cor, contraste, geometria\n` +
        `(anguloso vs. arredondado), densidade/espaçamento, tipografia (peso/compacidade),\n` +
        `texturas e efeitos de superfície, e ritmo de movimento/transições. Se o pedido for\n` +
        `específico só sobre uma parte do tema (ex: "só a cor"), o Brief pode ser curto e\n` +
        `focado — não invente detalhes que o usuário não sugeriu.\n\n` +
        `[PEDIDO DO USUÁRIO]\n${userPrompt}\n\n` +
        (referenceContent ? `[CONTEÚDO DE REFERÊNCIA EXTRAÍDO]\n${referenceContent}\n\n` : '') +
        `[STRICT GUARDRAILS]\n${rules}`;

    const rawBrief = await provider.generateResponse(
        systemPrompt,
        [{ role: 'user', content: userPrompt }],
        temperature,
        maxTokens,
        model
    );

    const brief = rawBrief.trim();
    if (!brief) {
        throw new Error('Design Brief vazio — o provider não retornou conteúdo utilizável.');
    }
    return brief;
}
