import { test, expect } from '@playwright/test';
import { parseISO, format } from 'date-fns';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  console.log(' ***********************    Current URL: ', page.url());
  await page.waitForLoadState();
});

test('Regression Report counter and comparing repor Date', async ({ page }) => {
  await page.getByRole('img', { name: 'RegrReport' }).click();
  await page.waitForLoadState('networkidle'); 
  const count = await page.locator('a').count();
  expect (count > 1);
  const dateInput = page.locator('input[type="date"]');
  const dateFromCalendar = await dateInput.inputValue();
  console.log("Date from calendar: " + dateFromCalendar);
  const dateFromCalendar1 = parseISO(dateFromCalendar);
  const date1 = format(dateFromCalendar1, 'yyyy-MM-dd');

  await page.locator('a').first().click();
  const dateFromReport = await page.locator('iframe[title="HTML Report"]').contentFrame().getByTestId('overall-time').innerText();
  console.log("Date from report: " + dateFromReport);//Date: 4/26/2025, 10:19:22 AM is NOT parsable by parseISO

  const dateFromReport1 = new Date(dateFromReport);
  const date2 = format(dateFromReport1, 'yyyy-MM-dd');
  expect (date1 == date2)
});


