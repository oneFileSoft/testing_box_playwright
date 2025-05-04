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
  expect (page.getByRole('heading', { name: 'Add Expense for test' })).toBeVisible(); 
  // await page.waitForFunction(() => sessionStorage.getItem("user") !== null); 
  const data = await utils.getSessionStorage(page, "user");
  expect (data.user).toContain("test__46");
});

/******************************************************/
/**************** API tests ***************************/
/******************************************************/


//{"success":true,"expenses":[{"id":159,"userId":46,"transDescr":"descriptions 2 for Test","transDate":"2025-05-02T12:33:48.000Z","transTotal":83.73},{"id":131,"userId":46,"transDescr":"descriptions 1 for Test","transDate":"2025-05-02T12:33:33.000Z","transTotal":107.81}]}
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
    if (expenseItem.transDescr === "descriptions 1 for Test") {
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

/*****************************************************************/
/*****************************************************************/
/*********************** End To End API **************************/
/*****************************************************************/
/*****************************************************************/
async function findMatchInDataSet(request, endpoint, dataKey, fieldName, expectedValue, additionalKeyValuesToPrint = undefined ) {
  const confirmResp = await request.get(endpoint);
  const confirmBody = await confirmResp.json();
  console.log("  --- "+confirmBody.toString());
  const records = confirmBody[dataKey];
  console.log("  --- checking if "+dataKey+"."+fieldName+" contain: " + expectedValue);
  console.log(`  --- Number of ${dataKey} = ${records.length}`);
  const found = records.some(item => item[fieldName] === expectedValue);
  console.log(`  --- ExpectedValue(${expectedValue}) found in ${dataKey}.${fieldName} = ${found}`);
  let arrAdditionals = [];
  if (additionalKeyValuesToPrint !== undefined) {
       arrAdditionals = additionalKeyValuesToPrint.split(",");
  }
  for (let i = 0; i < records.length; i++) {
    let line = "  --- #" + i + " " + fieldName + ": " + records[i][fieldName];
    for (let j = 0; j < arrAdditionals.length; j++) {
      line += " | "+ arrAdditionals[j] + ": " + records[i][arrAdditionals[j]];
    }
    console.log(line);
  }
}
//res.status(200).json({ success: true, message: "User expenses include " + transDescr + " for the amount + " + transTotal + " inserted successfully!"
test('Api test --- INSERT(Post) - GET(get) - DELETE(Delete) by GIU', async ({ page, request }) => {
  let generatedId = 0;
  const myNumb = parseFloat(`${utils.getRandomInt()}.${utils.getRandomInt()}`);
  const transDecr = "Test from Playwright " + myNumb;
  await page.evaluate(() => sessionStorage.clear());
  await findMatchInDataSet(request, "/getExpenses?userId=45", "expenses", "transDescr", transDecr);

  await test.step("step#1: INSERT new activities by API", async() => {
    console.log("Step#1 - insert to user = Test (45) new expence record: " + transDecr);
    const response = await request.post('/insertExpense', {
      data: {
        userId: '45',
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
    console.log("Step#1 - For sake of imidiate verification of correctness of working [/insertExpense API],");
    console.log("      will verify just inserted record with [/getExpenses API] specifically for taransDescr="+transDecr)
      // const confirmResp = await request.get(`/getExpenses?userId=45`);
      // const confirmBody = await confirmResp.json();
      // const inserted = confirmBody.expenses.some(item => item.transDescr === transDecr);
      // console.log("Step#1 - umber transDescr ["+transDecr+"] is found: " + inserted);
      // expect(inserted).toBe(true); 
    await findMatchInDataSet(request, "/getExpenses?userId=45", "expenses", "transDescr", transDecr);
  });

  await test.step("Step#2: Checking inserted activities available with GET-API (with 3 loops)", async() => {
    const endpoint = "/getExpenses?userId=45";
    const resp = await request.get(endpoint); 
    expect (resp.status()).toBe(200);
    const body = await resp.json();
    // example of JSON:  body.expenses[0].userId, body.expenses[0].transDescr
    console.log("Step#2 - for demo purpose, looking for generatedId and transDescr in 3 type of loops");
    console.log("Step#2 - loop1:   for (const expenseItem of body.expenses) {...}");
    let expenceFound = false;
    for (const expenseItem of body.expenses) {
      if (expenseItem.id == generatedId && expenseItem.transDescr === transDecr) {
        expenceFound = true;
        break;
      }
    }    
    expect(expenceFound).toBe(true);
    
    console.log("Step#2 - loop2:   body.expenses.forEach(expenseData => {...}");
    expenceFound = false;
    body.expenses.forEach(expenseData => {
      if (expenseData.id == generatedId && expenseData.transDescr === transDecr) {
        expenceFound = true;
      }
    });
    expect(expenceFound).toBe(true);

    console.log("Step#2 - loop3:   for (let i = 0; i < body.expenses.length; i++) {...}");
    for (let i = 0; i < body.expenses.length; i++) {
      if (body.expenses[i].id == generatedId && body.expenses[i].transDescr === transDecr) {
        expenceFound = true;
        break;
      }
    }
    expect(expenceFound).toBe(true);
    console.log("Step#2 - expected expence is found = " + expenceFound);
  });

  await test.step("step#3: Verification of new activities appearance from GUI", async () => {
    console.log("Step#3 - loggin into the system with John credentials to see added record");
    // Inject login debugger
    await page.route('/login', async (route, request) => {
    const postData = request.postDataJSON();
    console.log('🎯 Intercepted /login payload:', postData);
    route.continue();
    });
    //clicking between component to reset SessionStorage in natural way
    await page.getByRole('img', { name: 'Storage' }).click();
    await page.getByRole('img', { name: 'Home' }).click();
    await page.evaluate(() => {
      if (typeof window.loadTable === 'function') {
        window.loadTable();
      }
    });
    await page.waitForLoadState('networkidle');
    await page.getByRole('img', { name: 'User-DB' }).click();
    await page.locator('#uname').fill('John');
    await page.locator('#passw').fill('John');

    console.log("Step#3 - block to wait with login tracking");
    const [loginResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/login') && res.status() < 500),
      page.getByRole('button', { name: 'Authenticate' }).click()
    ]);

    const loginRequest = loginResponse.request();
    const requestBody = loginRequest.postDataJSON();
    const responseBody = await loginResponse.json();

    console.log('🔐 Login request payload:', requestBody);
    console.log('📬 Login response payload:', responseBody);

    const sessionUser = await utils.getSessionStorage(page);
    console.log("Step#3 - sessionStorage.user:", sessionUser.user);
    expect(sessionUser.user).toContain("John__45");

    await page.waitForSelector('tr td:first-child'); 
    await expect(page.locator('tr td:first-child').first()).toBeVisible();

      console.log("Step#3 - wait-for-text block");
      let foundDecription = false;
      const waitInterval = 400;
      let tries = 0;
      while (!foundDecription && tries < 10) {
        const activityTexts = await page.locator('tr td:first-child').allTextContents();
        console.log(`[Try #${tries}] Found rows:`, activityTexts);
        if (activityTexts.includes(transDecr)) {
          console.log("✅ Found inserted description: " + transDecr);
          foundDecription = true;
          break;
        }
        await page.waitForTimeout(waitInterval); // equvalent of sleep in milliseconds
        tries++;
      }
              //   const rows = page.locator('tbody tr');
              //   const rowCount = await rows.count();
              //   console.log("Step#3 - total number of records: " + rowCount);
              //   const row = rows.nth(0);
              //   const column0 = await row.locator('td').nth(0).innerText();
              //   const column1 = await row.locator('td').nth(1).innerText();
              //   console.log("Step#3 - -----1st row: " + column0 + " " + column1);
              //   // ///////  just another way to browse trough table:
              //   // //////////////////////    collecting 1st column to array   /////////////////////
              //   // const activityTexts = await page.locator('tr td:first-child').allTextContents();
              //   // let foundDecription = false;
              //   // activityTexts.forEach((text) => {
              //   //   if (text === transDecr) { 
              //   //     foundDecription = true;
              //   //   }
              //   // });
              //   // if (! foundDecription) {
              //   //   for (let i = 0; i < activityTexts.length; i++) {
              //   //     if (activityTexts[i]  === transDecr) {
              //   //       foundDecription = true;
              //   //       break;
              //   //     }
              //   //   }
              //   // }
      console.log("Step#3 - After loop: Found inserted description: " + foundDecription);
      expect(foundDecription).toBe(true);
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
    console.log("Step#4 - total number of records before I clicked on Delete button: " + rowCount);
    console.log("Step#4 - going to loop trough rows of table to find new transDesr");

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const descr = await row.locator('td').nth(0).innerText(); // first column (Description)
      // const amount = await row.locator('td').nth(1).innerText(); // second column (Amount)
      // const date   = await row.locator('td').nth(2).innerText(); // third column (Date)
      if (descr === transDecr) {
        console.log("Step#4 in the loop of rows, found match of descriptions: " + transDecr);
        page.once('dialog', dialog => {
          //        OK                           Cancel
          console.log("Step#4 - [delete] button clicked, we are in confurmation Dialog to accept it");
          dialog.accept().catch(() => {});// dialog.dismiss().catch(() => {});
        });
        // await row.locator('td').nth(3).getByRole('button', { name: /delete/i }).click();
        // await page.getByRole('row', { name: 'Test from Playwright 35.19 35' }).getByRole('button').click();
        // await page.locator('tr').filter({ hasText: transDecr }).locator('button').click();
        // await page.locator('tr:has-text("Test from Playwright 35.19")').locator('button').click();
        await page.locator(`tr:has-text("${transDecr}")`).locator('button').click();
        break;
      }
    }
    await page.getByRole('img', { name: 'Home' }).click();
  }); 
 
  await test.step("step#5: Verification of new activities is GONE from GIU!", async() => {
    console.log("Step#5 - re-loging wit hJohn's credentioal to confirm record is gone");
    await page.getByRole('img', { name: 'User-DB' }).click();
    await page.locator('#uname').fill('John');
    await page.locator('#passw').fill('John');
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await page.waitForLoadState('domcontentloaded');
    // very important to wait bfere table will load to GUI
    await page.waitForSelector('tr td:first-child'); 
    console.log("Step#5 - collecting 1st column 'Descriptions' to array");
    const activityTexts = await page.locator('tr td:first-child').allTextContents();
    let foundDecription = false;
    activityTexts.forEach((text) => {
      if (text === transDecr) foundDecription = true;
    });
    console.log("Step#5 - confirming that transDescr is not found " + (!foundDecription));
    expect (foundDecription).toBe(false);
    await page.getByRole('img', { name: 'Home' }).click();
  });

  await test.step("step#6: Verification of new activities is GONE by API-Get", async() => {
    console.log("Step#6 - using /getExpenses API to confirm it not returning deleted record");
    const endpoint = "/getExpenses?userId=45";
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
        userId: '45',
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
    const endpoint = "/getExpenses?userId=45";
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
        userId: 45,
        transDescr: transDecr
      }
    });
  
    const respBody = await response.json();
  
    expect(response.status()).toBe(200);
    expect(respBody.success).toBe(true);
    expect(respBody.message).toBe("Expense deleted successfully");
  }); 
 
  await test.step("step#4: Verification of new activities is GONE by API-Get", async() => {
    const endpoint = "/getExpenses?userId=45";
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