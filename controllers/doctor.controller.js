import Doctor from "../models/doctor.model.js";

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