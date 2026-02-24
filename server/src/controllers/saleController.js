const Sale = require("../model/saleModel.js");
const Product = require("../model/productModel.js");

exports.createSale = async(req, res) => {
    try {
        
        const {items, tax = 0 } = req.body;

        if(!items || items.length == 0){
            return res.status(400).json({message: 'Not item provided'});
        }

        let subtotal = 0;
        const processedItems = [];

        for(const item of items){
        
            const product = await Product.findOne({
                _id: item.productId,
                businessId: req.user.businessId
            });

            if(!product){
                return res.status(400).json({message: "product not found"});
            }
            
            if(product.stock < item.quantity){
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`
              })
            }

            const total = product.price * item.quantity;

            subtotal += total;

            processedItems.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                total
            });

            // Deduct Stock
            product.stock -= item.quantity;
            await product.save();

        }

        const totalAmount = subtotal + tax;

        const sale = await Sale.create({
            businessId: req.user.businessId,
            cashierId: req.user._id,
            items: processedItems,
            subtotal,
            tax,
            totalAmount
        });

       res.status(201).json(sale);

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.getSales = async(req, res) => {
    try {
        
        const sales = await Sale.find({
            businessId: req.user.businessId
        }).sort({createdAt: -1});

        res.json(sales);

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.getRevenueSummary = async(req, res) => {
    try {
        
        const sales = await Sale.find({
            businessId: req.user.businessId
        });

        const totalRevenue = sales.reduce(
            (sum, sale) => sum + sale.totalAmount, 0
        );

        res.json({
            totalSales: sales.length,
            totalRevenue
        })

    } catch (err) {
      res.status(500).json({message: err.message});        
    }
}