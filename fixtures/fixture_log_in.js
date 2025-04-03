import { test as baseTest } from '@playwright/test';
import { My_LogInPage } from '../pages__classes/loginPageClass';

export const login_procedure = baseTest.extend({
    authenticatedPage: async ({ page }, use) => {
        const loginPage = new My_LogInPage(page);
        await loginPage.logIntoApp();
        await use(loginPage); // ✅ Passes the instance of My_LogInPage to the test
    }
});