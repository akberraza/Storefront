const User = require("../model/userModel.js");

const seedSuperAdmin = async () => {
    try {
        const existing = await User.findOne({ role: "super_admin" });

        if (!existing) {
            await User.create({
                name: "Super Admin",
                email: "superadmin@gmail.com",
                password: "superAdmin@123",
                role: "super_admin"
            });

            console.log("✅ Super Admin Seeded");
        } else {
            console.log("⚡ Super Admin Already Exists");
        }

    } catch (err) {
        console.error("Seeding Error:", err.message);
    }
};

module.exports = seedSuperAdmin;