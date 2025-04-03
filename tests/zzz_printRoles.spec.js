import {test} from '@playwright/test';
test.use({ browserName: 'chromium' });


test('List all elements with roles', async ({ page }) => {
    // const url = await askQuestion('Enter the website URL: ');
    // console.log(`Navigating to: ${url}`);

    // const url = process.argv[2];
    // if (!url) {
    //     console.error('❌ Please provide a website URL as an argument.');
    //     console.log('Example: npx playwright test test-roles.spec.js https://example.com');
    //     process.exit(1);
    // }
    // await page.goto(url);//https://testautomationpractice.blogspot.com/#
// Navigate to the page
// await page.goto("https://testautomationpractice.blogspot.com/#");

// Navigate to the page
// Navigate to the page

// Navigate to the page
// await page.goto("https://testautomationpractice.blogspot.com/#");
await page.goto("https://saucedemo.com/");


// // Extract all elements on the page and generate locators
// const elements = await page.locator('*').evaluateAll(nodes => {
//     function getOptimalLocator(el) {
//         const role = el.getAttribute('role');
//         const name = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || el.textContent?.trim();
//         const tag = el.tagName.toLowerCase();
//         const textContent = el.textContent?.trim();
        
//         // Role-based locators (Playwright Inspector style)
//         if (role) {
//             if (name) {
//                 return `page.getByRole('${role}', { name: '${name}' })`;
//             } else {
//                 return `page.getByRole('${role}')`;
//             }
//         }
        
//         // Handle button elements with name
//         if (tag === 'button' && name) {
//             return `page.getByRole('button', { name: '${name}' })`;
//         }
        
//         // Handle text input fields (textbox)
//         if (tag === 'input' && el.type === 'text' && name) {
//             return `page.getByRole('textbox', { name: '${name}' })`;
//         }

//         // Handle checkbox elements
//         if (tag === 'input' && el.type === 'checkbox' && name) {
//             return `page.getByRole('checkbox', { name: '${name}' })`;
//         }
        
//         // Handle radio button elements
//         if (tag === 'input' && el.type === 'radio' && name) {
//             return `page.getByRole('radio', { name: '${name}' })`;
//         }
        
//         // Handle links (anchor elements)
//         if (tag === 'a' && name) {
//             return `page.getByText('${name}')`;
//         }
        
//         // Handle dropdown/select elements
//         if (tag === 'select' && el.name) {
//             return `page.locator('select[name="${el.name}"]').selectOption()`;
//         }
        
//         // Handle textarea elements
//         if (tag === 'textarea' && el.name) {
//             return `page.locator('textarea[name="${el.name}"]').fill()`;
//         }

//         // Handle image elements by alt text
//         if (tag === 'img' && el.alt) {
//             return `page.locator('img[alt="${el.alt}"]')`;
//         }

//         // Handle locators by ID
//         if (el.id) {
//             return `page.locator('#${el.id}')`;
//         }
        
//         // Handle class-based locators (safely handle non-string className)
//         if (el.className && typeof el.className === 'string') {
//             const className = el.className.replace(/\s+/g, '.');
//             return `page.locator('.${className}')`;
//         }
        
//         // Handle text-based locators (fallback)
//         if (textContent) {
//             return `page.getByText('${textContent}')`;
//         }

//         // If nothing else applies, use a generic locator based on the tag name
//         return `page.locator('${tag}')`;
//     }

//     // Map through the elements and generate locators
//     return nodes.map(el => ({
//         tag: el.tagName.toLowerCase(),
//         role: el.getAttribute('role'),
//         name: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || el.textContent?.trim(),
//         locator: getOptimalLocator(el),
//         innerHTML: el.innerHTML.substring(0, 100), // First 100 chars of element's HTML
//     }));
// });

// console.log('📌 Extracted Element Locators:');

// // Loop through the elements and print the optimal locator and element HTML
// elements.forEach(el => {
//     if (el.locator) {
//         console.log(`  ${el.locator} || ${el.innerHTML}`);
//     }
// });



    const elements = await page.locator('*').evaluateAll(nodes =>
        nodes.map(el => ({
            tag: el.tagName.toLowerCase(),
            role: el.getAttribute('role'),
            rawHTML: el.outerHTML.substring(0, 100) // Show first 100 chars of element
        }))
    );

    console.log('📌 Extracted Elements:');

    elements.forEach(el => {
        // Skip <br> and empty <div> tags
        if (el.tag === 'br' || (el.tag === 'div' && !el.content)) {
            return;
        }
        console.log(`{ tag: '${el.tag}', role: ${el.role ? `'${el.role}'` : 'null'} } → ${el.rawHTML}`);
    });

});

// Helper function to construct an optimal locator
// Helper function to generate the optimal Playwright locator


    // elements.forEach(el => { // prints EVERYTHING
    //     console.log(`{ tag: '${el.tag}', role: ${el.role ? `'${el.role}'` : 'null'} } → ${el.rawHTML}`);
    // });

// test('List all element roles', async ({ page }) => {
//     await page.goto('https://example.com');
//     await page.waitForLoadState();


//     const roles = await page.locator('*').evaluateAll(elements => 
//         elements.map(el => ({
//             tag: el.tagName.toLowerCase(),
//             role: el.getAttribute('role')
//         }))
//     );

//     console.log(roles); // Logs all elements with their roles
// });

// import readline from 'readline';

// // Function to ask for user input (URL)
// const askQuestion = (query) => {
//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout
//     });

//     return new Promise(resolve => rl.question(query, answer => {
//         rl.close();
//         resolve(answer);
//     }));
// };

