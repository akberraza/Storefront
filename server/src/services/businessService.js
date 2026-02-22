const Business = require("../model/businessModel.js");
const User = require("../model/userModel.js");

exports.createBusinessWithAdmin = async (data) => {

  const { name, ownerName, adminName, adminEmail, adminPassword } = data;

  if (!name || !ownerName || !adminName || !adminEmail || !adminPassword) {
    throw new Error("All fields are required!");
  }

  const existingUser = await User.findOne({ email: adminEmail });
if (existingUser) {
   throw new Error("Admin email already exists");
}

  // Business Create
  const business = await Business.create({
    name,
    ownerName,
    subscriptionStatus: "trial",
    subscriptionEndDate: new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000
    )
  });

  // Create Business Admin
  const adminUser = await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: "business_admin",
    businessId: business._id
  });

  return { business, adminUser };
};