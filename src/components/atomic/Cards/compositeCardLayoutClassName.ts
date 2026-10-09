/** Classes estruturais do cartão composto, com intervalo governado pelo token de espaçamento existente. */
export const compositeCardLayoutClassName = (): string =>
    'flex flex-col gap-[var(--sarak-card-padding-md,var(--theme-card-padding,0))]';
