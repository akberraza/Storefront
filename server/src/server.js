const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db.js");
const seedSuperAdmin = require("./config/seedSuperAdmin.js");
const authRoutes = require("./routes/authRouter.js");
const businessRoutes = require("./routes/businessRoute.js");
const ProductRoutes = require("./routes/productRoutes.js");
const saleRoutes = require("./routes/saleRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000

connectDB().then(()=> {
    app.listen(PORT, ()=> console.log(`Server running on Port ${PORT}`));
    seedSuperAdmin();
}).catch(err => console.log("DB Error: ", err.message));


app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/order", orderRoutes);