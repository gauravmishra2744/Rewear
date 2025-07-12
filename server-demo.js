const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock data
let users = [
  { _id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', location: 'Downtown', sustainabilityScore: 150, itemsShared: 8, itemsReceived: 5 },
  { _id: '2', name: 'Mike Chen', email: 'mike@example.com', location: 'Midtown', sustainabilityScore: 200, itemsShared: 12, itemsReceived: 7 }
];

let items = [
  { _id: '1', title: 'Vintage Denim Jacket', description: 'Classic blue denim jacket in excellent condition. Perfect for casual outings and layering.', category: 'outerwear', size: 'M', condition: 'excellent', location: 'Downtown', available: true, owner: users[0] },
  { _id: '2', title: 'Professional Blazer', description: 'Navy blue blazer perfect for business meetings and formal events.', category: 'outerwear', size: 'L', condition: 'good', location: 'Midtown', available: true, owner: users[1] },
  { _id: '3', title: 'Summer Floral Dress', description: 'Beautiful floral print dress, perfect for summer events.', category: 'dresses', size: 'S', condition: 'new', location: 'Uptown', available: true, owner: users[0] },
  { _id: '4', title: 'Designer Sneakers', description: 'Limited edition sneakers in great condition.', category: 'shoes', size: '9', condition: 'good', location: 'Westside', available: true, owner: users[1] }
];

// API Routes
app.get('/api/items', (req, res) => {
  const { category, location, search } = req.query;
  let filtered = items.filter(item => item.available);
  
  if (category) filtered = filtered.filter(item => item.category === category);
  if (location) filtered = filtered.filter(item => item.location.toLowerCase().includes(location.toLowerCase()));
  if (search) filtered = filtered.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));
  
  res.json(filtered);
});

app.post('/api/items', (req, res) => {
  const newItem = {
    _id: String(items.length + 1),
    ...req.body,
    available: true,
    owner: users.find(u => u._id === req.body.owner) || users[0]
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.post('/api/users', (req, res) => {
  const newUser = {
    _id: String(users.length + 1),
    ...req.body,
    sustainabilityScore: 0,
    itemsShared: 0,
    itemsReceived: 0
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.get('/api/sustainability-stats', (req, res) => {
  res.json({
    totalItems: items.length,
    totalUsers: users.length,
    totalExchanges: 15,
    co2Saved: 35
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌱 ReWear server running on http://localhost:${PORT}`);
  console.log('📱 Open your browser and visit the URL above!');
});