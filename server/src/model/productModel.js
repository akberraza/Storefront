const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        price:{
            type: Number,
            required: true,
        },
        stock:{
            type: Number,
            required: true,
            default: 0
        },
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, {timestamps: true}
);

module.exports = mongoose.model("Product", productSchema);