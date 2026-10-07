import { useCallback, useEffect, useRef, useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

type FormStatus = { type: 'success' | 'error'; message: string } | null;
type FormSubmit<T> = (data: T) => void | Promise<void>;

interface UseFormDataOptions<T> {
    data?: T;
    initialData: T;
    mode: 'create' | 'edit';
    mapping?: Record<string, string>;
    load?: () => Promise<T>;
    onSubmit?: FormSubmit<T>;
    onSuccess?: () => void | Promise<void>;
}

interface FormState<T> {
    formData: T;
    loading: boolean;
    saving: boolean;
    status: FormStatus;
}

function addMappedFields<T extends Record<string, unknown>>(
    data: T,
    mapping?: Record<string, string>,
): T {
    if (!mapping) return data;
    const nextData: Record<string, unknown> = { ...data };
    Object.keys(mapping).forEach((key) => {
        if (nextData[key] === undefined) nextData[key] = '';
    });
    return nextData as T;
}

export const useFormData = <T extends Record<string, unknown>>({
    data,
    initialData,
    mode,
    mapping,
    load,
    onSubmit,
    onSuccess,
}: UseFormDataOptions<T>) => {
    const [state, setState] = useState<FormState<T>>(() => ({
        formData: addMappedFields(data ?? initialData, mapping),
        loading: data === undefined && mode === 'edit' && Boolean(load),
        saving: false,
        status: null,
    }));
    const loadRef = useRef(load);
    const mappingRef = useRef(mapping);
    const initialDataRef = useRef(data ?? initialData);
    const submitRef = useRef(onSubmit);
    const successRef = useRef(onSuccess);
    const text = useLibraryText();
    const textRef = useRef(text);
    loadRef.current = load;
    mappingRef.current = mapping;
    initialDataRef.current = data ?? initialData;
    submitRef.current = onSubmit;
    successRef.current = onSuccess;
    textRef.current = text;

    useEffect(() => {
        if (data !== undefined) {
            setState((current) => ({
                ...current,
                formData: addMappedFields(data, mappingRef.current),
                loading: false,
                status: null,
            }));
            return;
        }
        if (mode === 'create') {
            setState((current) => ({
                ...current,
                formData: addMappedFields(initialDataRef.current, mappingRef.current),
                loading: false,
            }));
            return;
        }
        const loadFromHost = loadRef.current;
        if (!loadFromHost) {
            setState((current) => ({ ...current, loading: false }));
            return;
        }
        let active = true;
        setState((current) => ({ ...current, loading: true, status: null }));
        void loadFromHost()
            .then((loadedData) => {
                if (!active) return;
                setState((current) => ({
                    ...current,
                    formData: addMappedFields(loadedData, mappingRef.current),
                    loading: false,
                }));
            })
            .catch((error: unknown) => {
                if (!active) return;
                const message = error instanceof Error ? error.message : textRef.current('genericLoadError');
                setState((current) => ({ ...current, status: { type: 'error', message }, loading: false }));
            });
        return () => {
            active = false;
        };
    }, [data, mode, Boolean(load)]);

    const handleChange = useCallback((key: string, value: unknown) => {
        setState((current) => ({
            ...current,
            formData: { ...current.formData, [key]: value },
        }));
    }, []);

    const handleSave = useCallback(async () => {
        const submit = submitRef.current;
        if (!submit) return;
        setState((current) => ({ ...current, saving: true, status: null }));
        try {
            await submit(state.formData);
            await successRef.current?.();
            setState((current) => ({
                ...current,
                status: { type: 'success', message: textRef.current('formSaveSuccess') },
            }));
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : textRef.current('genericLoadError');
            setState((current) => ({ ...current, status: { type: 'error', message } }));
        } finally {
            setState((current) => ({ ...current, saving: false }));
        }
    }, [state.formData]);

    return { ...state, handleChange, handleSave };
};
