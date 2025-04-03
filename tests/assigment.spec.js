import { test } from '@playwright/test';
test('home-work', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/newest');
    await page.waitForLoadState();

    let collectedItems = []; 
    let collectedPerPage = 0;  
    let collectedTotal = 0;
    const recordsToCollect = 100; 

    while (collectedTotal < recordsToCollect) {
        if (collectedPerPage > 0 && collectedPerPage % 30 === 0) {
            await page.locator('.morelink').click();
            await page.waitForLoadState();
            collectedPerPage = 0;
        }
        const remainingRecords = recordsToCollect - collectedTotal;

        const rows = await extractRows(page, remainingRecords);

        collectedItems.push(...rows);

        collectedPerPage += rows.length;
        collectedTotal += rows.length;

    }
    collectedItems.sort((a, b) => {return new Date(b.age) - new Date(a.age); });
 
    collectedItems.forEach((item, index) => {
        console.log(`#${index} ${item.age} - ${item.title}`);
    });

});

async function extractRows(page, remainingRecords) {
    return await page.$$eval('tr', (rows, counterFormCallaback) => {
        let items = [];
        let count = 0;

        for (let i = 0; i < rows.length - 1 && count < counterFormCallaback; i++) {
            const titleRow = rows[i];
            const ageRow = rows[i + 1];

            let titleElement = titleRow.querySelector('.titleline a');
            let ageElement = ageRow.querySelector('.subline .age');

            if (titleElement && ageElement) {
                let title = titleElement.innerText.trim();
                let age = ageElement.getAttribute('title').trim();
                age = age.slice(0, age.indexOf(" "));
                items.push({ age, title });
                count++;
            }
        }
        return items;
    }, remainingRecords);
}


// test('site has title2', async ({ page }) => {
//     await page.goto('https://news.ycombinator.com/newest');
//     await page.waitForLoadState()

//     // let lnks = await page.locator('.rank').all();
//     // const page = await browser.newPage();
    
//     let collectedItems = [];  // Store collected titles & ages
//     let collectedPerPage = 0;  
//     let collectedTotal = 0;     // Start from page 1

//     while (collectedTotal < 100 ) {
//         if (collectedPerPage > 0 && collectedPerPage % 30 == 0){
//             await page.locator('.morelink').click();
//             await page.waitForLoadState();
//             collectedPerPage = 0;
//         }

//         const rows = await page.$$eval('tr', rows => {
//             let items = [];
//             for (let i = 0; i < rows.length - 1; i++) {
//                 const titleRow = rows[i];
//                 const ageRow = rows[i + 1];

//                 let titleElement = titleRow.querySelector('.titleline a');
//                 let ageElement = ageRow.querySelector('.subline .age');

//                 if (titleElement && ageElement) {
//                     let title = titleElement.innerText.trim();
//                     let age = ageElement.innerText.trim();
//                     items.push({ age, title });
//                 }
//             }
//             return items;
//         });

//         collectedItems.push(rows);
//         collectedPerPage++; 
//         collectedTotal++;
//         console.log("collectedPerPage="+collectedPerPage+
//             " collectedTotal="+collectedTotal+ " "+ collectedItems[collectedTotal-1].age+" - "+collectedItems[collectedTotal-1].title);

//     }
//         // for(let i=0; i<collectedItems.length; i++){
    //     let y = collectedItems[i];
    //     console.log("#"+i+" " +y.age + " - " + y.title);
    // }   
    // collectedItems.forEach((item, index) => {
    //     console.log(`#${index} ${item.age} - ${item.title}`);
    // });
// });