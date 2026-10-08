export const SARAK_BUILD_INFO = {
    "baseCommit": "782adf0de385ce9c88e55991585dea45f5790c10",
    "baseCommitShort": "782adf0",
    "builtAt": "2026-10-08T02:28:58.844Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
