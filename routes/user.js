const express = require("express");
const { userRegister,verifyUser,userLogin,myProfile } = require("../controller/userController.js");
const {isAuth} = require("../middlewares/isAuth.js");


const router = express.Router();

router.post("/user/register", userRegister);
router.post("/user/verify", verifyUser);
router.post("/user/login", userLogin);
router.get("/user/profile",isAuth,myProfile);

module.exports = router