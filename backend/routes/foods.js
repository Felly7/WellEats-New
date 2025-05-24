// routes/foods.ts
const { Router } = require('express');
const { Food }    = require('../models/Food');
const { Product}  = require('../models/Product');


  const router = Router();

router.get('/', async (req, res) => {
  const { allergies = [], conditions = [] } = req.query;

  // 1) Base nutrient query (e.g. low‐sodium for hypertension)
  const nutrientFilter = {};
  if (conditions.includes('hypertension')) nutrientFilter['nutrients.sodium'] = { $lt: 140 };
  if (conditions.includes('diabetes'))    nutrientFilter['nutrients.sugars'] = { $lt: 5 };
  // …add more condition rules…

  // 2) Allergy filter via OFF
  const excludeAllergenQueries = allergies.map(a => {
    if (a === 'nuts') return { 'allergens.contains_nuts': false };
    if (a === 'gluten') return { 'allergens.contains_gluten': false };
    // …
  }).filter(Boolean);

  // 3) Lookup Foods, then join Products (by barcode or custom mapping)
  // For simplicity, assume fdcId maps to Product.code string:
  const foods = await Food.find(nutrientFilter).lean();
  const codes = foods.map(f => String(f.fdcId));
  const products = await Product.find({ code: { $in: codes }, $and: excludeAllergenQueries }).lean();
  const allowedCodes = new Set(products.map(p => p.code));

  // 4) Return only foods whose code/barcode passed the allergy check
  const results = foods.filter(f => allowedCodes.has(String(f.fdcId)));
  res.json({ results });
});

module.exports = router;
