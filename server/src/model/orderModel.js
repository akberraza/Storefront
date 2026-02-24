const mongoose = require("mongoose");

const orderItemSchema  = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: String,
    price: Number,
    costPrice: Number,
    quantity: Number
})

const orderSchema = new mongoose.Schema({

    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },
    items: [orderItemSchema],

    totalAmount:{
        type: Number,
        required: true
    },
     totalProfit: {  
      type: Number,
      default: 0
    },

    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true});

module.exports = mongoose.model("Order", orderSchema);