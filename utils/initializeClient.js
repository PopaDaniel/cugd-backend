const { Client, LocalAuth } = require("whatsapp-web.js");

const initializeClient = (app) => {
  const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
      type: "remote",
      remotePath:
        "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
  });

  client.on("qr", (qr) => {
    app.locals.qrCode = qr;
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    app.locals.isUserLogged = true;
    app.locals.client = client;
  });

  client.on("authenticated", () => {
    console.log("AUTHENTICATED");
  });

  client.on("auth_failure", (msg) => {
    console.error("AUTHENTICATION FAILURE", msg);
    app.locals.isUserLogged = false;
  });

  client.on("disconnected", (reason) => {
    console.log("Client disconnected", reason);
    app.locals.isUserLogged = false;
    app.locals.qrCode = null;
    app.locals.client = null; // Update client to null on disconnection
  });

  client.initialize();
};

module.exports = initializeClient;
