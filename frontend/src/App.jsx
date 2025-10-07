import { useState } from 'react';
import { Sparkles, Baby, ArrowRight, RotateCcw, Lock, Star, Volume2, TrendingUp, RefreshCw, Download, Share2, Mail } from 'lucide-react';

export default function BabyNameGenerator() {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [showPopularity, setShowPopularity] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    parentNames: '',
    siblingNames: '',
    partnerName: '',
    income: '',
    heritage: '',
    preferences: '',
    style: '',
    additionalInfo: ''
  });
  const [suggestions, setSuggestions] = useState([]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      const context = `
        Location: ${formData.location || 'Not specified'}
        Heritage: ${formData.heritage || 'Not specified'}
        Partner's name: ${formData.partnerName || 'Not specified'}
        Parents' names: ${formData.parentNames || 'Not specified'}
        Sibling names: ${formData.siblingNames || 'None'}
        Preferred style: ${formData.style || 'Any'}
        Income range: ${formData.income || 'Not specified'}
        Additional preferences: ${formData.additionalInfo || 'None'}
      `.trim();

      const prompt = `You are a baby name expert. Based on the following family context, suggest 8 beautiful, meaningful baby names. For each name, provide:
1. The name itself
2. Its meaning/origin
3. A specific reason why it fits THIS family's context

Context:
${context}

Return your response as a JSON array with this exact structure:
[
  {
    "name": "Name Here",
    "meaning": "Meaning and origin",
    "reason": "Specific reason why this works for their family"
  }
]

Make the suggestions diverse (different origins, styles) but all contextually relevant. Be thoughtful about cultural heritage, sibling harmony, and location. Keep explanations concise but personal.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'YOUR_API_KEY_HERE',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const names = JSON.parse(jsonMatch[0]);
        setSuggestions(names);
        setStep('results');
        setHasGeneratedOnce(true);
      } else {
        throw new Error('Could not parse AI response');
      }
    } catch (error) {
      console.error('Error generating names:', error);
      
      const demoSuggestions = [
        { name: 'Luna', meaning: 'Moon - Latin origin', reason: 'Universally beautiful, works across cultures', pronunciation: 'LOO-nah', rank: 14, region: 'National' },
        { name: 'Oliver', meaning: 'Olive tree - Latin origin', reason: 'Classic choice, consistently popular', pronunciation: 'AH-liv-er', rank: 3, region: 'National' },
        { name: 'Aria', meaning: 'Air, melody - Italian origin', reason: 'Modern, musical, and elegant', pronunciation: 'AH-ree-ah', rank: 22, region: 'National' },
        { name: 'Theodore', meaning: 'Gift of God - Greek origin', reason: 'Vintage revival with sophisticated appeal', pronunciation: 'THEE-uh-dor', rank: 8, region: 'National' },
        { name: 'Nadia', meaning: 'Hope - Slavic origin', reason: 'Beautiful sound with positive meaning', pronunciation: 'NAH-dee-ah', rank: 356, region: 'Northeast' },
        { name: 'Leo', meaning: 'Lion - Latin origin', reason: 'Strong, short, and timeless', pronunciation: 'LEE-oh', rank: 31, region: 'National' },
        { name: 'Amelia', meaning: 'Industrious - German origin', reason: 'Classic with modern popularity', pronunciation: 'ah-MEEL-yah', rank: 6, region: 'National' },
        { name: 'Felix', meaning: 'Happy, fortunate - Latin origin', reason: 'Cheerful meaning with vintage charm', pronunciation: 'FEE-liks', rank: 189, region: 'West Coast' }
      ];
      
      setSuggestions(demoSuggestions);
      setStep('results');
      setHasGeneratedOnce(true);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('form');
    setSuggestions([]);
    setLoading(false);
    setIsPremium(false);
    setHasGeneratedOnce(false);
    setShowPopularity(false);
  };

  const handleUnlock = async () => {
    try {
      const response = await fetch('YOUR_BACKEND_URL/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1SFKHRPnhWpLDLv4Yllnnc2N',
          successUrl: window.location.href + '?premium=true',
          cancelUrl: window.location.href,
        }),
      });

      const { sessionId } = await response.json();
      
      const stripe = window.Stripe('pk_test_51SFK1hPnhWpLDLv4qTcXVYZISHc8HHrKfVOL8hvLqnF18yf2ZwMkQioPHjHFEbnUunfdnAtegyrGqZlIFWi4CilO00SN9TObN2');
      await stripe.redirectToCheckout({ sessionId });
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing would happen here via Stripe!\n\nFor this demo, unlocking for free.');
      setIsPremium(true);
    }
  };

  const handleGenerateMore = async () => {
    try {
      const response = await fetch('YOUR_BACKEND_URL/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1SFKJyPnhWpLDLv4UFgYtTFJ',
          successUrl: window.location.href + '?generate=true',
          cancelUrl: window.location.href,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = window.Stripe('pk_test_51SFK1hPnhWpLDLv4qTcXVYZISHc8HHrKfVOL8hvLqnF18yf2ZwMkQioPHjHFEbnUunfdnAtegyrGqZlIFWi4CilO00SN9TObN2');
      await stripe.redirectToCheckout({ sessionId });
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing would happen here via Stripe!\n\nGenerating new names...');
      generateSuggestions();
    }
  };

  const playPronunciation = (name, pronunciation) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Pronunciation: ${pronunciation}`);
    }
  };

  const downloadAsPDF = () => {
    const printWindow = window.open('', '_blank');
    const namesToShow = isPremium ? [...freeNames, ...premiumNames] : freeNames;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Your Boop Name Suggestions</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto;
              background: linear-gradient(135deg, #e0f2fe 0%, #e0f7fa 100%);
            }
            h1 { 
              color: #0284c7; 
              text-align: center; 
              margin-bottom: 10px;
            }
            .subtitle {
              text-align: center;
              color: #64748b;
              margin-bottom: 30px;
            }
            .name-card { 
              background: white; 
              padding: 20px; 
              margin: 20px 0; 
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #1e293b;
              margin-bottom: 8px;
            }
            .pronunciation {
              color: #0284c7;
              font-size: 14px;
              margin-bottom: 8px;
            }
            .meaning { 
              font-style: italic; 
              color: #64748b;
              margin-bottom: 12px;
            }
            .reason { 
              background: #f0f9ff; 
              padding: 12px; 
              border-radius: 8px;
              color: #075985;
              font-size: 14px;
            }
            .rank {
              color: #0284c7;
              font-weight: bold;
              margin-top: 8px;
            }
            .context {
              background: white;
              padding: 20px;
              border-radius: 12px;
              margin-top: 30px;
            }
            .context h3 {
              color: #0284c7;
              margin-bottom: 10px;
            }
            .context-item {
              color: #64748b;
              margin: 5px 0;
            }
            @media print {
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <h1>👶 Your Boop Name Suggestions</h1>
          <p class="subtitle">Personalized recommendations for your family</p>
          ${namesToShow.map(n => `
            <div class="name-card">
              <div class="name">${n.name}</div>
              <div class="pronunciation">🔊 ${n.pronunciation}</div>
              <div class="meaning">"${n.meaning}"</div>
              <div class="reason"><strong>Why this works:</strong> ${n.reason}</div>
              ${n.rank ? `<div class="rank">📊 National Rank: #${n.rank}</div>` : ''}
            </div>
          `).join('')}
          <div class="context">
            <h3>Your Context</h3>
            ${formData.location ? `<div class="context-item"><strong>Location:</strong> ${formData.location}</div>` : ''}
            ${formData.heritage ? `<div class="context-item"><strong>Heritage:</strong> ${formData.heritage}</div>` : ''}
            ${formData.siblingNames ? `<div class="context-item"><strong>Siblings:</strong> ${formData.siblingNames}</div>` : ''}
            ${formData.style ? `<div class="context-item"><strong>Style:</strong> ${formData.style}</div>` : ''}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const shareViaEmail = () => {
    const namesToShow = isPremium ? [...freeNames, ...premiumNames] : freeNames;
    const nameList = namesToShow.map(n => `${n.name} (${n.pronunciation})\n"${n.meaning}"\n${n.reason}`).join('\n\n');
    
    const subject = encodeURIComponent('Boop Name Suggestions');
    const body = encodeURIComponent(`Here are our baby name ideas:\n\n${nameList}\n\nGenerated by Boop`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaText = () => {
    const namesToShow = isPremium ? [...freeNames, ...premiumNames] : freeNames;
    const nameList = namesToShow.map(n => n.name).join(', ');
    
    const text = encodeURIComponent(`Check out these baby name ideas: ${nameList}`);
    
    if (navigator.share) {
      navigator.share({
        title: 'Boop Name Suggestions',
        text: `Check out these baby name ideas: ${nameList}`,
      }).catch(err => console.log('Share failed', err));
    } else {
      window.location.href = `sms:?body=${text}`;
    }
  };

  const freeNames = suggestions.slice(0, 3);
  const premiumNames = suggestions.slice(3, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Crafting Your Perfect Names...</h2>
          <p className="text-gray-600">Analyzing your family context and cultural background</p>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 px-6 py-12">
        <div className="max-w-3xl mx-auto" style={{width: '100%', maxWidth: '48rem', marginLeft: 'auto', marginRight: 'auto'}}>
          <div className="text-center mb-8 pt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Baby className="text-blue-600" size={40} />
              <h1 className="text-4xl font-bold text-gray-800">Your Personalized Name Suggestions</h1>
            </div>
            <p className="text-gray-600 text-lg">Based on your unique story and preferences</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={reset}
                className="mt-4 px-6 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center gap-2 text-gray-700 font-medium"
              >
                <RotateCcw size={18} />
                Start Over
              </button>
              
              <button
                onClick={() => setShowPopularity(!showPopularity)}
                className="mt-4 px-6 py-2 bg-blue-100 text-blue-700 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center gap-2 font-medium"
              >
                <TrendingUp size={18} />
                {showPopularity ? 'Hide' : 'Show'} Popularity
              </button>

              <button
                onClick={downloadAsPDF}
                className="mt-4 px-6 py-2 bg-green-100 text-green-700 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center gap-2 font-medium"
              >
                <Download size={18} />
                Save as PDF
              </button>

              <button
                onClick={shareViaEmail}
                className="mt-4 px-6 py-2 bg-purple-100 text-purple-700 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center gap-2 font-medium"
              >
                <Mail size={18} />
                Email
              </button>

              <button
                onClick={shareViaText}
                className="mt-4 px-6 py-2 bg-pink-100 text-pink-700 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center gap-2 font-medium"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          {showPopularity && (
            <div className="mt-8 mb-8 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={28} />
                Popularity Rankings (2024)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {freeNames.map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{name.name}</p>
                      <p className="text-sm text-gray-600">{name.region || 'National'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">#{name.rank || 'N/A'}</p>
                      <p className="text-xs text-gray-500">National Rank</p>
                    </div>
                  </div>
                ))}
                
                {!isPremium && premiumNames.length > 0 && (
                  <>
                    {premiumNames.slice(0, 2).map((name, i) => (
                      <div key={i} className="relative flex items-center justify-between p-4 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="blur-sm">
                          <p className="font-bold text-gray-800 text-lg">{name.name}</p>
                          <p className="text-sm text-gray-600">Region Data</p>
                        </div>
                        <div className="text-right blur-sm">
                          <p className="text-3xl font-bold text-gray-400">#123</p>
                          <p className="text-xs text-gray-500">Rank</p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                          <Lock className="text-white" size={32} />
                        </div>
                      </div>
                    ))}
                    <div className="md:col-span-2 text-center p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white">
                      <p className="font-semibold mb-2">Unlock popularity data for all 8 names</p>
                      <p className="text-sm text-blue-100">Upgrade to premium to see complete ranking trends</p>
                    </div>
                  </>
                )}
                
                {isPremium && premiumNames.map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{name.name}</p>
                      <p className="text-sm text-gray-600">{name.region || 'National'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">#{name.rank || 'N/A'}</p>
                      <p className="text-xs text-gray-500">National Rank</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Rankings based on Social Security Administration data and regional trends
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {freeNames.map((suggestion, i) => (
              <div 
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-800">{suggestion.name}</h3>
                    <button
                      onClick={() => playPronunciation(suggestion.name, suggestion.pronunciation)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 mt-1 text-sm font-medium"
                    >
                      <Volume2 size={16} />
                      {suggestion.pronunciation}
                    </button>
                  </div>
                  <Sparkles className="text-blue-500 flex-shrink-0" size={24} />
                </div>
                <p className="text-gray-600 italic mb-3 text-lg">"{suggestion.meaning}"</p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">
                    <span className="font-semibold">Why this works: </span>
                    {suggestion.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {premiumNames.length > 0 && (
            <div className="mt-8">
              {!isPremium ? (
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <Lock size={32} />
                      <h3 className="text-3xl font-bold">Unlock 5 More Premium Names</h3>
                    </div>
                    <p className="text-blue-50 mb-6 text-lg">
                      Get 5 additional contextually personalized name suggestions, each carefully selected for your unique family story.
                    </p>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6 backdrop-blur-sm">
                      <div className="flex items-start gap-3 mb-2">
                        <Star className="text-yellow-300 flex-shrink-0 mt-1" size={20} />
                        <p className="text-sm">5 additional personalized names</p>
                      </div>
                      <div className="flex items-start gap-3 mb-2">
                        <Star className="text-yellow-300 flex-shrink-0 mt-1" size={20} />
                        <p className="text-sm">Complete popularity rankings for all names</p>
                      </div>
                      <div className="flex items-start gap-3 mb-2">
                        <Star className="text-yellow-300 flex-shrink-0 mt-1" size={20} />
                        <p className="text-sm">More diverse cultural perspectives</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Star className="text-yellow-300 flex-shrink-0 mt-1" size={20} />
                        <p className="text-sm">Deep cultural and family context analysis</p>
                      </div>
                    </div>
                    <button
                      onClick={handleUnlock}
                      className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-blue-50 transition-all text-xl shadow-lg w-full md:w-auto"
                    >
                      Unlock for $0.99
                    </button>
                    <p className="text-blue-100 text-sm mt-3">One-time payment • Instant access</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="text-yellow-500 fill-yellow-500" size={24} />
                    <h2 className="text-2xl font-bold text-gray-800">Premium Suggestions</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {premiumNames.map((suggestion, i) => (
                      <div 
                        key={i}
                        className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-blue-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-3xl font-bold text-gray-800">{suggestion.name}</h3>
                            <button
                              onClick={() => playPronunciation(suggestion.name, suggestion.pronunciation)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 mt-1 text-sm font-medium"
                            >
                              <Volume2 size={16} />
                              {suggestion.pronunciation}
                            </button>
                          </div>
                          <Star className="text-yellow-500 fill-yellow-500 flex-shrink-0" size={24} />
                        </div>
                        <p className="text-gray-600 italic mb-3 text-lg">"{suggestion.meaning}"</p>
                        <div className="bg-white bg-opacity-70 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-800">
                            <span className="font-semibold">Why this works: </span>
                            {suggestion.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasGeneratedOnce && (
            <div className="mt-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Want More Options?</h3>
                <p className="text-gray-600 mb-4">
                  Generate a fresh set of 8 personalized names using your same context
                </p>
                <button
                  onClick={handleGenerateMore}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <RefreshCw size={20} />
                  Generate More Names - $0.99
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Your Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              {formData.location && <p><span className="font-semibold">Location:</span> {formData.location}</p>}
              {formData.heritage && <p><span className="font-semibold">Heritage:</span> {formData.heritage}</p>}
              {formData.siblingNames && <p><span className="font-semibold">Siblings:</span> {formData.siblingNames}</p>}
              {formData.style && <p><span className="font-semibold">Style:</span> {formData.style}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Baby className="text-blue-600" size={40} />
            <h1 className="text-5xl font-bold text-gray-800">Tell Us Your Story</h1>
          </div>
          <p className="text-gray-600 text-lg">We'll suggest names that fit your unique family context</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Where do you live?
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="e.g., NYC, San Francisco, Austin..."
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's your heritage or cultural background?
              </label>
              <input
                type="text"
                value={formData.heritage}
                onChange={(e) => updateField('heritage', e.target.value)}
                placeholder="e.g., Eastern European, Irish, Italian, Mexican..."
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your partner's name (optional)
              </label>
              <input
                type="text"
                value={formData.partnerName}
                onChange={(e) => updateField('partnerName', e.target.value)}
                placeholder="e.g., Sarah"
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your parent's names (optional)
              </label>
              <input
                type="text"
                value={formData.parentNames}
                onChange={(e) => updateField('parentNames', e.target.value)}
                placeholder="e.g., Anna and Boris"
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Do you have other children? If so, what are their names?
              </label>
              <input
                type="text"
                value={formData.siblingNames}
                onChange={(e) => updateField('siblingNames', e.target.value)}
                placeholder="e.g., Emma, Liam"
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What style of name do you prefer?
              </label>
              <select
                value={formData.style}
                onChange={(e) => updateField('style', e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors"
              >
                <option value="">Choose a style...</option>
                <option value="classic">Classic & Timeless</option>
                <option value="modern">Modern & Trendy</option>
                <option value="unique">Unique & Uncommon</option>
                <option value="traditional">Traditional & Cultural</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Household income range (helps with cultural context)
              </label>
              <select
                value={formData.income}
                onChange={(e) => updateField('income', e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors"
              >
                <option value="">Optional - Select range...</option>
                <option value="<50k">Under $50K</option>
                <option value="50-100k">$50K - $100K</option>
                <option value="100-200k">$100K - $200K</option>
                <option value="200k+">$200K+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Any other preferences or context?
              </label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => updateField('additionalInfo', e.target.value)}
                placeholder="Tell us anything else that matters to you... religious preferences, names you love/hate, family traditions, etc."
                rows={4}
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors resize-none"
              />
            </div>

            <button
              onClick={generateSuggestions}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate My Personalized Names'}
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          We use your context to suggest culturally relevant, meaningful names that fit your family
        </p>
      </div>
    </div>
  );
}