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
      "rin",
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

    // Send JSON response in case of an error
    return res.status(400).json({
      success: false,
      error: "Authentication failed",
    });
  }
};


// exports.paymentVerification = async (req, res) => {
//   console.log("wor");
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     req.body;

//   const body = razorpay_order_id + "|" + razorpay_payment_id;

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_API_SECRET) // Corrected the typo here
//     .update(body)
//     .digest("hex");

//   const isAuthentic = expectedSignature === razorpay_signature;
//   console.log(isAuthentic, expectedSignature, razorpay_signature);
//   if (isAuthentic) {
//     try {
//       // Database logic comes here
//       console.log(
//         "rin",
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature
//       );
//       await Payment.create({
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature,
//       });

//       console.log("Payment data stored in the database");

//       res.redirect(
//         `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
//       );
//     } catch (error) {
//       console.error("Error storing payment data in the database:", error);
//       res.status(500).json({ success: false, error: "Internal Server Error" });
//     }
//   }
//   // if (isAuthentic) {
//   //   console.log('check');
//   //   // Database logic comes here
//   //   await Payment.create({
//   //     razorpay_order_id,
//   //     razorpay_payment_id,
//   //     razorpay_signature,
//   //   });

//   //   res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
//   // }
//   else {
//     res.status(400).json({
//       success: false,
//     });
//   }
// };

exports.paymentcheck = async (req, res) => {
  try {
    // const instance = new Razorpay({
    //   key_id: process.env.RAZORPAY_API_KEY,
    //   key_secret: process.env.RAZORPAY_API_SECRET,
    // });
    console.log('check')
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET,
    });
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
      // receipt: shortid.generate(),
    };
    const order = await instance.orders.create(options);
    // console.log('rde',order);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
