export const SARAK_BUILD_INFO = {
    "baseCommit": "a116d7edc9b61d56e45c561361e30cf31ce3eb6c",
    "baseCommitShort": "a116d7e",
    "builtAt": "2026-10-17T20:43:31.772Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
