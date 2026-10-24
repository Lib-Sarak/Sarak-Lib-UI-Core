export const SARAK_BUILD_INFO = {
    "baseCommit": "e90ecabf88be6de909e1f757c07aee3f941b2fdd",
    "baseCommitShort": "e90ecab",
    "builtAt": "2026-10-24T15:08:20.393Z",
    "libVersion": "8.0.0-rc.2",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
