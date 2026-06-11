import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    registerSarakModule, 
    getRegisteredModules, 
    getSarakModule,
    registerLocalComponent,
    getLocalComponent,
    subscribeToRegistry
} from '../registry';

describe('Discovery Registry', () => {
    beforeEach(() => {
        const _global = (typeof window !== 'undefined' ? window : {}) as any;
        _global.__SARAK_REGISTRY_MODS__?.clear();
        _global.__SARAK_REGISTRY_COMPS__?.clear();
        _global.__SARAK_REGISTRY_LISTENERS__?.clear();
    });

    it('registra e recupera um componente local', () => {
        const MockComponent = () => null;
        registerLocalComponent('test-mod', MockComponent as any);
        expect(getLocalComponent('test-mod')).toBe(MockComponent);
    });

    it('registra um módulo e o recupera com o componente local resolvido', () => {
        const MockComponent = () => null;
        registerLocalComponent('app1', MockComponent as any);
        
        const manifest = {
            id: 'app1',
            label: 'My App',
            icon: 'Home'
        };
        registerSarakModule(manifest);

        const mod = getSarakModule('app1');
        expect(mod).toBeDefined();
        expect(mod?.label).toBe('My App');

        const allMods = getRegisteredModules();
        const resolvedMod = allMods.find(m => m.id === 'app1');
        expect(resolvedMod?.component).toBe(MockComponent);
    });

    it('não registra módulo sem id', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        registerSarakModule({ label: 'No ID' } as any);
        expect(consoleError).toHaveBeenCalled();
        consoleError.mockRestore();
    });

    it('assina e notifica ouvintes', () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToRegistry(listener);
        
        registerLocalComponent('trigger', (() => null) as any);
        expect(listener).toHaveBeenCalled();
        
        unsubscribe();
        registerLocalComponent('trigger2', (() => null) as any);
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
