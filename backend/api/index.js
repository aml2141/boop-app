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
    const nameCount = count || 3; // Default to 3 names

    console.log('Generating', nameCount, 'names');
console.log('Existing names to avoid:', existingNames || 'none');

    // Build the prompt from form data
    let prompt = `You are a thoughtful baby name consultant. Based on the following information, suggest ${nameCount} beautiful, meaningful baby names.

Parent's name: ${formData.userName || 'Not provided'}
Location: ${formData.location || 'Not provided'}
Parent names: ${formData.parentNames || 'Not provided'}
Cultural background: ${formData.culturalBackground || 'Not provided'}
Baby's sex: ${formData.babySex || 'Not provided'}
Name style preferences: ${formData.nameStyle || 'Not provided'}
Favorite color: ${formData.favoriteColor || 'Not provided'}
Favorite food: ${formData.favoriteFood || 'Not provided'}
Sibling names: ${formData.siblingNames || 'Not provided'}
Names to avoid: ${formData.avoidNames || 'Not provided'}
Additional context: ${formData.additionalContext || 'Not provided'}`;

// Add existing names to avoid if provided
if (existingNames) {
  prompt += `\n\n🚨 CRITICAL REQUIREMENT 🚨
You have already suggested these names: ${existingNames}

You MUST NOT suggest ANY of these names again. Every single one of the ${nameCount} names you generate MUST be completely different and unique from this list. Double-check your response before providing it to ensure no duplicates.`;
}

    prompt += `\n\nFor each name, provide:
1. The name
2. Pronunciation guide
3. Meaning and origin
4. Why it fits their family story

Format as JSON array with objects containing: name, pronunciation, meaning, origin, reasoning`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse the response
    const responseText = message.content[0].text;
    
    res.json({ names: responseText });
  } catch (error) {
    console.error('Error generating names:', error);
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

