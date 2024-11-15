import pLimit from 'p-limit';
import puppeteer from 'puppeteer';
import fs from 'node:fs';
let i = 0;
const urls = fs
  .readFileSync('./url.csv')
  .toString()
  .split('\n')
  .map((v) => v.split(','))
  .map((v) => v[1]?.replace('\r', ''));

const processUrlWithPage = async (url, browser) => {
  const page = await browser.newPage();
  i++;
  console.log(i);
  try {
    await page.goto(`http://${url}`);
    await page.waitForSelector('body');

    const DOMresult = await page.evaluate(() => {
      try {
        document.body.innerHTML = 'hoge';
        return 'Success';
      } catch (error) {
        return { error: error.message };
      }
    });
    const evalResult = await page.evaluate(() => {
      try {
        eval(console.log(1));
        return 'Sunccess';
      } catch (error) {
        return { error: error.message };
      }
    });
    const fetchResult = await page.evaluate(() => {
      try {
        fetch('https://google.com');
        return 'Sunccess';
      } catch (error) {
        return { error: error.message };
      }
    });
    if (DOMresult?.error) {
      fs.appendFileSync('result.txt', url);
      fs.appendFileSync('result.txt', DOMresult.error);
    }
    if (evalResult?.error) {
      fs.appendFileSync('result.txt', url);
      fs.appendFileSync('result.txt', evalResult.error);
    }
    if (fetchResult.error) {
      fs.appendFileSync('result.txt', url);
      fs.appendFileSync('result.txt', fetchResult.error);
    }
  } catch (outerError) {
    return { error: outerError.message };
  } finally {
    await page.close();
  }
};

const main = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const limit = pLimit(300);

  const results = await Promise.all(
    urls.map((url) => limit(() => processUrlWithPage(url, browser)))
  );

  console.log('全URLの処理が完了しました:', results);
  await browser.close();
};

main();
