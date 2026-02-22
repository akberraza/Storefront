const Product = require("../model/productModel.js");

exports.createProduct = async(req, res) => {
    try {
        
        const {name, price, stock} = req.body;

        if(!name || !price || !stock){
            throw new Error("All fields are required!")
        }

        const product = await Product.create({
            name,
            price,
            stock,
            businessId: req.user.businessId
        });
        
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

exports.getProduct = async(req, res) => {
    try {
        
        const products = await Product.findById({
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