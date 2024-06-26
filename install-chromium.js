const puppeteer = require("puppeteer-core");
const fs = require("fs");
const { promisify } = require("util");
const { chromium } = require("playwright-core");

const downloadBrowser = async () => {
  const browserFetcher = playwright.chromium.createBrowserFetcher();
  const revisionInfo = await browserFetcher.download("756035");

  console.log(`Downloaded revision: ${revisionInfo.folderPath}`);
  const browser = await puppeteer.launch({
    executablePath: revisionInfo.executablePath,
  });
};

downloadBrowser().catch(console.error);
