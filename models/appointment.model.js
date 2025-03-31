import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorEmail: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "completed", "cancelled"], 
    default: "pending" 
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  amount: { type: Number },
  paymentMethod: { type: String },
  transactionId: { type: String },
  appointmentDate: { type: Date },
  zoomLink: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;