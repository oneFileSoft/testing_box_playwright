import { test, expect } from '@playwright/test';
import { runQuery } from '../z_experiment/test_db.js';
import aws_utils from '../z_experiment/test_util.js';



test('extract rendered HTML and find price', async ({ page }) => {
  // test.setTimeout(100 * 60 * 1000);
  const profitMargin = 0.33;
  const startTest = Date.now();
/////// *********************************************************************************************///////
/////// *********************************************************************************************///////
/////// *********************************************************************************************///////
/////// *****************  Section#1: collect outherHtml from all available pages  ******************///////
/////// *********************************************************************************************///////
/////// *********************************************************************************************///////
const dateStr = aws_utils.todayDateSignature();
/////////////////////**********************//////////////////////  
  let fileName = "noa_exampleData.txt";
  const status = "active"; // active all inactive
  let asinsListForVal = "";
  let arrTrio = "";
  const wrightPageFiles = false;
  const write100PagesFile = false;
  const combine1report = true;
/////////////////////**********************//////////////////////  
  // const baseCostFile = "dataJune26.csv";
  const checkPack = true;
  const okPriceListingFileName = "a_ok_price_"+dateStr+".txt";
  //const bCost  = await readFromFile('Documents', "a_dataJune26.csv");
  //const priceMap = loadFeedMap(bCost);
  const dbResults = await runQuery(3);
  // console.log(dbResults);
  const priceQuantityMapFromDB = aws_utils.loadFeedMapFromDB(dbResults, 3);
  let wholeHtml = "";
  const processMap = new Map();
  processMap.set("badPriceCount", 0);// expence > listingPrice
  processMap.set("sellsInLoss", "");
  processMap.set("okPriceCount", 0); // expence <= listingPrice
  processMap.set("okPriceList", '');
  processMap.set("winnerProducts", 0); //expence <= buyBox && expence <= listingPrice
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
  processMap.set("sellLoss", 0);
  processMap.set("sell0Margin", 0);
  const asinDuplicated = new Map();
  // const mapOfProblematicAndWinningBoxItem = new Map();

  if (fileName != "a_exampleData.txt") { 
      await aws_utils.loginToAWS(page);
  //await page.goto('https://sellercentral.amazon.com/myinventory/inventory?fulfilledBy=all&page=1&pageSize=25&sort=date_created_desc&status=all&ref_=xx_invmgr_dnav_xx');
  await page.goto('https://sellercentral.amazon.com/myinventory/inventory?fulfilledBy=all&page=1&pageSize=25&sort=date_created_desc&status='+status); //status=all

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

        
        // const tableRows  = page.locator('div.JanusTable-module__tableContentRow--MGDsi');
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

          wholeHtml += theOnlyProductFromThisPage;            
          if (pg%10==0 && pg >9) {          
            console.log("🔄 Page# "+pg+" of "+totalPages+", number of found products: " + 
              aws_utils.countOccurrences(wholeHtml, "div id=\"TRIO-")); 
            await page.waitForTimeout(500);
          }    

          if (wrightPageFiles) {
              await aws_utils.writeToFile('Documents','a_page_'+pg+'_'+dateStr+'.txt', theOnlyProductFromThisPage);
          }
          if(pg%100 == 0 && pg > 99) {
            console.log("✅running evaluation on 100 pages✅");
            await newFunction(wholeHtml);
            if (write100PagesFile) { await aws_utils.writeToFile('Documents', "a_page_"+pg+"_collectedData_"+dateStr+".txt", wholeHtml);}
            wholeHtml = "";
            reportWasOnPage = pg;
          }
          pg++; 
          await nextButton.click();
        }
  
    console.log("✅ ✅ ✅ Collected all pages✅ ✅ ✅ ");
    if (write100PagesFile) {await aws_utils.writeToFile('Documents', "a_page_"+pg+"_collectedData_"+dateStr+".txt", wholeHtml);}
    if (reportWasOnPage != pg) {
       console.log("running evaluation on remaining: "+(pg-reportWasOnPage-1)+" pages");
       await newFunction(wholeHtml);
    }
  } else {
    wholeHtml = await aws_utils.readFromFile('Documents', fileName);
    await newFunction(wholeHtml);
  }
  
  await aws_utils.writeToFile('Documents',"a_collectedTrio_" + dateStr + ".txt", arrTrio.slice(0, -1));

  let listOdDuplicatedAsin = "";
  let cntDuplicated = 0;
  for (const [asin, value] of asinDuplicated.entries()) {
    if (value.includes(" and ")){
      cntDuplicated++;
      listOdDuplicatedAsin += asin + " -> " +value +"\n";
    }
  }  
    const mismatchedOKList = processMap.get("mismatchQuantityListOK");
    const mismatchedOKCount = aws_utils.countOccurrences(mismatchedOKList, "TRIO-");
    const mismatchedOKCountMetropac = aws_utils.countOccurrences(mismatchedOKList, "METRO-");
    const mismatchedOKCountEncompass = aws_utils.countOccurrences(mismatchedOKList, "ECOMP-");

    const mismatchedBadList = processMap.get("mismatchQuantityListBad");
    const mismatchedBadCount = aws_utils.countOccurrences(mismatchedBadList, "TRIO-");
    const mismatchedBadCountMetropac = aws_utils.countOccurrences(mismatchedBadList, "METRO-");
    const mismatchedBadCountEncompass = aws_utils.countOccurrences(mismatchedBadList, "ECOMP-");

    const sellIn0Marg = parseInt(processMap.get("sell0Margin"));
    const selInLoss = parseInt(processMap.get("sellLoss"));
  const rpt = "\nReport date: "+dateStr+"\n\n✅ Total products parsed: " + processMap.get("totalParsedProducts") + "\n" +
        "✅ Total products verified: " + processMap.get("totalVerifiedItems") + "\n" +
        "✅ Total products winning BuyBox: " + processMap.get("winnerProducts") + "\n" + 
        "❗ Total Asins found with more then 1 SKY: " + cntDuplicated + "\n" +
        "❗ Total products selling in LOSS: " +processMap.get("badPriceCount") + 
          ":  0-marging: "+sellIn0Marg+(sellIn0Marg>0?"❗":"✅")+ " loss:"+selInLoss+(selInLoss>0?"❗":"✅")+"\n" +
        "❗ Total not parsed recordsets: " +  processMap.get("notParsedRS") + "\n" +
        "❗ Total products with mismatching Quantities: " +  processMap.get("mismatchQuantity") + "\n" +
        "❗ Total products with missing some data on listing: " +  processMap.get("missingSomeDataCount") + "\n" +
        "❗ Total products with bad statuses: " + processMap.get("badStatusCount") + "\n" +
        "❗ All products with Pack/Set in description: " +  processMap.get("productsWithPacks") + "\n";
  console.log(rpt + "Total products with mismatching Quantities: " + processMap.get("mismatchQuantity") + " of ACTIVE items with quantity difference between Listing and Feed been found"+
    "\n⚠️ Following, will NOT do much damage because vendor will have in stack more than we list on AWS:\n" +
    "Total: "+mismatchedOKCount+" -> Metropac: "+mismatchedOKCountMetropac+", Encompass: "+mismatchedOKCountEncompass+"\n" + 
    "\n❗❗ But these, quantities needs to be urgently updated at AMAZON:\n" + 
    "Total: "+mismatchedBadCount+" -> Metropac: "+mismatchedBadCountMetropac+", Encompass: "+mismatchedBadCountEncompass+"\n");      
  if (!combine1report) {
    // await aws_utils.writeToFile('Documents', "a_sellInLoss_" + dateStr + ".txt", 
    // "Total products selling in loss: " + processMap.get("badPriceCount") + " been found\n" + 
    // "Formula to calculate it: (bCostRs + 13 + (bCostRs * "+profitMargin+")) > listingPrice\n\n"+processMap.get("sellsInLoss"));
    // await aws_utils.writeToFile('Documents', "a_notParsedRsets_" + dateStr + ".txt",
    // "Total not parsed records from DB " + processMap.get("notParsedRS") + " been found\n\n" + processMap.get("notParsedRSData"));
    // await aws_utils.writeToFile('Documents', "a_mismatchQuantityList_" + dateStr + ".txt", 
    // "Total " + processMap.get("mismatchQuantity") + " of ACTIVE items with " +
    // "quantity difference between Listing and Feed been found\n\n" + processMap.get("mismatchQuantityListOk")+
    // "\n\n"+ processMap.get("mismatchQuantityListBad"));
    // await aws_utils.writeToFile('Documents', "a_badStatuses_" + dateStr + ".txt",
    // "Total products with bad status " + processMap.get("badStatusCount") + " been found\n\n" + processMap.get("batStatusInfo"));
    // await aws_utils.writeToFile('Documents', "a_packInDescription_" + dateStr + ".txt", 
    // "Total " + processMap.get("productsWithPacks") + " of ACTIVE items with " +
    // "Pack/Set/etc.. been found\n\n" + processMap.get("productsWithPacksList"));
  } else {

    const runTestTime = "";//aws_utils.runTime(startTest);

    await aws_utils.writeToFile('Documents',"a_generalReport_" + dateStr + ".txt",
    rpt +"\n" +runTestTime+ "\n\n=============================================================================\n\n\n" +
    "❗❗ Total Asins found with more then 1 SKY: " + cntDuplicated + "\n" + listOdDuplicatedAsin + "\n\n\n" +
    "❗❗ Total not parsed recordsets: " + processMap.get("notParsedRS") + " been found\n\n" + processMap.get("notParsedRSData")+
    "\n\n\n"+  
    "Total products with bad statuses: " + processMap.get("badStatusCount") + " been found\n\n" + processMap.get("batStatusInfo") +
    "\n\n\n"+
    "❗❗ Total products selling in LOSS: " + processMap.get("badPriceCount") + " been found: "+
      ":  0-marging: "+sellIn0Marg+(sellIn0Marg>0?"❗":"✅")+ " loss:"+selInLoss+(selInLoss>0?"❗":"✅")+"\n" + 
    "Formula to calculate it: [ ( {baseCost + shipping(depend-on-supplier)} + 3.5%=tax-from-supplier ) + 15%=aws-sell-fee] > listingPrice\n\n"+processMap.get("sellsInLoss")+
    "\n\n\n\n\n"+
    "Total products with mismatching Quantities: " + processMap.get("mismatchQuantity") + " (ACTIVE items with quantity difference between Listing and Feed been found)"+
    "\n⚠️ Following, will NOT do much damage because vendor will have in stack more than we list on AWS:\n" +
    "Total: "+mismatchedOKCount+" -> Metropac: "+mismatchedOKCountMetropac+", Encompass: "+mismatchedOKCountEncompass+"\n\n" + 
    mismatchedOKList+
    "\n\n❗❗ But these, quantities needs to be urgently updated at AMAZON:\n" + 
    "Total: "+mismatchedBadCount+" -> Metropac: "+mismatchedBadCountMetropac+", Encompass: "+mismatchedBadCountEncompass+"\n\n" + 
    "\n" + mismatchedBadList+
    "\n\n\n\n\n❗❗ All products with Pack/Set in description: " + processMap.get("productsWithPacks") + " of ACTIVE items been found\n\n" + 
    processMap.get("productsWithPacksList") + "\n\n\n\n\n" +
    "💰💰💰 Total products winning BuyBox: "+processMap.get("winnerProducts")+" 💰💰💰\n\n"+
    processMap.get("winBuyBoxList")+"\n\n\n\n\nTotal not parsed recordsets: "
    +processMap.get("notParsedRS") +
    "\n\n\n\n❗ Total products with missing some data on listing: \n" + processMap.get("missingSomeDataInfo")+
    "\n\n"+asinsListForVal.slice(0, -1) );
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

    const totalParsedProducts = products.length - 1;
    let badPriceCount = 0; // expence > listingPrice
    let sellLoss = 0;
    let sell0Marging = 0;
    let okPriceCount = 0; // expence <= listingPrice
    let okPriceList = '';
    let winnerProducts = 0; // expence <= buyBox && expence <= listingPrice
    let badStatusCount = 0;
    let productsWithPacks = 0;
    let productsWithPacksList = "";
    let missingSomeDataCount = 0;
    let mismatchQuantity = 0;
    let notParsedRS = 0;
    let notParsedRSData = "";
    let totalVerifiedItems =0;
    
    const rows = [];
    const regExpOld = /(?:\d+[\s-]*(?:pack|pk|count|ct|piece|pc|filters?|units?)|set\s+of\s+\d+|pack\s+of\s+\d+|\d+[\s-]*pack|\d+[\s-]*piece|\d+[\s-]*count|\d+[\s-]*set|kit[\/\\]set|set[\/\\]kit)|(?:\d+[\s-]*(pack|pk|count|ct|piece|pc|filters?|units?)|set\s+of\s+\d+|pack\s+of\s+\d+|\d+[\s-]*pack|\d+[\s-]*piece|\d+[\s-]*count|\d+[\s-]*set|kit[\/\\]set|set[\/\\]kit|(?:pack|pk|count|ct|piece|pc|filters?|units?)[\s-]*\d+)/i;
    const regExp = /(?:(?:[2-9]|\d{2,})[\s-]*(?:pack|pk|count|ct|piece|pc|filters?|units?)|set\s+of\s+(?:[2-9]|\d{2,})|pack\s+of\s+(?:[2-9]|\d{2,})|(?:[2-9]|\d{2,})[\s-]*pack|(?:[2-9]|\d{2,})[\s-]*piece|(?:[2-9]|\d{2,})[\s-]*count|(?:[2-9]|\d{2,})[\s-]*set|kit[\/\\]set|set[\/\\]kit|(?:pack|pk|count|ct|piece|pc|filters?|units?)[\s-]*(?:[2-9]|\d{2,}))/i;

    const lstAsn = 'ASIN</span></div><div class="JanusSplitBox-module__panel--AbYDg" style="flex: 3 1 0%; justify-content: flex-start; align-items: normal;"><span class="JanusRichText-module__defaultText--pMlk1" style="overflow-wrap: anywhere; white-space: break-spaces;">';
    const featureOffer = 'Featured offer</span></div><div class="JanusReferencePrice-module__subContainer--0gbcy JanusReferencePrice-module__priceText--weT1m"><span class="JanusRichText-module__defaultText--pMlk1" style="overflow-wrap: anywhere; white-space: break-spaces;">$';
    for (let i = 1; i < products.length; i++) {
      let thisAsingNotParsable = false;
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
      arrTrio += asin+","+sky+","+lstPrice+","+quantity+"\n"; //colect all TRIO-xxxxxx
      const rsData = String(feedMap);
      if (rsData.includes("undefined") || rsData.includes("null") || aws_utils.countOccurrences(rsData, ",") != 6) {
        notParsedRS++;
        notParsedRSData += "Asin: " + asin + ": rs-data: " + rsData + " | "+state +"\n";
        asinsListForVal += asin +",";
        thisAsingNotParsable = true;
        // let gg = "";
        // if (rsData.includes("undefined")) gg += "rsData =undefined ";
        // if (rsData.includes("null")) gg += "rsData = null ";
        // if (aws_utils.countOccurrences(rsData, ",") != 6) gg += "countOccurences < 6 ";
        // gg += " | "+rsData;
        // if (gg) { console.log("❗ Missing or invalid rs:" + gg); }
      }
      const listingQuantity = parseInt(quantity);
      let feedMapArr = ""; //priceQuantityMapFromDB.set(asin, sky,qnt,cost,supplierId);
      let bCostRs = 0;
      let qtnRs = 0;
      let supplierNameRs = "";
      // let skuRs = "";
      let lstPrcRs = 0;
      let shipCostRs = 0; 
      let brandRs = "";
      if(!thisAsingNotParsable) {
        feedMapArr = String(feedMap).split(","); //priceQuantityMapFromDB.set(sky,qnt,bCost,supplyer,lstPrice,brand,shiping);
        bCostRs = parseFloat(feedMapArr[2]);
        qtnRs = parseInt(feedMapArr[1]);
        supplierNameRs = String(feedMapArr[3]);
        lstPrcRs = parseFloat(feedMapArr[4]);
        shipCostRs = parseFloat(feedMapArr[6]);
        // skuRs = String(feedMapArr[0]);
        brandRs = String(feedMapArr[5]);
      } 
      if (supplierNameRs.toLocaleLowerCase().includes("encom")) {
        shipCostRs = 13.00;
      }
      const tmpAsin = asinDuplicated.get(asin);
      if(tmpAsin == null || tmpAsin == undefined) {
          asinDuplicated.set(asin, sky +" - "+  supplierNameRs + " - " + brandRs);
      } else {
          asinDuplicated.set(asin, tmpAsin + " and " + sky +" - "+  supplierNameRs + " - " + brandRs);
      }    
      let flagNoDescripancy = true;

      // if(i > 10 && i < 20) { console.log("********* "+ asin + ", "+ feedMap+ ", "+ bCostRs+", " +supplierNameRs);}
      if (state.includes('Active') &&
        (lstPrice == null || buyBoxValue == null || asin == null || bCostRs == null || bCostRs == 0 || quantity == null ||
          listingQuantity ==0
        )) {
        // let gg = "";
        // if (lstPrice == null) gg += "lstPrice:" + lstPrice + ", ";
        // if (buyBoxValue == null) gg += "buyBoxValue:" + buyBoxValue + ", ";
        // if (asin == null) gg += "asin:" + asin + ", ";
        // if (bCostRs == null) gg += "bCostRs:" + bCostRs + ", ";
        // if (bCostRs == 0) gg += "bCostRs_zero:" + bCostRs + ", ";
        // if (quantity == null) gg += "quantity:" + quantity + ", ";
        // if (listingQuantity == 0) gg += "listingQuantity_zero:" + listingQuantity + ", ";
        // if (gg.length>1) { console.log("❗ Missing or invalid data:\n" + gg);  }

        flagNoDescripancy = false;
        missingSomeDataCount++;
        rows.push({
          state: state ?? "-----",
          asin: asin ?? "-----",
          bsdCost: bCostRs.toFixed(2) ?? "-----",
          listPrice: lstPrice ?? "-----",
          buyBox: buyBoxValue ?? "-----",
          quantity: quantity ?? "-----",
          sku: sky ?? "-----",
          supplier: supplierNameRs ?? "-----",
          msg: "missing data ❗❗"
        });
        continue;
      }
      const listingPrice = parseFloat(lstPrice);
      const buyBox = parseFloat(buyBoxValue);
      const msgT = (Number.isNaN(qtnRs) || qtnRs < listingQuantity) ? "quantity - urgent fix❗❗" : "quantity - fix ⚠️";
      let msgUrg = "";
      if (Number.isNaN(qtnRs) || qtnRs == 0 || qtnRs < 0 || qtnRs < listingQuantity) { 
        if(thisAsingNotParsable) { msgUrg =" 🆘  ⚠️"; } // console.log("⚠️⚠️⚠️⚠️⚠️ "+ asin +" "+String(feedMap));
        else                     { msgUrg =" 🆘";    }
        flagNoDescripancy = false;
        mismatchQuantity++;
        rows.push({
          state: state,
          asin: asin,
          bsdCost: bCostRs.toFixed(2),
          listPrice: listingPrice.toFixed(2),
          buyBox: buyBox.toFixed(2),
          quantity: "listing: " + listingQuantity + " - feed: " + qtnRs +
            ((Number.isNaN(qtnRs) || qtnRs == 0) ? "🆘🆘" : ""),
          sku: sky,
          supplier: supplierNameRs,
          msg: msgT + msgUrg
        });
      }
      // if (state.includes('Active') && qtnRs != listingQuantity) {  

      // }
      let msg = "";
      const expence = aws_utils.calculateExpences(bCostRs, shipCostRs, "");
      if (expence > listingPrice || expence > lstPrcRs) {
        flagNoDescripancy = false;
        badPriceCount++;
        const t = Math.abs(expence - listingPrice);
        if(t<0.1) sell0Marging++;
        else sellLoss++
        msg = (t<0.1?'0 marg':'loss ❗') + ( thisAsingNotParsable? '⚠️': '');
        rows.push({
          state: state,
          asin: asin,
          bsdCost: bCostRs.toFixed(2),
          listPrice: "Expence: " + expence.toFixed(2) + " ListingPr: " + listingPrice.toFixed(2),
          buyBox: buyBox.toFixed(2),
          quantity: quantity ?? 'N/A',
          sku: sky,
          supplier: supplierNameRs,
          msg: msg + (listingPrice != lstPrcRs?" ❗ListPr:"+listingPrice+" Rs:"+lstPrcRs+"❗": "")
        });
      } 
      if (expence <= parseFloat(buyBox) && expence <= listingPrice && expence <= lstPrcRs) {
        flagNoDescripancy = false;
        winnerProducts++;
        msg = "winner 🎉" + ( thisAsingNotParsable? '⚠️': '');
        rows.push({
          state: state,
          asin: asin,
          bsdCost: bCostRs.toFixed(2),
          listPrice: msg.includes("loss") || msg.includes("0 marg") ? "Our expence: " + expence.toFixed(2) + " ListingPr: " + listingPrice.toFixed(2) : listingPrice.toFixed(2),
          buyBox: buyBox.toFixed(2),
          quantity: quantity ?? 'N/A',
          sku: sky,
          supplier: supplierNameRs,
          msg: msg + (listingPrice != lstPrcRs?" ❗ListingPrc:"+listingPrice+" RsPrc:"+lstPrcRs+"❗": "")
        });
      } 
      if(flagNoDescripancy) {
        okPriceCount++;
        okPriceList += "Asin: " + asin + " Sky: " + sky + " B-Cost: " + bCostRs.toFixed(2) + " ListPrice: " + listingPrice.toFixed(2) + " BuyBox:" + buyBox.toFixed(2) + '\n';
        msg = 'ok price' + ( thisAsingNotParsable? '⚠️': '');
      }

      // console.log(`❗${state === 'Active' ? state + '  ' : state} ASIN: ${asin} | Bsd_Cst: ${bCostRs}| ListPrice: ${listingPrice.toFixed(2)} | buyBox: $${buyBox.toFixed(2)} | quantity (FBM): ${quantity ?? 'N/A'} | SKU: ${sky} | ${msg}`);
      if (!state.includes('Active')) {
        badStatusCount++;
        rows.push({
          state: state,
          asin: asin,
          bsdCost: bCostRs.toFixed(2),
          listPrice: "",
          buyBox: "",
          quantity: quantity ?? 'N/A',
          sku: sky,
          supplier: supplierNameRs,
          msg: "status ??"
        });
      }
      if (checkPack && regExp.test(descr)) { //   /pack|set of/i.test(descr)) {
        productsWithPacks++;
        productsWithPacksList += asin + " | " + sky + " | " +supplierNameRs+" | "+ descr + "\n";
      }
      totalVerifiedItems++;
    }

    

    processMap.set("totalParsedProducts", Number(processMap.get("totalParsedProducts")) + totalParsedProducts);
    processMap.set("badPriceCount", Number(processMap.get("badPriceCount")) + badPriceCount);// expence > listingPrice
    processMap.set("sellLoss", Number(processMap.get("sellLoss")) + sellLoss);
    processMap.set("sell0Margin", Number(processMap.get("sell0Margin")) + sell0Marging);
    const lossSell = aws_utils.printAlignedTable(rows, "loss");
    const marg0 =  aws_utils.printAlignedTable(rows, "0 marg");
    processMap.set("sellsInLoss", processMap.get("sellsInLoss") + "\n"+ lossSell + "\n\n" + marg0);
    processMap.set("okPriceCount",  Number(processMap.get("okPriceCount")) + okPriceCount); // expence <= listingPrice
    processMap.set("okPriceList", processMap.get("okPriceList") + "\n" + okPriceList);
    processMap.set("winnerProducts", Number(processMap.get("winnerProducts")) + winnerProducts); //expence <= buyBox && expence <= listingPrice
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




