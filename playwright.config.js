// installation: npm init playwright@latest
// ✅✅✅ page.locator() ✅✅✅
// page.locator('#myId');            // Select by ID
// page.locator('.myClass');         // Select by class
// page.locator('[data-test="btn"]'); // Select by custom attribute
// page.locator('button');           // Select by tag name
// page.locator('button:has-text("Click Me")'); // Select by text inside button

    // await expect(myButton).toBeVisible();
    // await expect(myButton.isVisible()).toBeTruthy();

//     page.getByRole() to locate by explicit and implicit accessibility attributes.
// Element	    Use with getByRole()?	        How to Select?
// Button	    ✅ Yes	                         getByRole('button', { name: 'Click Me' })
// Link	      ✅ Yes	                         getByRole('link', { name: 'Home' })
// Text Input	✅ Yes	                         getByRole('textbox', { name: 'Username' })
// Checkbox	  ✅ Yes	                         getByRole('checkbox', { name: 'I agree' })
// Label	    ❌ No	                         Use getByLabel('Label Text') instead
// Textarea	  ✅ Yes	                         getByRole('textbox')
// Image	    ✅ Yes	                         getByRole('img', { name: 'Profile picture' })


// page.getByText() to locate by text content.
// page.getByLabel() to locate a form control by associated label's text.
// page.getByPlaceholder() to locate an input by placeholder.
// page.getByAltText() to locate an element, usually image, by its text alternative.
// page.getByTitle() to locate an element by its title attribute.
// page.getByTestId() to locate an element based on its data-testid attribute (other attributes can be configured).
// Method	                              Finds Elements Based On...	              Works On These Elements
// ✅✅✅getByText('Text')✅✅✅ Visible text content	✅✅✅Any element with text (div, span, button, link, etc.)✅✅✅
//                                                                                  !!! not case sencetive !!!!
// getByLabel('Label Text')	               <label> associated with a form control	  <input>, <textarea>, <select>
// getByPlaceholder('Placeholder Text')	   placeholder="..." attribute	            <input>, <textarea>
// getByAltText('Alt Text')	               alt="..." attribute	                    <button>, <img>, <area>
// getByTitle('Title Text')	               title="..." attribute	                  Any element with title
// getByTestId('test-id')	                 data-testid="..." attribute	            Any element with data-testid

// await page.getByLabel('User Name').fill('John');
// await page.getByLabel('Password').fill('secret-password');
// await page.getByRole('button', { name: 'Sign in' }).click();
// await expect(page.getByText('Welcome, John!')).toBeVisible();
    // await expect (page.getByAltText('Home')).toBeVisible()	
    // await expect(page.locator('.bar-icon.w-8.h-8.cursor-pointer.dim-icon')).toBeVisible();
// await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
// await page.getByRole('checkbox', { name: 'Subscribe' }).check();
// await page.getByRole('button', { name: /submit/i }).click();
// await page.getByLabel('Password').fill('secret');
// expect(await page1.title()).toContain('Example');
// expect (textNow1==="abcdefg").toBeTruthy();
//   const msgBox = page.locator(".Toastify__toast").first();
//   await msgBox.waitFor(); // Ensures it's visible before extracting text
//   const messageText = await msgBox.textContent();
// await page.getByRole('combobox').selectOption({value:"vitzislav.plakhin@arbatrade.us"});
// await page.getByRole('combobox').selectOption({index:1}); 
//<div class ="abcd" ></div>            .abcd     or   div[class="absd"]
//<button id="myId"> Submit </button>   #myId     or   button[id="myId"]   
//<input type="text" name="uName">                     input[name="uName"]
//<p>my text!!</p>  <h1>testing</h1>     p   */}

// await page.getByTestId('inventory-item')
//          .filter(has:page.getByRole('link',{name: 'T-short'})
//           .click()

// const { defineConfig } = require('@playwright/test');


//const isDocker = process.env.IS_DOCKER === 'true'; //setUp from Dockerfile . ENV




import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: "tests/",
  reporter: [['html'],
             ['junit', { outputFile: 'test-results/junit-test-result.xml' }] ],
  timeout: 30000, //global timeout for running tests... if it runs more - fail the test
  expect:{ timeout: 5000 }, 
  fullyParallel: true,
  workers: 2,
  retries:2,
  //use: {testidAttribute: 'data-test'},
  projects: [ 
    {
      name: 'chromium',
      use: { 
         browserName: 'chromium', 
         video: "retain-on-failure",
         trace: "retain-on-failure",
         screenshot: "on-first-failure"
         
        }
    }
    //,{ name: 'firefox', use: { browserName: 'firefox' }, trace: "retain-on-failure" },
    // { name: 'webkit',  use: { browserName: 'webkit' }, trace: "retain-on-failure" },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ]
 
  // brew install allure  //Reporter to use. See https://playwright.dev/docs/test-reporters
  // npm install -D allure-playwright
  // allure generate ./allure-results -o ./allure-report
  // allure open ./allure-report
  // reporter: [['html'], ['allure-playwright']], 

  //,webServer: {   // Run your local dev server before starting the tests
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

