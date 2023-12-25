const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add this line
const appointmentController = require('./doc.js');
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/doctor-appointments', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors()); // Add this line to enable CORS

// Routes
app.get('/appointments', appointmentController.getAllAppointments);
app.post('/appointments', appointmentController.createAppointment);
app.get('/checkAvailability', appointmentController.checkAvailability);
app.post("/checkout", appointmentController.paymentcheck);
app.post("/paymentverification", appointmentController.paymentVerification);
app.get("/getkey", (req, res) =>
  res.status(200).json({ key:process.env.RAZORPAY_API_KEY})
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
