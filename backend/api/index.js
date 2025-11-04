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

app.options('*', cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.post('/api/generate-names', async (req, res) => {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const { formData, existingNames, count } = req.body;
    const nameCount = count || 3;

    const hasTwoHeritages = formData.heritage && formData.partnerHeritage && 
                            formData.heritage.toLowerCase() !== formData.partnerHeritage.toLowerCase();
    
    const hasTwoReligions = formData.religiousPreferences && 
                            (formData.religiousPreferences.toLowerCase().includes('catholic') || 
                             formData.religiousPreferences.toLowerCase().includes('christian')) &&
                            formData.religiousPreferences.toLowerCase().includes('hindu');

   let prompt = `You are an expert baby name consultant specializing in personalized, meaningful suggestions.

CRITICAL INSTRUCTIONS:
1. Honor the user's stated style preferences exactly (${formData.style || 'any style'})
2. Generate ${nameCount} DIVERSE names
3. ${hasTwoHeritages || hasTwoReligions ? `MANDATORY: Balance both heritages equally - provide ${Math.floor(nameCount/2)} names from ${formData.heritage} and ${Math.ceil(nameCount/2)} from ${formData.partnerHeritage}` : 'Personalize based on context'}

User Context:
- Parent: ${formData.userName || 'Not provided'}
- Gender: ${formData.babyGender || 'Any'}
- Location: ${formData.location || 'Not provided'}
- Heritage: ${formData.heritage || 'Not provided'}
- Partner: ${formData.partnerName || 'Not provided'}
- Partner Heritage: ${formData.partnerHeritage || 'Not provided'}
- Siblings: ${formData.siblingNames || 'Not provided'}
- Traditions: ${formData.familyTraditions || 'Not provided'}
- Values: ${formData.values || 'Not provided'}
- Religion: ${formData.religiousPreferences || 'Not provided'}
- Last Name: ${formData.lastName || 'Not provided'}
- Languages: ${formData.languages || 'Not provided'}
- Style: ${formData.style || 'Not provided'}

${existingNames ? `Avoid these names: ${existingNames}` : ''}

Return ONLY JSON: [{"name":"","pronunciation":"","meaning":"","reason":"","rank2024":"","trend2025":""}]`;

    const message = await anthropic.messages.create({
model: 'claude-3-5-sonnet-20240620',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = message.content[0].text;
    res.json({ names: content });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});