export type InjectionOwner = object;

type ManagedValue = unknown;
type ManagedEntry = {
    owner: InjectionOwner;
    value: ManagedValue;
    previousValue: ManagedValue;
    read: () => ManagedValue;
    write: (value: ManagedValue) => void;
    equals: (left: ManagedValue, right: ManagedValue) => boolean;
};

type HostLedger = {
    entries: Map<string, ManagedEntry>;
    ownerKeys: Map<InjectionOwner, Set<string>>;
};

const LEDGERS = new WeakMap<object, HostLedger>();

const getLedger = (host: object): HostLedger => {
    const existing = LEDGERS.get(host);
    if (existing) return existing;

    const ledger: HostLedger = { entries: new Map(), ownerKeys: new Map() };
    LEDGERS.set(host, ledger);
    return ledger;
};

const ownerKeysFor = (ledger: HostLedger, owner: InjectionOwner): Set<string> => {
    const existing = ledger.ownerKeys.get(owner);
    if (existing) return existing;

    const keys = new Set<string>();
    ledger.ownerKeys.set(owner, keys);
    return keys;
};

const forgetOwnerKey = (ledger: HostLedger, owner: InjectionOwner, key: string): void => {
    const keys = ledger.ownerKeys.get(owner);
    keys?.delete(key);
    if (keys?.size === 0) ledger.ownerKeys.delete(owner);
};

const releaseEntry = (host: object, key: string): boolean => {
    const ledger = LEDGERS.get(host);
    const entry = ledger?.entries.get(key);
    if (!ledger || !entry) return false;

    if (entry.equals(entry.read(), entry.value)) entry.write(entry.previousValue);
    ledger.entries.delete(key);
    forgetOwnerKey(ledger, entry.owner, key);
    return true;
};

export const clearOwnedValue = (host: object, key: string): void => {
    releaseEntry(host, key);
};

export const writeOwnedValue = (
    host: object,
    key: string,
    owner: InjectionOwner,
    value: ManagedValue,
    read: () => ManagedValue,
    write: (value: ManagedValue) => void,
    equals: (left: ManagedValue, right: ManagedValue) => boolean = Object.is,
): void => {
    const ledger = getLedger(host);
    const previous = ledger.entries.get(key);
    const currentValue = read();
    const originalValue = previous && previous.equals(currentValue, previous.value)
        ? previous.previousValue
        : currentValue;

    if (!equals(currentValue, value)) write(value);
    if (previous) forgetOwnerKey(ledger, previous.owner, key);

    ledger.entries.set(key, {
        owner,
        value: read(),
        previousValue: originalValue,
        read,
        write,
        equals,
    });
    ownerKeysFor(ledger, owner).add(key);
};

export const releaseOwnedValues = (host: object, owner: InjectionOwner): string[] => {
    const ledger = LEDGERS.get(host);
    const keys = ledger?.ownerKeys.get(owner);
    if (!ledger || !keys) return [];

    const releasedKeys: string[] = [];
    for (const key of [...keys]) {
        if (ledger.entries.get(key)?.owner !== owner) continue;
        releaseEntry(host, key);
        releasedKeys.push(key);
    }
    ledger.ownerKeys.delete(owner);
    return releasedKeys;
};
