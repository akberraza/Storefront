const Business = require("../model/businessModel.js");

exports.checkSubscription = async (req, res, next) => {
  try {

    if (req.user.role === "super_admin") {
      return next();
    }

    const business = await Business.findById(req.user.businessId);

    if (!business) {
      return res.status(404).json({
        message: "Business not found"
      });
    }

    if (
      business.subscriptionStatus !== "active" &&
      business.subscriptionStatus !== "trial"
    ) {
      return res.status(403).json({
        message: "Subscription inactive"
      });
    }

    if (
      business.subscriptionEndDate &&
      business.subscriptionEndDate < new Date()
    ) {
      business.subscriptionStatus = "expired";
      await business.save();

      return res.status(403).json({
        message: "Subscription expired. Please renew"
      });
    }

    next();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};