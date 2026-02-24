const User = require("../model/userModel.js");

exports.createCashier = async(req, res) => {
    try {
        
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({message: 'All fields are required'})
        }

        const existing = await User.findOne({email});
        if(existing){
            return res.status(400).json({message: "Email Already exist"});
        }

        const cashier = await User.create({
            name,
            email,
            password,
            role: "cashier",
            businessId: req.user.businessId
        })

        res.status(201).json({
            message: "Cashier Created",
            cashier: {
                id: cashier._id,
                name: cashier.name,
                email: cashier.email
            }
        });

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

