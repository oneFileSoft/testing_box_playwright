import { test, expect } from '@playwright/test';
import { runQuery } from './test_db.js';
import aws_utils from './test_util.js';
// import { homedir } from 'os';
// import { sk } from 'date-fns/locale';



test('extract rendered HTML and find price', async ({ page }) => {
  test.setTimeout(100 * 60 * 1000);
/////// *********************************************************************************************///////
/////// *********************************************************************************************///////
/////// *********************************************************************************************///////
/////// *****************  Section#1: collect outherHtml from all available pages  ******************///////
/////// *********************************************************************************************///////
/////// *********************************************************************************************///////
  const dateStr = aws_utils.todayDateSignature();
/////////////////////**********************//////////////////////  
  let fileName = "noa_exampleData.txt";
  const status = "other_inactive_issue"; // other_inactive_issue

  const wrightPageFiles = false;
  const write100PagesFile = false;
  const combine1report = true;
/////////////////////**********************//////////////////////  
  // const baseCostFile = "dataJune26.csv";
  const checkPack = true;
  const okPriceListingFileName = "a_ok_price_"+dateStr+".txt";
  //const bCost  = await readFromFile('Documents', "a_dataJune26.csv");
  //const priceMap = loadFeedMap(bCost);
  const dbResults = await runQuery();
  // console.log(dbResults);
  const priceQuantityMapFromDB = aws_utils.loadFeedMapFromDB(dbResults);
  let wholeHtml = "";
  const processMap = new Map();
  processMap.set("badPriceCount", 0);// minSpendingForItem > listingPrice
  processMap.set("sellsInLoss", "");
  processMap.set("okPriceCount", 0); // minSpendingForItem <= listingPrice
  processMap.set("okPriceList", '');
  processMap.set("winnerProducts", 0); //minSpendingForItem <= buyBox && minSpendingForItem <= listingPrice
  processMap.set("badStatusCount", 0);
  processMap.set("batStatusInfo", "");
  processMap.set("productsWithPacks", 0);
  processMap.set("productsWithPacksList", "");
  processMap.set("missingSomeDataCount", 0);
  processMap.set("missingSomeDataInfo", "");
  processMap.set("mismatchQuantity", 0);
  processMap.set("notParsedRS", 0);
  processMap.set("notParsedRSData", "");
  processMap.set("totalParsedProducts", 0);
  processMap.set("wrongQuantites", "");
  processMap.set("mismatchQuantityListOk", "");
  processMap.set("mismatchQuantityListBad", "");
  processMap.set("totalVerifiedItems", 0);
  processMap.set("winBuyBoxList", "");
  processMap.set("approvalNeeded", 0);
  processMap.set("approvalNotNeeded", 0);
  processMap.set("itmAll", "");
  const asinDuplicated = new Map();
  // const mapOfProblematicAndWinningBoxItem = new Map();

  if (fileName != "a_exampleData.txt") { 
      await aws_utils.loginToAWS(page);

        await page.goto('https://sellercentral.amazon.com/myinventory/inventory?fulfilledBy=all&page=1&pageSize=25&sort=date_created_desc&status='+status+'&ref_=xx_invmgr_dnav_xx'); //status=all
 
        const startInd = "</span></kat-label></div></div></div></div><div>";
        const endInd = "</div></div><div class=\"VolusPaginationBar-module__footer--EFQLo\">";
        const pagination = page.locator('kat-pagination');
        const totalItems    = Number(await pagination.getAttribute('total-items'));
        const itemsPerPage  = Number(await pagination.getAttribute('items-per-page'));
        const totalPages  = Math.ceil(totalItems / itemsPerPage);// compute pages (round up)
        
        const nextButton = await page.evaluateHandle(() => {// Try to find the "next" button inside shadow DOM
          const pagination = document.querySelector('kat-pagination');
          if (!pagination) return null;

          const shadow = pagination.shadowRoot;
          return shadow?.querySelector('[part="pagination-nav-right"]');
        });

        const tableRows  = page.locator('div.JanusTable-module__tableContentRow--MGDsi');
        let pg = 1;
        let reportWasOnPage = 1;
        console.log("Total pages to go "+totalPages);
        const asinDuplicated = new Map();
        while (pg < totalPages+1) { // if(pg%8 == 0 && pg > 0) { await page.pause(); } if (pg==2) { runLoop = false; }
          await page.waitForTimeout(500);
          await page.waitForLoadState('domcontentloaded', { timeout: 3000 });
          await page.waitForLoadState('load', { timeout: 3000 });
          await page.waitForLoadState('networkidle', { timeout: 3000 });
          await page.waitForSelector('div.JanusTable-module__tableContentRow--MGDsi', { state: 'attached', timeout: 30000 });
          //copy outherHtml of current page to varieble
          const htmlContent = await page.evaluate(() => document.documentElement.outerHTML);
          const theOnlyProductFromThisPage = htmlContent.substring(
                      htmlContent.indexOf(startInd)+startInd.length, htmlContent.indexOf(endInd));
          
            console.log("🔄 Page# "+pg+" of "+totalPages+", number of found products: " + 
              aws_utils.countOccurrences(theOnlyProductFromThisPage, "div id=\"TRIO-")); 


          if(pg%100 == 0 && pg > 99) {
            console.log("✅page# 100 ✅");
            reportWasOnPage = pg;
          }
          await newFunction(theOnlyProductFromThisPage);

          pg++; 
          // if (pg ==10) break;
          await nextButton.click();
        }
  
    console.log("✅ ✅ ✅ Collected all pages✅ ✅ ✅ ");

  } else {
    wholeHtml = await aws_utils.readFromFile('Documents', fileName);
    await newFunction(wholeHtml);
  }

  let listOdDuplicatedAsin = "";
  let cntDuplicated = 0;
  for (const [asin, value] of asinDuplicated.entries()) {
    if (value.includes(" and ")){
      cntDuplicated++;
      listOdDuplicatedAsin += asin + " -> " +value +"\n";
    }
  }  
  const rpt = "\nReport date: "+dateStr+"\n\n✅ Total products parsed: " + processMap.get("totalParsedProducts") + "\n" +
        "✅ Total products verified: " + processMap.get("totalVerifiedItems") + "\n" +
        "✅ Total products winning BuyBox: " + processMap.get("winnerProducts") + "\n" + 
        "❗ Total Asins found with more then 1 SKY: " + cntDuplicated + "\n" +
        "❗ Total products selling in LOSS: " +processMap.get("badPriceCount") + "\n" +
        "❗ Total not parsed recordsets: " +  processMap.get("notParsedRS") + "\n" +
        "❗ Total products with mismatching Quantities: " +  processMap.get("mismatchQuantity") + "\n" +
        "❗ Total products with missing some data on listing: " +  processMap.get("missingSomeDataCount") + "\n" +
        "❗ Total products with bad statuses: " + processMap.get("badStatusCount") + "\n" +
        "❗ All products with Pack/Set in description: " +  processMap.get("productsWithPacks") + "\n";
  console.log(rpt);      
  if (!combine1report) {
    await aws_utils.writeToFile('Documents', "a_sellInLoss_" + dateStr + ".txt", 
    "Total products selling in loss: " + processMap.get("badPriceCount") + " been found\n" + 
    "Formula to calculate it: (bCostForTheAsin + 13 + (bCostForTheAsin * 0.2)) > listingPrice\n\n"+processMap.get("sellsInLoss"));
    await aws_utils.writeToFile('Documents', "a_notParsedRsets_" + dateStr + ".txt",
    "Total not parsed records from DB " + processMap.get("notParsedRS") + " been found\n\n" + processMap.get("notParsedRSData"));
    await aws_utils.writeToFile('Documents', "a_mismatchQuantityList_" + dateStr + ".txt", 
    "Total " + processMap.get("mismatchQuantity") + " of ACTIVE items with " +
    "quantity difference between Listing and Feed been found\n\n" + processMap.get("mismatchQuantityListOk")+
    "\n\n"+ processMap.get("mismatchQuantityListBad"));
    await aws_utils.writeToFile('Documents', "a_badStatuses_" + dateStr + ".txt",
    "Total products with bad status " + processMap.get("badStatusCount") + " been found\n\n" + processMap.get("batStatusInfo"));
    await aws_utils.writeToFile('Documents', "a_packInDescription_" + dateStr + ".txt", 
    "Total " + processMap.get("productsWithPacks") + " of ACTIVE items with " +
    "Pack/Set/etc.. been found\n\n" + processMap.get("productsWithPacksList"));
  } else {
    await aws_utils.writeToFile('Documents',"a_generalReport_" + dateStr + ".txt",
    rpt + "\n=============================================================================\n\n\n" +
    "❗❗ Total Asins with more then 1 SKY: " + cntDuplicated + "\n" + listOdDuplicatedAsin + "\n\n\n" +
    "❗❗ Total not parsed records from DB: " + processMap.get("notParsedRS") + " been found\n\n" + processMap.get("notParsedRSData")+
    "\n\n\n"+  
    "Total products with bad status: " + processMap.get("badStatusCount") + " been found\n\n" + processMap.get("batStatusInfo") +
    "\n\n\n"+
    "❗❗ Total products selling in loss: " + processMap.get("badPriceCount") + " been found\n" + 
    "Formula to calculate it: (bCostForTheAsin + 13 + (bCostForTheAsin * 0.2)) > listingPrice\n\n"+processMap.get("sellsInLoss")+
    "\n\n\n\n\n"+
    "Total " + processMap.get("mismatchQuantity") + " of ACTIVE items with quantity difference between Listing and Feed been found"+
    "\n⚠️ Following, will NOT do much damage because vendor will have in stack more than we list on AWS:\n\n" + 
    processMap.get("mismatchQuantityListOK")+
    "\n\n❗❗ But these, quantities needs to be urgently updated at AMAZON:\n\n" + processMap.get("mismatchQuantityListBad")+
    "\n\n\n\n\n❗❗ Total " + processMap.get("productsWithPacks") + " of ACTIVE items with Pack/Set/etc.. been found\n\n" + 
    processMap.get("productsWithPacksList") + "\n\n\n\n\n" +
    "💰💰💰 Total of products where our list-price winning BuyBox: "+processMap.get("winnerProducts")+" 💰💰💰\n\n"+
    processMap.get("winBuyBoxList") + "\n\n\nApproval needed:"+  processMap.get("approvalNeeded") +" Approval NOT needed:"+processMap.get("approvalNotNeeded") +
    "\n\n" + processMap.get("itmAll") 
 
  
   );
  }
  
/////// *********************************************************************************************///////
/////// *********************************************************************************************///////
/////// *********************************************************************************************///////
/////// *********************  Section#2: read file and run verifications  **************************///////
/////// *********************************************************************************************///////
/////// *********************************************************************************************///////

  //const content  = await readFromFile('Documents', fileName);

  

  // Split by product marker: const products = content.split('JanusTable-module__tableContentRow--MGDsi');
  //await newFunction(content);

  async function newFunction(content) {
    const products = String(content).split('div id=\"TRIO-');
    let itms = 0;
    let needApproval = 0;
    const totalParsedProducts = products.length - 1;
    let badPriceCount = 0; // minSpendingForItem > listingPrice
    let okPriceCount = 0; // minSpendingForItem <= listingPrice
    let okPriceList = '';
    let winnerProducts = 0; // minSpendingForItem <= buyBox && minSpendingForItem <= listingPrice
    let badStatusCount = 0;
    let productsWithPacks = 0;
    let productsWithPacksList = "";
    let missingSomeDataCount = 0;
    let mismatchQuantity = 0;
    let notParsedRS = 0;
    let notParsedRSData = "";
    let totalVerifiedItems = 0;
    
    const rows = [];
    const regExpOld = /(?:\d+[\s-]*(?:pack|pk|count|ct|piece|pc|filters?|units?)|set\s+of\s+\d+|pack\s+of\s+\d+|\d+[\s-]*pack|\d+[\s-]*piece|\d+[\s-]*count|\d+[\s-]*set|kit[\/\\]set|set[\/\\]kit)|(?:\d+[\s-]*(pack|pk|count|ct|piece|pc|filters?|units?)|set\s+of\s+\d+|pack\s+of\s+\d+|\d+[\s-]*pack|\d+[\s-]*piece|\d+[\s-]*count|\d+[\s-]*set|kit[\/\\]set|set[\/\\]kit|(?:pack|pk|count|ct|piece|pc|filters?|units?)[\s-]*\d+)/i;
    const regExp = /(?:(?:[2-9]|\d{2,})[\s-]*(?:pack|pk|count|ct|piece|pc|filters?|units?)|set\s+of\s+(?:[2-9]|\d{2,})|pack\s+of\s+(?:[2-9]|\d{2,})|(?:[2-9]|\d{2,})[\s-]*pack|(?:[2-9]|\d{2,})[\s-]*piece|(?:[2-9]|\d{2,})[\s-]*count|(?:[2-9]|\d{2,})[\s-]*set|kit[\/\\]set|set[\/\\]kit|(?:pack|pk|count|ct|piece|pc|filters?|units?)[\s-]*(?:[2-9]|\d{2,}))/i;

    const lstAsn = 'ASIN</span></div><div class="JanusSplitBox-module__panel--AbYDg" style="flex: 3 1 0%; justify-content: flex-start; align-items: normal;"><span class="JanusRichText-module__defaultText--pMlk1" style="overflow-wrap: anywhere; white-space: break-spaces;">';
    const featureOffer = 'Featured offer</span></div><div class="JanusReferencePrice-module__subContainer--0gbcy JanusReferencePrice-module__priceText--weT1m"><span class="JanusRichText-module__defaultText--pMlk1" style="overflow-wrap: anywhere; white-space: break-spaces;">$';
    let itmAll = "";
    let itmCountApprovalNeeded = 0;
    let itmCountApprovalNotNeeded = 0;
    for (let i = 1; i < products.length; i++) {
      let itemStatus = "ok";
      const block = products[i];
      const state = aws_utils.extractBetween(block, '<kat-label emphasis="', '" state="');
      const lstPrice = aws_utils.cleanNumber(aws_utils.extractAfter(block, 'VolusPriceInputComposite-module__container--PTx1A', '<b>Price</b>', '\\$?([\\d,]+\\.\\d{2})'));
      // const buyBoxValue= cleanNumber(extractAfter(block, 'Featured offer</span>', null, '\\$?([\\d,]+\\.\\d{2})' ));
      const buyBoxValue = aws_utils.cleanNumber(aws_utils.extractBetween(block, featureOffer, ' + '));
      // const asin       = extractAfter(block, 'ASIN</span>', null, '([A-Z0-9]{10})');
      const asin = aws_utils.extractBetween(block, lstAsn, '</span></div></div>');
      // const quantity   = extractAfter( block, 'Available (FBM)', 'type="text" value="', '(\\d{1,4})' );
      const quantity = aws_utils.extractAfter(block, 'Available (FBM)', null, 'type="text" value="(\\d{1,5})"');
      const sky = aws_utils.extractBetween(block, 'data-sku="', '">');
      const descr = aws_utils.extractBetween(block, "ProductDetails-module__titleContainer--wRcGp\"><a href=\"https://www.amazon.com/dp/" + asin + "\" target=\"_blank\" rel=\"noreferrer\" style=\"overflow-wrap: anywhere; white-space: break-spaces;\">", "</a>");
      const feedMap = priceQuantityMapFromDB.get(asin);
      const tmpAsin = asinDuplicated.get(asin);
      if(tmpAsin == null || tmpAsin == undefined) {
          asinDuplicated.set(asin, sky);
      } else {
          asinDuplicated.set(asin, tmpAsin + " and " + sky);
          itemStatus = "duplicated trio"; 
      }    

      if (typeof String(feedMap) !== 'string' || String(feedMap).includes("null") || aws_utils.countOccurrences(String(feedMap), ",") != 3) {
        notParsedRS++;
        notParsedRSData += "Asin: " + asin + "++++++ rc-data: " + feedMap + "\n";
        continue;
      }
      const feedMapArr = String(feedMap).split(","); //priceQuantityMapFromDB.set(asin, sky,qnt,cost,supplierId);
      const bCostForTheAsin = parseFloat(feedMapArr[2]);
      const feedQuantity = parseInt(feedMapArr[1]);
      const listingQuantity = parseInt(quantity);
      const supplierId = String(feedMapArr[3])

      if (state.includes('Active') &&
        (lstPrice == null || buyBoxValue == null || asin == null || bCostForTheAsin == null | quantity == null)) {
        missingSomeDataCount++;
        rows.push({
          state: state ?? "-----",
          asin: asin ?? "-----",
          bsdCost: bCostForTheAsin ?? "-----",
          listPrice: lstPrice ?? "-----",
          buyBox: buyBoxValue ?? "-----",
          quantity: quantity ?? "-----",
          sku: sky ?? "-----",
          supplier: supplierId ?? "-----",
          msg: "missing data ❗❗"
        });
        itemStatus = "missing data";
        continue;
      }
      const listingPrice = parseFloat(lstPrice);
      const buyBox = parseFloat(buyBoxValue);
      const msgT = (Number.isNaN(feedQuantity) || feedQuantity < listingQuantity) ? "quantity - urgent fix❗❗" : "quantity - fix ⚠️";
      let msgUrg = "";
      if (Number.isNaN(feedQuantity) || feedQuantity == 0 | feedQuantity < 0) { 
        msgUrg =" 🆘 🆘 🆘"; itemStatus = "low quantity";
      }
      if (feedQuantity != listingQuantity) {
        mismatchQuantity++;
        rows.push({
          state: state,
          asin: asin,
          bsdCost: bCostForTheAsin,
          listPrice: listingPrice.toFixed(2),
          buyBox: buyBox.toFixed(2),
          quantity: "listing: " + listingQuantity + " - feed: " + feedQuantity +
            ((Number.isNaN(feedQuantity) || feedQuantity < listingQuantity) ? " ❗" : ""),
          sku: sky,
          supplier: supplierId,
          msg: msgT + msgUrg
        });
      }

      // if (listingPrice <= buyBox) {
      let msg = "";
      const minSpendingForItem = bCostForTheAsin + 13 + (bCostForTheAsin * 0.2);
      if (minSpendingForItem > listingPrice) {
        badPriceCount++;
        msg = 'loss ❗';
        itemStatus = "loss";
      } else if (minSpendingForItem <= buyBox && minSpendingForItem <= listingPrice) {
        winnerProducts++;
        msg = "winner 🎉";
        itemStatus = "winner";
      } else {
        okPriceCount++;
        okPriceList += "Asin: " + asin + " Sky: " + sky + " B-Cost: " + bCostForTheAsin.toFixed(2) + " ListPrice: " + listingPrice.toFixed(2) + " BuyBox:" + buyBox.toFixed(2) + '\n';
        msg = 'ok price';
      }

      if (msg != 'ok price') {
        // console.log(`❗${state === 'Active' ? state + '  ' : state} ASIN: ${asin} | Bsd_Cst: ${bCostForTheAsin}| ListPrice: ${listingPrice.toFixed(2)} | buyBox: $${buyBox.toFixed(2)} | quantity (FBM): ${quantity ?? 'N/A'} | SKU: ${sky} | ${msg}`);
        rows.push({
          state: state,
          asin: asin,
          bsdCost: bCostForTheAsin,
          listPrice: msg.includes("loss") ? "Our expence for item = " + minSpendingForItem.toFixed(2) + " ListingPr: " + listingPrice.toFixed(2) : listingPrice.toFixed(2),
          buyBox: buyBox.toFixed(2),
          quantity: quantity ?? 'N/A',
          sku: sky,
          supplier: supplierId,
          msg: msg
        });
      }

      if (checkPack && regExp.test(descr)) { //   /pack|set of/i.test(descr)) {
        productsWithPacks++;
        productsWithPacksList += asin + " | " + sky + " | " +supplierId+" | "+ descr + "\n";
        itemStatus = "multipleItems";
      }
      
      const { needApproval, itms } =  await handleSkuEdit(page, sky, asin, itemStatus, itmAll);
      itmCountApprovalNeeded += parseInt(needApproval);
      itmCountApprovalNotNeeded += parseInt(itms);
      totalVerifiedItems++;
    }

    
    console.log("=============================== "+totalVerifiedItems + " needAprooval="+
      itmCountApprovalNeeded +" no-approval needed=" +itmCountApprovalNotNeeded);
    processMap.set("approvalNeeded", Number(processMap.get("approvalNeeded")) + Number(itmCountApprovalNeeded)) ;
    processMap.set("approvalNotNeeded", Number(processMap.get("approvalNotNeeded")) + Number(itmCountApprovalNotNeeded)) ;
    processMap.set("itmAll", processMap.get("itmAll") +"\n"+itmAll);
    processMap.set("totalParsedProducts", Number(processMap.get("totalParsedProducts")) + totalParsedProducts);
    processMap.set("badPriceCount", Number(processMap.get("badPriceCount")) + badPriceCount);// minSpendingForItem > listingPrice
    const lossSell = aws_utils.printAlignedTable(rows, "loss");
    processMap.set("sellsInLoss", processMap.get("sellsInLoss") + "\n"+ lossSell);
    processMap.set("okPriceCount",  Number(processMap.get("okPriceCount")) + okPriceCount); // minSpendingForItem <= listingPrice
    processMap.set("okPriceList", processMap.get("okPriceList") + "\n" + okPriceList);
    processMap.set("winnerProducts", Number(processMap.get("winnerProducts")) + winnerProducts); //minSpendingForItem <= buyBox && minSpendingForItem <= listingPrice
    processMap.set("badStatusCount", Number(processMap.get("badStatusCount")) + badStatusCount);
    const batStatusInfo = aws_utils.printAlignedTable(rows, "status ??");
    processMap.set("batStatusInfo", processMap.get("batStatusInfo") + "\n" + batStatusInfo);
    processMap.set("productsWithPacks", Number(processMap.get("productsWithPacks")) + productsWithPacks);
    processMap.set("productsWithPacksList", processMap.get("productsWithPacksList") + "\n" + productsWithPacksList);
    processMap.set("missingSomeDataCount", Number(processMap.get("missingSomeDataCount")) + missingSomeDataCount);
    const missingSomeDataInfo = aws_utils.printAlignedTable(rows, "missing data");
    processMap.set("missingSomeDataInfo", processMap.get("missingSomeDataInfo") + "\n" + missingSomeDataInfo);
    processMap.set("notParsedRS", Number(processMap.get("notParsedRS")) + notParsedRS);
    processMap.set("notParsedRSData", processMap.get("notParsedRSData") + "\n" + notParsedRSData);
    processMap.set("mismatchQuantity", Number(processMap.get("mismatchQuantity")) + mismatchQuantity);
    const wrongQnt = aws_utils.printAlignedTable(rows, "quantity -");
    processMap.set("wrongQuantites", processMap.get("wrongQuantites") + "\n" + wrongQnt);
    const rptUpdatedQuantityOK = aws_utils.printAlignedTable(rows, "quantity - fix"); 
    processMap.set("mismatchQuantityListOK", processMap.get("mismatchQuantityListOK") + "\n" + rptUpdatedQuantityOK);
    const rptUpdatedQuantityBad = aws_utils.printAlignedTable(rows, "quantity - urgent fix"); 
    processMap.set("mismatchQuantityListBad", processMap.get("mismatchQuantityListBad") + "\n" + rptUpdatedQuantityBad);
    processMap.set("totalVerifiedItems", Number(processMap.get("totalVerifiedItems")) + totalVerifiedItems);
    const winBuyBoxList = aws_utils.printAlignedTable(rows, "winner");
    processMap.set("winBuyBoxList", processMap.get("winBuyBoxList") + "\n" + winBuyBoxList);

      
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////           reusable methods        ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


async function closeIfApprovalNeeded(page) {
  try {
    const el = await page.getByText('You need approval to list', { timeout: 1000 });
    if (await el.isVisible()) {
      await page.close();
      return false;
    }
  } catch (_) {
     return true;
  }
}


async function handleSkuEdit_old(mainPage, sku, asin, itemStatus, listOfAll) {
  let needApproval = 0;
  let itms = 0;
  const existingPages = mainPage.context().pages();
  await mainPage.locator('#' + sku).getByRole('link', { name: 'Add missing offer details' }).click();

  let page1;
  await mainPage.context().waitForEvent('page', { timeout: 5000 });
  const newPages = mainPage.context().pages();
  for (const p of newPages) {
    if (!existingPages.includes(p)) {
      page1 = p;
      break;
    }
  }

  if (!page1) return;
  await page1.waitForLoadState('load');
  await page1.bringToFront();

  const approved = await closeIfApprovalNeeded(page1);
  if (!approved) {
    needApproval++;
  } else {
    itms++;
    // listOfAll +="\n✅ sky ="+asin+ " " +sku+" need approval = " + needApproval+", itms="+itms;
            if (itemStatus == "winner" || itemStatus == "ok") {

            } else if (itemStatus == "loss") {

            } else if (itemStatus == "multipleItems") {
              
            } else if (itemStatus == "low quantity") {
              
            } else if (itemStatus == "duplicated trio") {
              
            } else if (itemStatus == "missing data") {
              
            }
    try {
      const cancelButton = page1.getByRole('button', { name: /cancel/i });
      await cancelButton.waitFor({ state: 'visible', timeout: 3000 });
      await cancelButton.scrollIntoViewIfNeeded();
      await cancelButton.click({ timeout: 3000 });
    } catch (_) {}
  }
  
  await page1.close();
  
  return { needApproval, itms };
}

async function handleSkuEdit(mainPage, sku, asin, itemStatus, listOfAll) {
  let needApproval = 0;
  let itms = 0;

  const offerLink = mainPage.locator('#' + sku).getByRole('link', { name: 'Add missing offer details' });
  const count = await offerLink.count();
  if (count === 0) {
    console.log(`❌ Skipping SKU ${sku} — no 'Add missing offer details' link`);
    return { needApproval, itms }; // skip this item entirely
  }
  try {
    await offerLink.waitFor({ state: 'attached', timeout: 3000 });
    await offerLink.scrollIntoViewIfNeeded();

    const [newPage] = await Promise.all([
      mainPage.context().waitForEvent('page', { timeout: 5000 }),
      offerLink.click()
    ]);

    await newPage.waitForLoadState('load');
    await newPage.bringToFront();

    const approved = await closeIfApprovalNeeded(newPage);
    if (!approved) {
      needApproval++;
    } else {
      itms++;

      // do something based on itemStatus...
      try {
        const cancelButton = newPage.getByRole('button', { name: /cancel/i });
        await cancelButton.waitFor({ state: 'visible', timeout: 3000 });
        await cancelButton.scrollIntoViewIfNeeded();
        await cancelButton.click({ timeout: 3000 });
      } catch (_) {}
    }

    await newPage.close();
  } catch (err) {
    console.error(`❌ Could not handle tab for SKU: ${sku}, ASIN: ${asin}. Error:`, err);
  }

  return { needApproval, itms };
}
