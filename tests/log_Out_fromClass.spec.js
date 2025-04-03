import { test, expect } from '@playwright/test';
import {My_LogInPage} from '../pages__classes/loginPageClass';
import {My_LogOutProfile} from '../pages__classes/logOutClass';

test('logingOut from usage of class', async ({ page }) => {
  const loginPage = new My_LogInPage(page); // Pass Playwright page instance, inside of class it instantiate URL
  await loginPage.logIntoApp("admin@email.com", "admin@123"); // Call the login method
  const manageButton = await loginPage.getManageButton(); // ✅  using returnable method from class
  expect (manageButton).toBeVisible();

  const logOut = new My_LogOutProfile(page);
  const headerText = await logOut.checkHeader()
  expect (headerText.includes("Automation Courses")).toBeTruthy();
  await logOut.logOutProfile()
  await expect(manageButton).toBeHidden();
  page.pause();
}); 