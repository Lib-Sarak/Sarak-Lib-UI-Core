import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateDesign } from '../validation';

describe('validateDesign (Spec 44 §2.3 — tema é dado validado, nunca CSS/HTML cru)', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('aceita um valor de enum (`select`) válido e descarta um valor fora do enum', () => {
        const result = validateDesign({ mode: 'light' });
        expect(result.mode).toBe('light');

        const malicious = validateDesign({ mode: 'javascript:alert(1)' });
        expect(malicious.mode).not.toBe('javascript:alert(1)');
        expect(warnSpy).toHaveBeenCalled();
    });

    it('aceita uma cor segura (`color`) e descarta um payload de breakout CSS/HTML', () => {
        const safe = validateDesign({ primaryColor: '#ff0000' });
        expect(safe.primaryColor).toBe('#ff0000');

        const breakoutAttempt = validateDesign({
            primaryColor: 'red; } body { background: url(javascript:alert(1)) } /* <script>alert(1)</script>'
        });
        // Fora do contrato de cor (não bate `COLOR_PATTERN` e carrega `;`/`<>`) —
        // descartado por completo, nunca "sanitizado e mantido".
        expect(breakoutAttempt.primaryColor).toBeUndefined();
    });

    it('aceita `var(--x, fallback)` como cor (contrato de tokens públicos)', () => {
        const result = validateDesign({ primaryColor: 'var(--sarak-primary-color, #00f2ff)' });
        expect(result.primaryColor).toBe('var(--sarak-primary-color, #00f2ff)');
    });

    it('clampa um token numérico/responsivo (`sidebarWidth`, min 200 max 400) dentro da faixa', () => {
        const result = validateDesign({ sidebarWidth: { desk: 9999, tab: -50, mob: 240 } });
        expect(result.sidebarWidth).toEqual({ desk: 400, tab: 200, mob: 240 });
    });

    it('descarta um token responsivo com um eixo não-numérico (tipo errado)', () => {
        const result = validateDesign({ sidebarWidth: { desk: '9999px; } </style><script>', tab: 220, mob: 200 } });
        expect(result.sidebarWidth).not.toEqual({ desk: '9999px; } </style><script>', tab: 220, mob: 200 });
        expect(warnSpy).toHaveBeenCalled();
    });

    it('descarta uma chave completamente desconhecida no schema de tema', () => {
        const result = validateDesign({ brandColorPrimary: '#ff0000' });
        expect(result).not.toHaveProperty('brandColorPrimary');
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('desconhecida no schema de tema'),
            expect.anything()
        );
    });

    it('aceita um campo legado/branding conhecido (`systemName`) mas descarta se carregar HTML cru', () => {
        const safe = validateDesign({ systemName: 'Minha Empresa' });
        expect(safe.systemName).toBe('Minha Empresa');

        const unsafe = validateDesign({ systemName: '<img src=x onerror=alert(1)>' });
        expect(unsafe.systemName).toBeUndefined();
    });

    it('nunca produz um valor que sobreviveria a um `<style>`/`dangerouslySetInnerHTML` sem sanitização', () => {
        const attemptedPayload = {
            primaryColor: '</style><script>alert(document.cookie)</script>',
            mode: '<img src=x onerror=alert(1)>',
            systemName: '"><svg onload=alert(1)>',
            sidebarWidth: { desk: '</style>', tab: 1, mob: 1 }
        };

        const result = validateDesign(attemptedPayload);
        const serialized = JSON.stringify(result);
        expect(serialized).not.toContain('<script');
        expect(serialized).not.toContain('</style');
        expect(serialized).not.toContain('onerror');
        expect(serialized).not.toContain('onload');
    });

    // Achado 40 (specs/specs/15-divida-conhecida.md §3.1): `hapticIntensity`/
    // `scaleRatio` eram injetadas como fallback estrutural e, na passada
    // seguinte, descartadas por serem chave desconhecida (nem token de schema,
    // nem `PAYLOAD_EXTRA_KEYS`) — e reinjetadas de novo. Um par de warn por
    // chamada, para sempre. `validateDesign` é idempotente: validar a SAÍDA de
    // uma validação não pode gerar warn novo.
    it('validar o MESMO design duas vezes não emite warn na segunda passada (achado 40)', () => {
        const once = validateDesign({ mode: 'dark', primaryColor: '#111827' });
        warnSpy.mockClear();

        validateDesign(once);

        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('não injeta mais `hapticIntensity`/`scaleRatio` — vestigiais do manifesto legado (achado 40)', () => {
        const result = validateDesign({ mode: 'dark' });
        expect(result).not.toHaveProperty('hapticIntensity');
        expect(result).not.toHaveProperty('scaleRatio');
    });
});

// Os tokens `image`/`file` (só `globalBackgroundImageUrl` existe hoje no
// schema) têm predicado próprio: aceitam `https:` e mídia embutida (`data:`)
// bem-formada, sem afrouxar `CSS_BREAKOUT_PATTERN` para nenhum outro tipo.
describe('validateDesign — predicado de mídia embutida em tokens `image`/`file`', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('aceita uma URL `https:` sem warn', () => {
        const result = validateDesign({ globalBackgroundImageUrl: 'https://cdn.example.com/bg.png' });
        expect(result.globalBackgroundImageUrl).toBe('https://cdn.example.com/bg.png');
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('aceita mídia embutida `data:` bem-formada (imagem) sem warn — o defeito reproduzido na plan', () => {
        const dataUri = `data:image/png;base64,${PNG_1PX}`;
        const result = validateDesign({ globalBackgroundImageUrl: dataUri });
        expect(result.globalBackgroundImageUrl).toBe(dataUri);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('aceita mídia embutida `data:` bem-formada (vídeo) sem warn', () => {
        const dataUri = 'data:video/mp4;base64,AAAAAA==';
        const result = validateDesign({ globalBackgroundImageUrl: dataUri });
        expect(result.globalBackgroundImageUrl).toBe(dataUri);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('recusa `data:` com payload fora do alfabeto base64 (mal-formada), com warn', () => {
        const result = validateDesign({ globalBackgroundImageUrl: 'data:image/png;base64,not_base64!!!' });
        expect(result.globalBackgroundImageUrl).toBeUndefined();
        expect(warnSpy).toHaveBeenCalled();
    });

    it('recusa `data:` com MIME que não é imagem/vídeo — só este predicado pega isto (o `CSS_BREAKOUT_PATTERN` já rejeitava TODA `data:` antes, inclusive as bem-formadas)', () => {
        const nonMedia = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';
        const result = validateDesign({ globalBackgroundImageUrl: nonMedia });
        expect(result.globalBackgroundImageUrl).toBeUndefined();
    });

    it('recusa `javascript:`', () => {
        const result = validateDesign({ globalBackgroundImageUrl: 'javascript:alert(1)' });
        expect(result.globalBackgroundImageUrl).toBeUndefined();
    });

    it('recusa tentativa de breakout anexada a uma `data:` bem-formada', () => {
        const result = validateDesign({
            globalBackgroundImageUrl: `data:image/png;base64,${PNG_1PX}<script>alert(1)</script>`
        });
        expect(result.globalBackgroundImageUrl).toBeUndefined();
    });

    it('recusa breakout dentro de uma URL `https:`', () => {
        const result = validateDesign({
            globalBackgroundImageUrl: 'https://evil.com/x?a=1;background:url(javascript:alert(1))'
        });
        expect(result.globalBackgroundImageUrl).toBeUndefined();
    });

    it('mantém aceito, sem warn, o formato legado `url("https://...")` do tema shippado `nebula-space`', () => {
        const legacy = 'url("https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop")';
        const result = validateDesign({ globalBackgroundImageUrl: legacy });
        expect(result.globalBackgroundImageUrl).toBe(legacy);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('não afrouxa nenhum outro tipo de token — cor, texto e select continuam sob o predicado geral de breakout', () => {
        const asColor = validateDesign({ primaryColor: `data:image/png;base64,${PNG_1PX}` });
        expect(asColor.primaryColor).toBeUndefined();

        const asText = validateDesign({ systemName: `data:image/png;base64,${PNG_1PX}` });
        expect(asText.systemName).toBeUndefined();

        const asSelect = validateDesign({ mode: 'light' });
        expect(asSelect.mode).toBe('light');
    });
});
