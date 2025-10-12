const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['https://helloboop.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});
// Name generation endpoint
app.post('/api/generate-names', async (req, res) => {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const { formData, existingNames, count } = req.body;
    const nameCount = count || 3;

    console.log('Generating', nameCount, 'names');
    console.log('Existing names to avoid:', existingNames || 'none');

    let prompt = `You are a baby name expert. Generate ${nameCount} diverse baby name suggestions.

Context:
- Name: ${formData.userName || 'Not provided'}
- Gender: ${formData.babyGender || 'Any'}
- Location: ${formData.location || 'Not provided'}
- Heritage: ${formData.heritage || 'Not provided'}
- Partners: ${formData.parentNames || 'Not provided'}
- Partner's Heritage: ${formData.partnerHeritage || 'Not provided'}
- Partner's Parent's Names: ${formData.partnerParentNames || 'Not provided'}
- Siblings: ${formData.siblingNames || 'Not provided'}
- Style: ${formData.style || 'Not provided'}
- Preferences: ${formData.meaning || 'Not provided'}
- Avoid: ${formData.avoid || 'None'}

${existingNames && existingNames.length > 0 ? `🚨 MUST AVOID these previously suggested names: ${existingNames.join(', ')}` : ''}

For each name provide:
1. The name
2. Pronunciation guide (phonetic)
3. Meaning and origin
4. Why it works for this family (2-3 sentences referencing their context)
5. 2024 SSA rank (use real data if known, or "Not ranked")
6. 2025 trend: "Rising", "Timeless", or "Declining"
7. Regional note if relevant to their location

Return ONLY a JSON array:
[{"name":"Name","pronunciation":"","meaning":"","reason":"","rank2024":"","trend2025":"","regionalNote":""}]`;

const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2000,
  stream: true,  // <-- ADD THIS
  messages: [
    {
      role: 'user',
      content: prompt
    }
  ]
});
let fullContent = '';
    
    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    for await (const event of message) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text;
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error generating names:', error);
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/create-checkout-session', async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
try {
  const { priceId, successUrl, cancelUrl } = req.body;
  
  console.log('Creating checkout session with:', { priceId, successUrl, cancelUrl });
  console.log('Using Stripe key starting with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10));

  const session = await stripe.checkout.sessions.create({
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

