const Order = require("../model/orderModel.js");
const Product = require("../model/productModel.js");
const ActivityLog = require("../model/activityLogModel.js");
const ExcelJS =  require("exceljs");
const PDFDocument = require("pdfkit");

exports.createOrder = async(req, res) => {
    try {
        
        const {items, paymentMethod} = req.body;

        if(!items || items.length === 0){
          return res.status(400).json({message: 'No order items provided'})
        }

        if(!paymentMethod){
            return res.status(400).json({message: "Payment method required"});
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
            paymentMethod,
            paymentStatus: "paid",
            createdBy: req.user._id 
        });

        await ActivityLog.create({
            businessId: req.user.businessId,
            user: req.user._id,
            action: "Create Order"
        })

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

exports.refundOrder = async(req, res) => {
    try {
        
        const order = await Order.findOne({
            _id: req.params.id,
            businessId: req.user.businessId
        });

        if(!order){
            return res.status(404).json({message: "Order not found"});
        }

        if(order.paymentStatus === "refund"){
            return res.status(400).json({message: "Already refunded"});
        }

        for(let item of order.items){
            const product = await Product.findOne(item.product);
            product.stock += item.quantity;
            await Product.save();
        }

        order.paymentStatus = "refunded";
        order.totalProfit = 0;

        await order.save();

        await ActivityLog.create({
            businessId: req.user.businessId,
            user: req.user._id,
            action: "Refunded Order"
        })

        res.json({message: "Order refunded Successfully"});

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and End date required",
      });
    }

    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T23:59:59.999Z");

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    if (start > end) {
      return res.status(400).json({
        message: "Start date cannot be greater than End date",
      });
    }

    console.log("Final Start:", start);
    console.log("Final End:", end);

    const orders = await Order.find({
      businessId: req.user.businessId,
      createdAt: {
        $gte: start,
        $lte: end,
      },
    }).sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopSellingProducts = async(req, res) => {
  try {
    
    const topProduct = await Order.aggregate([
        { $match: {businessId: req.user.businessId} },
        { $unwind: "$items" },
        {
            $group:{
                _id: "$items.name",
                totalSold: { $sum: "$items.quantity" },
                revenue: {
                    $sum:{
                        $multiply:["$items.price", "$items.quantity"],
                    }
                }
            }
        },
        { $sort: {total: -1}},
        { $limit: 5 }
    ]);

    res.json(topProduct);

  } catch (err) {
    res.status(500).json({message: err.message});
  }
}


exports.getMonthlyChartData = async(req, res) => {
    try {
        
        const year = new Date.getFullYear();
        
        const data = await Order.aggregate([
            {
                $match: {
                    businessId: req.user.businessId,
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group:{
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1}}
        ])

        res.json(data);

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.exportSalesExcel = async(req, res) => {
     try {
        
        const orders = await Order.find({
            businessId: req.user.businessId
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Sales Report");

        sheet.columns = [
            {header: "Order ID", key: "id"},
            {header: "Revenue", key: "revenue"},
            {header: "Profit", key: "profit"},
            {header: "Payment", key: "payment"}
        ];

        orders.forEach(order => {
            sheet.addRow({
                id: order._id.toString(),
                revenue: order.totalAmount,
                profit: order.totalProfit,
                payment: order.paymentMethod
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=sales.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

     } catch (err) {
        res.status(500).json({message: err.message});
     }
}

exports.exportSalesPDF = async(req, res) => {
    try {
        
        const orders = await Order.find({
            businessId: req.user.businessId
        });

        const doc = new PDFDocument();
        res.setHeader(
            "Content-Type",
            "exportSalesPDF"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=sales.pdf"
        );

        doc.pipe(res);

        doc.fontSize(18).text("Sales Report", {align: "Center"});
        doc.moveDown();

        orders.forEach(order => {
            doc
            .fontSize(12)
            .text(
                `Order: ${orders._id} | Revenue: ${orders.totalAmount} | Profit: ${orders.totalProfit} `
            );
        })

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}