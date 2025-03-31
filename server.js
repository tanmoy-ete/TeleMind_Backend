import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import appointmentRoutes from "./routes/appointment.route.js"; // Uncomment when needed
import doctorRoutes from "./routes/doctor.route.js"; 


dotenv.config(); // Load environment variables

const startServer = async () => {
  try {
    await connectDB(); // Ensure MongoDB connection is established before starting the server
    console.log("✅ Database connected successfully!");

    const app = express();

    // Middleware
    app.use(express.json());
    app.use(cors({
      origin: "https://telemindfrontend.netlify.app"
    }));

    // Base Route - Check if server is running
    app.get("/", (req, res) => {
      res.send("🚀 TeleMind API is running...");
    });

    // Public Routes (No token required)
    app.use("/api/users", userRoutes);

    // Protected Routes
    app.use("/api/appointments", appointmentRoutes); // Add this line
    app.use("/api/doctors", doctorRoutes); 

    
     // JWT Authentication Middleware
     const authenticate = (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];
    
      if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
      }
    
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach entire decoded object (includes userId)
        next();
      } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }
    };
    
      // Global Error Handling Middleware
      app.use((err, req, res, next) => {
        console.error("❌ Internal Server Error:", err);
        res.status(500).json({ success: false, message: "Something went wrong!" });
      });
  
      // Start Server
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      process.exit(1); // Stop execution if DB connection fails
    }
  };
  
  startServer();
