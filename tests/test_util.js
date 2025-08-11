import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import path from 'path';

async function loginToAWS(page) {
    await page.goto('https://sellercentral.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fsellercentral.amazon.com%2Fmyinventory%2Finventory&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=sc_na_amazon_v2&openid.mode=checkid_setup&language=en_US&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&pageId=sc_amazon_v3_unified&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&ssoResponse=eyJ6aXAiOiJERUYiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiQTI1NktXIn0.Rw3gA1Gk4ypalPU-Hd81X4-d-KkDAQY2Jq8XSH_CFnU9GVafpQUmkg.GddFsM8czxA1rB0W.eWoUVNUqlxaGpqz2DlvdG4sBL1KMh8FAcgcjdO-7OYDOvbVVOBeqLh4ppIXHlagNDORcmuzt6LY9HuxoU42RcCNRAfHUsyHIfGKQB1Oz8j7uYMm2H7_kTGlU8i13lqEXPUQ3P-RYuBOU7cVpuveiCSZ5OyY792i6fRE05vd0quHvNgfkBJ3HOGrAa9N_bXZG-kwNi8Lu.dU3M3lTTBDFx7Gl1VqvtNg');
    await page.getByRole('textbox', { name: 'Email or mobile phone number' }).fill('sales@arbatrade.us');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('W!qU?P^xoB977');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('textbox', { name: 'Enter OTP:' }).click();
    //here, I'm entering QTP code and then click "Sign" again - manually

    await page.getByRole('button', { name: 'United States' }).waitFor({ timeout: 30000 });
    await page.getByRole('button', { name: 'United States' }).click();
    await page.getByRole('button', { name: 'Select account' }).click();
    await page.getByRole('button', { name: 'close' }).click();
    await page.getByRole('button', { name: 'close' }).click();

    
    // Wait until <h1> says "Manage All Inventory"
    await page.waitForURL('**/myinventory/inventory**', { timeout: 60000 });
    await page.waitForFunction(() => {
        const el = document.querySelector('h1');
        return el && el.textContent.includes('Manage All Inventory');
    }, { timeout: 60000 });
}

function todayDateSignature() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${mm}-${dd}-${yyyy}_${hh}-${min}`;
}
async function writeToFile(folderName, fileName, txt) {
  const filePath = path.join(homedir(), folderName, fileName); // 🔥 Save outerHTML to ~/Documents/...
  await writeFile(filePath, txt);
}
async function readFromFile(folderName, fileName) {
  const filePath = path.join(homedir(), folderName, fileName);
  return await readFile(filePath, 'utf8');
}
function countOccurrences(text, searchFor) {
  return text.split(searchFor).length - 1;
}
function extractAfter(block, anchor1, anchor2, pattern) {
  let start = 0;
  if (anchor1 && block.includes(anchor1)) {
    start = block.indexOf(anchor1) + anchor1.length;
  }
  let sub = block.substring(start);

  if (anchor2 && sub.includes(anchor2)) {
    sub = sub.substring(sub.indexOf(anchor2) + anchor2.length);
  }

  const regex = new RegExp(pattern);
  const match = regex.exec(sub);
  return match ? match[1] : null;
}
function extractBetween(block, fromTxt, toTxt) {
  if (!block.includes(fromTxt) || !block.includes(toTxt)) {
    return '';
  }
  const start = block.indexOf(fromTxt) + fromTxt.length;
  const end   = block.indexOf(toTxt, start);
  return block.substring(start, end);
}
function cleanNumber(num) {
  return num != null ? num.replace(/,/g, '') : null;
}

function loadFeedMapFromDB(dbRecords, rs = 1) {
  // dbRecords is an array of objects like:
// {
//   asin: 'B00004WADO',
//   seller_sku: 'TRIO-427574',
//   quantity: 2,
//   base_cost: '132.00',
//   supplier_sku: 'ECOMP-244103'
// }  
  let priceMap = new Map();
  for (const row of dbRecords) {
    const asin = String(row.asin).trim();
    const sky = String(row.seller_sku).trim();
    const qnt = String(row.quantity).trim();
    const bCost = String(row.base_cost).trim();
    const supplyer = String(row.supplier_sku).trim(); //encompass, metropac
    let valToCollect = sky+","+qnt+","+bCost+","+supplyer;
    if(rs === 2) {
        let lstPrice = String(row.listing_price).trim();
        let brand = String(row.brand_name).trim();
        valToCollect += "," + lstPrice + "," + brand; //sky,qnt,bCost,supplyer,lstPrice,brand
    } else if(rs === 3) {
        let lstPrice = String(row.listing_price).trim();
        let brand = String(row.brand_name).trim();
        let shiping = String(row.shipping_cost).trim();
        valToCollect += "," + lstPrice + "," + brand+","+shiping; //sky,qnt,bCost,supplyer,lstPrice,brand,shiping
    }
    priceMap.set(asin, valToCollect);
  }
  return priceMap;
}
function printAlignedTable(rows, patternToPrint, style = 1) {
  // 1) Define the column headers and the corresponding object keys
  let headers = [];
  let keys = [];
  if (style === 1) {
    headers = ['Status', 'ASIN', 'SKU', 'Supplier', 'B-Cost', 'ListPrice', 'BuyBox', 'Quantity', 'Msg'];
    keys = ['state',  'asin', 'sku', 'supplier', 'bsdCost',   'listPrice', 'buyBox', 'quantity', 'msg'];
  } else if (style === 2) {
    headers = ['Asin', 'SKU', 'ListPrice', 'Quantity', 'Expence-Margin', 'Supplier', 'Brand', 'Msg'];
    keys =    ['asin', 'sku', 'listPrice', 'quantity', 'margin','supplier', 'brand', 'msg'];
  }
  const filteredRows = [];
  for (const row of rows) {
    let tAr = [];
    if (patternToPrint.includes("-|-")) {
        tAr = patternToPrint.split("-|-");
    }
    const msg = String(row.msg);
    if (tAr.length == 2) {
        if (msg.includes(String(tAr[0])) && msg.includes(String(tAr[1]))) {
         filteredRows.push(row);
        }        
    } else if (tAr.length == 3) {
        if (msg.includes(String(tAr[0])) && msg.includes(String(tAr[1])) && msg.includes(String(tAr[2]))) {
         filteredRows.push(row);
        }        
    } else if (tAr.length == 4) {
        if (msg.includes(String(tAr[0])) && msg.includes(String(tAr[1])) && msg.includes(String(tAr[2])) && msg.includes(String(tAr[3]))) {
         filteredRows.push(row);
        }        
    } else {
        if (msg.includes(patternToPrint)) {
         filteredRows.push(row);
        }        
    }
  }
  let printOut = ""; 
  // 2) Compute the maximum width of each column
  const widths = headers.map((h, i) => {
    return Math.max(
      h.length,
      ...filteredRows.map(r => String(r[keys[i]]).length)
    );
  });

  // 3) Build a helper to pad a cell
  const pad = (str, width) => str.padEnd(width, ' ');

  // 4) Print header row
  const headerLine = headers.map((h, i) => pad(h, widths[i])).join(' | ');
  printOut += headerLine + "\n";//console.log(headerLine);

  // 5) Print a separator
  const b = widths.map(w => '-'.repeat(w)).join('-|-');
  printOut += b + "\n";//console.log(b);

  // 6) Print each data row
  for (const row of filteredRows) {
    const line = keys
      .map((k, i) => pad(String(row[k]), widths[i]))
      .join(' | ');
       printOut += line + "\n";
  }
  return printOut;
}

                        function loadPriceMap2(fileContent) { // used to read content of CSV file
                        const lines = fileContent.trim().split(/\r?\n/);
                        const priceObj = {};
                        for (const line of lines) {
                            const [asin, base_cost] = line.split(',');
                            priceObj[asin.replace(/^\uFEFF/, '').trim().replace(/^"|"$/g, '')] = parseFloat(base_cost.trim().replace(/^"|"$/g, ''));
                        }
                        return priceObj;
                        }
                        function loadFeedMap(fileContent) {
                        const lines = fileContent.trim().split(/\r?\n/);
                        let priceMap = new Map();
                        for (const line of lines) {
                            // const cols = line.split(',');
                            // const asin = cols[0].replace(/^\uFEFF/, '').trim().replace(/^"|"$/g, '');
                            // const cost = cols[1].trim().replace(/^"|"$/g, '');
                            if (!line) continue;                  // skip blank lines
                            const cols = line.split(',');
                            let [rawAsin, rawSky, rawQnt, rawCost] = cols;
                            const asin = rawAsin.replace(/^\uFEFF/, '').trim().replace(/^"|"$/g, '');    
                            const sky = rawSky.replace(/^\uFEFF/, '').trim().replace(/^"|"$/g, '');            
                            const qnt = rawQnt.replace(/^\uFEFF/, '').trim().replace(/^"|"$/g, '');            
                            const cost = rawCost.trim().replace(/^"|"$/g, '');

                            priceMap.set(asin, sky+","+qnt+","+cost);
                        }
                        return priceMap;// console.log("the size of the map = " + priceMap.size);
                        }
  async function fetchTrio(productCode) {
    const url = `https://api.hvacandmore.com/api/products?search=${encodeURIComponent(productCode)}`;
    const t ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsInVzZXJuYW1lIjoic3BsYWtoaW4iLCJyb2xlIjozLCJpYXQiOjE3NTQ2NjIyMzIsImV4cCI6MTc1NDcwNTQzMn0.1mJVwYLiLNCCbgzpkqfl-8IM3ByXrCVp3OnNoY0JkNk';
    let response ;
    try{ response = await fetch(url, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+ t,
            'Origin': 'https://admin.hvacandmore.com',
            'Referer': 'https://admin.hvacandmore.com/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
            }
         });
    } catch (_) {
     return null;
    }     

    if (!response.ok) {
        console.error(`❌ HTTP ${response.status} for ${productCode}`);
        return null;
    }
    try {
        const json = await response.json();
        return json;
    } catch (err) {
        console.error(`❌ Failed to parse JSON for ${productCode}:`, err.message);
        return null;
    }
  }              
  function runTime(startTime) {
    const endTest = Date.now();
    const totalDurationInSeconds = parseInt((endTest - parseInt(startTime)) / 1000);
    const minutes = Math.floor(totalDurationInSeconds / 60);
    const seconds = totalDurationInSeconds % 60;

    report `🕒 Test completed in ${minutes} mins ${parseInt(seconds)} sec`;
  }     
  function calculateExpences(bCost, shipping = 13, asn =gg) {
    // let bCostVal = parseFloat(bCost);
    // let expence = bCostVal + 12.50;
    // expence += bCostVal <= 20? 4:bCostVal * 0.33;
    // return parseFloat(expence + expence * 0.15);// that will be our listing price
    let expence = parseFloat(bCost) + parseFloat(shipping);
    // if (asn == "B00JBSE67A") { console.log("-------- bCost:"+bCost+" shipping:"+shipping + " exp:"+expence); }
    expence += expence * 0.035; // tax taken on part + shipping
    // if (asn == "B00JBSE67A") { console.log("-------- expence:"+expence); }
    return expence + (expence * 0.15); //expence * 0.15 == amazon fees from sell
  }   
  export default {
    loginToAWS,
    todayDateSignature,
    writeToFile,
    readFromFile,
    countOccurrences,
    extractAfter,
    extractBetween,
    cleanNumber,
    loadFeedMapFromDB,
    printAlignedTable,
    runTime,
    calculateExpences,
    fetchTrio
  };