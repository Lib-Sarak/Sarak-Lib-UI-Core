export const SARAK_BUILD_INFO = {
    "baseCommit": "3b8f8f1c4e44dd9b50999384c937c18d627a0c00",
    "baseCommitShort": "3b8f8f1",
    "builtAt": "2026-10-10T00:49:21.521Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
