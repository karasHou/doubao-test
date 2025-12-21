const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let subscriptions = [
  {
    id: '1',
    name: 'Netflix',
    type: '视频流媒体',
    amount: 39,
    currency: 'CNY',
    billingCycle: 'monthly',
    startDate: '2024-01-15',
    nextBillingDate: '2024-02-15',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Spotify',
    type: '音乐流媒体',
    amount: 15,
    currency: 'CNY',
    billingCycle: 'monthly',
    startDate: '2024-01-10',
    nextBillingDate: '2024-02-10',
    status: 'active',
    createdAt: '2024-01-10'
  }
];

app.get('/api/subscriptions', (req, res) => {
  res.json(subscriptions);
});

app.post('/api/subscriptions', (req, res) => {
  const newSubscription = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString().split('T')[0]
  };
  subscriptions.push(newSubscription);
  res.json(newSubscription);
});

app.put('/api/subscriptions/:id', (req, res) => {
  const id = req.params.id;
  const index = subscriptions.findIndex(sub => sub.id === id);
  if (index !== -1) {
    subscriptions[index] = { ...subscriptions[index], ...req.body };
    res.json(subscriptions[index]);
  } else {
    res.status(404).json({ error: 'Subscription not found' });
  }
});

app.delete('/api/subscriptions/:id', (req, res) => {
  const id = req.params.id;
  subscriptions = subscriptions.filter(sub => sub.id !== id);
  res.json({ message: 'Subscription deleted successfully' });
});

app.get('/api/stats', (req, res) => {
  const monthlyTotal = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      const amount = sub.amount;
      return sum + (sub.billingCycle === 'monthly' ? amount : amount / 12);
    }, 0);

  const annualTotal = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      const amount = sub.amount;
      return sum + (sub.billingCycle === 'annual' ? amount : amount * 12);
    }, 0);

  res.json({
    monthlyTotal: monthlyTotal.toFixed(2),
    annualTotal: annualTotal.toFixed(2),
    activeCount: subscriptions.filter(sub => sub.status === 'active').length,
    totalCount: subscriptions.length
  });
});

cron.schedule('0 0 * * *', () => {
  console.log('Running daily subscription check...');
  const today = new Date().toISOString().split('T')[0];

  subscriptions.forEach(sub => {
    if (sub.nextBillingDate === today && sub.status === 'active') {
      console.log(`Reminder: Subscription ${sub.name} is due today!`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});