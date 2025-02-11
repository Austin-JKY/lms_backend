const express = require("express");
const { isAuth, isAdmin } = require("../middlewares/isAuth");

const { createCourse, addLecture, deleteCourse ,getAllStats,getAllUser,updateRole} = require("../controller/adminController");
const uploadFile = require("../middlewares/multer");
const router = express.Router();

router.post("/course/new", isAuth, isAdmin, uploadFile, createCourse);
router.post("/course/:id", isAuth, isAdmin, uploadFile, addLecture);
router.delete("/course/:id", isAuth, isAdmin, deleteCourse);
router.delete("/lecture/:id", isAuth, isAdmin,deleteCourse );
router.get("/stats", isAuth, isAdmin, getAllStats);
router.put("/user/:id", isAuth, isAdmin, updateRole);
router.get("/users", isAuth, isAdmin, getAllUser);

module.exports = router;



