const { exec } = require("child_process");

// Function to execute a command asynchronously
const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed to execute command: ${command}`);
        console.error(stderr); // Log any error output
        reject(error);
      } else {
        console.log(stdout); // Log standard output
        resolve();
      }
    });
  });
};

// Main function to install Chromium using puppeteer-core
(async () => {
  try {
    await executeCommand("npx puppeteer-core install");
    console.log("Chromium installation successful");
  } catch (error) {
    console.error("Failed to install Chromium", error);
    process.exit(1); // Exit with non-zero code to indicate failure
  }
})();
