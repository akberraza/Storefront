const businessService = require("../services/businessService");

exports.createBusiness = async (req, res) => {
  try {
    const result = await businessService.createBusinessWithAdmin (req.body);

    res.status(201).json({
      message: "Business created successfully",
      business: result.business,
      admin: {
        email: result.adminUser.email,
        role: result.adminUser.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};