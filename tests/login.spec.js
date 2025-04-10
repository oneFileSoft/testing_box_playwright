const { test, expect } = require('@playwright/test');

test('test 1 - some experiments', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  expect(await page.title()).toContain('OrangeHRM');
  let btnUpgrade = await page.getByRole('button', { name: 'Upgrade' });  //!!!!!!!!!!!
  btnUpgrade = await page.getByRole('button[name="Upgrade"]');//alternative identificator !!!!!!!!!1
  await expect(btnUpgrade).not.toBeVisible(); // checking NOT-VISIBLE
  await page.getByRole('textbox', { name: 'UserName' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  // NOT NESSESARY to refetch locator of btnUpgrade cause it's life reference (pointer)
  await expect(btnUpgrade).toBeVisible();    // checking VISIBLE - bit more relible way
  await expect(btnUpgrade.isVisible()).resolves.toBeTruthy();  // checking VISIBLE !!
  //same but with locator:
  const buttonUpgrade = page.locator("//button[normalize-space()='Upgrade']");//relative X-Path  !!!!!!!!!!
  await expect(buttonUpgrade.isVisible()).toBeTruthy();
  const buttonUpgradeByText = page.getByText("Upgrade");//relative X-Path  !!!!!
  await expect(buttonUpgradeByText).toBeVisible();

				

  let currentUrl = await page.url();
  console.log("url in profile: " + currentUrl);
  expect(currentUrl).toContain('ashboard');

  const profileButton = '//*[@id="app"]/div[1]/div[1]/header/div[1]/div[3]/ul/li/span/i';
  await page.click(profileButton);
  await page.getByRole('menuitem', { name: 'logoUt' }).click();  // NOT CASE Sencetive!!!!
  //   await page.getByText('LogouT').click();                   // NOT CASE Sencetive!!!!
  currentUrl = page.url();
  console.log("url logged-out profile: " + currentUrl);
  expect(currentUrl).toContain('login');

 });

 test('test bad login', async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.viewportSize
    expect(await page.title()).toContain('OrangeHRM');
    const uN = await page.locator('input[placeholder="Username"]');
    await uN.fill('Admin');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin12mmmmmmm3');
    await page.getByRole('button', { name: 'Login' }).click();
    const erMsg = await page.getByText('Invalid credentials').innerHTML();
    console.log("err = " + erMsg);
    expect (erMsg).toMatch(/Invalid credentials/); 
    expect (erMsg.includes("Invalid")).toBeTruthy();
    expect (erMsg==="Invalid credentials").toBeTruthy();
   });

test.skip('test snapshot example', async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  
    // Get the Upgrade button locator
    let btnUpgrade = page.getByRole('button', { name: 'Upgrade' });
  
    // Store the initial visibility state as a fixed snapshot
    const wasVisible = await btnUpgrade.isVisible();
    console.log('Before login - Is Upgrade visible?:', wasVisible);
  
    // Store the initial text content as a fixed snapshot
    const initialText = await btnUpgrade.innerText();
    console.log('Before login - Upgrade button text:', initialText);
  
    // Perform login
    await page.getByRole('textbox', { name: 'UserName' }).fill('Admin');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
  
    // The locator is still live, but our stored values remain unchanged
    console.log('After login - Is Upgrade visible?:', await btnUpgrade.isVisible());
    console.log('After login - Upgrade button text:', await btnUpgrade.innerText());
  
    // Assert the Upgrade button was initially hidden
    expect(wasVisible).toBeFalsy();
  
    // Assert the text of the Upgrade button did not change after login
    expect(initialText).toBe('Upgrade'); // Change expected text if needed
  });
