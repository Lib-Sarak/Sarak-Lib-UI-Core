export const SARAK_BUILD_INFO = {
    "baseCommit": "596af0badebfee5f2dba985249f3e7a66d1e95f3",
    "baseCommitShort": "596af0b",
    "builtAt": "2026-10-12T19:04:06.187Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
