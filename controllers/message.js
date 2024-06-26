const handleSendMessage = async (req, res) => {
  const failedNumbers = [];
  try {
    const numbers = req.body.phones;
    const message = req.body.message;
    const sendMessages = numbers.map(async (number) => {
      try {
        await req.app.locals.client.sendMessage(number, message);
        return { number, status: "success" };
      } catch (error) {
        if (error.message.includes("invalid wid")) {
          failedNumbers.push(number);
          return { number, status: "failed", error: "Invalid WID" };
        }
        throw error;
      }
    });

    const results = await Promise.all(sendMessages);

    const failed = results.filter((result) => result.status === "failed");
    const successful = results.filter((result) => result.status === "success");

    if (failed.length > 0) {
      res
        .status(500)
        .json({ message: "Some messages failed to send", failed, successful });
    } else {
      res.status(200).json({
        message: "Messages sent successfully to all numbers",
        successful,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending messages", failed: failedNumbers });
  }
};

module.exports = { handleSendMessage };
