import puppeteer, { Browser, Page } from 'puppeteer';

interface CardInfo {
  message: string;
  cardNumber?: string;
  expirationDate?: string;
  status?: string;
  balance?: string;
}

async function hafilatCardInfo(serialNumber: string): Promise<CardInfo> {
  const browser = await puppeteer.launch({
    args: ['--disable-setuid-sandbox', '--no-sandbox', '--single-process', '--no-zygote'],
    executablePath:
      process.env.NODE_ENV === 'production'
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  const page: Page = await browser.newPage();
  const cardInfo: CardInfo = { message: 'Error fetching card info' };

  try {
    await page.goto('https://hafilat.darb.ae/AnonymousMedia/Default.aspx');
    await page.waitForSelector('input[name="ctl00$cphContent$tbSerialNumber"]');
    await page.type('input[name="ctl00$cphContent$tbSerialNumber"]', serialNumber);

    await Promise.all([
      page.click('input[name="ctl00$cphContent$btnSubmit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    const errorElement = await page.$('#result.error_text');
    if (errorElement) {
      const errorMessageElement = await page.$('#lblFailure');
      cardInfo.message = errorMessageElement
        ? await errorMessageElement.evaluate((node) => node.textContent?.trim() || '')
        : 'Unknown error';
    } else {
      const cardNumberElement = await page.$(
        '#ctl00_ctl00_cphContent_cphContent_MediaRepeater_ctl00_MediaControl_SerialNumber',
      );
      const expirationDateElement = await page.$(
        '#ctl00_ctl00_cphContent_cphContent_MediaRepeater_ctl00_MediaControl_ExpirationDate',
      );
      const statusElement = await page.$(
        '#ctl00_ctl00_cphContent_cphContent_MediaRepeater_ctl00_MediaControl_MediaStatus',
      );
      const balanceElement = await page.$(
        '#ctl00_ctl00_cphContent_cphContent_MediaRepeater_ctl00_MediaControl_ContractRepeater_ctl00_detailProduct',
      );

      const balance = await balanceElement?.evaluate((node) => {
        const balanceText = node.textContent?.trim() || '';
        const balanceMatch = balanceText.match(/Balance\s*:\s*([\d.]+)\s*AED/i);
        return balanceMatch ? balanceMatch[1] : null;
      });

      cardInfo.cardNumber = await cardNumberElement?.evaluate(
        (node) => node.textContent?.trim() || '',
      );
      cardInfo.expirationDate = await expirationDateElement?.evaluate(
        (node) => node.textContent?.trim() || '',
      );
      cardInfo.status = await statusElement?.evaluate((node) => node.textContent?.trim() || '');
      cardInfo.balance = balance || undefined;

      cardInfo.message = 'Success';
    }
  } catch (error) {
    console.error('An error occurred:', error);
    cardInfo.message = 'An error occurred';
  } finally {
    await browser.close();
    return cardInfo;
  }
}

export default hafilatCardInfo;
