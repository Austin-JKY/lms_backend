const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or invalid format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SEC);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next(); 
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const isAdmin = (req, res, next) => {
    try{
        if(req.user.role !== "admin") return res.status(403).json({message:"You are not Admin"});
        next();
    }catch(error){
        res.status(500).json({ message: error.message })
    }
}


module.exports = {
    isAuth,
    isAdmin
}