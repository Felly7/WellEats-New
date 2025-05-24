// backend/scripts/import-foods.js
require('dotenv').config();
const fs      = require('fs');
const path    = require('path');
const csv     = require('csv-parse');
const mongoose= require('mongoose');
const { Food }    = require('../models/Food');
const { Product } = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI;

async function importUSDA() {
  await mongoose.connect(MONGO_URI);
  const parser = fs
    .createReadStream(path.join(__dirname, '../data/FoundationFoods.csv'))
    .pipe(csv({ columns: true, skip_empty_lines: true }));
  for await (const row of parser) {
    // adjust column names to match your CSV
    const doc = {
      fdcId: Number(row.fdc_id),
      description: row.description,
      nutrients: {
        calories: +row.calories,
        protein: +row.protein_g,
        fat: +row.fat_g,
        sodium: +row.sodium_mg,
        sugars: +row.sugars_g,
      },
    };
    await Food.updateOne({ fdcId: doc.fdcId }, doc, { upsert: true });
  }
  console.log('✅ USDA import complete');
  mongoose.disconnect();
}

async function importOFF() {
  await mongoose.connect(MONGO_URI);
  // assumes you have a full OFF JSON dump at backend/data/off.json
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/off.json'), 'utf8'));
  for (const p of data.products) {
    const doc = {
      code: p.code,
      name: p.product_name,
      allergens: {
        contains_gluten: p.allergens_tags.includes('en:gluten'),
        contains_milk:   p.allergens_tags.includes('en:milk'),
        contains_nuts:   p.allergens_tags.includes('en:nuts'),
      },
    };
    await Product.updateOne({ code: doc.code }, doc, { upsert: true });
  }
  console.log('Open Food Facts import complete');
  mongoose.disconnect();
}

// Run via CLI: `node import-foods.js usda` or `node import-foods.js off`
const which = process.argv[2];
if (which === 'usda') importUSDA();
else if (which === 'off') importOFF();
else console.error('Specify "usda" or "off"');
