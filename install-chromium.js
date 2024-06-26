const { execSync } = require("child_process");

(async () => {
  try {
    // Execute puppeteer-core install command to download Chromium
    execSync("npx puppeteer-core install");
    console.log("Chromium installation successful");
  } catch (error) {
    console.error("Failed to install Chromium", error);
    process.exit(1); // Exit with non-zero code to indicate failure
  }
})();
