const jwt = require("jsonwebtoken");
const User = require("../model/userModel.js");

const generateToken = async(userId) => {
    
    return jwt.sign(
        {id: userId},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );
}

exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

 

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successfully",
      role: user.role,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.logout = async(req, res) => {
    try {
        res.cookie("token", "", {maxAge: 0});
        res.json({message: 'Logout Successfully!'})
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}