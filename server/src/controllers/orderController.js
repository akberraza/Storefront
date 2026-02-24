const Order = require("../model/orderModel.js");
const Product = require("../model/productModel.js");

exports.createOrder = async(req, res) => {
    try {
        
        const {items} = req.body;

        if(!items || items.length === 0){
          return res.status(400).json({message: 'No order items provided'})
        }

        let total = 0;
        let totalProfit = 0;

        const orderItems = [];
        
        for(let item of items){
        
            const product = await Product.findOne({
                _id: item.productId,
                businessId: req.user.businessId
            });

            if(!product){
                return res.status(404).json({message: 'product not found'});  
            }

            if(product.stock < item.quantity){
                return res.status(400).json({message: "Insufficient stock"});
            }

            product.stock -=  item.quantity;
            await product.save();

           total += product.price * item.quantity;

           totalProfit +=  (product.price - product.costPrice) * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                costPrice: product.costPrice,
                quantity: item.quantity
            });
        }

        const order = await Order.create({
            businessId: req.user.businessId,
            items: orderItems,
            totalAmount: total,
            totalProfit,
            createdBy: req.user._id 
        });

        res.status(201).json(order);

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.getOrders = async(req, res) => {
    try {

        const businessId = req.user.businessId;
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const search = req.query.search || "";

        const query = {
            businessId,
            ...(search && {
                "items.name" : { $regex: search, $option: "i" },
            })
        }

        const total = await Order.countDocuments(query);

        const orders = await Order.find(query)
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit);

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            orders
        })

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.getDailySales = async(req, res) => {
    try {
        
        const today = new Date();
        today.setHours(0, 0, 0, 0,);

        const sales = await Order.aggregate([
            {
                $match: {
                    businessId: req.user.businessId,
                    createdAt: { $gte: today }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalAmount" },
                    totalOrders: {$sum: 1}
                }
            }
        ]);

        res.json(sales[0] || { totalSales: 0, totalOrders: 0});

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.getMonthlyRevenue = async(req, res) => {
    try {
        
        const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const revenue = await Order.aggregate([
            {
                $match: {
                    businessId: req.user.businessId,
                    createdAt: { $gte: start}
                },
            },
                {
                    $group:{
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" }
                    }
                }
        ])

        res.json(revenue[0] || {totalRevenue: 0});

    } catch (err) {
       res.status(500).json({message: err.message});        
    }
}

exports.getDashboardStats = async(req, res) => {
    try {
        
        const businessId = req.user.businessId;

        const totalOrders = await Order.countDocuments({businessId});

        const totalRevenueAgg = await Order.aggregate([
            {$match : { businessId }},
            { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
        ])

        const totalRevenue = totalRevenueAgg[0]?.revenue || 0;

        res.json(
            {
                totalOrders, totalRevenue
            }
        )

    } catch (err) {
       res.status(500).json({message: err.message}); 
    }
}


exports.getAdvancedDashboard = async(req, res) => {
    try {
        
        const businessId = req.user.businessId;

        const stats = await Order.aggregate([
            {$match: {businessId}},
            {
                $group: {
                    _id: null,
                    totalRevenue: {$sum: "$totalAmount" },
                    totalProfit: { $sum: "$totalProfit" },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalAmount"}
                }
            }
        ]);

        res.json(
            stats[0] || {
                totalRevenue: 0,
                totalProfit: 0,
                totalOrders: 0,
                avgOrderValue: 0
            }
        );

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}