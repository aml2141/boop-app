const Anthropic = require('@anthropic-ai/sdk');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const { formData, existingNames, count } = req.body;
    const nameCount = count || 3;

    let prompt = `You are a baby name expert. Generate ${nameCount} diverse baby name suggestions.

Context:
- Name: ${formData.userName || 'Not provided'}
- Gender: ${formData.babyGender || 'Any'}
- Location: ${formData.location || 'Not provided'}
- Heritage: ${formData.heritage || 'Not provided'}
- Parent's Names: ${formData.parentNames || 'Not provided'}
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
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0].text;
    res.json({ names: content });
  } catch (error) {
    console.error('Error generating names:', error);
    res.status(500).json({ error: error.message });
  }
};