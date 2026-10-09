export const SARAK_BUILD_INFO = {
    "baseCommit": "7dcb59ee02417d579eaa540861e6b892d625a13f",
    "baseCommitShort": "7dcb59e",
    "builtAt": "2026-10-09T05:51:11.754Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
