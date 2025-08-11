import { test, expect } from '@playwright/test';
import { runQuery } from './test_db.js';
import aws_utils from './test_util.js';



test('extract rendered HTML and find price', async ({ page }) => {
  test.setTimeout(100 * 60 * 1000);
  const rerunSkus= false;
  const listToRerun=``;
  let tmpArrSkus = listToRerun.split("\n");
  const rows = [];
  const startTest = Date.now();
  const dateStr = aws_utils.todayDateSignature();
  const fileName ="a_collectedTrio_08-09-2025_15-56";
  const dbResults = await runQuery(3);
  const priceQuantityMapFromDB = aws_utils.loadFeedMapFromDB(dbResults, 3);
//  await page.pause();
  let totalProgress = 0;
  let badSkusList = "";
  let badSkusCount = 0;
  let goodSkusCount = 0;
  let goodResponseCount = 0;
  let badResponseCount = 0;
  let badResponseList = "";
  let emptyResponseCount = 0;
  let emptyResponseList = "";
  let noMatchSkuInfoWithRsCount = 0;
  let noMatchApiInfoCount = 0;
  let notParsedRS = 0;
  let notParsedRSData ="";
  ////read file which was prepared fromsearch trough listing: arrTrio += asin+","+sky+","+lstPrice+","+quantity+"\n"; 
  const existingListing =  await aws_utils.readFromFile('Documents',fileName+".txt");
  const tmpArrListing = existingListing.split("\n");
  console.log("Total listing to verify: " + tmpArrListing.length);
  for (const lst of tmpArrListing) {
    totalProgress++;
    // if (totalProgress ==100) break;
    if (totalProgress%100==0 && totalProgress >99) console.log("🔄 progress# "+totalProgress+" records");
    let [assiLsting, skuLsting, lstPriceLsting, qntLsting] = lst.split(','); /////// from listing .......
    
    lstPriceLsting = parseFloat(lstPriceLsting).toFixed(2);
    const lstPriceLstingVal = parseFloat(lstPriceLsting);
    qntLsting = parseInt(qntLsting);
    let bCostFromRs = -1;
    let supplierFromRs = "";
    let brandFromRs = "";
    //////////////////  comparing listing data to RS   //////////////////
    const feedMap = priceQuantityMapFromDB.get(assiLsting);
    const feedMapStr = String(feedMap);
    const isInvalidFeedMap = (feedMapStr.includes("undefined") || feedMapStr.includes("null") );
    if (isInvalidFeedMap) {
        notParsedRS++;
        notParsedRSData += "Asin: "+assiLsting+" - rs-data: "+feedMapStr+"\n";
    } else {
        let [skuRs, qntRs, bCostRs, supplierRs,lstPriceRs, brandRs, shippingPrcRs] = feedMapStr.split(","); //from RS: sky,qnt,cost,supplyer,lstPrice,brand
        qntRs = parseInt(qntRs);
        bCostRs = parseFloat(bCostRs).toFixed(2);
        lstPriceRs = parseFloat(lstPriceRs);
        supplierRs = supplierRs.toLowerCase();
        bCostFromRs = bCostRs;
        supplierFromRs = supplierRs;
        brandFromRs = brandRs;
        shippingPrcRs = parseFloat(shippingPrcRs).toFixed(2);

        
        if ((skuLsting != skuRs || qntLsting != qntRs || lstPriceLstingVal != lstPriceRs) ||
             (rerunSkus &&  listToRerun.includes(skuLsting))) {
            noMatchSkuInfoWithRsCount++;
            let expence = aws_utils.calculateExpences(bCostRs, shippingPrcRs, assiLsting);
            // expence = parseFloat(expence);
            if (skuLsting !== skuRs) {
                badSkusCount++;
                badSkusList += item +"\n";
            }

            if(assiLsting=="B00JBSE67A") {
                console.log("===========================prRs:"+lstPriceRs+ " lstingPr:"+lstPriceLsting + " exp:"+expence);
            }
            // console.log("info: lstPr:"+lstPriceLsting+" bCost:"+bCostRs+" expenc:"+expence+" marg:"+parseFloat(lstPriceLstingVal-expence).toFixed(2));
            rows.push({
                asin: assiLsting, 
                sku: (skuLsting !== skuRs? "aws:"+ skuLsting + " RS:" + skuRs: skuLsting),
                listPrice: (lstPriceLstingVal !== lstPriceRs? "aws:"+ lstPriceLsting + " RS:" + parseFloat(lstPriceRs).toFixed(2): lstPriceLsting),
                quantity: (qntLsting !== qntRs? "aws:"+ qntLsting + " RS:" + qntRs: qntRs),
                margin: (expence > lstPriceLstingVal? "aws:"+ lstPriceLsting + " Exp:" + parseFloat(expence).toFixed(2): "E:" + parseFloat(expence).toFixed(2) + " M:" +parseFloat(lstPriceLstingVal-expence).toFixed(2)) ,
                supplier: supplierRs.slice(0, 4),
                brand: brandRs,
                msg: "Listing to RS"+ (skuLsting !== skuRs?", Sku bad❗":", Sku Ok✅") + 
                    (lstPriceLstingVal !== lstPriceRs?", ListPr Bad❗":", ListPr OK✅") + 
                    (qntLsting !== qntRs?", Qnt Bad❗":", Qty OK✅") + 
                    (expence > lstPriceLstingVal?", price Loss❗":", price OK✅")

            });
        }
    }

    ////////////////// comparing listing data to API   //////////////////
    // if(/^TRIO-\d{6}$/.test(skuLsting)) {
    //     goodSkusCount++;
    //     const apiRec = await aws_utils.fetchTrio(skuLsting); // ✅ //// calling API
    //     if (!apiRec || !Array.isArray(apiRec) || apiRec.length === 0) {
    //     if (apiRec === null) {
    //         badResponseCount++;
    //         badResponseList += skuLsting + "\n";
    //     } else {
    //         emptyResponseCount++;
    //         emptyResponseList += skuLsting + "\n";
    //     }
    //     } else {
    //         //[{"id":204055,"product_id":204055,"supplier_sku":"ECOMP-050870","supplier_id":5,
    //         // "sku":"TRIO-204057","list_price":"44.64","base_cost":"39.06","product_price":"70.39","quantity":1,"on_hand":0,
    //         // "supplier":"Encompass Supply Chain Solutions","brand":"Homelite","category":null,"is_active":true,
    //         // "item_name":"FUEL PUMP","total_cost":"58.66","main_image_url":null}]
    //         goodResponseCount++;
    //         const product = apiRec[0];
    //         const lstPriceApi = parseFloat(product.product_price); 
    //         const bCostApi = parseFloat(product.base_cost).toFixed(2); 
    //         const qntApi = parseInt(product.quantity); 
    //         const vendorApi = (product.supplier_sku).slice(0, 4).toLowerCase();
    //         const brandApi = (product.brand);
    //         if ( qntLsting !== qntApi || lstPriceLstingVal !== lstPriceApi || (bCostFromRs !==bCostApi && bCostFromRs != -1) ||
    //              !supplierFromRs.includes(vendorApi) || (rerunSkus &&  listToRerun.includes(skuLsting))) {
    //             noMatchApiInfoCount++;
    //             const expence = aws_utils.calculateExpences(bCostApi);
    //             rows.push({
    //                 asin: assiLsting, 
    //                 sku: skuLsting,
    //                 listPrice: (lstPriceLstingVal !== lstPriceApi? "aws: "+ lstPriceLsting + " Api:" + lstPriceApi: lstPriceLsting),
    //                 quantity: (qntLsting !== qntApi? "aws:"+ qntLsting + " Api:" + qntApi: qntApi+" ✅"),
    //                 margin: (expence > lstPriceApi? "Api:"+ lstPriceApi + " Exp:" + expence.toFixed(2): "E:" + parseFloat(expence).toFixed(2) +" M:"+parseFloat(lstPriceApi-expence).toFixed(2)) ,
    //                 supplier: (!supplierFromRs.toLowerCase().includes(vendorApi.toLowerCase())?" Api:"+vendorApi+" Rs:"+supplierFromRs:"vendors Ok"),
    //                 brand: (brandFromRs.toLowerCase()!=brandApi.toLowerCase()? "Api:"+brandApi+" Rs:"+brandFromRs: brandApi),
    //                 msg: "Listing to Api"+ (bCostFromRs !==bCostApi && bCostFromRs != -1?" ⚠️ bcost Api:"+bCostApi+" Rs:"+bCostFromRs:" bCost Ok") + 
    //                     (lstPriceLstingVal !== lstPriceApi?", LisPr Bad❗":", ListPr OK✅") + 
    //                     (qntLsting !== qntApi?", Qnt Bad❗":", Qty OK✅") + 
    //                     (expence > lstPriceApi?", price Loss❗":", price OK✅")
    //             });
    //         }
    //     }

    // } else {
    //     badSkusCount++;
    //     badSkusList += item +"\n";
    // }
    
  } // end of for
  console.log("🔄 done ...  "+totalProgress+" records verified");
// const allAsinsToDelete = tmpArr.map(line => line.split(' | TRIO-')[0].trim());
// const asinArray = allAsins.split(',').map(asin => asin.trim());






const msToPrint ="Report run: "+ 
"\n\n comparing Listing data to RS:"+
"\n\n\nTotal not parsed RS: " + notParsedRS +"\n"+notParsedRSData+
"\n\n\nTotal Asins from listing and mapped to RS has mismatch from Listing in compare to RS: "+ noMatchSkuInfoWithRsCount+"\n"+
aws_utils.printAlignedTable(rows, "Listing to RS", 2)
// noMatchSkuInfoWithRsList+
// "\n\n\n comparing Listing data to API:"+
// "\nTotal skus which was found by API and returned result: "+ goodResponseCount+
// "\n\nTotal bad sku (not formated as TRIO-.....): "+ badSkusCount + "\n"+ badSkusList+
// "\n\n\n\nTotal bad skus which was not found by API at all: "+ badResponseCount+"\n"+badResponseList+
// "\n\n\n\nTotal skus which was not found by API but returned empty result: "+ emptyResponseCount+"\n"+emptyResponseList+
// "\n\n\n\nTotal mismached Api in compare to Listing: "+ noMatchApiInfoCount +"\n"+
// aws_utils.printAlignedTable(rows, "Listing to Api", 2);

aws_utils.writeToFile("Documents", 'a_listing_rs_api_'+dateStr+'.txt', msToPrint);
console.log("**********  Done  **********");
});