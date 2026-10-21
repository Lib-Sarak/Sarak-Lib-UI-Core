import React, { createContext, useContext } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export const SarakStyleNonceContext = createContext<string | undefined>(undefined);

export const useSarakStyleNonce = (): string | undefined => useContext(SarakStyleNonceContext);

export const SarakStyle: React.FC<ComponentPropsWithoutRef<'style'>> = ({ nonce, ...props }) => {
    const inheritedNonce = useSarakStyleNonce();
    return <style {...props} nonce={nonce ?? inheritedNonce} />;
};
