// scripts/import-foods.js
import fs from 'fs';
import path from 'path';
import csv from 'csv-parse';
import mongoose from 'mongoose';
import { Food, Product } from '../models'; // see next

async function importUSDA() {
  await mongoose.connect(process.env.MONGO_URI!);
  const parser = fs
    .createReadStream(path.join(__dirname, 'FoodData_CSV', 'FoundationFoods.csv'))
    .pipe(csv({ columns: true, skip_empty_lines: true }));

  for await (const row of parser) {
    // pick just the fields you need
    const doc = {
      fdcId: row.fdc_id,
      description: row.description,
      nutrients: {
        calories: +row.calories,
        protein: +row.protein_g,
        fat: +row.fat_g,
        sodium: +row.sodium_mg,
        sugars: +row.sugars_g,
        // ...
      },
    };
    await Food.updateOne({ fdcId: doc.fdcId }, doc, { upsert: true });
  }
  console.log('USDA import done');
  process.exit();
}

async function importOFF() {
  await mongoose.connect(process.env.MONGO_URI!);
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'open-food-facts.json'), 'utf8')
  );
  for (const product of data.products) {
    const doc = {
      code: product.code,
      name: product.product_name,
      allergens: {
        contains_gluten: product.allergens_tags.includes('en:gluten'),
        contains_milk:   product.allergens_tags.includes('en:milk'),
        contains_nuts:   product.allergens_tags.includes('en:nuts'),
        // ...
      },
    };
    await Product.updateOne({ code: doc.code }, doc, { upsert: true });
  }
  console.log('OFF import done');
  process.exit();
}

// Run whichever you need:
if (process.argv[2] === 'usda') importUSDA();
else importOFF();
