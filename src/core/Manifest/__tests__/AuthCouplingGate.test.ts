/**
 * GATE ANTI-ACOPLAMENTO DE AUTENTICAÇÃO (Spec 20 §2.3)
 *
 * A lib NUNCA autentica ninguém — ela só renderiza a tela de login e entrega
 * credenciais ao host pelo `networkInterceptor` (Spec 08 §6.2). Este gate varre
 * `src/**\/*.{ts,tsx}` (fora de testes) caçando dois sinais de acoplamento real:
 *
 *  1. Import de SDK de provider de auth (Supabase Auth, Firebase Auth, Cognito,
 *     Auth0, next-auth, Keycloak, MSAL, jsonwebtoken/jwt-decode, passport) — a lib
 *     nunca deve depender de um provider específico.
 *  2. Leitura direta de token de `localStorage`/`sessionStorage` (`.getItem(...token...)`)
 *     — só o host sabe onde o token vive; a lib recebe via prop/interceptor, nunca lê
 *     do storage do browser sozinha.
 *
 * Achado real corrigido nesta spec: `shared/services/api.ts` e
 * `components/atomic/Templates/Chat/useSarakChat.ts` liam `${system}_token`/
 * `sarak_token`/`auth_token` diretamente do `localStorage` (arquitetura legada
 * "Sarak Matrix"/multi-tenant, anterior ao contrato `networkInterceptor`).
 *
 * Se este teste falhar, NÃO o afrouxe: remova a leitura/dependência OU declare a
 * exceção em `ALLOWLIST` abaixo com o motivo (mesmo padrão de `manifestExclusions.ts`).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC_ROOT = path.resolve(__dirname, '../../../');

/** Exceções explícitas e justificadas — vazio hoje (nenhuma violação legítima conhecida). */
const ALLOWLIST: ReadonlySet<string> = new Set([]);

const AUTH_SDK_SPECIFIERS = [
    '@supabase/supabase-js',
    '@supabase/auth-js',
    'firebase/auth',
    'aws-amplify',
    'amazon-cognito-identity-js',
    '@auth0/',
    'next-auth',
    'keycloak-js',
    'oidc-client',
    'msal',
    '@azure/msal',
    'jsonwebtoken',
    'jwt-decode',
    'passport',
];

const TOKEN_STORAGE_RE = /(localStorage|sessionStorage)\.getItem\([^)]*\b(token|jwt)\b/i;
const IMPORT_SPECIFIER_RE = /from\s+['"]([^'"]+)['"]/g;

const isScannable = (relPath: string): boolean => {
    if (!/\.(ts|tsx)$/.test(relPath)) return false;
    if (/__tests__|__e2e__|\.test\.|\.spec\./.test(relPath)) return false;
    return true;
};

const walk = (dir: string, out: string[] = []): string[] => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full, out);
        } else {
            out.push(full);
        }
    }
    return out;
};

interface Violation {
    file: string;
    reason: string;
}

const scan = (): Violation[] => {
    const violations: Violation[] = [];
    for (const absPath of walk(SRC_ROOT)) {
        const relPath = path.relative(SRC_ROOT, absPath).replace(/\\/g, '/');
        if (!isScannable(relPath)) continue;
        if (ALLOWLIST.has(relPath)) continue;

        const content = fs.readFileSync(absPath, 'utf-8');

        for (const match of content.matchAll(IMPORT_SPECIFIER_RE)) {
            const specifier = match[1];
            const hit = AUTH_SDK_SPECIFIERS.find((sdk) => specifier.includes(sdk));
            if (hit) violations.push({ file: relPath, reason: `importa SDK de auth "${hit}" (via "${specifier}")` });
        }

        if (TOKEN_STORAGE_RE.test(content)) {
            violations.push({ file: relPath, reason: 'lê token diretamente de localStorage/sessionStorage' });
        }
    }
    return violations;
};

describe('Gate anti-acoplamento — Fronteira de Autenticação (Spec 20 §2.3)', () => {
    it('nenhum arquivo de src/ importa SDK de auth nem lê token de storage diretamente', () => {
        const violations = scan();
        if (violations.length > 0) {
            const details = violations.map((v) => `  - ${v.file}: ${v.reason}`).join('\n');
            throw new Error(
                `Acoplamento a provider de auth encontrado (Spec 20 §2.3). A lib nunca decide onde o token vive:\n${details}`,
            );
        }
        expect(violations).toEqual([]);
    });
});
