import { expect, type Locator, type Page } from '@playwright/test';

/**
 * O item de modo (claro/escuro) da barra da prévia do painel. No padrão o modo mora no ⚙ da barra, não fixo nela: abre o
 * menu, devolve o item pelo nome que ele mostra e deixa o fechamento para `closePreviewMenu`.
 */
export const openPreviewModeItem = async (page: Page, name: 'Modo Claro' | 'Modo Escuro'): Promise<Locator> => {
    const gear = page.locator('.sarak-device-desktop [data-sarak-widget="preferences-menu"]').getByRole('button').first();
    await gear.click();
    const item = page.getByRole('menu', { name: 'Preferências' }).getByText(name, { exact: true });
    await expect(item).toBeVisible();
    return item;
};

/** Fecha o menu ⚙ aberto (o item de modo não o fecha sozinho). */
export const closePreviewMenu = async (page: Page): Promise<void> => {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu', { name: 'Preferências' })).toHaveCount(0);
};

/** Troca o modo da prévia pelo menu ⚙: `name` é o que o item mostra ANTES do clique. */
export const switchPreviewMode = async (page: Page, name: 'Modo Claro' | 'Modo Escuro'): Promise<void> => {
    const item = await openPreviewModeItem(page, name);
    await item.click();
    await closePreviewMenu(page);
};
