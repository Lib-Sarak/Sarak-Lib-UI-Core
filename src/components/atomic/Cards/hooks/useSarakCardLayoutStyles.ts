/** Classes estruturais do cartão, com intervalo governado pelo token de espaçamento existente. */
export const useSarakCardLayoutStyles = (): string =>
    'flex flex-col gap-[var(--sarak-card-padding-md,var(--theme-card-padding,0))]';
