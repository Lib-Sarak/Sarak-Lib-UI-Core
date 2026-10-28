export const SARAK_BUILD_INFO = {
    "baseCommit": "9df35287eaa75a28799800fed300844509e208f7",
    "baseCommitShort": "9df3528",
    "builtAt": "2026-10-28T18:08:58.082Z",
    "libVersion": "8.0.0-rc.3",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
