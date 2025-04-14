import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  console.log(' ***********************    Current URL: ', page.url());
  await page.waitForLoadState();
});

test('Prevention of Submit of Email, with all empty fields', async ({ page }) => {
    await page.getByRole('img', { name: 'Contact' }).click();

    expect (await page.locator('input[name="firstName"]').inputValue()).toBe('');

    await page.locator('input[name="firstName"]').click();
    await page.getByText('Submit').click();
    expect (await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe("First name is required");
    expect (await page.locator('input[name="lastName"]').getAttribute('placeholder')).toBe("Last name is required");
    expect (await page.locator('input[name="yourWebsite"]').getAttribute('placeholder')).toBe("Your website is required");
    expect (await page.locator('input[name="yourEmail"]').getAttribute('placeholder')).toBe("Your email is required");
    expect (await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe("Message is required");

    await page.getByRole('textbox', { name: 'First name is required' }).click();
    await page.getByRole('textbox', { name: 'First name is required' }).fill('John');
    await page.getByRole('textbox', { name: 'Last name is required' }).click();
    expect (await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe("");
  });

  test('Empty FirstName, lastName and message lost fokus', async ({ page }) => {
    await page.getByRole('img', { name: 'Contact' }).click();

    await page.locator('input[name="firstName"]').click();
    await page.locator('input[name="lastName"]').click();

    expect (await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe("First name is required");
    expect (await page.locator('input[name="lastName"]').getAttribute('placeholder')).toBe(null);
    await page.locator('textarea[name="message"]').click();
    expect (await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe("First name is required");
    expect (await page.locator('input[name="lastName"]').getAttribute('placeholder')).toBe("Last name is required");
    expect (await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe(null);
    await page.locator('input[name="firstName"]').click();
    expect (await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe("First name is required");
    expect (await page.locator('input[name="lastName"]').getAttribute('placeholder')).toBe("Last name is required");
    expect (await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe("Message is required");
    expect (await page.locator('input[name="yourWebsite"]').getAttribute('placeholder')).toBe(null);
    expect (await page.locator('input[name="yourEmail"]').getAttribute('placeholder')).toBe(null);
  });

  test('Only message is empty', async ({ page }) => {
    await page.getByRole('img', { name: 'Contact' }).click();

    await page.locator('input[name="firstName"]').fill("John");
    await page.locator('input[name="lastName"]').fill("Smith");
    await page.locator('input[name="yourWebsite"]').fill("www.myWebsite.com");
    await page.locator('input[name="yourEmail"]').fill("jsmith@yahoo.com");

    await page.getByText('Submit').click();

    expect (await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe("Message is required");
    expect (await page.getByText("Please, fill out all required")).toBeVisible();
    await page.waitForTimeout(7000);
    expect (await page.getByText('Please, fill out all required')).toBeHidden()
  });

  function getRandomInt() {
    return Math.floor(Math.random() * 100) + 10;
  }

  test('Successfull Email send', async ({ page }) => {
    await page.getByRole('img', { name: 'Contact' }).click();
    const fName = "J" + getRandomInt() + "J";
    await page.locator('input[name="firstName"]').fill(fName);
    const lName = "S" + getRandomInt() + "S"
    await page.locator('input[name="lastName"]').fill(lName);
    const webSite = "www.abc" + getRandomInt() + ".com"
    await page.locator('input[name="yourWebsite"]').fill(webSite);
    const email = "abc" + getRandomInt() + "@yahoo.com"
    await page.locator('input[name="yourEmail"]').fill(email);
    await page.locator('textarea[name="message"]').fill("Test Email: " + fName + " " + lName);

    const comboValue = await page.locator('select >> option').first().getAttribute('value');
    console.log("****Email test: F_Name = " + fName + ", L_Name = " + lName + " from: " + comboValue);

    await page.getByText('Submit').click();
    await page.waitForSelector('.Toastify__toast--success', { state: 'visible' });
    const toastText = page.locator('.Toastify__toast--success').textContent().replace('\n', '');
    await expect(toastText).toHaveText(fName + " " + lName + "Your email has been sent successfully!");

    // await expect(page.locator('.Toastify__toast')).toHaveText(/Your email has been sent/);
    // const toastText = (await page.locator('.Toastify__toast').textContent()).replace('\n', '');
    expect (toastText).toContain(fName + " " + lName + "Your email has been sent successfully!");

    expect (await page.locator('input[name="firstName"]').getAttribute('placeholder')).toBe(null);
    expect (await page.locator('input[name="lastName"]').getAttribute('placeholder')).toBe(null);
    expect (await page.locator('input[name="yourWebsite"]').getAttribute('placeholder')).toBe(null);
    expect (await page.locator('input[name="yourEmail"]').getAttribute('placeholder')).toBe(null);
    expect (await page.locator('textarea[name="message"]').getAttribute('placeholder')).toBe(null);
  });
 