// models/Product.js
const { Schema, model } = require('mongoose');

const ProductSchema = new Schema({
  code: String, // barcode
  name: String,
  allergens: {
    contains_gluten: Boolean,
    contains_milk:   Boolean,
    contains_nuts:   Boolean,
  },
});

const Product = model('Product', ProductSchema);

module.exports.Product = Product;
