import React from 'react';

/** Identidade do usuário exibida no Shell (vinda do app consumidor). */
export interface SarakShellUser {
    username?: string;
    email?: string;
    level?: number;
    [key: string]: unknown;
}

export interface SarakShellProps {
    children?: React.ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
    extraToolbarItems?: React.ReactNode;
    user?: SarakShellUser;
    logout?: () => void;
    token?: string;
    authApi?: unknown;
}
