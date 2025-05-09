// models/Food.ts
import { Schema, model } from 'mongoose';

const FoodSchema = new Schema({
  fdcId:       { type: Number, unique: true },
  description: String,
  nutrients: {
    calories: Number,
    protein:  Number,
    fat:      Number,
    sodium:   Number,
    sugars:   Number,
  },
});

export const Food = model('Food', FoodSchema);

// models/Product.ts
import { Schema, model } from 'mongoose';

const ProductSchema = new Schema({
  code: String, // barcode
  name: String,
  allergens: {
    contains_gluten: Boolean,
    contains_milk:   Boolean,
    contains_nuts:   Boolean,
  },
});

export const Product = model('Product', ProductSchema);
