export const SARAK_BUILD_INFO = {
    "baseCommit": "56c3324b386a73910895c1e1aaac782159482aa3",
    "baseCommitShort": "56c3324",
    "builtAt": "2026-10-12T06:12:18.266Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
