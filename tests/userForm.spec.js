import { test, expect } from '@playwright/test';
import utils from './utils';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  console.log(' ***********************    Current URL: ', page.url());
  await page.waitForLoadState();
});

test('negative - User obey 25 characters lenght', async ({ page }) => {
  await page.getByRole('img', { name: 'User-DB' }).click();
  await page.locator('#uname').fill('asdfghjklqwertyuiop01234567890');
  await page.locator('#passw').fill('test');
  const fieldText = await page.locator('#uname').inputValue();
  expect (fieldText).toBe("asdfghjklqwertyuiop012345"); 
});

test('Wrong User name', async ({ page }) => {
  await page.getByRole('img', { name: 'User-DB' }).click();
  await page.locator('#uname').fill('test1');
  await page.locator('#passw').fill('test');
  await page.getByRole('button', { name: 'Authenticate' }).click();
  
  const messageText = await utils.getTextFromToast(page);
  expect (messageText).toContain("Error during login: Invalid username or password");
  expect (await page.getByRole('textbox', { name: 'Description' })).toBeHidden();
});

test('Wrong password', async ({ page }) => {
  await page.getByRole('img', { name: 'User-DB' }).click();
  await page.locator('#uname').fill('test');
  await page.locator('#passw').fill('test1');
  await page.getByRole('button', { name: 'Authenticate' }).click();

  const messageText = await utils.getTextFromToast(page);
  expect (messageText).toContain("Error during login: Invalid username or password");  
  expect (await page.getByRole('textbox', { name: 'Description' })).toBeHidden();
  const data = await utils.getSessionStorage(page);
  expect (data.user).toBeUndefined();
});

test('Authenticate existing User', async ({ page }) => {
  await page.getByRole('img', { name: 'User-DB' }).click();
  await page.getByRole('textbox', { name: 'Your User Name' }).fill('test');
  await page.getByRole('textbox', { name: 'Your User Name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Your Password' }).fill('test');
  await page.getByRole('textbox', { name: 'Your Password' }).press('Tab');
  await page.getByRole('button', { name: 'Authenticate' }).click();
  await page.waitForLoadState('domcontentloaded');

  await page.getByRole('textbox', { name: 'Description' }).fill('');
  expect (await page.getByRole('textbox', { name: 'Description' })).toBeVisible();

  expect (await page.getByPlaceholder('Total Amount')).toBeVisible();
  expect (await page.locator('input[type="date"]')).toBeVisible();
  //following, because they have unique type - easy to capture by locator
  // expect (await page.locator('input[type="date"]').isVisible()).toBeTruthy();
  expect (await page.getByRole('heading', { name: 'Add Expense for test' })).toBeVisible(); 
  const data = await utils.getSessionStorage(page);
  expect (data.user).toContain("test__");
});

/******************************************************/
/**************** API tests ***************************/
/******************************************************/


//{"success":true,"expenses":[{"id":56,"userId":46,"transDescr":"nothing","transDate":"2025-03-01T00:00:00.000Z","transTotal":5},{"id":55,"userId":46,"transDescr":"nothing1","transDate":"2025-01-30T00:00:00.000Z","transTotal":80}]}
test('Api test --- GET', async ({ request }, testInfo) => {
  const endpoint = "/getExpenses?userId=46";
  const resp = await request.get(endpoint); 

  // Get baseURL from test info config
  const baseURL = testInfo.project.use.baseURL;
  console.log(' ***********************    API - URL: ', `${baseURL}${endpoint}`);
  console.log("RESPONSE TEXT: ", await resp.text());
  expect (resp.status()).toBe(200);
  
  const text = await resp.text();
  console.log("text from GET: " + text);

  const bodyRaw = await resp.body();
  const body = bodyRaw.toString();
  const respBody =  JSON.parse(body);
  console.log("body from GET: " + body);
  // Access specific keys-values in respBody
  console.log("specific values from: respBody.expenses[0].userId=" + respBody.expenses[0].userId + 
    ", respBody.expenses[0].transDescr="+respBody.expenses[0].transDescr);
    console.log("respBody.expenses[0].transDescr = "+ respBody.expenses[0].transDescr );
  let descriptionFound = false;
  for (const expenseItem of respBody.expenses) {
    if (expenseItem.transDescr === "descriptions 1 for John") {
      descriptionFound = true;
      break;
    }
  }    
  expect(descriptionFound).toBeTruthy(); 
});

//res.status(404).json({ success: false, message: "User not found" })
test('Api test --- Post - INSERT - no User found', async ({ request }) => {
  const response = await request.post('/insertExpense', {
    data: {
      userId: '9999',
      transDescr: 'Test from Playwright',
      transTotal: '15.75',
      transDate: '2025-04-22T00:00:00-05:00'
    }
  });
  expect (response.status()).toBe(404);
  const body = await response.json();// Parse JSON body from response
  expect (body.success).toBe(false);  // Assert on the body
  expect (body.message).toBe("User not found");

});

//res.status(500).json({ success: false, message: "Error inserting user expences to DB", error: error.message });
test('Api test --- Post - INSERT - invalid amount', async ({ request }, testInfo) => {
  const response = await request.post('/insertExpense', {
    data: {
      userId: '46',
      transDescr: 'Test from Playwright',
      transTotal: 'abc',
      transDate: '2025-04-22T00:00:00-05:00'
    }
  });
  expect (response.status()).toBe(500);
  const body = await response.json();// Parse JSON body from response
  expect (body.success).toBe(false);  // Assert on the body
  expect (body.message).toBe("Error inserting user expences to DB");
});




//res.status(200).json({ success: true, message: "User expenses include " + transDescr + " for the amount + " + transTotal + " inserted successfully!"
test('Api test --- INSERT(Post) - GET(get) - DELETE(Delete) from GIU', async ({ page, request }) => {
  let generatedId = 0;
  const myNumb = parseFloat(`${utils.getRandomInt()}.${utils.getRandomInt()}`);
  const transDecr = "Test from Playwright " + myNumb;
  
  await test.step("step#1: INSERT new activities by API", async() => {
    console.log("decimal number using in test = " + myNumb);
    const response = await request.post('/insertExpense', {
      data: {
        userId: '46',
        transDescr: transDecr,
        transTotal: myNumb,
        transDate: '2025-04-22T00:00:00-05:00'
      }
    });
    expect (response.status()).toBe(200);
    const body = await response.json();// Parse JSON body from response
    expect (body.success).toBe(true);  // Assert on the body
    expect (body.message).toBe("User expenses include " + transDecr + " for the amount + " + myNumb + " inserted successfully!");
    generatedId = body.insertedId; // ✅ This is where the ID lives
  });

  await test.step("step#2: Checking inserted activities available with GET-API (with 3 loops)", async() => {
    const endpoint = "/getExpenses?userId=46";
    const resp = await request.get(endpoint); 
    expect (resp.status()).toBe(200);
    const body = await resp.json();
    // example of JSON:  body.expenses[0].userId, body.expenses[0].transDescr
    
    //loop#1
    let expenceFound = false;
    for (const expenseItem of body.expenses) {
      if (expenseItem.id == generatedId && expenseItem.transDescr === transDecr) {
        expenceFound = true;
        break;
      }
    }    
    expect(expenceFound).toBe(true);
    
    //loop#2
    expenceFound = false;
    body.expenses.forEach(expenseData => {
      if (expenseData.id == generatedId && expenseData.transDescr === transDecr) {
        expenceFound = true;
      }
    });
    expect(expenceFound).toBe(true);

    //loop#3
    for (let i = 0; i < body.expenses.length; i++) {
      if (body.expenses[i].id == generatedId && body.expenses[i].transDescr === transDecr) {
        expenceFound = true;
        break;
      }
    }
    expect(expenceFound).toBe(true);
  });

  await test.step("step#3: Verification of new activities appearence from GIU", async() => {
    await page.getByRole('img', { name: 'User-DB' }).click();
    await page.locator('#uname').fill('John');
    await page.locator('#passw').fill('John');
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await page.waitForLoadState('domcontentloaded');
    // very important to wait bfere table will load to GUI
    await page.waitForSelector('tr td:first-child'); 
    
    await expect(page.locator('tr td:first-child').first()).toBeVisible();

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(" total number of records before I delete on Delete button: " + rowCount);
    const row = rows.nth(0);
    const descr = await row.locator('td').nth(0).innerText();
    const descr1 = await row.locator('td').nth(1).innerText();
    console.log("-----1st row: "+ descr+" "+descr1);

    //////////////////////    collecting 1st column to array   /////////////////////
    const activityTexts = await page.locator('tr td:first-child').allTextContents();
    let foundDecription = false;
    activityTexts.forEach((text) => {
      // await expect(page.locator(`tr td:first-child`, { hasText: transDecr })).toBeVisible({ timeout: 5000 });

      if (text === transDecr) { 
        console.log("---------------------------------");
        foundDecription = true;
      }
    });
    if (! foundDecription) {
      for (let i = 0; i < activityTexts.length; i++) {
        if (activityTexts[i]  === transDecr) {
          foundDecription = true;
          break;
        }
      }
    }
    expect (foundDecription).toBe(true);
    await page.getByRole('img', { name: 'Home' }).click();
  });

  await test.step("step#4: Delete this activities from GIU (by: userId + id)", async() => {
    await page.getByRole('img', { name: 'User-DB' }).click();
    await page.locator('#uname').fill('John');
    await page.locator('#passw').fill('John');
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await page.waitForLoadState('domcontentloaded');
    // very important to wait bfere table will load to GUI
    await page.waitForSelector('tr td:first-child'); 
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(" total number of records before I clicked on Delete button: " + rowCount);
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const descr = await row.locator('td').nth(0).innerText(); // first column (Description)
      // const amount = await row.locator('td').nth(1).innerText(); // second column (Amount)
      // const date   = await row.locator('td').nth(2).innerText(); // third column (Date)
      if (descr === transDecr) {
        // Click the delete button inside this row (assuming it's in the 4th <td>)
        page.once('dialog', dialog => {
          // dialog.dismiss().catch(() => {});
          dialog.accept().catch(() => {});
        });
        // await row.locator('td').nth(3).getByRole('button', { name: /delete/i }).click();
        // await page.getByRole('row', { name: 'Test from Playwright 35.19 35' }).getByRole('button').click();
        // await page.locator('tr').filter({ hasText: transDecr }).locator('button').click();
        // await page.locator('tr:has-text("Test from Playwright 35.19")').locator('button').click();
        console.log("in the loop of rows, found match of descriptions: " + transDecr);
        await page.locator(`tr:has-text("${transDecr}")`).locator('button').click();
        break;
      }
    }
    await page.getByRole('img', { name: 'Home' }).click();
  }); 
 
  await test.step("step#5: Verification of new activities is GONE from GIU!", async() => {
    await page.getByRole('img', { name: 'User-DB' }).click();
    await page.locator('#uname').fill('John');
    await page.locator('#passw').fill('John');
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await page.waitForLoadState('domcontentloaded');
    // very important to wait bfere table will load to GUI
    await page.waitForSelector('tr td:first-child'); 
    // collecting 1st column to array
    const activityTexts = await page.locator('tr td:first-child').allTextContents();
    let foundDecription = false;
    activityTexts.forEach((text) => {
      if (text === transDecr) foundDecription = true;
    });
    expect (foundDecription).toBe(false);
    await page.getByRole('img', { name: 'Home' }).click();
  });

  await test.step("step#5: Verification of new activities is GONE by API-Get", async() => {
    const endpoint = "/getExpenses?userId=46";
    const resp = await request.get(endpoint); 
    expect (resp.status()).toBe(200);
    const body = await resp.json();
    // example of JSON:  body.expenses[0].userId, body.expenses[0].transDescr
    
    let expenceFound = false;
    for (const expenseItem of body.expenses) {
      if (expenseItem.id == generatedId && expenseItem.transDescr === transDecr) {
        expenceFound = true;
        break;
      }
    }    
    expect(expenceFound).toBe(false); 
  });

  console.log("API Insert-Get-Delete end-to-end test (Delete by GUI) is done!")
});

test('Api test --- INSERT(Post) - GET(get) - DELETE(Delete) by API', async ({ page, request }) => {
  let generatedId = 0;
  const myNumb = parseFloat(`${utils.getRandomInt()}.${utils.getRandomInt()}`);
  const transDecr = "Test from Playwright " + myNumb;
  
  await test.step("step#1: INSERT new activities by API", async() => {
    console.log("decimal number using in test = " + myNumb);
    const response = await request.post('/insertExpense', {
      data: {
        userId: '46',
        transDescr: transDecr,
        transTotal: myNumb,
        transDate: '2025-04-22T00:00:00-05:00'
      }
    });
    expect (response.status()).toBe(200);
    const body = await response.json();// Parse JSON body from response
    expect (body.success).toBe(true);  // Assert on the body
    expect (body.message).toBe("User expenses include " + transDecr + " for the amount + " + myNumb + " inserted successfully!");
    generatedId = body.insertedId; // ✅ This is where the ID lives
  });

  await test.step("step#2: Checking inserted activities available with GET-API", async() => {
    const endpoint = "/getExpenses?userId=46";
    const resp = await request.get(endpoint); 
    expect (resp.status()).toBe(200);
    const body = await resp.json();
    // example of JSON:  body.expenses[0].userId, body.expenses[0].transDescr......
    let expenceFound = false;
    for (const expenseItem of body.expenses) {
      if (expenseItem.id == generatedId && expenseItem.transDescr === transDecr) {
        expenceFound = true;
        break;
      }
    }    
    expect(expenceFound).toBe(true);
  });

  await test.step("step#3: Delete this activities from by API (by: userId + transDescr)", async() => {
    const response = await request.delete('/deleteExpense', {
      data: {
        userId: 46,
        transDescr: transDecr
      }
    });
  
    const respBody = await response.json();
  
    expect(response.status()).toBe(200);
    expect(respBody.success).toBe(true);
    expect(respBody.message).toBe("Expense deleted successfully");
  }); 
 
  await test.step("step#4: Verification of new activities is GONE by API-Get", async() => {
    const endpoint = "/getExpenses?userId=46";
    const resp = await request.get(endpoint); 
    expect (resp.status()).toBe(200);
    const body = await resp.json();
    // example of JSON:  body.expenses[0].userId, body.expenses[0].transDescr
    let expenceFound = false;
    for (const expenseItem of body.expenses) {
      if (expenseItem.id == generatedId && expenseItem.transDescr === transDecr) {
        expenceFound = true;
        break;
      }
    }    
    expect(expenceFound).toBe(false);  
  });

  console.log("API Insert-Get-Delete end-to-end test (Delete by API) is done!")
});