const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business"
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    action: String,
},{timestamps: true});

module.exports = mongoose.model("ActivityLog", activityLogSchema);