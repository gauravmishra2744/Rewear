// Demo data script to populate the database with sample data
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear');

// Define schemas (same as in server.js)
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  location: String,
  sustainabilityScore: { type: Number, default: 0 },
  itemsShared: { type: Number, default: 0 },
  itemsReceived: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const ItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  size: String,
  condition: String,
  images: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String,
  available: { type: Boolean, default: true },
  tags: [String],
  sustainabilityImpact: Number,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Item = mongoose.model('Item', ItemSchema);

// Sample data
const sampleUsers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    location: 'Downtown',
    sustainabilityScore: 150,
    itemsShared: 8,
    itemsReceived: 5
  },
  {
    name: 'Mike Chen',
    email: 'mike@example.com',
    location: 'Midtown',
    sustainabilityScore: 200,
    itemsShared: 12,
    itemsReceived: 7
  },
  {
    name: 'Emma Rodriguez',
    email: 'emma@example.com',
    location: 'Uptown',
    sustainabilityScore: 95,
    itemsShared: 4,
    itemsReceived: 6
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    location: 'Westside',
    sustainabilityScore: 180,
    itemsShared: 9,
    itemsReceived: 4
  }
];

const sampleItems = [
  {
    title: 'Vintage Denim Jacket',
    description: 'Classic blue denim jacket in excellent condition. Perfect for casual outings and layering. Barely worn, from a smoke-free home.',
    category: 'outerwear',
    size: 'M',
    condition: 'excellent',
    location: 'Downtown',
    tags: ['vintage', 'denim', 'casual'],
    sustainabilityImpact: 15
  },
  {
    title: 'Professional Blazer',
    description: 'Navy blue blazer perfect for business meetings and formal events. High-quality fabric, well-maintained.',
    category: 'outerwear',
    size: 'L',
    condition: 'good',
    location: 'Midtown',
    tags: ['professional', 'formal', 'business'],
    sustainabilityImpact: 12
  },
  {
    title: 'Summer Floral Dress',
    description: 'Beautiful floral print dress, perfect for summer events. Lightweight and comfortable, worn only a few times.',
    category: 'dresses',
    size: 'S',
    condition: 'new',
    location: 'Uptown',
    tags: ['summer', 'floral', 'casual'],
    sustainabilityImpact: 18
  },
  {
    title: 'Designer Sneakers',
    description: 'Limited edition sneakers in great condition. Comfortable for daily wear, authentic with original box.',
    category: 'shoes',
    size: '9',
    condition: 'good',
    location: 'Westside',
    tags: ['designer', 'sneakers', 'limited'],
    sustainabilityImpact: 20
  },
  {
    title: 'Cozy Wool Sweater',
    description: 'Warm and soft wool sweater, perfect for winter. Hand-knitted with care, no signs of wear.',
    category: 'tops',
    size: 'M',
    condition: 'excellent',
    location: 'Downtown',
    tags: ['wool', 'winter', 'handmade'],
    sustainabilityImpact: 14
  },
  {
    title: 'Black Leather Boots',
    description: 'Stylish ankle boots in genuine leather. Versatile for both casual and semi-formal occasions.',
    category: 'shoes',
    size: '8',
    condition: 'good',
    location: 'Midtown',
    tags: ['leather', 'boots', 'versatile'],
    sustainabilityImpact: 16
  },
  {
    title: 'Silk Scarf Collection',
    description: 'Set of 3 beautiful silk scarves in different patterns. Perfect for adding elegance to any outfit.',
    category: 'accessories',
    size: 'One Size',
    condition: 'new',
    location: 'Uptown',
    tags: ['silk', 'elegant', 'collection'],
    sustainabilityImpact: 10
  },
  {
    title: 'Casual Jeans',
    description: 'Comfortable straight-leg jeans in classic blue. Great for everyday wear, well-maintained.',
    category: 'bottoms',
    size: '32',
    condition: 'good',
    location: 'Westside',
    tags: ['jeans', 'casual', 'everyday'],
    sustainabilityImpact: 13
  }
];

async function populateDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    
    console.log('Cleared existing data...');
    
    // Create users
    const users = await User.insertMany(sampleUsers);
    console.log(`Created ${users.length} users`);
    
    // Create items with random owners
    const itemsWithOwners = sampleItems.map(item => ({
      ...item,
      owner: users[Math.floor(Math.random() * users.length)]._id
    }));
    
    const items = await Item.insertMany(itemsWithOwners);
    console.log(`Created ${items.length} items`);
    
    console.log('Demo data populated successfully!');
    console.log('\nSample users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.location}`);
    });
    
    console.log('\nSample items:');
    items.forEach(item => {
      console.log(`- ${item.title} (${item.category}, Size ${item.size}) - ${item.location}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

populateDatabase();