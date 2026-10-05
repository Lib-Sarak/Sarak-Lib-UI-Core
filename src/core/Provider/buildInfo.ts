export const SARAK_BUILD_INFO = {
    "baseCommit": "5c8ae7a571ddea6d88fe11ec440832cd29d68882",
    "baseCommitShort": "5c8ae7a",
    "builtAt": "2026-10-05T00:35:18.177Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
