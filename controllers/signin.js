const User = require("./userController");
const jwt = require("jsonwebtoken");
const handleSignin = async (req, res, User) => {
  // const { user, password } = req.body;
  // if (!user || !password) {
  //   return res.status(400).json("incorrect form submission");
  // }
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

  // if (signinUser) {
  //   if (password === signinUser.password) {
  //     res.status(200).json({
  //       user: {
  //         id: signinUser.id,
  //         name: signinUser.user,
  //       },
  //     });
  //   } else {
  //     return res.status(400).json({
  //       message: "Invalid Password",
  //     });
  //   }
  // } else {
  //   return res.status(400).json({
  //     message: "Invalid User",
  //   });
  // }

  // User.findOne({ user: user }).exec(async (err, user) => {
  //   if (err) return res.status(400).json({ err });
  //   console.log(user);
  //   if (user) {
  //     if (password === user.password) {
  //       res.send(user);
  //     } else {
  //       return res.status(400).json({
  //         message: "Invalid Password",
  //       });
  //     }
  //   } else {
  //     return res.status(400).json({
  //       message: "Invalid User",
  //     });
  //   }
  // });
};

module.exports = {
  handleSignin: handleSignin,
};
