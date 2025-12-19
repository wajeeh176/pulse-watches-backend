const Stripe = require('stripe');

const createCheckoutSession = async (req, res, next) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return res.status(500).json({ message: 'Stripe secret key not configured on server.' });

    const stripe = new Stripe(stripeSecret);
    const { items = [], shippingAddress = {}, successUrl, cancelUrl } = req.body;

    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'No items provided for checkout.' });

    const line_items = items.map((it) => ({
      price_data: {
        currency: process.env.STRIPE_CURRENCY || 'usd',
        product_data: {
          name: it.title || it.name || 'Product',
          description: it.description ? String(it.description).slice(0, 200) : undefined
        },
        unit_amount: Math.round((Number(it.price) || 0) * 100)
      },
      quantity: it.qty || 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: successUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout`,
      metadata: {
        shipping_name: shippingAddress.name || '',
        shipping_address: shippingAddress.address || ''
      }
    });

    return res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    next(err);
  }
};

module.exports = { createCheckoutSession };
