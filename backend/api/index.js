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
let prompt = `You are a thoughtful baby name consultant with deep knowledge of names from diverse cultures and traditions. Generate ${nameCount} PRACTICAL, REAL baby names that parents would actually use.

IMPORTANT: Use ALL the context provided below to make deeply personalized suggestions. Each name should feel chosen specifically for THIS family.

FAMILY CONTEXT:
- Parent's name: ${formData.userName || 'Not provided'}
- Location: ${formData.location || 'Not provided'}
- Cultural heritage: ${formData.heritage || 'Not provided'}
- Partner's name: ${formData.partnerName || 'Not provided'}
- Parents' names: ${formData.parentNames || 'Not provided'}
- Sibling names: ${formData.siblingNames || 'Not provided'}
- Preferred style: ${formData.style || 'Not provided'}
- Favorite color: ${formData.favoriteColor || 'Not provided'}
- Favorite food: ${formData.favoriteFood || 'Not provided'}
- Additional preferences: ${formData.additionalInfo || 'Not provided'}

REQUIREMENTS:
1. Suggest ONLY established, real names that parents would actually use (not invented names)
2. Names should honor their cultural heritage when provided
3. Names should complement sibling names when provided
4. Consider their location and community
5. Each name's reasoning must reference SPECIFIC details from their context (mention their heritage, location, sibling names, parent names, or other details they provided)
6. Be thoughtful about how names sound with the parent's surname if mentioned
7. Ensure names are appropriate for their stated style preference

For each name, provide a realistic estimated popularity ranking based on current naming trends:
- Popular classic names (like Emma, Noah): ranks 1-100
- Moderately popular names: ranks 100-500
- Unique/uncommon names: ranks 500-1000+`;

    // Add existing names to avoid if provided
    if (existingNames) {
      prompt += `\n\n🚨 CRITICAL REQUIREMENT 🚨
You have already suggested these names: ${existingNames}

You MUST NOT suggest ANY of these names again. Every single one of the ${nameCount} names you generate MUST be completely different and unique from this list. Double-check your response before providing it to ensure no duplicates.`;
    }

    prompt += `\n\nFormat as JSON array with objects containing: name, pronunciation, meaning, origin, reason (must reference specific family context), rank (estimated national rank as a number)`;

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
// Stripe checkout endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
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
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

