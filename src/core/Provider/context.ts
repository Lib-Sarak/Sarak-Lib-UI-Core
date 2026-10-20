import { createContext } from 'react';
import type { SarakThemePayload, SarakUIContextType } from './types';

export const UIContext = createContext<SarakUIContextType | undefined>(undefined);
export const DesignOverrideContext = createContext<Partial<SarakThemePayload> | null>(null);
