const handleStatus = (req, res) => {
  if (req.app.locals.isUserLogged) {
    res.json({ connected: true });
  } else {
    res.json({ connected: false });
  }
};

const handleWhatsAppDisconnect = async (req, res) => {
  const { client } = req.app.locals;

  if (client) {
    try {
      await client.logout();
      client.destroy();
      req.app.locals.client = null;
      req.app.locals.qrCode = null;
      req.app.locals.isUserLogged = false;
      res.json({ message: "Client disconnected" });
      console.log("Client disconnected");
    } catch (error) {
      console.error("Error during disconnection:", error);
      res.status(500).json({ message: "Error during disconnection", error });
    }
  } else {
    res.json({ message: "Client not connected" });
  }
};

module.exports = { handleStatus, handleWhatsAppDisconnect };
