import { test, expect } from '@playwright/test';

test.beforeEach('simple Dialog', async ({ page }) => {
    await page.goto('https://testautomationpractice.blogspot.com/#');
    await page.waitForLoadState();
});    

test('simple Dialog', async ({ page }) => {
    // page.once('dialog', dialog => {
    //     console.log(`Dialog message: ${dialog.message()}`);
    //     dialog.dismiss().catch(() => {});
    // });  without listener, playwright will automatically DISMISS dialog
    
    
    // await page.getByRole('button', { name: 'Simple Alert' }).click();
    // const alertBtm = page.locator('#alertBtn');
    const alertBtm = page.getByText('Simple aleRT');  // NOT case sentetive!!!!!!!!
    await alertBtm.click();  // P
});

test('Confirmation Dialog - OK', async ({ page }) => {
    const confirmationAlert = page.locator('#confirmBtn');
    page.on('dialog', async (dialog) => {
        await dialog.accept();
    } )
    confirmationAlert.click();
    await expect(page.getByText('You pressed OK!')).toBeVisible();
});

test('Confirmation Dialog - Cancel', async ({ page }) => {
    const confirmationAlert = page.locator('#confirmBtn');
    // page.on('dialog', async (dialog) => {
    //     await dialog.dismiss();
    // } )   ////////// without listener, playwright will automatically DISMISS dialog
    confirmationAlert.click();
    await expect(page.getByText('You pressed Cancel!')).toBeVisible();
});

test('Input Dialog - OK', async ({ page }) => {
    const inputAlert = page.locator('#promptBtn');
    page.on('dialog', async (dialog) => {
        await dialog.accept("Slava");
    } )
    inputAlert.click();
    await expect(page.getByText('Hello Slava! How are you today?')).toBeVisible();
});

test('Input Dialog - Cancel', async ({ page }) => {
    const inputAlert = page.locator('#promptBtn');
    page.on('dialog', async (dialog) => {
        await dialog.dismiss();
    } )
    inputAlert.click();
    await expect(page.getByText('User cancelled the prompt.')).toBeVisible();
});