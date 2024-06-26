const User = require("../models/user");
const jwt = require("jsonwebtoken");
const handleSignin = async (req, res) => {
  User.findOne({ user: req.body.user }).exec(async (err, user) => {
    if (err) return res.status(400).json({ err });

    if (user) {
      if (req.body.password === user.password) {
        const token = jwt.sign({ _id: user._id }, process.env.SHH, {
          expiresIn: "2d",
        });
        res.status(200).json({
          token,
          user: {
            user: user.user,
            id: user._id,
          },
        });
      } else {
        return res.status(400).json({
          message: "Invalid Password",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid Name",
      });
    }
  });
};

module.exports = {
  handleSignin: handleSignin,
};
