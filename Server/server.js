require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ['http://localhost:3000', 'https://your-github-pages-url.github.io'] }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'esimconnect backend running' });
});

// Create PaymentIntent for wallet top-up
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'sgd' } = req.body;

    if (!amount || amount < 500) {
      return res.status(400).json({ error: 'Minimum top-up is SGD 5.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,        // in cents — e.g. 2000 = SGD 20.00
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`esimconnect backend running on port ${PORT}`);
});
