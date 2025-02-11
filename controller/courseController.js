const tryCatch = require("../middlewares/tryCatch");
const courseModal = require("../models/courseModal");
const lecturesModal = require("../models/lecturesModal");
const paymentModal = require("../models/payMentModal");
const userModel = require("../models/userModel");


const getAllCourse = tryCatch(async (req, res) => {
    const courses = await courseModal.find();
    res.status(200).json({ courses });
});


const getCourse = tryCatch(async (req, res) => {
    const course = await courseModal.findById(req.params.id);
    res.status(200).json({ course });
});

const fetchLecture = tryCatch(async (req, res) => {
    const lecture = await lecturesModal.findById(req.params.id);
  
    const user = await userModel.findById(req.user._id);
  
    if (user.role === "admin") {
      return res.json({ lecture });
    }
  
    if (!user.subscription.includes(lecture.course))
      return res.status(400).json({
        message: "You have not subscribed to this course",
      });
  
    res.json({ lecture });
  });

  const getMyCourses = tryCatch(async (req, res) => {
    const courses = await courseModal.find({ _id: req.user.subscription });
  
    res.json({
      courses,
    });
  });

  const checkout = tryCatch(async (req, res) => {
    const user = await userModel.findById(req.user._id);
  
    const course = await courseModal.findById(req.params.id);
  
    if (user.subscription.includes(course._id)) {
      return res.status(400).json({
        message: "You already have this course",
      });
    }
  
    const options = {
      amount: Number(course.price * 100),
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    res.status(201).json({
      order,
      course,
    });
  });

  const paymentVerification = tryCatch(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
  
    const expectedSignature = crypto
      .createHmac("sha256", process.env.Razorpay_Secret)
      .update(body)
      .digest("hex");
  
    const isAuthentic = expectedSignature === razorpay_signature;
  
    if (isAuthentic) {
      await paymentModal.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
  
      const user = await userModel.findById(req.user._id);
  
      const course = await courseModal.findById(req.params.id);
  
      user.subscription.push(course._id);
  
      await user.save();
  
      res.status(200).json({
        message: "Course Purchased Successfully",
      });
    } else {
      return res.status(400).json({
        message: "Payment Failed",
      });
    }
  });
  
module.exports = {
    getAllCourse,
    getCourse,
    fetchLecture,
    getMyCourses,
    checkout,
    paymentVerification
}