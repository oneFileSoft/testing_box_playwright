import { test, expect } from '@playwright/test';
import utils from './utils.js';


test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState();
  await page.getByRole('img', { name: 'Contact' }).click();
});

test('Prevention of Submit of Email, with all empty fields', async ({ page }) => {
    expect(await page.locator('input[name="firstName"]').inputValue()).toBe('');

    await page.locator('input[name="firstName"]').click();
    await page.getByText('Submit').click();
    expect(await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe("First name is required");
    expect(await page.locator('input[name="lastName"]').getAttribute('placeholder')).toBe("Last name is required");
    expect(await page.locator('input[name="yourWebsite"]').getAttribute('placeholder')).toBe("Your website is required");
    expect(await page.locator('input[name="yourEmail"]').getAttribute('placeholder')).toBe("Your email is required");
    expect(await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe("Message is required");

    await page.getByRole('textbox', { name: 'First name is required' }).click();
    await page.getByRole('textbox', { name: 'First name is required' }).fill('John');
    await page.getByRole('textbox', { name: 'Last name is required' }).click();
    expect(await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe("");
  });

  test('Empty FirstName, lastName and message lost fokus', async ({ page }) => {
    await page.locator('input[name="firstName"]').click();
    await page.locator('input[name="lastName"]').click();

    expect(await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe("First name is required");
    expect(await page.locator('input[name="lastName"]').getAttribute('placeholder')).toBe(null);
    await page.locator('textarea[name="message"]').click();
    expect(await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe("First name is required");
    expect(await page.locator('input[name="lastName"]').getAttribute('placeholder')).toBe("Last name is required");
    expect(await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe(null);
    await page.locator('input[name="firstName"]').click();
    expect(await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe("First name is required");
    expect(await page.locator('input[name="lastName"]').getAttribute('placeholder')).toBe("Last name is required");
    expect(await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe("Message is required");
    expect(await page.locator('input[name="yourWebsite"]').getAttribute('placeholder')).toBe(null);
    expect(await page.locator('input[name="yourEmail"]').getAttribute('placeholder')).toBe(null);
  });

  test('Only message is empty', async ({ page }) => {
    await page.locator('input[name="firstName"]').fill("John");
    await page.locator('input[name="lastName"]').fill("Smith");
    await page.locator('input[name="yourWebsite"]').fill("www.myWebsite.com");
    await page.locator('input[name="yourEmail"]').fill("jsmith@yahoo.com");

    await page.getByText('Submit').click();
    expect(await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe("Message is required");
    if (page.viewportSize()?.width && page.viewportSize()?.width < 768) {
      expect(page.getByText("Please, fill out all required fields!")).toBeVisible();
    } else {  
      expect(page.getByText("Please, fill out all required")).toBeVisible();
    }
  });

  test('Successfull Email send', async ({ page }) => {
    console.log("Filling required fielsd (all *), and selecting specific Email-To from combo-box");
    console.log("All available options: " + 
                `<select name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ width: "100%" }}>
                   <option value="test@testingbox.pw">General box: contact us</option>
                   <option value="test@testingbox.pw"> TestingBox email </option>
                   <option value="i_slava_i@yahoo.com"> Technical Support </option>
                </select>`);
    const fName = "J" + utils.getRandomInt() + "J";
    await page.locator('input[name="firstName"]').fill(fName);
    const lName = "S" + utils.getRandomInt() + "S"
    await page.locator('input[name="lastName"]').fill(lName);
    const webSite = "www.abc" + utils.getRandomInt() + ".com"
    await page.locator('input[name="yourWebsite"]').fill(webSite);
    const email = "abc" + utils.getRandomInt() + "@yahoo.com"
    await page.locator('input[name="yourEmail"]').fill(email);
    await page.locator('textarea[name="message"]').fill("Test Email: " + fName + " " + lName);

    // await page.selectOption('select[name="email"]', 'jenkins_agent@testingbox.pw');  // option #1
    // const options = await page.locator('select[name="email"] >> option').all();      // option #2
    // await page.selectOption('select[name="email"]', await options[1].getAttribute('value'));
    // await page.selectOption('select[name="email"]', { label: 'Technical Support' }); //option #3
    await page.selectOption('select[name="email"]', { label: 'Technical Support' });
    // selection values from ComboBox:
    // following lane will always extract value of 1st (0) index:
    // const comboValue = await page.locator('select >> option').first().getAttribute('value');
    // this statement - will extract value of SELECTED index"
    const comboValue = await page.locator('select[name="email"]').inputValue();
    console.log("****Email test: F_Name = " + fName + ", L_Name = " + lName + " to: " + comboValue);

    await page.getByText('Submit').click();
    await page.waitForSelector('.Toastify__toast--success', { state: 'visible' });
    const toastText = (await page.locator('.Toastify__toast--success').textContent()).replace('\n', '');

    expect(toastText).toContain(fName + " " + lName + "Your email has been sent successfully!");

    expect(await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe(null);
    expect(await page.locator('input[name="lastName"]').getAttribute('placeholder')).toBe(null);
    expect(await page.locator('input[name="yourWebsite"]').getAttribute('placeholder')).toBe(null);
    expect(await page.locator('input[name="yourEmail"]').getAttribute('placeholder')).toBe(null);
    expect(await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe(null);
  });

  // test('Only message is empty -failing test', async ({ page }) => {
  //   await page.getByRole('img', { name: 'Contact' }).click();

  //   await page.locator('input[name="firstName"]').fill("John");
  //   await page.locator('input[name="lastName"]').fill("Smith");
  //   await page.locator('input[name="yourWebsite"]').fill("www.myWebsite.com");
  //   await page.locator('input[name="yourEmail"]').fill("jsmith@yahoo.com");

  //   await page.getByText('Submit').click();

  //   expect (await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe("Message is --- required");
  // });