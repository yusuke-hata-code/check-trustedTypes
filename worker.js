import pLimit from 'p-limit';
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const urls = fs
  .readFileSync('./url.csv')
  .toString()
  .split('\n')
  .map((v) => v.split(','))
  .map((v) => v[1]?.replace('\r', ''));

const processUrlWithPage = async (url, browser) => {
  const page = await browser.newPage();

  try {
    await page.goto(`http://${url}`);
    await page.waitForSelector('body');

    const result = await page.evaluate(() => {
      try {
        document.body.innerHTML = 'hoge';
        return 'Success';
      } catch (error) {
        return { error: error.message };
      }
    });

    return result.error ? { error: result.error } : { result: 'Success' };
  } catch (outerError) {
    return { error: outerError.message };
  } finally {
    await page.close();
  }
};

const main = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const limit = pLimit(20); // 同時に20ページのみ処理

  const results = await Promise.all(
    urls.map((url) => limit(() => processUrlWithPage(url, browser)))
  );

  console.log('全URLの処理が完了しました:', results);
  await browser.close();
};

main();
