import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";

// Get user by username or authenticated user
export const getUser = async (req, res) => {
  try {
    let user;
    if (req.user) {
      user = await User.findById(req.user.userId).select("-password"); // ✅ Use `userId`
    } else {
      const { username } = req.params;
      user = await User.findOne({ username }).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Fetch logged-in user's profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Create new user (Registration)
export const createUser = async (req, res) => {
  const { fullname, username, email, password, mobile, address, occupation, dob } = req.body;

  if (!fullname || !username || !email || !password || !mobile || !address || !occupation || !dob) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { mobile }] });
    if (existingUser) {
      let duplicateField = existingUser.username === username ? "Username" : 
                           existingUser.email === email ? "Email" : "Mobile";
      return res.status(400).json({ success: false, message: `${duplicateField} already exists` });
    }

    // 🚀 FIX: No manual hashing, let the model handle it
    const newUser = new User({
      fullname,
      username,
      email,
      password,  // Model will hash it automatically
      mobile,
      address,
      occupation,
      dob,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error in creating user:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Login user (Authentication)
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Please provide both username and password" });
  }

  try {
    console.log("🔍 Login request received:", req.body);

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ User not found in DB!");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("✅ User found:", user.username);

    // Compare entered password with stored hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("❌ Password does not match!");
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    console.log("✅ Password matched!");

     // Generate JWT token
     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

     res.status(200).json({
       success: true,
       message: "Login successful",
       _id: user._id,
       fullname: user.fullname,
       token,
       user: { username: user.username, email: user.email },
     });
   } catch (error) {
     console.error("❌ Error in login:", error.message);
     res.status(500).json({ success: false, message: "Server Error" });
   }
 };


// Update user by ID
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const user = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, user, { new: true }).select("-password");
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ✅ Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    user.fullname = req.body.fullname || user.fullname;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    user.address = req.body.address || user.address;
    user.occupation = req.body.occupation || user.occupation;
    user.dob = req.body.dob || user.dob;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Delete user by ID
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid User ID" });
  }

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log("Error in deleting user:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-__v');
    res.status(200).json({ 
      success: true, 
      data: doctors,
      count: doctors.length 
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch doctors",
      error: error.message 
    });
  }
};

// Add this new function
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-__v');
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }
    res.status(200).json({ 
      success: true, 
      data: doctor 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch doctor",
      error: error.message 
    });
  }
};