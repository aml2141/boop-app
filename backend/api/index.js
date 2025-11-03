const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const cors = require('cors');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Detect if there are two different heritages/religions
    const hasTwoHeritages = formData.heritage && formData.partnerHeritage && 
                            formData.heritage.toLowerCase() !== formData.partnerHeritage.toLowerCase();
    
    const hasTwoReligions = formData.religiousPreferences && 
                            (formData.religiousPreferences.toLowerCase().includes('catholic') || 
                             formData.religiousPreferences.toLowerCase().includes('christian')) &&
                            formData.religiousPreferences.toLowerCase().includes('hindu');

   let prompt = `You are an expert baby name consultant specializing in personalized, meaningful suggestions.

CRITICAL INSTRUCTIONS:
1. FIRST AND FOREMOST: Honor the user's stated style preferences exactly (${formData.style || 'any style'})
2. Generate ${nameCount} DIVERSE names - avoid suggesting the same names to different families
3. ${hasTwoHeritages || hasTwoReligions ? `🚨 MANDATORY BALANCE REQUIREMENT 🚨
   This family has TWO DIFFERENT cultural/religious backgrounds that must be honored EQUALLY.
   Heritage 1: ${formData.heritage || 'Not specified'}
   Heritage 2: ${formData.partnerHeritage || 'Not specified'}
   Religious backgrounds: ${formData.religiousPreferences || 'Not specified'}
   
   YOU MUST FOLLOW THIS EXACT FORMULA:
   - Out of ${nameCount} names, provide EXACTLY ${Math.floor(nameCount/2)} names from the first heritage/religion
   - Provide EXACTLY ${Math.ceil(nameCount/2)} names from the second heritage/religion
   - DO NOT provide more than ${Math.ceil(nameCount/2)} names from any single heritage
   - Before submitting your response, COUNT the names from each heritage to verify balance
   - If you find yourself suggesting mostly names from one culture, STOP and restart with better balance` : 'Personalize based on their unique context'}
4. Avoid generic suggestions - if suggesting a popular name, you must explain why it's uniquely suited to THIS specific family
5. Increase creativity and variety - think beyond the obvious choices

User Context:
- Parent Name: ${formData.userName || 'Not provided'}
- Preferred Gender: ${formData.babyGender || 'Any'}
- Location: ${formData.location || 'Not provided'}
- Baby Will Grow Up In: ${formData.regionGrowUp || 'Same as location'}
- Your Heritage: ${formData.heritage || 'Not provided'}
- Partner Name: ${formData.partnerName || 'Not provided'}
- Parent Names: ${formData.parentNames || 'Not provided'}
- Partner's Heritage: ${formData.partnerHeritage || 'Not provided'}
- Partner's Parent Names: ${formData.partnerParentNames || 'Not provided'}
- Sibling Names: ${formData.siblingNames || 'Not provided'}
- Family Naming Traditions: ${formData.familyTraditions || 'Not provided'}
- Family Names to Honor/Avoid: ${formData.familyNamesToHonor || 'Not provided'}
- Values to Reflect: ${formData.values || 'Not provided'}
- Religious/Spiritual Preferences: ${formData.religiousPreferences || 'Not provided'}
- Last Name: ${formData.lastName || 'Not provided'}
- Languages Spoken: ${formData.languages || 'Not provided'}
- Style Preference: ${formData.style || 'Not provided'} ⚠️ THIS IS CRITICAL
- Names to Avoid: ${formData.avoid || 'None'}

${existingNames && existingNames.length > 0 ? `
🚨 MANDATORY: Do NOT suggest any of these previously generated names: ${existingNames}
Generate completely different options.` : ''}

For each name, provide:
1. name: The suggested name
2. pronunciation: Clear phonetic guide (e.g., "ah-MEE-lee-ah")
3. meaning: Origin and meaning - **MUST explicitly state which heritage this represents: "${formData.heritage}" or "${formData.partnerHeritage}"**
4. reason: Why this name specifically works for THIS family (2-3 detailed sentences)
5. rank2024: 2024 SSA popularity rank (use real data if you know it, or "Not ranked" for rare names)
6. trend2025: One of: "Rising", "Timeless", "Declining", or "Emerging"
7. regionalNote: (optional) If relevant to their location/heritage

Return ONLY valid JSON array with no additional text:
[{"name":"","pronunciation":"","meaning":"","reason":"","rank2024":"","trend2025":"","regionalNote":""}]`;
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2000,
 stream: false,
  messages: [
    {
      role: 'user',
      content: prompt
    }
  ]
});

const content = message.content[0].text;
res.json({ names: content });

  } catch (error) {
    console.error('Error generating names:', error);
    res.status(500).json({ error: error.message });
  }
});
// Helper function to send email with names
async function sendNamesEmail(email, names, userName, isFullUnlock = false) {
  try {
    const namesList = names.map(name => `
      <div style="margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
        <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px;">${name.name}</h2>
        <p style="color: #64748b; margin: 5px 0;"><strong>Pronunciation:</strong> ${name.pronunciation}</p>
        <p style="color: #64748b; margin: 5px 0;"><strong>Meaning:</strong> ${name.meaning}</p>
        <p style="color: #475569; margin: 10px 0 5px 0;">${name.reason}</p>
        ${name.rank2024 ? `<p style="color: #64748b; margin: 5px 0; font-size: 14px;">2024 Rank: #${name.rank2024} • ${name.trend2025}</p>` : ''}
      </div>
    `).join('');

    await resend.emails.send({
      from: 'Boop <hello@helloboop.com>',
      to: email,
      subject: isFullUnlock ? `${userName}, here are all your personalized baby names! 👶` : `${userName}, here are your first personalized baby names! 👶`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; font-size: 32px; margin: 0;">👶 Boop</h1>
            <p style="color: #64748b; font-size: 18px;">Your Personalized Baby Names</p>
          </div>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${userName}!</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            ${isFullUnlock 
              ? "Here are all your unlocked personalized baby name suggestions:" 
              : "Here are your first personalized baby name suggestions. Unlock more names anytime at helloboop.com!"}
          </p>
          
          ${namesList}
          
          ${!isFullUnlock ? `
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://helloboop.com" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Get More Names →
              </a>
            </div>
          ` : ''}
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px;">© 2025 Boop • <a href="https://helloboop.com" style="color: #3b82f6;">helloboop.com</a></p>
          </div>
        </div>
      `
    });
    
    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// OPTIONS handler for send-names-email
app.options('/api/send-names-email', cors());

// Endpoint to send names via email
app.post('/api/send-names-email', cors(), async (req, res) => {
  try {
    const { email, names, userName, isFullUnlock } = req.body;
    
    if (!email || !names || !userName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendNamesEmail(email, names, userName, isFullUnlock);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in send-names-email:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    
    console.log('Creating checkout session with:', { priceId, successUrl, cancelUrl });
    console.log('Using Stripe key starting with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10));
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
// Email integration updated Mon Nov  3 15:58:56 EST 2025
// Resend package verified Mon Nov  3 17:08:20 EST 2025
