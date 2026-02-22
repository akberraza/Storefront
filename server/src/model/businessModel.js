const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true
    },
    subscriptionStatus:{
        type: String,
        enum: ["active", "expired", "trial"],
        default: "trial"
    },
    subscriptionEndDate:{
        type: Date
    },
    isActive:{
        type: Boolean,
        default: true
    }
},{timestamps: true});

module.exports = mongoose.model("Business", businessSchema);