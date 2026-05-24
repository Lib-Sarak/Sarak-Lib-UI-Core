import { useState, useEffect, useCallback } from 'react';

export interface BrandingState {
    companyName: string;
    loginName: string;
    tabName: string;
    logoBase64: string | null;
}

export function useBrandingManager(options: any, token?: string | null) {
    const [branding, setBranding] = useState<BrandingState>({
        companyName: 'Sarak OS',
        loginName: 'Acesso ao Sistema',
        tabName: 'Sarak OS',
        logoBase64: null
    });

    const [isBrandingLoaded, setIsBrandingLoaded] = useState(false);

    useEffect(() => {
        if (!options?.endpoints?.branding) return;

        const fetchBranding = async () => {
            try {
                const headers: any = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(options.endpoints.branding, { headers });
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

        if (!options?.endpoints?.branding) return;

        try {
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            await fetch(options.endpoints.branding, {
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
