const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
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

const ExchangeSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  status: { type: String, default: 'pending' },
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Item = mongoose.model('Item', ItemSchema);
const Exchange = mongoose.model('Exchange', ExchangeSchema);

// Routes
app.get('/api/items', async (req, res) => {
  try {
    const { category, location, search } = req.query;
    let query = { available: true };
    
    if (category) query.category = category;
    if (location) query.location = new RegExp(location, 'i');
    if (search) query.title = new RegExp(search, 'i');
    
    const items = await Item.find(query).populate('owner').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    await User.findByIdAndUpdate(item.owner, { $inc: { itemsShared: 1, sustainabilityScore: 10 } });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/exchanges', async (req, res) => {
  try {
    const exchange = new Exchange(req.body);
    await exchange.save();
    res.status(201).json(exchange);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/sustainability-stats', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalExchanges = await Exchange.countDocuments({ status: 'completed' });
    const co2Saved = totalExchanges * 2.3; // kg CO2 per item
    
    res.json({
      totalItems,
      totalUsers,
      totalExchanges,
      co2Saved: Math.round(co2Saved)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ReWear server running on port ${PORT}`);
});