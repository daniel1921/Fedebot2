// utils/albionApi.js
const puppeteer = require("puppeteer");

async function buscarJugadorAlbion(nickname) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    "User-Agent": "PostmanRuntime/7.44.0",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive"
  });

  const url = `https://gameinfo.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(nickname)}`;
  await page.goto(url, { waitUntil: "networkidle0" });

  const content = await page.evaluate(() => document.body.innerText);
  const json = JSON.parse(content);

  await browser.close();
  return json;
}

module.exports = { buscarJugadorAlbion };