export interface EmbeddingsInterface {
    embedQuery(text: string): number[] | Promise<number[]>;
    embedDocuments(texts: string[]): number[][] | Promise<number[][]>;
}
