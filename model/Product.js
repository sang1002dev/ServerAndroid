const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    number: { type: Number, required: true },
    year: { type: Number, required: true },
    imagePaths: [{ type: String, required: true }], // Lưu danh sách đường dẫn ảnh
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
