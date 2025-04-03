import { test, expect } from '@playwright/test';

test('drag & drop', async ({ page }) => {
    await page.goto('https://testautomationpractice.blogspot.com/#');
    await page.waitForLoadState();
    // const dragFrom = page.getByText('Drag me to the target');
    // const dropTo = page.getByText('Drop here');
    // and
    // const dragFrom = page.locator('text=Drag me to my target');
    // const dropTo = page.locator('text=Drop here');
    // not working, cause my target elements are inside nested elements like div and p

    const dragFrom = page.locator('#draggable');
    const dropTo = page.locator('#droppable');

    await dragFrom.waitFor({ state: 'visible' });
    await dropTo.waitFor({ state: 'visible' });
    await dragFrom.scrollIntoViewIfNeeded();
    await dropTo.scrollIntoViewIfNeeded();

    await dragFrom.dragTo(dropTo);
    await dropTo.waitFor({ state: 'visible' });
    await dropTo.scrollIntoViewIfNeeded();
    await page.pause();
    console.log(await dropTo.innerText());
    expect(await dropTo.innerText() === 'Dropped!').toBeTruthy();
    expect(dropTo).toHaveText('Dropped!');
    
    // const dropToText = await dropTo.innerText();
    // console.log(dropToText);  // Debugging output
    // expect(dropToText === 'Dropped!').toBeTruthy(); 
});