const initializeClient = require("../utils/initializeClient");

const handleConnect = (req, res) => {
  if (req.app.locals.isUserLogged) {
    res.send({ message: "Client already connected" });
  } else if (req.app.locals.qrCode) {
    res.json({ qr: req.app.locals.qrCode });
  } else {
    initializeClient(req.app);
    res.json({ message: "Generating QR code..." });
  }
};

module.exports = { handleConnect };
