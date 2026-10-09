export const SARAK_BUILD_INFO = {
    "baseCommit": "fbaa2d6cf96bfb155de3a65cf6d0016932f9ddb6",
    "baseCommitShort": "fbaa2d6",
    "builtAt": "2026-10-09T04:45:12.097Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
