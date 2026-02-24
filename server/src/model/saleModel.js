const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },
    cashierId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            productId: mongoose.Schema.Types.ObjectId,
            name: String,
            quantity: Number,
            price: Number,
            total: Number
        }
    ],
    subtotal: Number,
    tax: Number,
    totalAmount: Number
},{timestamps: true});

module.exports = mongoose.model("Sale", saleSchema);