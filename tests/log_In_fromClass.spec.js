import { test, expect } from '@playwright/test';
import {My_LogInPage} from '../pages__classes/loginPageClass';

test('loging from usage of class', async ({ page }) => {
  const loginPage = new My_LogInPage(page, "https://freelance-learn-automation.vercel.app/login"); // ✅ Pass Playwright page instance
  await loginPage.logIntoApp(); // ✅ Call the login method
});


// "type": "commonjs", affecting the way how do we export reusable classes:
// class My_LogInPage {
//   constructor(url) {
//     console.log(`Navigating to ${url}`);
//   }
//   login(username, password) {
//     console.log(`Logging in with ${username} and ${password}`);
//   }
// }
// module.exports = My_LogInPage

// with "type": "module", which is moder ES Modules, we can use:{
// export class My_LogInPage {
//   constructor(url) {
//     console.log(`Navigating to ${url}`);
//   }
//   login(username, password) {
//     console.log(`Logging in with ${username} and ${password}`);
//   }
// }
