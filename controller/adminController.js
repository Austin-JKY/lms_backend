const userModel = require("../models/userModel");
const tryCatch = require("../middlewares/tryCatch");
const courseModal = require("../models/courseModal");
const lecturesModal = require("../models/lecturesModal");
const {promisify} = require("util");
const {rm,unlink} = require("fs");


const createCourse = tryCatch(async (req, res) => {
    const { title, description, category, createBy, duration, price } = req.body;
    const image = req.file;

    if (!title || !description || !category || !createBy || !duration || !image) {
        return res.status(400).json({ message: "All fields are required." });
      }
    await courseModal.create({
        title,
        description,
        category,
        createBy,
        duration,
        price,
        image: image?.path 
      });

    res.status(200).json({ message: "Course Created Successfully" });
});


const addLecture = tryCatch(async (req, res) => {
  const course = await courseModal.findById(req.params.id);

  if(!course) return res.status(400).json({ message: "Course not found" });

  const { title, description } = req.body;
  const video = req.file;

  const lecture = await lecturesModal.create({
    title,
    description,
    video: video?.path,
    course: course._id,
  });

  res.status(200).json({ message: "Lecture Added Successfully", lecture });
});

const deleteLecture = tryCatch(async (req, res) => {
  const lecture = await lecturesModal.findById(req.params.id);

  rm(lecture.video, () => {
    console.log("Video deleted");
  });

  await lecture.deleteOne();

  res.json({ message: "Lecture Deleted" });
});

const unlinkAsync = promisify(unlink);

const deleteCourse = tryCatch(async (req, res) => {
  const course = await courseModal.findById(req.params.id);

  const lectures = await lecturesModal.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      await unlinkAsync(lecture.video);
      console.log("video deleted");
    })
  );

  rm(course.image, () => {
    console.log("image deleted");
  });

  await lecturesModal.find({ course: req.params.id }).deleteMany();

  await course.deleteOne();

  await userModel.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});


const getAllStats = tryCatch(async (req, res) => {
  const totalCoures = (await courseModal.find()).length;
  const totalLectures = (await lecturesModal.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCoures,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});

const getAllUser = tryCatch(async (req, res) => {
  const users = await userModel.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.json({ users });
});

const updateRole = tryCatch(async (req, res) => {
  const user = await userModel.findById(req.params.id);

  if (user.role === "user") {
    user.role = "admin";
    await user.save();

    return res.status(200).json({
      message: "Role updated to admin",
    });
  }

  if (user.role === "admin") {
    user.role = "user";
    await user.save();

    return res.status(200).json({
      message: "Role updated",
    });
  }
});

module.exports = {
    createCourse,
    addLecture,
    deleteLecture,
    getAllStats,
    getAllUser,
    updateRole,
    deleteCourse,
    
}