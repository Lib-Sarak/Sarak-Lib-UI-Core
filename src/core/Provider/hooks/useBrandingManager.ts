import { useState, useEffect, useCallback } from 'react';

export interface BrandingState {
    companyName: string;
    loginName: string;
    tabName: string;
    logoBase64: string | null;
}

export function useBrandingManager(options: any) {
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
                const res = await fetch(options.endpoints.branding, {
                    headers: {
                        'Authorization': options.token ? `Bearer ${options.token}` : ''
                    }
                });
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
    }, [options?.endpoints?.branding, options?.token]);

    const updateBranding = useCallback(async (partial: Partial<BrandingState>) => {
        setBranding(prev => ({ ...prev, ...partial }));

        if (!options?.endpoints?.branding) return;

        try {
            await fetch(options.endpoints.branding, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': options.token ? `Bearer ${options.token}` : ''
                },
                body: JSON.stringify({ branding: partial })
            });
        } catch (err) {
            console.error('[Sarak-UI-Core] Failed to save branding', err);
        }
    }, [options?.endpoints?.branding, options?.token]);

    return {
        branding,
        updateBranding,
        isBrandingLoaded
    };
}
