import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import nodemailer from "nodemailer";

// Create a new appointment
export const createAppointment = async (req, res) => {
  const { doctorId, userId } = req.body;

  try {
    // Fetch user and doctor details
    const user = await User.findById(userId);
    const doctor = await Doctor.findById(doctorId);

    if (!user || !doctor) {
      return res.status(404).json({ 
        success: false, 
        message: "User or Doctor not found" 
      });
    }

    // Create appointment
    const appointment = new Appointment({
      doctorId,
      userId,
      userName: user.fullname,
      userEmail: user.email,
      doctorName: doctor.name,
      doctorEmail: doctor.email
    });

    await appointment.save();

    res.status(201).json({ 
      success: true, 
      message: "Appointment created successfully",
      data: {
        appointment,
        user: {
          fullname: user.fullname,
          email: user.email
        },
        doctor: {
          name: doctor.name,
          designation: doctor.designation,
          hospital: doctor.hospital,
          phone: doctor.phone
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to create appointment",
      error: error.message 
    });
  }
};
// Confirm appointment
export const confirmAppointment = async (req, res) => {
  const { appointmentId, appointmentDate } = req.body;

  try {
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "confirmed", appointmentDate },
      { new: true }
    );

    // Send confirmation email to user
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.userEmail,
      subject: "Appointment Confirmed",
      text: `Your appointment with Dr. ${appointment.doctorId.name} has been confirmed for ${appointment.appointmentDate}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(200).json({ success: true, message: "Appointment confirmed successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to confirm appointment", error });
  }
};

export const getAppointmentDetails = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId', 'name designation hospital phone email')
      .populate('userId', 'fullname email');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: appointment 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch appointment details",
      error: error.message 
    });
  }
};