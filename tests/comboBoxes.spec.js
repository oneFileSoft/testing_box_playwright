import { test, expect } from '@playwright/test';
//await page.locator('//input[@type="text"]').count();
test('test ---', async ({ page }) => {
  // await page.goto('https://freelance-learn-automation.vercel.app/signup');
  // await page.locator('#gender2').check();
  // await page.locator('#gender1').check();
  // // await page.getByRole('checkbox', { name: 'PWS' }).check();

  // await page.getByRole('textbox', { name: 'Name' }).fill('aa');
  // await page.getByRole('textbox', { name: 'Email' }).fill('eee');
  // await page.getByRole('textbox', { name: "password" }).fill('ddd');
  // await page.waitForTimeout(2000);
  // await page.locator('#state').selectOption({value:'Kerala'});
  // await page.waitForTimeout(2000);
  // await page.locator('#state').selectOption({index:4});
  // await page.waitForTimeout(2000);
  // await page.locator('#hobbies').selectOption(['Singing', 'Dancing']);
  // await page.waitForTimeout(2000);
  // await page.getByRole('checkbox', { name: 'Java' }).check();
  // await page.waitForTimeout(2000);
  // const btnSbmt = "//button[normalize-space()='Sign up']";
  // await page.click(btnSbmt);

  await page.goto('https://arbatrade.us/');
  await page.getByRole('img', { name: 'Contact' }).click();
  await page.getByRole('combobox').selectOption('val.korytny@arbatrade.us');
  await page.getByRole('combobox').selectOption({value:"vitzislav.plakhin@arbatrade.us"});
  await page.getByRole('combobox').selectOption({index:1}); 
  const comboIndexes = await page.getByRole('combobox').textContent();
  expect (comboIndexes).toContain("Return");
  if (comboIndexes.includes("Return")) {
    console.log("yes---------");
  }
  await page.getByRole('combobox').selectOption({label:"Return & Shipping"}); 
  await page.waitForTimeout(2000);
 
  // getting counter of all input fields, and verifying it's = 4 
  const inpFields = await page.locator('//input[@type="text"]').count();
  expect (inpFields).toBe(3); //(0, 1, 2, 3)
  console.log("number ot text fields wit htype=text:" + inpFields);

  //running trough all values of ComboBox
  // let chkBox = await page.getByRole('combobox');  // Await the element handle
  let comboBox = page.locator("//select[@name='email']");  // Await the element handle
  if (!comboBox) {
    console.log("comboBox is not identified on the page");
  }
  
  let allElements = await comboBox.allTextContents(); // return all values as 1 text
  console.log("all elements: " + allElements);
  allElements = await comboBox.locator('option').allInnerTexts();
  
  for (let i = 0; i < allElements.length; i++) { 
    console.log("element value: " + allElements[i]);
  }

  await page.getByRole('button', { name: 'submit' }).click();

  const msgBox = page.locator(".Toastify__toast").first();
  await msgBox.waitFor(); // Ensures it's visible before extracting text
  const messageText = await msgBox.textContent();
  console.log("message=" + messageText);
  expect(messageText.includes("fill out all required fields")).toBeTruthy();
  //https://playwright.dev/docs/api/class-keyboard
  const txtArea = "textarea[name='message']";
  await page.locator(txtArea).fill("abcdefg");
  await page.keyboard.press("Meta+A");
  await page.keyboard.press("Meta+C");
  await page.keyboard.press("Backspace");
  const textNow = await page.locator(txtArea).textContent();
  expect (textNow==="").toBeTruthy();
  await page.keyboard.press("Meta+V");
  const textNow1 = await page.locator(txtArea).textContent();
  expect (textNow1==="abcdefg").toBeTruthy();

  page.on('dialog', async (dialog) => {
    console.log("Dialog detected:", dialog.message());
    await dialog.accept("Playwright was here!"); // Auto-handle prompt
  });
  // console.log("Before alert...");
  // await page.evaluate(() => alert("This is an alert!"));
  // console.log("After alert...");

});

test('Work with multiple tabs', async ({ browser }) => {
  // Open first tab (context.newPage())
  const page_1 = await browser.newPage();
  await page_1.goto('https://example.com');
  console.log('Opened Tab 1');
//////////////////////////////////////////////////////////////////////////////////////////
  // Open second tab staticaly, by adding tab to browser
  const page2 = await browser.newPage();
  await page2.goto('https://playwright.dev');
  console.log('Opened Tab 2');
  console.log('New tab URL:', page2.url());

//   // here, if 2nd tab been open from clicking on some icon,
//   // in order to handle 2nd tab we'll need to solve Promise
//   ///////////// with 2 tabs
//   const [page2] = await Promise.all([
//     page_1.waitForEvent('page'),  //  or popup if it will be in pop-up window
//     page_1.click('a[target="forExampleFacebookIcon"]') // Click link on page_1 -> that opens a new tab 
//   ]);
///////////////////////////////////////////////////////////////////////////////////////////
  
  await page2.waitForLoadState(); // !!!!!!!!!!!!!!!   waits till DOM been loaded !!!!!!!!!!!!!!
  // Perform actions in second tab
  const title2 = await page2.title();
  console.log('Tab 2 Title:', title2);
  expect(title2).toContain('Playwright');

  // Switch back to first tab
  const title1 = await page1.title();
  console.log('Tab 1 Title:', title1);
  expect(title1).toContain('Example');

  // Close second tab
  await page2.close();
 
  // Verify first tab is still open
  expect(await page1.title()).toContain('Example');
});