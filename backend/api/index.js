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
const prompt = `You are a baby name expert. Generate ${nameCount} diverse, high-quality baby name suggestions based on the following context:

Name: ${formData.userName || 'Not provided'}
Baby Gender Preference: ${formData.babyGender || 'Any'}
Location: ${formData.location || 'Not provided'}
Cultural Heritage: ${formData.heritage || 'Not provided'}
Partner Names: ${formData.parentNames || 'Not provided'}
Sibling Names: ${formData.siblingNames || 'Not provided'}
Style Preferences: ${formData.style || 'Not provided'}
Important Factors: ${formData.meaning || 'Not provided'}
Names to Avoid: ${formData.avoid || 'None'}
Additional Context: ${formData.notes || 'None'}

${existingNames && existingNames.length > 0 ? `Previously suggested names to avoid duplicating: ${existingNames.join(', ')}` : ''}

For EACH name, provide:
1. The name itself
2. Pronunciation guide (phonetic)
3. Meaning and origin
4. Detailed reasoning for why this name works for this specific family (2-3 sentences, referencing their location, heritage, style preferences, and other context)
5. 2024 SSA popularity rank (use actual data if you know it, or estimate "Not ranked" if outside top 1000)
6. 2025 trend prediction: "Rising", "Timeless", or "Declining"
7. Regional popularity note if relevant to their location (e.g., "Especially popular in Texas" or "Classic Southern choice")

Return ONLY a JSON array with this exact structure:
[
  {
    "name": "Name",
    "pronunciation": "pronunciation guide",
    "meaning": "meaning and origin",
    "reason": "why this works for them",
    "rank2024": "15" or "Not ranked",
    "trend2025": "Rising" or "Timeless" or "Declining",
    "regionalNote": "Especially popular in Texas" or null
  }
]

Focus on names that truly fit their cultural context, location, and preferences. Make each suggestion thoughtful and personalized.`;
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

