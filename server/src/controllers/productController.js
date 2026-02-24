const Product = require("../model/productModel.js");

exports.createProduct = async(req, res) => {
    try {
        
        const {name, price, stock, costPrice} = req.body;

        if(!name || price == null){
            return res.status(400).json({message: "Name and price required"})
        }

        if(price < 0 || stock < 0){
          return res.status(400).json({message: "Invalid price or stock"});
        }

        const product = await Product.create({
            name,
            price,
            stock,
            costPrice,
            businessId: req.user.businessId
        });
        
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.getProduct = async(req, res) => {
    try {
        
        const products = await Product.find({
            businessId: req.user.businessId
        })

        res.json(products)

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.updateProduct = async(req, res) =>{
    try {
        
        const  product = await Product.findByIdAndUpdate({
            _id: req.params.id,
            businessId: req.user.businessId
        },
          req.body,
         {new: true}
    );

    if(!product){
        return res.status(404).json({message: 'product not found'})
    }

    res.json(product);

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.deleteProduct = async(req, res) => {
    try {
        
        const product = await Product.findByIdAndDelete(
            {
                _id: req.params.id,
                businessId: req.user.businessId
            }
        );

        if(!product){
            return res.status(404).json({message: 'product not found'});
        }

        res.json({message: 'product delete successfully'})

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.getLowStockProducts = async(req, res) => {
    try {
        
        const threshold = parseInt(req.query.threshold) || 5;

        const products = await Product.find({
            businessId: req.user.businessId,
            stock: { $lte: threshold},
        })

        res.json(products);

    } catch (err) {
        res.status(500).json({message: err.message});
    }
}