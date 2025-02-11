const express = require("express");
const { getAllCourse, getCourse, fetchLectures, fetchLecture, getMyCourses, checkout, paymentVerification } = require("../controller/courseController");
const { isAuth } = require("../middlewares/isAuth");

const router = express.Router();

router.get("/course/all",getAllCourse);
router.get("/course/:id",getCourse);
router.get("/lectures/:id", isAuth, fetchLecture);
router.get("/lecture/:id", isAuth, fetchLecture);
router.get("/mycourse", isAuth, getMyCourses);
router.post("/course/checkout/:id", isAuth, checkout);
router.post("/verification/:id", isAuth, paymentVerification);

module.exports = router;



