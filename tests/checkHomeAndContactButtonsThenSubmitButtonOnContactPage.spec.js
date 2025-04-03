import { test, expect } from '@playwright/test';

test('Verify home and contact icons are present', async ({ page }) => {
    // 1. Open the website
    await page.goto('https://arbatrade.us');
    expect(await page.title()).toContain('Arbatrade');
    // 2. Check that the Home icon is visible
    // const homeIcon = page.locator('.bar-icon.w-8.h-8.cursor-pointer.dim-icon');
    // await expect(homeIcon).toBeVisible();
    await expect (page.getByAltText('Home')).toBeVisible()	
    await expect(page.locator('.bar-icon.w-8.h-8.cursor-pointer.dim-icon')).toBeVisible();


    // 3. Check that the Contact icon is visible, and then clicks on it and check Submit button
    const contactXPath = '//*[@id="root"]/div/header/div/img[2]'
    await page.waitForSelector(contactXPath, { timeout: 10000 }); // Wait for contact icon
    await expect(page.locator(contactXPath)).toBeVisible();
    await page.click(contactXPath);
    
    await expect(page.locator('//*[@id="root"]/div/main/div/div/div/form/table/tr[4]/td/button')).toBeVisible(); // checking submit button
    //on page load placeholders are empty
    const inputElement = await page.locator('input[name="firstName"]');
    let placeholderValue = await inputElement.getAttribute('placeholder');
    expect(placeholderValue).toBe(null);

    await page.click('button[type="submit"]');

    placeholderValue = await inputElement.getAttribute('placeholder');
    expect(placeholderValue).toBe('First name is required');
    //filling some data
    await inputElement.fill('John Doe');
    placeholderValue = await inputElement.getAttribute('value');
    expect(placeholderValue).toBe("John Doe");
});
