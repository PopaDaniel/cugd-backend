const puppeteer = require("puppeteer-core");
const { execSync } = require("child_process");

(async () => {
  try {
    // Explicitly download the correct version of Chromium
    execSync("npx puppeteer-core install chrome");
    console.log("Chromium installation successful");
  } catch (error) {
    console.error("Failed to install Chromium", error);
    process.exit(1);
  }
})();
