import { useState, useEffect, useCallback } from 'react';
import { SarakUIOptions } from '../types';

export interface BrandingState {
    companyName: string;
    loginName: string;
    tabName: string;
    logoBase64: string | null;
}

export function useBrandingManager(options: SarakUIOptions, token?: string | null) {
    const [branding, setBranding] = useState<BrandingState>({
        companyName: 'Sarak OS',
        loginName: 'Acesso ao Sistema',
        tabName: 'Sarak OS',
        logoBase64: null
    });

    const [isBrandingLoaded, setIsBrandingLoaded] = useState(false);

    useEffect(() => {
        const brandingUrl = options?.endpoints?.branding;
        if (!brandingUrl) return;

        const fetchBranding = async () => {
            try {
                const headers: Record<string, string> = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(brandingUrl, { headers });
                if (res.ok) {
                    const data = await res.json();
                    if (data.branding && Object.keys(data.branding).length > 0) {
                        setBranding({
                            companyName: data.branding.companyName || 'Sarak OS',
                            loginName: data.branding.loginName || 'Acesso ao Sistema',
                            tabName: data.branding.tabName || 'Sarak OS',
                            logoBase64: data.branding.logoBase64 || null
                        });
                    }
                }
            } catch (err) {
                console.error('[Sarak-UI-Core] Failed to fetch branding', err);
            } finally {
                setIsBrandingLoaded(true);
            }
        };

        fetchBranding();
    }, [options?.endpoints?.branding, token]);

    const updateBranding = useCallback(async (partial: Partial<BrandingState>) => {
        setBranding(prev => ({ ...prev, ...partial }));

        const brandingUrl = options?.endpoints?.branding;
        if (!brandingUrl) return;

        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            await fetch(brandingUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({ branding: partial })
            });
        } catch (err) {
            console.error('[Sarak-UI-Core] Failed to save branding', err);
        }
    }, [options?.endpoints?.branding, token]);

    return {
        branding,
        updateBranding,
        isBrandingLoaded
    };
}
