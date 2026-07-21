// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { resolveRemoteUrl } from '../resolveRemoteUrl.mjs';

describe('resolveRemoteUrl', () => {
    it('atalho github: sem fragmento -> HEAD (default branch remoto)', () => {
        const result = resolveRemoteUrl('github:Lib-Sarak/Sarak-Lib-UI-Core');
        expect(result).toEqual({ url: 'https://github.com/Lib-Sarak/Sarak-Lib-UI-Core.git', ref: 'HEAD', pinnedCommit: null });
    });

    it('atalho owner/repo nu (sem prefixo) também vira github', () => {
        const result = resolveRemoteUrl('Lib-Sarak/Sarak-Lib-UI-Core');
        expect(result.url).toBe('https://github.com/Lib-Sarak/Sarak-Lib-UI-Core.git');
        expect(result.ref).toBe('HEAD');
    });

    it('atalho gitlab:/bitbucket:', () => {
        expect(resolveRemoteUrl('gitlab:owner/repo').url).toBe('https://gitlab.com/owner/repo.git');
        expect(resolveRemoteUrl('bitbucket:owner/repo').url).toBe('https://bitbucket.org/owner/repo.git');
    });

    it('URL completa git+ssh:// perde só o prefixo git+', () => {
        const result = resolveRemoteUrl('git+ssh://git@github.com/Lib-Sarak/Sarak-Lib-UI-Core.git');
        expect(result.url).toBe('ssh://git@github.com/Lib-Sarak/Sarak-Lib-UI-Core.git');
    });

    it('fragmento de branch/tag (não-hash) vira a ref a consultar', () => {
        const result = resolveRemoteUrl('github:Lib-Sarak/Sarak-Lib-UI-Core#develop');
        expect(result.ref).toBe('develop');
        expect(result.pinnedCommit).toBeNull();
    });

    it('fragmento que É um commit SHA vira pinnedCommit (sem HEAD remoto p/ comparar)', () => {
        const result = resolveRemoteUrl('github:Lib-Sarak/Sarak-Lib-UI-Core#7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223');
        expect(result.pinnedCommit).toBe('7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223');
        expect(result.ref).toBeNull();
    });
});
