const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        min: 5,
        max: 20
    },
    email:{
        type:String,
        required: true,
        unique: true,
        lowercase: true
    },
    password:{
        type:String,
        required: true,
        minlength: 6,
        select: false
    },
    role:{
        type: String,
        enum: ["super_admin", "business_admin","cashier"],
    },
    businessId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: function (){
            return this.role !== "super_admin";
        }
    },
    isActive:{
        type: Boolean,
        default: true
    }
},{timestamps: true});

userSchema.pre("save", async function(){
  if(!this.isModified("password")) return;
  
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model("User", userSchema);