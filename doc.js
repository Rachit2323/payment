const Appointment = require("./Appointment.js");
// const instance =require("./index.js");
const crypto = require("crypto");
const Payment = require("./paymentModal.js");
const Razorpay = require("razorpay");

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { doctor, patient, date, startTime, endTime } = req.body;
    const newAppointment = new Appointment({
      doctor,
      patient,
      date,
      startTime,
      endTime,
    });
    await newAppointment.save();
    res.json({ message: "Appointment created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { doctor, date, startTime, endTime } = req.query;
    const existingAppointments = await Appointment.find({
      doctor,
      date,
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } },
          ],
        },
      ],
    });

    if (existingAppointments.length === 0) {
      res.json({
        doctor,
        date,
        startTime,
        endTime,
        available: true,
        message: "Doctor is available for the given time slot.",
      });
    } else {
      res.json({
        doctor,
        date,
        startTime,
        endTime,
        available: false,
        message: "Doctor is not available for the given time slot.",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log(
      "run",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    console.log("Payment data stored in the database");


    return res.status(200).json({
      success: true,
      error: "txn success",
    });
    

  } catch (error) {
    console.error("Error processing payment verification:", error);

    return res.status(400).json({
      success: false,
      error: "Authentication failed",
    });
  }
};



exports.paymentcheck = async (req, res) => {
  try {
 

    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET,
    });
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",

    };
    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
