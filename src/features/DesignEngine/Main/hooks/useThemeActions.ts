import { useCallback } from 'react';

export function useThemeActions(uiBaseUrl: string, apiToken?: string) {
    const saveNewThemeAPI = useCallback(async (design: any, name: string, isActive: boolean) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;
        const res = await fetch(`${uiBaseUrl}/themes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ design, name, is_active: isActive })
        });
        return await res.json();
    }, [uiBaseUrl, apiToken]);

    const updateThemeAPI = useCallback(async (themeId: string, design: any, name: string, isActive: boolean = false) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;
        const res = await fetch(`${uiBaseUrl}/themes/${themeId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ design, name, is_active: isActive })
        });
        return await res.json();
    }, [uiBaseUrl, apiToken]);

    const activateThemeAPI = useCallback(async (themeId: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;
        const res = await fetch(`${uiBaseUrl}/themes/${themeId}/activate`, {
            method: 'PUT',
            headers
        });
        return await res.json();
    }, [uiBaseUrl, apiToken]);

    return {
        saveNewThemeAPI,
        updateThemeAPI,
        activateThemeAPI
    };
}
