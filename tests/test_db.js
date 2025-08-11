// test_db.js
const { connect } = require('http2');
const { Client } = require('pg');

async function runQuery(querySelector = 1) {
  const client = new Client({
    host:'triotrade-1.cruyuuigeo2i.us-east-2.rds.amazonaws.com',
    port:5432,
    user:'postgres',
    password:'9tmLWM24HoV9qW6C9ELt',
    database:'trio_trade',
    ssl: false
  });

  console.log('before connect');
  await client.connect();
  console.log('before query');
    const query1 =`SELECT DISTINCT ON (al.asin)
    al.asin,
    p.sku as seller_sku,
    i.on_hand as quantity,
    p.base_cost,
    p.supplier_sku
      FROM supplier_feeds.amazon_listings al
    JOIN ecom_store.products p ON al.product_id = p.product_id
    JOIN ecom_store.inventory i ON i.supplier_product_id = p.supplier_product_id 
    LEFT JOIN ecom_store.product_prices pp ON p.product_id = pp.product_id
    LEFT JOIN ecom_store.product_brands pb ON p.product_id = pb.product_id
    LEFT JOIN ecom_store.brands b ON pb.brand_id = b.brand_id
    WHERE p.is_active = TRUE
        AND al.is_on_amazon = TRUE
        AND al.asin IS NOT NULL
        AND al.asin != ''
    ORDER BY al.asin;`;

    const q1 =`SELECT DISTINCT ON (al.asin)
    al.asin,
    p.sku as seller_sku,
    i.on_hand as quantity,
    pp.product_price as listing_price,
    p.base_cost,
    sc.shipping_cost,
    p.supplier_sku,
    b.name as brand_name
    FROM supplier_feeds.amazon_listings al
    JOIN ecom_store.products p ON al.product_id = p.product_id
    JOIN ecom_store.product_shipping_costs sc ON sc.product_id = p.product_id 
    JOIN ecom_store.inventory i ON i.supplier_product_id = p.supplier_product_id 
    LEFT JOIN ecom_store.product_prices pp ON p.product_id = pp.product_id
    LEFT JOIN ecom_store.product_brands pb ON p.product_id = pb.product_id
    LEFT JOIN ecom_store.brands b ON pb.brand_id = b.brand_id
    WHERE p.is_active = TRUE
        AND al.asin IS NOT NULL
        AND al.asin != ''
    ORDER BY al.asin;`;
    const query2 =`SELECT DISTINCT ON (al.asin)
    al.asin,
    p.sku as seller_sku,
    i.on_hand as quantity,
    pp.product_price as listing_price,
    p.base_cost,
    p.supplier_sku,
    b.name as brand_name
    FROM supplier_feeds.amazon_listings al
    JOIN ecom_store.products p ON al.product_id = p.product_id
    JOIN ecom_store.inventory i ON i.supplier_product_id = p.supplier_product_id 
    LEFT JOIN ecom_store.product_prices pp ON p.product_id = pp.product_id
    LEFT JOIN ecom_store.product_brands pb ON p.product_id = pb.product_id
    LEFT JOIN ecom_store.brands b ON pb.brand_id = b.brand_id
    WHERE p.is_active = TRUE
        AND al.is_on_amazon = TRUE
        AND al.asin IS NOT NULL
        AND al.asin != ''
    ORDER BY al.asin;`; //     al.listing_status, al.last_amazon_check, al.is_on_amazon, p.item_name,


  let selectedQuery = (querySelector === 1) ? query1 : query2;
  if (querySelector===3) {
    selectedQuery = q1;
  }
  const res = await client.query(selectedQuery);
  console.log("Total records : "+res.rows.length +" fetched from DB"); // Or do whatever you need with the data
// console.log(res.rows[0]);
  await client.end();
  return res.rows;
}

// runQuery().catch(console.error);
module.exports = { runQuery };
