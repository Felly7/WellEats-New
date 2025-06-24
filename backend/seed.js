// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Food     = require('./models/Food');
const Category = require('./models/Category');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('🗄️  Connected to MongoDB for seeding');

  // 1) Clear existing data
  await Promise.all([
    Food.deleteMany({}),
    Category.deleteMany({}),
  ]);

  // 2) Seed Foods
  const foods = [
    {
      fdcId: 1001,                          // ← unique numeric ID
      description: 'Avocado Toast',
      views: 42,
      nutrients: { calories: 250, protein: 6, fat: 14, sodium: 210, sugars: 2 },
    },
    {
      fdcId: 1002,
      description: 'Green Smoothie',
      views: 17,
      nutrients: { calories: 180, protein: 4, fat: 1, sodium: 40, sugars: 12 },
    },
    {
      fdcId: 1003,
      description: 'Quinoa Salad',
      views: 23,
      nutrients: { calories: 320, protein: 8, fat: 10, sodium: 150, sugars: 3 },
    },
  ];
  await Food.insertMany(foods);
  console.log(`🌮 Seeded ${foods.length} foods`);

  // 3) Seed Categories
  const categories = [
    { name: 'Vegan', views: 15 },
    { name: 'Gluten-Free', views: 8 },
    { name: 'Keto', views: 12 },
    { name: 'Low-Carb', views: 5 },
  ];
  await Category.insertMany(categories);
  console.log(`📂 Seeded ${categories.length} categories`);

  await mongoose.disconnect();
  console.log('✅ Seeding complete!');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
