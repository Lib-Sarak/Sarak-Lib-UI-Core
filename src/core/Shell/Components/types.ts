import React from 'react';

export interface SarakShellProps {
    children?: React.ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
    extraToolbarItems?: React.ReactNode;
    user?: any;
    logout?: () => void;
    token?: string;
    authApi?: any;
}
