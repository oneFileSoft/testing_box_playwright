import { test, expect } from '@playwright/test';

test('Adding item to cart wit hcart verification', async ({ page }) => {
    await test.step("step#1: navigate to website", async() => {
        await page.goto('https://saucedemo.com/');
        await page.waitForLoadState();
    });
    await test.step("step#2: login to website", async() => {
        await page.locator("#user-name").fill("standard_user");
        await page.locator("#password").fill("secret_sauce");
        await page.locator("#login-button").click();
    });

    let firstItemName = ""
    await test.step("step#3: adding item to the cart", async() => {
        firstItemName = await page.locator("#item_4_title_link").innerText(); //getting name of the added Item
        await page.locator("#add-to-cart-sauce-labs-backpack").click(); // going to cart
    });

    await test.step("step#4: checking the item-name in the cart", async() => {

        await page.locator(".shopping_cart_link").click();//going to cart
        await page.waitForLoadState();

        const itemInTheCart = await page.locator(".inventory_item_name").innerText();

        expect (itemInTheCart === firstItemName).toBeTruthy();
    });


});