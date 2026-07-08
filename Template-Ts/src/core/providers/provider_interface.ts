export interface ProviderInterface {
    generateResponse(
        systemPrompt: string, 
        history: { role: string, content: string }[], 
        temperature: number, 
        maxTokens: number,
        model: string
    ): string | Promise<string>;
}
