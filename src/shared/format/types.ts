export type SarakValueFormat =
    | { type: 'number'; options?: Intl.NumberFormatOptions }
    | { type: 'currency'; currency: string }
    | { type: 'percent'; options?: Omit<Intl.NumberFormatOptions, 'style'> }
    | { type: 'date'; options?: Intl.DateTimeFormatOptions };
