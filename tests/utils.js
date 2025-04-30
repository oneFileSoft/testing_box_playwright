
function extractBetween(text, startMarker, endMarker = null) {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return null;
    const from = startIndex + startMarker.length;
    if (endMarker === null) return text.substring(from).trim();
    const endIndex = text.indexOf(endMarker, from);
    if (endIndex === -1) return null;
    return text.substring(from, endIndex).trim();
}
  
async function getSessionStorage(page) {
    return await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        data[key] = sessionStorage.getItem(key);
      }
      return data;
    });
}

async function getLocalStorage(page) {
    return await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
}
  
function getRandomInt() {
    return Math.floor(Math.random() * 100) + 10;
}

async function getComputedStyleProperty(page, locator, property) {
    const elementHandle = await locator.elementHandle();
    if (!elementHandle) throw new Error('Element not found for computed style');
  
    return await page.evaluate(({ el, prop }) => {
      return getComputedStyle(el)[prop];
    }, { el: elementHandle, prop: property });
}

async function getTextFromToast(page) {
    await page.waitForLoadState('domcontentloaded');
    const toastBox = page.locator(".Toastify__toast").first();
    await toastBox.waitFor(); // Ensures it's visible before extracting text
    const messageText = await toastBox.textContent();
    return messageText;
}
  export default {
    extractBetween,
    getSessionStorage,
    getLocalStorage,
    getRandomInt,
    getComputedStyleProperty,
    getTextFromToast
  };
  