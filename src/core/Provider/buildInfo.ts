export const SARAK_BUILD_INFO = {
    "baseCommit": "ee42ccc0c8f031ed0ca33a2935157967c1e35e37",
    "baseCommitShort": "ee42ccc",
    "builtAt": "2026-10-17T17:40:05.962Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
