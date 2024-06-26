const puppeteer = require("puppeteer-core");
const { promisify } = require("util");

const downloadChromium = async () => {
  const fetcher = puppeteer.createBrowserFetcher();
  const revisionInfo = await fetcher.download("756035"); // Replace with desired Chromium revision

  console.log(`Chromium downloaded to: ${revisionInfo.folderPath}`);
  console.log(`Executable path: ${revisionInfo.executablePath}`);

  // Optionally, you can save the executable path to an environment variable for later use
  process.env.CHROMIUM_EXECUTABLE_PATH = revisionInfo.executablePath;
};

downloadChromium().catch((error) => {
  console.error("Failed to download Chromium:", error);
  process.exit(1); // Exit with non-zero code to indicate failure
});
