
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail  = require("../middlewares/sendMail.js");

const User = require("../models/userModel.js");
const tryCatch = require("../middlewares/tryCatch.js");
const userRegister = tryCatch(async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: "User already exists" });
  const hashedPassword = await bcrypt.hash(password, 10);
  user = { name, email, password: hashedPassword };

  const otp = Math.floor(1000 + Math.random() * 9000);
  const activationToken = jwt.sign(
    {
      user,
      otp,
    },
    process.env.ACTIVATION_TOKEN_SECRET,
    {
      expiresIn: "5m",
    }
  );
  const data = {
    name,
    otp,
  };

  await sendMail(email, "LMS PROJECT", data);

  res.status(200).json({ message: "OTP Sent To Your Mail", activationToken });
})


const verifyUser = tryCatch(async (req, res) => {
  const {otp ,activationToken} = req.body;
  const verify = jwt.verify(activationToken,process.env.ACTIVATION_TOKEN_SECRET);

  if( !verify) return res.status(400).json({ message: "OTP Expired" });

  if (verify.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });


  await User.create({
    name: verify.user.name,
    email: verify.user.email,
    password: verify.user.password
  });
  res.json({
    message : "User Registered Successfully"
  })
});


const userLogin = tryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({
      message: "No User with this email",
    });

  const mathPassword = await bcrypt.compare(password, user.password);

  if (!mathPassword)
    return res.status(400).json({
      message: "wrong Password",
    });

  // const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC, {
  //   expiresIn: "15d",
  // });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SEC, { expiresIn: "15d" });

  res.json({
    message: `Welcome back ${user.name}`,
    token,
    user,
  });
});

const myProfile = tryCatch(async (req, res) => {
  // const authHeader = req.headers.authorization;
  // // console.log("Authorization Header:", authHeader);

  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return res.status(401).json({ message: "No token provided or invalid format" });
  // }

  // const token = authHeader.split(" ")[1];
  // // console.log("Extracted Token:", token);

  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SEC);
  //   // console.log("Decoded Token:", decoded);

  //   const user = await User.findById(decoded.id).select("-password");
  //   // console.log("User Found:", user);

  //   if (!user) {
  //     return res.status(404).json({ message: "User not found" });
  //   }

  //   res.json({ message: "User profile retrieved", user });
  // } catch (error) {
  //   console.error("Token Verification Error:", error);
  //   return res.status(401).json({ message: "Invalid or expired token" });
  // }
  res.json({
    message: "User profile retrieved",
    user: req.user,
  });

});


module.exports = {
  userRegister,
  verifyUser,
  userLogin,
  myProfile
};
