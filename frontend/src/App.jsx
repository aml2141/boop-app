import { useState, useEffect } from 'react';
import { Baby, Sparkles, ArrowRight, ArrowLeft, Share2, Download, Star } from 'lucide-react';
import Select from 'react-select';
// Animation styles
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;
export default function BabyNameGenerator() {
  // Inject animation styles
  if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    if (!document.head.querySelector('[data-boop-styles]')) {
      styleSheet.setAttribute('data-boop-styles', 'true');
      document.head.appendChild(styleSheet);
    }
  }
  
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [currentFormStep, setCurrentFormStep] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [hasUnlockedOnce, setHasUnlockedOnce] = useState(false);
  const [showPopularity, setShowPopularity] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    location: '',
    parentNames: '',
    siblingNames: '',
    partnerName: '',
    favoriteColor: '',
    favoriteFood: '',
    heritage: '',
    preferences: '',
    style: '',
    additionalInfo: ''
  });
  const [suggestions, setSuggestions] = useState([]);
const formSteps = [
  {
    id: 'userName',
    label: "What's your name?",
    placeholder: 'e.g., Sarah',
    type: 'text',
    required: true
  },
  {
    id: 'location',
    label: 'Where do you live?',
    type: 'searchable-select',
    required: true
  },
  {
    id: 'heritage',
    label: "What's your heritage or cultural background?",
    placeholder: 'e.g., Eastern European, Irish, Italian, Mexican...',
    type: 'text',
    required: false
  },
  {
    id: 'partnerName',
    label: "Your partner's name (optional)",
    placeholder: 'e.g., Alex',
    type: 'text',
    required: false
  },
  {
    id: 'parentNames',
    label: "Your parent's names (optional)",
    placeholder: 'e.g., Anna and Boris',
    type: 'text',
    required: false
  },
  {
    id: 'siblingNames',
    label: 'Do you have other children? If so, what are their names?',
    placeholder: 'e.g., Emma, Liam',
    type: 'text',
    required: false
  },
  {
    id: 'style',
    label: 'What style of name do you prefer?',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Choose a style...' },
      { value: 'classic', label: 'Classic & Timeless' },
      { value: 'modern', label: 'Modern & Trendy' },
      { value: 'unique', label: 'Unique & Uncommon' },
      { value: 'traditional', label: 'Traditional & Cultural' }
    ]
  },
  {
    id: 'favoriteColor',
    label: "What's your favorite color? (optional)",
    placeholder: 'e.g., Blue, Purple...',
    type: 'text',
    required: false
  },
  {
    id: 'additionalInfo',
    label: 'Any other preferences or context?',
    placeholder: 'Tell us anything else that matters to you...',
    type: 'textarea',
    required: false
  }
];

const majorCities = [
  { value: 'New York City, NY', label: 'New York City, NY' },
  { value: 'Los Angeles, CA', label: 'Los Angeles, CA' },
  { value: 'Chicago, IL', label: 'Chicago, IL' },
  { value: 'Houston, TX', label: 'Houston, TX' },
  { value: 'Phoenix, AZ', label: 'Phoenix, AZ' },
  { value: 'San Francisco, CA', label: 'San Francisco, CA' },
  { value: 'Boston, MA', label: 'Boston, MA' },
  { value: 'Miami, FL', label: 'Miami, FL' },
  { value: 'Seattle, WA', label: 'Seattle, WA' },
  { value: 'Austin, TX', label: 'Austin, TX' },
  { value: 'Toronto, Canada', label: 'Toronto, Canada' },
  { value: 'Vancouver, Canada', label: 'Vancouver, Canada' },
  { value: 'London, UK', label: 'London, UK' },
  { value: 'Paris, France', label: 'Paris, France' },
  { value: 'Berlin, Germany', label: 'Berlin, Germany' },
  { value: 'Tokyo, Japan', label: 'Tokyo, Japan' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Sydney, Australia', label: 'Sydney, Australia' },
  { value: 'Mexico City, Mexico', label: 'Mexico City, Mexico' }
];

const updateField = (field, value) => {
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const nextFormStep = () => {
  const currentQuestion = formSteps[currentFormStep];
  
  // Validate required fields
  if (currentQuestion.required && !formData[currentQuestion.id]) {
    alert(`Please answer: ${currentQuestion.label}`);
    return;
  }
  
  if (currentFormStep < formSteps.length - 1) {
    setCurrentFormStep(currentFormStep + 1);
  }
};

const prevFormStep = () => {
  if (currentFormStep > 0) {
    setCurrentFormStep(currentFormStep - 1);
  }
};

const isLastStep = currentFormStep === formSteps.length - 1;
const canSubmit = formData.userName && formData.location && formData.style;
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://boop-app-eight.vercel.app'
  : 'http://localhost:3000';
  // Handle return from Stripe payment
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  
  if (params.get('generate') === '5' && suggestions.length > 0) {
    setHasUnlockedOnce(true);
    generateAdditionalNames(5);
    sessionStorage.removeItem('boopFormData');
    sessionStorage.removeItem('boopSuggestions');
    window.history.replaceState({}, '', window.location.pathname);
  }
  
  if (params.get('generate') === '8' && suggestions.length > 0) {
    generateAdditionalNames(5);
    sessionStorage.removeItem('boopFormData');
    sessionStorage.removeItem('boopSuggestions');
    window.history.replaceState({}, '', window.location.pathname);
  }
}, [suggestions]);

// Restore state from sessionStorage on page load
useEffect(() => {
  const savedFormData = sessionStorage.getItem('boopFormData');
  const savedSuggestions = sessionStorage.getItem('boopSuggestions');
  
  if (savedSuggestions) {
    const parsed = JSON.parse(savedSuggestions);
    if (parsed.length > 0) {
      setSuggestions(parsed);
      setStep('results');
      setHasGeneratedOnce(true);
      if (parsed.length > 3) {
        setHasUnlockedOnce(true);
      }
    }
  }
  
  if (savedFormData) {
    setFormData(JSON.parse(savedFormData));
  }
}, []);

const generateSuggestions = async () => {

  setLoading(true);
  
  try {
      const response = await fetch(`${API_URL}/api/generate-names`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData,
          count: 3
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      const content = data.names;
      
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
        { name: 'Aria', meaning: 'Air, melody - Italian origin', reason: 'Modern, musical, and elegant', pronunciation: 'AH-ree-ah', rank: 22, region: 'National' }
      ];
      
      setSuggestions(demoSuggestions);
      setStep('results');
      setHasGeneratedOnce(true);
    } finally {
      setLoading(false);
    }
  };

  const generateAdditionalNames = async (count = 5) => {
    setLoading(true);
    try {
      const existingNames = suggestions.map(s => s.name).join(', ');
      
      const response = await fetch(`${API_URL}/api/generate-names`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData,
          existingNames: existingNames,
          count: count
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      const content = data.names;
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const newNames = JSON.parse(jsonMatch[0]);
        setSuggestions([...suggestions, ...newNames]);
      } else {
        throw new Error('Could not parse AI response');
      }
    } catch (error) {
      console.error('Error generating additional names:', error);
      alert('Error generating more names. Please try again.');
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
  setHasUnlockedOnce(false);
  setShowPopularity(false);
  // Clear sessionStorage
  sessionStorage.removeItem('boopFormData');
  sessionStorage.removeItem('boopSuggestions');
};

  const handleUnlock = async () => {
    try {
      const response = await fetch('https://boop-app-eight.vercel.app/api/create-checkout-session', {
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
  console.log('handleGenerateMore clicked!');
  // Save state before redirecting to Stripe
  sessionStorage.setItem('boopFormData', JSON.stringify(formData));
  sessionStorage.setItem('boopSuggestions', JSON.stringify(suggestions));
  try {
    const response = await fetch('https://boop-app-eight.vercel.app/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_1SFKJyPnhWpLDLv4UFgYtTFJ',
        successUrl: window.location.href + '?generate=5',
        cancelUrl: window.location.href,
      }),
    });

    const { sessionId } = await response.json();
    const stripe = window.Stripe('pk_test_51SFK1hPnhWpLDLv4qTcXVYZISHc8HHrKfVOL8hvLqnF18yf2ZwMkQioPHjHFEbnUunfdnAtegyrGqZlIFWi4CilO00SN9TObN2');
    await stripe.redirectToCheckout({ sessionId });
    
  } catch (error) {
    console.error('Payment error:', error);
    // Fallback for demo/testing
    setHasUnlockedOnce(true);
    generateAdditionalNames(5);
  }
};

const handleGenerateEightMore = async () => {
  // Save state before redirecting to Stripe
  sessionStorage.setItem('boopFormData', JSON.stringify(formData));
  sessionStorage.setItem('boopSuggestions', JSON.stringify(suggestions));
  try {
    const response = await fetch('https://boop-app-eight.vercel.app/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_1SFKJyPnhWpLDLv4UFgYtTFJ',
        successUrl: window.location.href + '?generate=5',
        cancelUrl: window.location.href,
      }),
    });

    const { sessionId } = await response.json();
    const stripe = window.Stripe('pk_test_51SFK1hPnhWpLDLv4qTcXVYZISHc8HHrKfVOL8hvLqnF18yf2ZwMkQioPHjHFEbnUunfdnAtegyrGqZlIFWi4CilO00SN9TObN2');
    await stripe.redirectToCheckout({ sessionId });
    
  } catch (error) {
    console.error('Payment error:', error);
    // Fallback for demo/testing
    setHasUnlockedOnce(true);
    generateAdditionalNames(5);
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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  window.print();
  return;
}
    const printWindow = window.open('', '_blank');
    const namesToShow = suggestions;
    
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
              <div class="reason"><strong>Why this works:</strong> ${n.reason || n.reasoning || 'Personalized for your family'}</div>
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
    const namesToShow = suggestions;
    const nameList = namesToShow.map(n => `${n.name} (${n.pronunciation})\n"${n.meaning}"\n${n.reason || n.reasoning}`).join('\n\n');
    
    const subject = encodeURIComponent('Boop Name Suggestions');
    const body = encodeURIComponent(`Here are our baby name ideas:\n\n${nameList}\n\nGenerated by Boop`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

const shareViaText = () => {
  const namesToShow = suggestions;
  const nameList = namesToShow.map(n => 
    `${n.name} (${n.pronunciation})\n"${n.meaning}"\n${n.reason || n.reasoning || 'Perfect for your family'}`
  ).join('\n\n');
  
  const text = `Check out these personalized baby name ideas:\n\n${nameList}\n\nGenerated by Boop`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Boop Name Suggestions',
      text: text,
    }).catch(err => console.log('Share failed', err));
  } else {
    const encoded = encodeURIComponent(text);
    window.location.href = `sms:?body=${encoded}`;
  }
};
const shareIndividualName = (name) => {
  const text = `Check out this baby name idea:\n\n${name.name} (${name.pronunciation})\n"${name.meaning}"\n\n${name.reason || name.reasoning || 'Perfect for your family'}\n\nGenerated by Boop`;
  
  if (navigator.share) {
    navigator.share({
      title: `Baby Name: ${name.name}`,
      text: text,
    }).catch(err => console.log('Share failed', err));
  } else {
    const encoded = encodeURIComponent(text);
    window.location.href = `sms:?body=${encoded}`;
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 p-6 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 p-6 flex items-center justify-center">
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
{/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'Save as Image' : 'Save as PDF'}
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
      {suggestions.map((name, i) => (
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
    </div>
    <p className="text-sm text-gray-500 mt-4 text-center">
      Estimated popularity rankings based on current naming trends
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
                  <button
  onClick={(e) => {
    e.stopPropagation();
    shareIndividualName(suggestion);
  }}
  className="text-blue-500 hover:text-blue-600 transition-colors"
  title="Share this name"
>
  <Star size={24} />
</button>
                </div>
                <p className="text-gray-600 italic mb-3 text-lg">"{suggestion.meaning}"</p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">
                    <span className="font-semibold">Why this works: </span>
                    {suggestion.reason || suggestion.reasoning || 'Personalized for your family'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {premiumNames.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="text-yellow-500 fill-yellow-500" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Additional Suggestions</h2>
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
                        
                    </div>
                    <p className="text-gray-600 italic mb-3 text-lg">"{suggestion.meaning}"</p>
                    <div className="bg-white bg-opacity-70 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-800">
                        <span className="font-semibold">Why this works: </span>
                        {suggestion.reason || suggestion.reasoning || 'Personalized for your family'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasGeneratedOnce && !hasUnlockedOnce && suggestions.length === 3 && (
            <div className="mt-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Want More Options?</h3>
                <p className="text-gray-600 mb-4">
                  Generate 5 more personalized names using your same context
                </p>
                <button
                  onClick={handleGenerateMore}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <RefreshCw size={20} />
                  Unlock 5 More Names - $0.99
                </button>
              </div>
            </div>
          )}

          {hasGeneratedOnce && hasUnlockedOnce && (
            <div className="mt-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Want Even More Options?</h3>
                <p className="text-gray-600 mb-4">
                  Generate a fresh set of 5 personalized names using your same context
                </p>
                <button
                  onClick={handleGenerateEightMore}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <RefreshCw size={20} />
                  Generate 5 More Names - $0.99
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Your Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              {formData.userName && <p><span className="font-semibold">Your Name:</span> {formData.userName}</p>}
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
if (step === 'form') {
  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 px-6 py-12">
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8 pt-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Baby className="text-blue-600" size={40} />
          <h1 className="text-5xl font-bold text-gray-800">Boop</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Tell Us Your Story</h2>
        <p className="text-gray-600 text-lg">Let's find a name your baby will love!</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Question {currentFormStep + 1} of {formSteps.length}
          </span>
          <span className="text-sm text-gray-500">~2 minutes</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentFormStep + 1) / formSteps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[300px] flex flex-col">
        {/* Question */}
        <div className="flex-1">
          <div className="animate-fadeIn">
            <label className="block text-2xl font-bold text-gray-800 mb-6">
              {formSteps[currentFormStep].label}
              {formSteps[currentFormStep].required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {formSteps[currentFormStep].type === 'text' && (
              <input
                type="text"
                value={formData[formSteps[currentFormStep].id] || ''}
                onChange={(e) => updateField(formSteps[currentFormStep].id, e.target.value)}
                placeholder={formSteps[currentFormStep].placeholder}
                className="w-full p-4 text-lg rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors"
                autoFocus
              />
            )}

            {formSteps[currentFormStep].type === 'searchable-select' && (
              <Select
                options={majorCities}
                value={majorCities.find(c => c.value === formData[formSteps[currentFormStep].id])}
                onChange={(option) => updateField(formSteps[currentFormStep].id, option?.value)}
                placeholder="Type to search cities..."
                className="text-lg"
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    padding: '8px',
                    fontSize: '1.125rem',
                    border: '2px solid #e5e7eb',
                    '&:hover': { borderColor: '#60a5fa' }
                  })
                }}
              />
            )}

            {formSteps[currentFormStep].type === 'select' && (
              <select
                value={formData[formSteps[currentFormStep].id] || ''}
                onChange={(e) => updateField(formSteps[currentFormStep].id, e.target.value)}
                className="w-full p-4 text-lg rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors"
                autoFocus
              >
                {formSteps[currentFormStep].options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {formSteps[currentFormStep].type === 'textarea' && (
              <textarea
                value={formData[formSteps[currentFormStep].id] || ''}
                onChange={(e) => updateField(formSteps[currentFormStep].id, e.target.value)}
                placeholder={formSteps[currentFormStep].placeholder}
                rows={6}
                className="w-full p-4 text-lg rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none transition-colors resize-none"
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {currentFormStep > 0 && (
            <button
              onClick={prevFormStep}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          )}
          
          {!isLastStep ? (
            <button
              onClick={nextFormStep}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={generateSuggestions}
              disabled={loading || !canSubmit}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate My Names'}
              <Sparkles size={20} />
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        We use your context to suggest culturally relevant, meaningful names
      </p>
    </div>
  </div>
  );
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Crafting Your Perfect Names...</h2>
          <p className="text-gray-600">Analyzing your family context and cultural background</p>
        </div>
      </div>
    );
  }

  const freeNames = suggestions.slice(0, 3);
  const premiumNames = suggestions.slice(3);

  // Results screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Baby className="text-blue-600" size={48} />
            <h1 className="text-5xl font-bold text-gray-800">Boop</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Perfect Baby Names</h2>
          <p className="text-gray-600">Personalized suggestions just for your family</p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 mb-8">
          {freeNames.map((suggestion, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow relative">
              <button
                onClick={() => shareName(suggestion)}
                className="absolute top-4 right-4 p-2 hover:bg-blue-50 rounded-full transition-colors"
                title="Share this name"
              >
                <Star className="text-blue-500" size={24} />
              </button>
              
              <h3 className="text-4xl font-bold text-gray-800 mb-3">{suggestion.name}</h3>
              <p className="text-blue-600 font-semibold mb-2 text-lg">🔊 {suggestion.pronunciation}</p>
              <p className="text-gray-600 italic mb-4 text-lg">"{suggestion.meaning}"</p>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-blue-600">Why this works for you:</strong> {suggestion.reason || suggestion.reasoning}
                </p>
              </div>
            </div>
          ))}
        </div>

        {premiumNames.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Additional Names</h3>
            <div className="grid gap-6 md:grid-cols-1">
              {premiumNames.map((suggestion, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow relative">
                  <button
                    onClick={() => shareName(suggestion)}
                    className="absolute top-4 right-4 p-2 hover:bg-blue-50 rounded-full transition-colors"
                    title="Share this name"
                  >
                    <Star className="text-blue-500" size={24} />
                  </button>
                  
                  <h3 className="text-4xl font-bold text-gray-800 mb-3">{suggestion.name}</h3>
                  <p className="text-blue-600 font-semibold mb-2 text-lg">🔊 {suggestion.pronunciation}</p>
                  <p className="text-gray-600 italic mb-4 text-lg">"{suggestion.meaning}"</p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-blue-600">Why this works for you:</strong> {suggestion.reason || suggestion.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!hasUnlockedOnce && (
            <button
              onClick={handleGenerateMore}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              Unlock 5 More Names - $0.99
            </button>
          )}

          {hasUnlockedOnce && suggestions.length < 13 && (
            <button
              onClick={handleGenerateEightMore}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              Get 5 More Names - $0.99
            </button>
          )}

          <button
            onClick={downloadAsPDF}
            className="w-full bg-gray-700 text-white font-bold py-4 rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <Download size={20} />
            {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'Save as Image' : 'Save as PDF'}
          </button>

          <button
            onClick={reset}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 rounded-lg hover:bg-gray-50 transition-all"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}