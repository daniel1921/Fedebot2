const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' }); // headless:true también funciona
  const page = await browser.newPage();

  // Opcional: setear headers como Postman
  await page.setExtraHTTPHeaders({
    'User-Agent': 'PostmanRuntime/7.44.0',
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
  });

  const url = 'https://gameinfo.albiononline.com/api/gameinfo/search?q=venecostenio';
  await page.goto(url, { waitUntil: 'networkidle0' });

  const content = await page.evaluate(() => document.body.innerText);
  const json = JSON.parse(content);

  console.log("✅ FUNCIONÓ desde navegador real:", json);

  await browser.close();
})();