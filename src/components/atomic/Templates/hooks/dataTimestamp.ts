export const parseDataTimestamp = (value?: Date | string | number): Date | null => {
    if (value === undefined) return null;
    const timestamp = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    return Number.isNaN(timestamp.getTime()) ? null : timestamp;
};
