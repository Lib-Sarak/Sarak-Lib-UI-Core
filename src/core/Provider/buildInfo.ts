export const SARAK_BUILD_INFO = {
    "baseCommit": "ce7d767e650763abdfc11b8fdf3ef2c273d92d01",
    "baseCommitShort": "ce7d767",
    "builtAt": "2026-10-07T03:01:32.692Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
