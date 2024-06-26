const puppeteer = require("puppeteer");

(async () => {
  try {
    // Trigger the Puppeteer installation process
    await puppeteer.launch();
    console.log("Chromium installation successful");
  } catch (error) {
    console.error("Failed to install Chromium", error);
    process.exit(1);
  }
})();
