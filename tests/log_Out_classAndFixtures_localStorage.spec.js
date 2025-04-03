import { test, expect } from '@playwright/test'; // ✅ Import Playwright's default 'test' used in 1st case
import { login_procedure } from '../fixtures/fixture_log_in'; //    using in second case
import { My_LogInPage } from '../pages__classes/loginPageClass';
import { My_LogOutProfile } from '../pages__classes/logOutClass';

test('Logging out using class', async ({ page }) => {
    const loginPage = new My_LogInPage(page);
    await loginPage.logIntoApp("admin@email.com", "admin@123");

    const manageButton = await loginPage.getManageButton();
    await expect(manageButton).toBeVisible();

    const logOut = new My_LogOutProfile(page);
    const headerText = await logOut.checkHeader();
    expect(headerText.includes("Automation Courses")).toBeTruthy();

    await logOut.logOutProfile();
    await expect(manageButton).toBeHidden();
});

// ✅ Use login_procedure directly, and in the end, it return current PAGE
login_procedure('Add Item to the cart', async ({ authenticatedPage }) => {
    const manageButton = await authenticatedPage.getManageButton();
    await expect(manageButton).toBeVisible();
    await expect(manageButton.isVisible()).toBeTruthy();
    await expect(authenticatedPage.pom_page).toHaveURL(/freelance-learn-automation.vercel/);

    const profilePage = new My_LogOutProfile(authenticatedPage.pom_page);
    let cartValueFromLocalStorage = await profilePage.getValueOfLocalStorage("cart");
    console.log("Before adding to the cart, expected 'null' cause 'cart' not been created " + cartValueFromLocalStorage);
    expect (cartValueFromLocalStorage === null);
    await profilePage.addToCart(); 
    await profilePage.checkCart_numberItems(1);

    const nameOfAddedBook = await profilePage.pom_page.locator('.name').first().innerText();
    console.log(" name been added: " + nameOfAddedBook)

    await profilePage.getValueOfLocalStorage("cart"); // now cart has '[..... description:"XXXX", .....]
    const valueFromLocalStorage = await profilePage.getSpecificTagFromBody('description');
    expect (nameOfAddedBook == valueFromLocalStorage) ;
    

    await profilePage.removeItem();
    await profilePage.checkCart_numberItems(0);
    await profilePage.logOutProfile();
    await expect(manageButton).toBeHidden();
});
