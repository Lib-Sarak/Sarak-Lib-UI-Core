export const SARAK_BUILD_INFO = {
    "baseCommit": "29dfb52c1bac46e35f2f876e8c55c48b40704991",
    "baseCommitShort": "29dfb52",
    "builtAt": "2026-10-11T06:19:59.714Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
