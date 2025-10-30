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

    // RANDOMIZE HERITAGE ORDER to prevent bias toward first-listed heritage
    const shouldFlipHeritageOrder = Math.random() > 0.5;
    const heritage1 = shouldFlipHeritageOrder ? formData.partnerHeritage : formData.heritage;
    const heritage2 = shouldFlipHeritageOrder ? formData.heritage : formData.partnerHeritage;
    const heritage1Label = shouldFlipHeritageOrder ? "Partner's Heritage" : "Your Heritage";
    const heritage2Label = shouldFlipHeritageOrder ? "Your Heritage" : "Partner's Heritage";

   let prompt = `You are an expert baby name consultant specializing in personalized, meaningful suggestions.

CRITICAL INSTRUCTIONS:
1. FIRST AND FOREMOST: Honor the user's stated style preferences exactly (${formData.style || 'any style'})
2. Generate ${nameCount} DIVERSE names - avoid suggesting the same names to different families
3. **MANDATORY BALANCE**: When partners have different heritages OR religions, you MUST include names from EACH background equally. DO NOT favor one culture over the other.
4. HEAVILY personalize based on their unique context (heritage, siblings, location, values, traditions)
5. Avoid generic suggestions - if suggesting a popular name, you must explain why it's uniquely suited to THIS specific family
6. Increase creativity and variety - think beyond the obvious choices

User Context:
- Parent Name: ${formData.userName || 'Not provided'}
- Preferred Gender: ${formData.babyGender || 'Any'}
- Location: ${formData.location || 'Not provided'} (consider regional preferences and cultural context)
- Baby Will Grow Up In: ${formData.regionGrowUp || 'Same as location'} (consider future cultural context)
- ${heritage1Label}: ${heritage1 || 'Not provided'}
- Partner Name: ${formData.partnerName || 'Not provided'}
- Parent Names: ${formData.parentNames || 'Not provided'}
- ${heritage2Label}: ${heritage2 || 'Not provided'}
- Partner's Parent Names: ${formData.partnerParentNames || 'Not provided'}

🚨 **HERITAGE BLENDING RULE**: ${heritage1 && heritage2 ? `BOTH "${heritage1}" and "${heritage2}" heritages are provided. You MUST provide EQUAL representation from BOTH cultures in your ${nameCount} suggestions. If you provide ${nameCount} names, aim for a 50/50 split between the two heritages. Do NOT provide only or mostly names from one heritage.` : 'Single heritage provided or none.'}

- Sibling Names: ${formData.siblingNames || 'Not provided'} (ensure the name fits the sibling set's style and flow)
- Family Naming Traditions: ${formData.familyTraditions || 'Not provided'} (honor these traditions if provided)
- Family Names to Honor/Avoid: ${formData.familyNamesToHonor || 'Not provided'} (prioritize honoring or avoiding these specific names)
- Values to Reflect: ${formData.values || 'Not provided'} (choose names that embody these values)
- Religious/Spiritual Preferences: ${formData.religiousPreferences || 'Not provided'} (respect and balance multiple traditions if provided)
- Last Name: ${formData.lastName || 'Not provided'} (ensure good flow and avoid unfortunate initials)
- Languages Spoken: ${formData.languages || 'Not provided'} (ensure name works well in these languages)
- Style Preference: ${formData.style || 'Not provided'} ⚠️ THIS IS CRITICAL - match this style exactly
- Names to Avoid: ${formData.avoid || 'None'}

${existingNames && existingNames.length > 0 ? `
🚨 MANDATORY: Do NOT suggest any of these previously generated names: ${existingNames}
Generate completely different options.` : ''}

**REQUIRED DISTRIBUTION** (when multiple heritages present):
- For ${nameCount} names with 2 different heritages: Provide approximately ${Math.floor(nameCount/2)} names from EACH heritage
- You MUST alternate between heritages or ensure balanced representation
- Include a mix: some names from heritage 1, some from heritage 2, and optionally some universal/bridge names that work in both cultures

For each name, provide:
1. name: The suggested name
2. pronunciation: Clear phonetic guide (e.g., "ah-MEE-lee-ah")
3. meaning: Origin and meaning - **EXPLICITLY STATE which heritage/culture this name comes from**
4. reason: Why this name specifically works for THIS family (2-3 detailed sentences that reference which heritage this honors and why it fits the family)
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
