require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 4000;

// Supabase admin client (service role — bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());

// Raw body required for Stripe webhook signature verification
// Must be registered BEFORE express.json()
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'esimconnect backend running' });
});

// Create PaymentIntent for wallet top-up
// Now accepts userId and stores it in Stripe metadata
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'sgd', userId } = req.body;

    if (!amount || amount < 500) {
      return res.status(400).json({ error: 'Minimum top-up is SGD 5.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,        // in cents — e.g. 2000 = SGD 20.00
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: userId || '',
        source: 'wallet_topup',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Stripe webhook — listens for payment_intent.succeeded
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const userId = intent.metadata?.user_id;
    const amountSgd = intent.amount / 100; // convert cents to SGD

    if (!userId) {
      console.warn('Webhook: no user_id in metadata, skipping wallet credit');
      return res.json({ received: true });
    }

    try {
      // 1. Upsert wallet_topups row (idempotent — unique on stripe_payment_intent_id)
      const { error: topupError } = await supabase
        .from('wallet_topups')
        .upsert({
          user_id: userId,
          amount_sgd: amountSgd,
          stripe_payment_intent_id: intent.id,
          status: 'succeeded',
        }, { onConflict: 'stripe_payment_intent_id' });

      if (topupError) {
        console.error('wallet_topups upsert error:', topupError.message);
        return res.status(500).json({ error: topupError.message });
      }

      // 2. Fetch current balance and increment
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Profile fetch error:', fetchError.message);
        return res.status(500).json({ error: fetchError.message });
      }

      const newBalance = parseFloat(((profile.wallet_balance || 0) + amountSgd).toFixed(2));

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', userId);

      if (updateError) {
        console.error('Wallet balance update error:', updateError.message);
        return res.status(500).json({ error: updateError.message });
      }

      console.log(`Wallet credited: user=${userId} amount=SGD${amountSgd} new_balance=SGD${newBalance}`);
    } catch (err) {
      console.error('Webhook handler error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`esimconnect backend running on port ${PORT}`);
});
