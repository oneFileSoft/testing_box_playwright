import { test, expect } from '@playwright/test';
test.use({ browserName: 'chromium' });
test('site has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  await expect(page).toHaveTitle(/Playwright/);// Expect a title "to contain" a substring.
});

test('click on link', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Get started' }).click();// Click the get started link.

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
///////////////////////////////////////////////////////////////////
// await page.goto('https://reqres.in/');
///////////////////////////////////////////////////////////////////

// response:
// body : {"data":{"id":2,"email":"janet.weaver@reqres.in","first_name":"Janet","last_name":"Weaver","avatar":"https://reqres.in/img/faces/2-image.jpg"},"support":{"url":"https://contentcaddy.io?utm_source=reqres&utm_medium=json&utm_campaign=referral","text":"Tired of writing endless social media content? Let Content Caddy generate it for you."}}
// headers: {"date":"Fri, 14 Mar 2025 18:10:03 GMT","content-type":"application/json; charset=utf-8","content-length":"51","connection":"keep-alive","report-to":"{\"group\":\"heroku-nel\",\"max_age\":3600,\"endpoints\":[{\"url\":\"https://nel.heroku.com/reports?ts=1741975803&sid=c4c9725f-1ab0-44d8-820f-430df2718e11&s=a2BElexNcsjaPSgx1XuruOcWNOt1D9r1bjwU68J9MZ4%3D\"}]}","reporting-endpoints":"heroku-nel=https://nel.heroku.com/reports?ts=1741975803&sid=c4c9725f-1ab0-44d8-820f-430df2718e11&s=a2BElexNcsjaPSgx1XuruOcWNOt1D9r1bjwU68J9MZ4%3D","nel":"{\"report_to\":\"heroku-nel\",\"max_age\":3600,\"success_fraction\":0.005,\"failure_fraction\":0.05,\"response_headers\":[\"Via\"]}","x-powered-by":"Express","access-control-allow-origin":"*","etag":"W/\"33-5gJ3PWt3i39d40qmk6y4tRhOPDA\"","via":"1.1 vegur","cf-cache-status":"DYNAMIC","server":"cloudflare","cf-ray":"9205b9c36fb5e7eb-DFW","server-timing":"cfL4;desc=\"?proto=TCP&rtt=25807&min_rtt=25192&rtt_var=10677&sent=6&recv=6&lost=0&retrans=0&sent_bytes=2820&recv_bytes=662&delivery_rate=135888&cwnd=252&unsent_bytes=0&cid=106dbc62888517b0&ts=612&x=0\""}
test('api test --- GET', async ({ request }) => {
  const resp = await request.get("https://reqres.in/api/users/2"); 
  expect (resp.status()).toBe(200);
  const text = await resp.text();
  console.log("text : " + text);
  console.log("---------------------");

  const bodyRaw = await resp.body();
  const body = bodyRaw.toString();
  const redBody =  JSON.parse(body);
  console.log("body : " + body);
  console.log("");
  // Access specific keys in Body
     console.log("specific keys: redBody.data.first_name=" + redBody.data.first_name + "    redBody.data.avatar="+redBody.data.avatar);
     console.log("---------------------");
  expect (body).toContain('Janet');

  const headers = await resp.headers();
  console.log("headers: " + JSON.stringify(headers));  // Convert headers to string
  console.log("---------------------");
    // Access specific headers
      console.log("specific headers - Vary header: " + headers['vary']);
      console.log("specific headers - Accept-Encoding header: " + headers['accept-encoding']);
});





// response:
// body: {"id":"<random-int>","createdAt":"2025-03-14T18:05:49.108Z"}
// headers: {"date":"Fri, 14 Mar 2025 18:10:03 GMT","content-type":"application/json; charset=utf-8","content-length":"51","connection":"keep-alive","report-to":"{\"group\":\"heroku-nel\",\"max_age\":3600,\"endpoints\":[{\"url\":\"https://nel.heroku.com/reports?ts=1741975803&sid=c4c9725f-1ab0-44d8-820f-430df2718e11&s=a2BElexNcsjaPSgx1XuruOcWNOt1D9r1bjwU68J9MZ4%3D\"}]}","reporting-endpoints":"heroku-nel=https://nel.heroku.com/reports?ts=1741975803&sid=c4c9725f-1ab0-44d8-820f-430df2718e11&s=a2BElexNcsjaPSgx1XuruOcWNOt1D9r1bjwU68J9MZ4%3D","nel":"{\"report_to\":\"heroku-nel\",\"max_age\":3600,\"success_fraction\":0.005,\"failure_fraction\":0.05,\"response_headers\":[\"Via\"]}","x-powered-by":"Express","access-control-allow-origin":"*","etag":"W/\"33-5gJ3PWt3i39d40qmk6y4tRhOPDA\"","via":"1.1 vegur","cf-cache-status":"DYNAMIC","server":"cloudflare","cf-ray":"9205b9c36fb5e7eb-DFW","server-timing":"cfL4;desc=\"?proto=TCP&rtt=25807&min_rtt=25192&rtt_var=10677&sent=6&recv=6&lost=0&retrans=0&sent_bytes=2820&recv_bytes=662&delivery_rate=135888&cwnd=252&unsent_bytes=0&cid=106dbc62888517b0&ts=612&x=0\""}
test('api test --- POST', async ({ request }) => {
  const resp = await request.post("https://reqres.in/api/users", {
    "name": "Slava",
    "job": "Plakhin"
   }
  ); 
  expect (resp.status()).toBe(201);
  const text = await resp.text();
  console.log("text : " + text);
  console.log("---------------------");

  const bodyRaw = await resp.body();
  const body = bodyRaw.toString();
  const respBody =  JSON.parse(body);
  console.log("body : " + body);
  console.log("");
  // Access specific keys in Body
     console.log("specific keys: respBody.id=" + respBody.id + "    respBody.createdAt="+respBody.createdAt);
     console.log("---------------------");
  expect (body).not.toContain('Slava');//body: {"id":"<random-int>","createdAt":"2025-03-14T18:05:49.108Z"}
  expect (body).toContain("2025");

  const headers = await resp.headers();
  console.log("headers: " + JSON.stringify(headers));  // Convert headers to string
  console.log("---------------------");
    // Access specific headers
      console.log("specific headers - Vary header: " + headers['vary']);
      console.log("specific headers - Accept-Encoding header: " + headers['accept-encoding']);
});




// response:
// body : {"updatedAt":"2025-03-14T21:39:08.337Z"}
// headers: {"date":"Fri, 14 Mar 2025 21:39:08 GMT","content-type":"application/json; charset=utf-8","content-length":"40","connection":"keep-alive","report-to":"{\"group\":\"heroku-nel\",\"max_age\":3600,\"endpoints\":[{\"url\":\"https://nel.heroku.com/reports?ts=1741988348&sid=c4c9725f-1ab0-44d8-820f-430df2718e11&s=1bKkB85p8ReapP5%2Bz9%2FKcAl2gMMlS0loa%2F7NidWczfQ%3D\"}]}","reporting-endpoints":"heroku-nel=https://nel.heroku.com/reports?ts=1741988348&sid=c4c9725f-1ab0-44d8-820f-430df2718e11&s=1bKkB85p8ReapP5%2Bz9%2FKcAl2gMMlS0loa%2F7NidWczfQ%3D","nel":"{\"report_to\":\"heroku-nel\",\"max_age\":3600,\"success_fraction\":0.005,\"failure_fraction\":0.05,\"response_headers\":[\"Via\"]}","x-powered-by":"Express","access-control-allow-origin":"*","etag":"W/\"28-FFSfPwR209Glmluf4I3zxXLj9i4\"","via":"1.1 vegur","cf-cache-status":"DYNAMIC","vary":"Accept-Encoding","server":"cloudflare","cf-ray":"9206ec07ffdc6b9b-DFW","server-timing":"cfL4;desc=\"?proto=TCP&rtt=24656&min_rtt=23514&rtt_var=9634&sent=5&recv=5&lost=0&retrans=0&sent_bytes=2819&recv_bytes=663&delivery_rate=174023&cwnd=249&unsent_bytes=0&cid=a03a7e74807da491&ts=273&x=0\""}test('api test --- PUT', async ({ request }) => {
test('api test --- PUT', async ({ request }) => {
  const resp = await request.put("https://reqres.in/api/users/2", {
   "name": "morpheus",
   "job": "zion resident"
   }
  ); 
  expect (resp.status()).toBe(200);
  const text = await resp.text();
  console.log("text : " + text);
  console.log("---------------------");

  const bodyRaw = await resp.body();
  const body = bodyRaw.toString();
  const respBody =  JSON.parse(body);
  console.log("body : " + body);
  console.log("");
  // Access specific keys in Body
     console.log("specific keys: respBody.updatedAt="+respBody.updatedAt);
     console.log("---------------------");
  expect (body).not.toContain('Slava');
  expect (body).toContain("2025");

  const headers = await resp.headers();
  console.log("headers: " + JSON.stringify(headers));  // Convert headers to string
  console.log("---------------------");
    // Access specific headers
      console.log("specific headers - Vary header: " + headers['vary']);
      console.log("specific headers - Accept-Encoding header: " + headers['accept-encoding']);
});


// response:
// body: {"data": [], "type": "Buffer"}
// headers: {"date":"Fri, 14 Mar 2025 21:39:08 GMT","content-type":"application/json; charset=utf-8","content-length":"40","connection":"keep-alive","report-to":"{\"group\":\"heroku-nel\",\"max_age\":3600,\"endpoints\":[{\"url\":\"https://nel.heroku.com/reports?ts=1741988348&sid=c4c9725f-1ab0-44d8-820f-430df2718e11&s=1bKkB85p8ReapP5%2Bz9%2FKcAl2gMMlS0loa%2F7NidWczfQ%3D\"}]}","reporting-endpoints":"heroku-nel=https://nel.heroku.com/reports?ts=1741988348&sid=c4c9725f-1ab0-44d8-820f-430df2718e11&s=1bKkB85p8ReapP5%2Bz9%2FKcAl2gMMlS0loa%2F7NidWczfQ%3D","nel":"{\"report_to\":\"heroku-nel\",\"max_age\":3600,\"success_fraction\":0.005,\"failure_fraction\":0.05,\"response_headers\":[\"Via\"]}","x-powered-by":"Express","access-control-allow-origin":"*","etag":"W/\"28-FFSfPwR209Glmluf4I3zxXLj9i4\"","via":"1.1 vegur","cf-cache-status":"DYNAMIC","vary":"Accept-Encoding","server":"cloudflare","cf-ray":"9206ec07ffdc6b9b-DFW","server-timing":"cfL4;desc=\"?proto=TCP&rtt=24656&min_rtt=23514&rtt_var=9634&sent=5&recv=5&lost=0&retrans=0&sent_bytes=2819&recv_bytes=663&delivery_rate=174023&cwnd=249&unsent_bytes=0&cid=a03a7e74807da491&ts=273&x=0\""}
test('api test --- DELETE', async ({ request }) => {
  const resp = await request.delete("https://reqres.in/api/users/2"); 
  expect (resp.status()).toBe(204);
  const text = await resp.text();
  console.log("text : " + text);
  console.log("---------------------");

  const bodyRaw = await resp.body();
  const body = bodyRaw.toString();
  console.log("---------------------" + body);
  expect (body.length).toBe(0);

  const headers = await resp.headers();
  console.log("headers: " + JSON.stringify(headers));  // Convert headers to string
  console.log("---------------------");
    // Access specific headers
      console.log("specific headers - Vary header: " + headers['vary']);
      console.log("specific headers - Accept-Encoding header: " + headers['accept-encoding']);
});
