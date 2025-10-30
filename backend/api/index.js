const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['https://helloboop.com', 'https://www.helloboop.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// Explicitly add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.post('/api/generate-names', async (req, res) => {
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

   let prompt = `You are an expert baby name consultant specializing in personalized, meaningful suggestions.

CRITICAL INSTRUCTIONS:
1. FIRST AND FOREMOST: Honor the user's stated style preferences exactly (${formData.style || 'any style'})
2. Generate ${nameCount} DIVERSE names - avoid suggesting the same names to different families
3. HEAVILY personalize based on their unique context (heritage, siblings, location, values, traditions)
4. Avoid generic suggestions - if suggesting a popular name, you must explain why it's uniquely suited to THIS specific family
5. Increase creativity and variety - think beyond the obvious choices

User Context:
- Parent Name: ${formData.userName || 'Not provided'}
- Preferred Gender: ${formData.babyGender || 'Any'}
- Location: ${formData.location || 'Not provided'} (consider regional preferences and cultural context)
- Baby Will Grow Up In: ${formData.regionGrowUp || 'Same as location'} (consider future cultural context)
- Heritage: ${formData.heritage || 'Not provided'} (weigh this HEAVILY)
- Partner Name: ${formData.partnerName || 'Not provided'}
- Parent Names: ${formData.parentNames || 'Not provided'}
- Partner's Heritage: ${formData.partnerHeritage || 'Not provided'} (blend both heritages meaningfully)
- Partner's Parent Names: ${formData.partnerParentNames || 'Not provided'}
- Sibling Names: ${formData.siblingNames || 'Not provided'} (ensure the name fits the sibling set's style and flow)
- Family Naming Traditions: ${formData.familyTraditions || 'Not provided'} (honor these traditions if provided)
- Family Names to Honor/Avoid: ${formData.familyNamesToHonor || 'Not provided'} (prioritize honoring or avoiding these specific names)
- Values to Reflect: ${formData.values || 'Not provided'} (choose names that embody these values)
- Religious/Spiritual Preferences: ${formData.religiousPreferences || 'Not provided'} (respect these preferences in name meanings)
- Last Name: ${formData.lastName || 'Not provided'} (ensure good flow and avoid unfortunate initials)
- Languages Spoken: ${formData.languages || 'Not provided'} (ensure name works well in these languages)
- Style Preference: ${formData.style || 'Not provided'} ⚠️ THIS IS CRITICAL - match this style exactly
- Names to Avoid: ${formData.avoid || 'None'}

${existingNames && existingNames.length > 0 ? `
🚨 MANDATORY: Do NOT suggest any of these previously generated names: ${existingNames}
Generate completely different options.` : ''}

For each name, provide:
1. name: The suggested name
2. pronunciation: Clear phonetic guide (e.g., "ah-MEE-lee-ah")
3. meaning: Origin and meaning (1-2 sentences)
4. reason: Why this name specifically works for THIS family (2-3 detailed sentences that reference their heritage, sibling names, location, values, traditions, or stated preferences)
5. rank2024: 2024 SSA popularity rank (use real data if you know it, or "Not ranked" for rare names)
6. trend2025: One of: "Rising", "Timeless", "Declining", or "Emerging"
7. regionalNote: (optional) If relevant to their location/heritage

Return ONLY valid JSON array with no additional text:
[{"name":"","pronunciation":"","meaning":"","reason":"","rank2024":"","trend2025":"","regionalNote":""}]`;
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
  
  console.log('Creating checkout session with:', { priceId, successUrl, cancelUrl });
  console.log('Using Stripe key starting with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10));

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
// Updated Thu Oct 30 14:20:15 EDT 2025
