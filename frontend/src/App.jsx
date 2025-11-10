import React, { useState, useEffect } from 'react';
import { Baby, Sparkles, ArrowRight, ArrowLeft, Share2, Download, Star } from 'lucide-react';
import Select from 'react-select';
import html2canvas from 'html2canvas';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SFK1hPnhWpLDLv40A2hyQrJEx3JREFfllDrYQzaAULkaJOvaROwPD6tI5eCTnFOwF8cRrtOzzHAECBgoeUmi5zM00cIN3fOJG';

// Maintenance mode check - MUST BE BEFORE THE COMPONENT
const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

const MaintenanceScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-200 flex items-center justify-center px-6">
    <div className="max-w-md text-center">
      <Baby className="mx-auto text-blue-600 mb-6" size={80} />
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Boop</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🛠️ Under Maintenance</h2>
      <p className="text-black mb-6">
        We're making some improvements to bring you an even better baby name experience!
      </p>
      <p className="text-black text-sm">
        We'll be back shortly. Thank you for your patience! 💙
      </p>
      <div className="mt-8">
        <a 
          href="mailto:support@helloboop.com" 
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Contact Support
        </a>
      </div>
    </div>
  </div>
);

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
  // Check maintenance mode first
  if (MAINTENANCE_MODE) {
    return <MaintenanceScreen />;
  }

  // Inject animation styles
  if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    if (!document.head.querySelector('[data-boop-styles]')) {
      styleSheet.setAttribute('data-boop-styles', 'true');
      document.head.appendChild(styleSheet);
    }
  }

  // STATE DECLARATIONS START HERE

  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [currentFormStep, setCurrentFormStep] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [hasUnlockedOnce, setHasUnlockedOnce] = useState(false);
  const [showPopularity, setShowPopularity] = useState(false);
  const [startOverCount, setStartOverCount] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [hasUnlockedInitial, setHasUnlockedInitial] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [favorites, setFavorites] = useState(() => {
  const saved = localStorage.getItem('boopFavorites');
  return saved ? JSON.parse(saved) : [];
});
const [showFavorites, setShowFavorites] = useState(false);

// GenerationProgress component
  const GenerationProgress = ({ progress, status }) => (
    <div className="w-full max-w-md mx-auto space-y-4 min-h-[200px] flex flex-col justify-center">
      <div className="text-center">
        <Baby className="mx-auto text-blue-600 animate-bounce mb-4" size={64} />
        <p className="text-xl font-semibold text-gray-800 mb-2">{status}</p>
        <p className="text-sm text-black">{progress}% complete</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

// Admin bypass
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') === 'boop2025') {
    setHasUnlockedOnce(true);
    setHasUnlockedInitial(true); // Add this line
    console.log('Admin mode activated');
  }
}, []);
// Favorites functions
const toggleFavorite = (suggestion) => {
  setFavorites(prev => {
    const isFav = prev.some(fav => fav.name === suggestion.name);
    const updated = isFav 
      ? prev.filter(fav => fav.name !== suggestion.name)
      : [...prev, suggestion];
    localStorage.setItem('boopFavorites', JSON.stringify(updated));
    return updated;
  });
};

const isFavorited = (suggestion) => {
  return favorites.some(fav => fav.name === suggestion.name);
};

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    babyGender: '',
    location: '',
    parentNames: '',
    partnerHeritage: '',  
    partnerParentNames: '',
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
    id: 'babyGender',
    label: 'What types of names are you interested in?',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Choose...' },
      { value: 'boy', label: 'Boy names' },
      { value: 'girl', label: 'Girl names' },
      { value: 'neutral', label: 'Gender-neutral names' },
      { value: 'any', label: "I'm open to all names" }
    ]
  },
  {
    id: 'location',
    label: 'Where do you live?',
    placeholder: 'e.g., Brooklyn, Austin, London, Tokyo...',
    type: 'text',
    required: true
  },
  {
    id: 'regionGrowUp',
    label: 'What region/city will your baby grow up in?',
    placeholder: 'e.g., New York, Tokyo, Same as above...',
    type: 'text',
    required: false
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
    label: "Your partner's name",
    placeholder: 'e.g., Alex',
    type: 'text',
    required: false
  },
  {
    id: 'parentNames',
    label: "What are your parent's names?",
    type: 'text',
    placeholder: 'e.g., Sarah and Michael',
    required: false
  },
  {
    id: 'partnerHeritage',
    label: "What's your partner's heritage or cultural background?",
    type: 'text',
    placeholder: 'e.g., Japanese, Mexican, Irish',
    required: false
  },
  {
    id: 'partnerParentNames',
    label: "What are your partner's parent's names?",
    type: 'text',
    placeholder: 'e.g., Maria and Carlos',
    required: false
  },
  {
    id: 'siblingNames',
    label: 'Do you already have children? If so, what are their names?',
    placeholder: 'e.g., Emma, Liam',
    type: 'text',
    required: false
  },
  {
    id: 'familyTraditions',
    label: 'Any family traditions around naming (e.g., honoring ancestors, religious customs)?',
    placeholder: 'e.g., We honor grandparents, Use family surnames as middle names...',
    type: 'text',
    required: false
  },
  {
    id: 'familyNamesToHonor',
    label: 'Are there any family names you would like to specifically honor or avoid?',
    placeholder: 'e.g., Honor: Rose, Avoid: John',
    type: 'text',
    required: false
  },
  {
    id: 'values',
    label: 'What values do you want the name to reflect?',
    placeholder: 'e.g., Strength, kindness, creativity, wisdom...',
    type: 'text',
    required: false
  },
  {
    id: 'religiousPreferences',
    label: 'Do you want your baby name to include any religious or spiritual preferences?',
    placeholder: 'e.g., Jewish, Christian, Hindu, None...',
    type: 'text',
    required: false
  },
  {
    id: 'lastName',
    label: 'What is your last name?',
    placeholder: 'e.g., Smith, Garcia, Chen...',
    type: 'text',
    required: false
  },
  {
    id: 'languages',
    label: 'What languages are spoken in your household?',
    placeholder: 'e.g., English, Spanish, Mandarin...',
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
    { value: 'Madrid, Spain', label: 'Madrid, Spain' },
    { value: 'Rome, Italy', label: 'Rome, Italy' },
    { value: 'Tokyo, Japan', label: 'Tokyo, Japan' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Sydney, Australia', label: 'Sydney, Australia' },
    { value: 'Mexico City, Mexico', label: 'Mexico City, Mexico' },
    { value: 'Dubai, UAE', label: 'Dubai, UAE' }
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextFormStep = () => {
    const currentQuestion = formSteps[currentFormStep];
    
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

const API_URL = import.meta.env.VITE_API_URL || 'https://boop-backend-v3.vercel.app';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('generate') === '5' && suggestions.length > 0) {
      setHasUnlockedOnce(true);
      generateAdditionalNames(5);
      sessionStorage.removeItem('boopFormData');
      sessionStorage.removeItem('boopSuggestions');
      window.history.replaceState({}, '', window.location.pathname);
    }
      if (params.get('unlock') === 'initial' && suggestions.length > 0) {
      setHasUnlockedInitial(true);
      setHasUnlockedOnce(true);
      sessionStorage.removeItem('boopFormData');
      sessionStorage.removeItem('boopSuggestions');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('generate') === '8' && suggestions.length > 0) {
       setHasUnlockedInitial(true); //
      generateAdditionalNames(5);
      sessionStorage.removeItem('boopFormData');
      sessionStorage.removeItem('boopSuggestions');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('action') === 'startover') {
  setStartOverCount(0); // Reset counter after payment
  setStep('form');
  setSuggestions([]);
  setHasUnlockedOnce(true);
  sessionStorage.clear();
  window.history.replaceState({}, '', window.location.pathname);
}
  }, [suggestions]);

  useEffect(() => {
    const savedFormData = sessionStorage.getItem('boopFormData');
    const savedSuggestions = sessionStorage.getItem('boopSuggestions');
    
    if (savedSuggestions) {
      const parsed = JSON.parse(savedSuggestions);
      if (parsed.length > 0) {
        setSuggestions(parsed);
        setStep('results');
        setHasGeneratedOnce(true);
        if (parsed.length > 5) {
          setHasUnlockedOnce(true);
        }
      }
    }
    
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

const generateSuggestions = async (retryCount = 0) => {
  const hasMinimumInput = formData.location || formData.heritage || formData.style || formData.userName;
  
  if (!hasMinimumInput) {
    alert('Please fill out at least your name, location, heritage, or style preference to get personalized suggestions!');
    return;
  }

  setStep('loading');
  setLoading(true);
  setGenerationProgress(0);
  setGenerationStatus('Analyzing your preferences...');

  // Simulate progress
  const progressInterval = setInterval(() => {
    setGenerationProgress(prev => {
      if (prev >= 90) {
        clearInterval(progressInterval);
        return 90;
      }
      return prev + 10;
    });
  }, 800);

  // Update status messages
  setTimeout(() => setGenerationStatus('Searching our name database...'), 2000);
  setTimeout(() => setGenerationStatus('Finding perfect matches...'), 5000);
  setTimeout(() => setGenerationStatus('Finalizing your names...'), 8000);
  await new Promise(resolve => setTimeout(resolve, 50));

  try {
    // Get previously seen names to avoid duplicates
    const seenNames = JSON.parse(localStorage.getItem('boopSeenNames') || '[]');
    
    const response = await fetch(`${API_URL}/api/generate-names`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: formData,
        existingNames: seenNames.join(', '),
        count: 5
      })
    });

    const data = await response.json();
    const content = data.names;

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const names = JSON.parse(jsonMatch[0]);
        setSuggestions(names);
        
        // Track these names to avoid showing again
        const allSeenNames = [...seenNames, ...names.map(n => n.name)];
        localStorage.setItem('boopSeenNames', JSON.stringify([...new Set(allSeenNames)]));
        
        setStep('results');
        setHasGeneratedOnce(true);
      } catch (parseError) {
        // JSON parse failed - retry up to 2 times
        if (retryCount < 2) {
          console.log(`JSON parse failed, retrying (attempt ${retryCount + 1}/2)...`);
          clearInterval(progressInterval);
          return generateSuggestions(retryCount + 1);
        } else {
          throw new Error('Failed to parse names after multiple attempts');
        }
      }
    }
  } catch (error) {
    console.error('Error generating names:', error);
    setError({
      type: 'generation',
      message: 'We encountered an issue generating your names. Please try again.'
    });
  } finally {
    setLoading(false);
    clearInterval(progressInterval);
    setGenerationProgress(100);
    setGenerationStatus('Complete!');
  }
};

  const generateAdditionalNames = async (count) => {
    setLoading(true);
    setGenerationProgress(0);
    setGenerationStatus('Generating 5 more amazing names...');

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 800);

    setTimeout(() => setGenerationStatus('Finding unique suggestions...'), 2000);
    setTimeout(() => setGenerationStatus('Finalizing your names...'), 8000);
    
    try {
      const existingNames = suggestions.map(s => s.name).join(', ');
      
      const response = await fetch(`${API_URL}/api/generate-names`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData,
          count: count,
          existingNames: existingNames
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
        setSuggestions(prev => [...prev, ...newNames]);
      }
} catch (error) {
  console.error('Error generating additional names:', error);
  setError({
    type: 'paid',
    message: 'We encountered an issue generating your additional names. Please contact support for a refund.'
  });
} finally {
  setLoading(false);
  clearInterval(progressInterval);
setGenerationProgress(100);
setGenerationStatus('Complete!');
}
  };

  const handleGenerateMore = async () => {
    console.log('handleGenerateMore clicked!');
    
    sessionStorage.setItem('boopFormData', JSON.stringify(formData));
    sessionStorage.setItem('boopSuggestions', JSON.stringify(suggestions));
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1SHFBRPnhWpLDLv4YzyXXxDj',
          successUrl: window.location.href + '?unlock=initial',
          cancelUrl: window.location.href,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = window.Stripe('pk_live_51SFK1hPnhWpLDLv40A2hyQrJEx3JREFfllDrYQzaAULkaJOvaROwPD6tI5eCTnFOwF8cRrtOzzHAECBgoeUmi5zM00cIN3fOJG');
      await stripe.redirectToCheckout({ sessionId });
      
    } catch (error) {
      console.error('Payment error:', error);
      setHasUnlockedOnce(true);
      generateAdditionalNames(5);
    }
  };

  const handleGenerateEightMore = async () => {
    sessionStorage.setItem('boopFormData', JSON.stringify(formData));
    sessionStorage.setItem('boopSuggestions', JSON.stringify(suggestions));
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1SJHbmPnhWpLDLv4JYn8jsDG',
          successUrl: window.location.href + '?generate=8',
          cancelUrl: window.location.href,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = window.Stripe('pk_live_51SFK1hPnhWpLDLv40A2hyQrJEx3JREFfllDrYQzaAULkaJOvaROwPD6tI5eCTnFOwF8cRrtOzzHAECBgoeUmi5zM00cIN3fOJG');
      await stripe.redirectToCheckout({ sessionId });
      
    } catch (error) {
      console.error('Payment error:', error);
      generateAdditionalNames(5);
    }
  };

const reset = () => {
  // Check if they've used their free start over
  if (startOverCount >= 1 && !hasUnlockedOnce) {
    // Show paywall
    handleStartOverPayment();
    return;
  }
  
  setStep('form');
  setSuggestions([]);
  setLoading(false);
  setIsPremium(false);
  setHasGeneratedOnce(false);
  setShowPopularity(false);
  setCurrentFormStep(0);
  setStartOverCount(startOverCount + 1);
  sessionStorage.removeItem('boopFormData');
  sessionStorage.removeItem('boopSuggestions');
};

const handleStartOverPayment = async () => {
  sessionStorage.setItem('boopFormData', JSON.stringify(formData));
  sessionStorage.setItem('boopSuggestions', JSON.stringify(suggestions));
  
  try {
    const response = await fetch('https://boop-app-eight.vercel.app/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_1SHFBRPnhWpLDLv4YzyXXxDj',
        successUrl: window.location.href + '?action=startover',
        cancelUrl: window.location.href,
      }),
    });

    const { sessionId } = await response.json();
    const stripe = window.Stripe('pk_live_51SFK1hPnhWpLDLv40A2hyQrJEx3JREFfllDrYQzaAULkaJOvaROwPD6tI5eCTnFOwF8cRrtOzzHAECBgoeUmi5zM00cIN3fOJG');
    await stripe.redirectToCheckout({ sessionId });
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  }
};

  const shareName = (name) => {
    const text = `Check out this baby name: ${name.name} (${name.pronunciation})\n\nMeaning: ${name.meaning}\n\nWhy it works: ${name.reason || name.reasoning}`;
    
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

const saveNameAsImage = async (name, index) => {
  console.log('Generating image for:', name.name);
  
  try {
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#e0f2fe');
    gradient.addColorStop(1, '#0ea5e9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);
    
    // White card background
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    const cardPadding = 60;
    const cardRadius = 30;
    ctx.beginPath();
    ctx.roundRect(cardPadding, cardPadding, 1080 - cardPadding * 2, 1080 - cardPadding * 2, cardRadius);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Logo at top
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👶 Boop', 540, 140);
    
    // Name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 80px system-ui, -apple-system, sans-serif';
    ctx.fillText(name.name, 540, 280);
    
    // Pronunciation
    ctx.fillStyle = '#0284c7';
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillText(`🔊 ${name.pronunciation}`, 540, 340);
    
    // Meaning
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(`"${name.meaning}"`, 540, 400);
    
    // "Why this works" section - blue background
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(cardPadding + 40, 460, 1080 - cardPadding * 2 - 80, 400);
    
    // "Why this works" title
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Why this works for you:', cardPadding + 60, 510);
    
    // Reasoning text (word wrap)
    ctx.fillStyle = '#334155';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    const maxWidth = 880;
    const lineHeight = 36;
    let y = 560;
    
    const words = (name.reason || name.reasoning || '').split(' ');
    let line = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, cardPadding + 60, y);
        line = words[i] + ' ';
        y += lineHeight;
        
        // Stop if too many lines
        if (y > 820) break;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, cardPadding + 60, y);
    // Popularity section (if available)
    let popularityY = y + 60; // Start below the reasoning text
    
    if (name.rank2024 || name.trend2025) {
      // Purple background box
      ctx.fillStyle = '#faf5ff';
      ctx.fillRect(cardPadding + 40, popularityY, 1080 - cardPadding * 2 - 80, name.regionalNote ? 100 : 70);
      
      // Popularity text
      ctx.fillStyle = '#7c3aed';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      
      let popText = '';
      if (name.rank2024 && name.rank2024 !== "Not ranked") {
        popText = `📊 2024 Rank: ${name.rank2024}`;
      } else if (name.rank2024 === "Not ranked") {
        popText = '📊 Unique choice';
      }
      
      if (name.trend2025) {
        const emoji = name.trend2025 === "Rising" ? "↗️" : name.trend2025 === "Declining" ? "↘️" : "✨";
        popText += ` • ${emoji} ${name.trend2025}`;
      }
      
      ctx.fillText(popText, cardPadding + 60, popularityY + 35);
      
      // Regional note
      if (name.regionalNote) {
        ctx.fillStyle = '#9333ea';
        ctx.font = 'italic 18px system-ui, -apple-system, sans-serif';
        ctx.fillText(name.regionalNote, cardPadding + 60, popularityY + 65);
      }
    }
    // Website at bottom
    ctx.fillStyle = '#64748b';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('helloboop.com', 540, 980);
    
    // Convert to image
    const imageUrl = canvas.toDataURL('image/png', 1.0);
    
    // Show in modal
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;overflow-y:auto;';
      
      modal.innerHTML = `
        <div style="text-align:center;max-width:90vw;">
          <h2 style="color:white;margin-bottom:20px;">Long-press to save</h2>
          <img src="${imageUrl}" style="width:100%;max-width:500px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);"/>
          <button onclick="this.parentElement.parentElement.remove()" style="margin-top:20px;padding:14px 28px;background:#0EA5E9;color:white;border:none;border-radius:8px;font-size:18px;font-weight:bold;">Close</button>
        </div>
      `;
      
      document.body.appendChild(modal);
    } else {
      // Desktop: Download
      const link = document.createElement('a');
      link.download = `${name.name.toLowerCase()}-boop.png`;
      link.href = imageUrl;
      link.click();
    }
  } catch (error) {
    console.error('Error generating image:', error);
    alert('Could not generate image. Please try again.');
  }
};
const downloadAsPDF = async () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  console.log('downloadAsPDF called, isMobile:', isMobile, 'userAgent:', navigator.userAgent);
  
if (isMobile) {
  // Mobile: Show image in modal overlay
  try {
    const element = document.querySelector('.max-w-5xl');
    if (!element) {
      alert('Could not find content to capture');
      return;
    }
    
    const canvas = await html2canvas(element, {
      backgroundColor: '#e0f2fe',
      scale: 2,
      logging: false
    });
    
    const imageUrl = canvas.toDataURL('image/png');
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;overflow:auto;';
    
    modal.innerHTML = `
      <h2 style="color:white;margin-bottom:20px;text-align:center;">Long-press the image below to save</h2>
      <img src="${imageUrl}" style="max-width:100%;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);"/>
      <button onclick="this.parentElement.remove()" style="margin-top:20px;padding:12px 24px;background:#0EA5E9;color:white;border:none;border-radius:8px;font-size:16px;font-weight:bold;">Close</button>
    `;
    
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error generating image:', error);
    alert('Could not generate image. Please try again.');
  }
  return;
}
  
  // Desktop: Keep existing PDF functionality
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
          </div>
        `).join('')}
        <div class="context">
          <h3>Your Context</h3>
          ${formData.userName ? `<div class="context-item"><strong>Your Name:</strong> ${formData.userName}</div>` : ''}
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

  // FORM SCREEN
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-200 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Baby className="text-blue-600" size={40} />
              <h1 className="text-5xl font-bold text-gray-800">Boop</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Tell Us Your Story</h2>
            <p className="text-black text-lg">Let's find a name your baby will love!</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Question {currentFormStep + 1} of {formSteps.length}
              </span>
              <span className="text-sm text-black">~2 minutes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentFormStep + 1) / formSteps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[300px] flex flex-col">
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

          <p className="text-center text-black text-sm mt-6">
            We use your context to suggest culturally relevant, meaningful names
          </p>
          <div className="text-center mt-4 space-x-4">
  <a href="/terms" className="text-blue-600 hover:text-blue-700 text-sm">Terms of Service</a>
  <span className="text-gray-400">•</span>
  <a href="/privacy" className="text-blue-600 hover:text-blue-700 text-sm">Privacy Policy</a>
</div>
        </div>
      </div>
    );
  }

// LOADING SCREEN
if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-200 flex items-center justify-center px-6">
        <GenerationProgress progress={generationProgress} status={generationStatus} />
      </div>
    );
  }
// ERROR MODAL
if (error) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-200 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
            <span className="text-4xl">😔</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something Went Wrong</h2>
          <p className="text-black">{error.message}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setError(null);
              setLoading(false);
              if (error.type === 'generation') {
                setStep('form');
              }
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Try Again
          </button>

          {error.type === 'paid' && (
            
            <a 
            href="mailto:support@helloboop.com?subject=Refund Request&body=I paid for additional names but encountered an error."
              className="block w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-all text-center"
            >
              Request Refund
            </a>
          )}

            <a
            href="mailto:support@helloboop.com?subject=Error Report&body=I encountered an error while using Boop."
            className="block w-full text-blue-600 hover:text-blue-700 text-center py-2"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
);
}
// FAVORITES SCREEN
  if (showFavorites) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-200 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Baby className="text-blue-600" size={48} />
              <h1 className="text-5xl font-bold text-gray-800">Boop</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">⭐ My Favorite Names</h2>
            <p className="text-black">Your saved baby names ({favorites.length})</p>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Star className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-xl text-black">No favorites yet!</p>
              <p className="text-black mt-2">Tap the star icon on any name to save it here.</p>
            </div>
          ) : (
           <div className="grid gap-6 md:grid-cols-1 mb-8">
          {/* First 2 names - always shown */}
          {freeNames.slice(0, 2).map((suggestion, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => shareName(suggestion)}
                  className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                  title="Share this name"
                >
                  <Share2 className="text-blue-500" size={24} />
                </button>
                <button
                  onClick={() => saveNameAsImage(suggestion, index)}
                  className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                  title="Save as image"
                >
                  <Download className="text-blue-500" size={24} />
                </button>
                {hasUnlockedInitial && (
                  <button
                    onClick={() => toggleFavorite(suggestion)}
                    className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
                    title={isFavorited(suggestion) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star 
                      className={isFavorited(suggestion) ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} 
                      size={24} 
                    />
                  </button>
                )}
              </div>
              
              <h3 className="text-4xl font-bold text-gray-800 mb-3">{suggestion.name}</h3>
              <p className="text-blue-600 font-semibold mb-2 text-lg">🔊 {suggestion.pronunciation}</p>
              
              {(suggestion.rank2024 || suggestion.trend2025) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    {suggestion.rank2024 && suggestion.rank2024 !== "Not ranked" && (
                      <span className="text-purple-700 font-semibold">
                        📊 2024 Rank: {suggestion.rank2024}
                      </span>
                    )}
                    {suggestion.rank2024 === "Not ranked" && (
                      <span className="text-purple-700 font-semibold">
                        📊 Unique choice
                      </span>
                    )}
                    {suggestion.trend2025 && (
                      <span className="text-purple-700">
                        • {suggestion.trend2025 === "Rising" ? "↗️" : suggestion.trend2025 === "Declining" ? "↘️" : "✨"} {suggestion.trend2025}
                      </span>
                    )}
                  </div>
                  {suggestion.regionalNote && (
                    <p className="text-purple-600 text-xs mt-1 italic">{suggestion.regionalNote}</p>
                  )}
                </div>
              )}
              
              <p className="text-black italic mb-4 text-lg">"{suggestion.meaning}"</p>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-blue-600">Why this works for you:</strong> {suggestion.reason || suggestion.reasoning}
                </p>
              </div>
            </div>
          ))}

          {/* Lock banner for names 3-5 OR show them if unlocked */}
          {!hasUnlockedInitial ? (
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-12 text-center text-white">
              <div className="mb-6">
                <h3 className="text-3xl font-bold mb-2">🔒 3 More Names Waiting</h3>
                <p className="text-blue-100 text-lg">Unlock to see meanings, popularity, and personalized reasons</p>
              </div>
              
              <div className="flex gap-4 justify-center mb-6 text-xl font-semibold">
                <span className="bg-white/20 px-4 py-2 rounded-lg">{freeNames[2]?.name}</span>
                <span className="bg-white/20 px-4 py-2 rounded-lg">{freeNames[3]?.name}</span>
                <span className="bg-white/20 px-4 py-2 rounded-lg">{freeNames[4]?.name}</span>
              </div>

              <button
                onClick={handleGenerateMore}
                className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-blue-50 transition-all text-xl shadow-lg flex items-center justify-center gap-2 mx-auto"
              >
                <Sparkles size={24} />
                Unlock All 3 Names - $0.99
              </button>
            </div>
          ) : (
            <>
              {freeNames.slice(2, 5).map((suggestion, index) => (
                <div key={index + 2} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => shareName(suggestion)}
                      className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                      title="Share this name"
                    >
                      <Share2 className="text-blue-500" size={24} />
                    </button>
                    <button
                      onClick={() => saveNameAsImage(suggestion, index + 2)}
                      className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                      title="Save as image"
                    >
                      <Download className="text-blue-500" size={24} />
                    </button>
                    <button
                      onClick={() => toggleFavorite(suggestion)}
                      className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
                      title={isFavorited(suggestion) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star 
                        className={isFavorited(suggestion) ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} 
                        size={24} 
                      />
                    </button>
                  </div>
                  
                  <h3 className="text-4xl font-bold text-gray-800 mb-3">{suggestion.name}</h3>
                  <p className="text-blue-600 font-semibold mb-2 text-lg">🔊 {suggestion.pronunciation}</p>
                  
                  {(suggestion.rank2024 || suggestion.trend2025) && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        {suggestion.rank2024 && suggestion.rank2024 !== "Not ranked" && (
                          <span className="text-purple-700 font-semibold">
                            📊 2024 Rank: {suggestion.rank2024}
                          </span>
                        )}
                        {suggestion.rank2024 === "Not ranked" && (
                          <span className="text-purple-700 font-semibold">
                            📊 Unique choice
                          </span>
                        )}
                        {suggestion.trend2025 && (
                          <span className="text-purple-700">
                            • {suggestion.trend2025 === "Rising" ? "↗️" : suggestion.trend2025 === "Declining" ? "↘️" : "✨"} {suggestion.trend2025}
                          </span>
                        )}
                      </div>
                      {suggestion.regionalNote && (
                        <p className="text-purple-600 text-xs mt-1 italic">{suggestion.regionalNote}</p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-black italic mb-4 text-lg">"{suggestion.meaning}"</p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-blue-600">Why this works for you:</strong> {suggestion.reason || suggestion.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
          )}

          <button
            onClick={() => setShowFavorites(false)}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all"
          >
            Back to Results
          </button>

          <div className="text-center mt-8 space-x-4">
            <a href="/terms" className="text-blue-600 hover:text-blue-700 text-sm">Terms of Service</a>
            <span className="text-gray-400">•</span>
            <a href="/privacy" className="text-blue-600 hover:text-blue-700 text-sm">Privacy Policy</a>
          </div>
        </div>
      </div>
    );
  }

// RESULTS SCREEN
if (step === 'results') {
  const freeNames = suggestions.slice(0, 5);
  const premiumNames = suggestions.slice(5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-200 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Baby className="text-blue-600" size={48} />
            <h1 className="text-5xl font-bold text-gray-800">Boop</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Perfect Baby Names</h2>
          <p className="text-black">Personalized suggestions just for your family</p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 mb-8">
{/* First 2 names - always shown */}
          {freeNames.slice(0, 2).map((suggestion, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => shareName(suggestion)}
                  className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                  title="Share this name"
                >
                  <Share2 className="text-blue-500" size={24} />
                </button>
                <button
                  onClick={() => saveNameAsImage(suggestion, index)}
                  className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                  title="Save as image"
                >
                  <Download className="text-blue-500" size={24} />
                </button>
                {hasUnlockedInitial && (
                  <button
                    onClick={() => toggleFavorite(suggestion)}
                    className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
                    title={isFavorited(suggestion) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star 
                      className={isFavorited(suggestion) ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} 
                      size={24} 
                    />
                  </button>
                )}
              </div>
              
              <h3 className="text-4xl font-bold text-gray-800 mb-3">{suggestion.name}</h3>
              <p className="text-blue-600 font-semibold mb-2 text-lg">🔊 {suggestion.pronunciation}</p>
              
              {(suggestion.rank2024 || suggestion.trend2025) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    {suggestion.rank2024 && suggestion.rank2024 !== "Not ranked" && (
                      <span className="text-purple-700 font-semibold">
                        📊 2024 Rank: {suggestion.rank2024}
                      </span>
                    )}
                    {suggestion.rank2024 === "Not ranked" && (
                      <span className="text-purple-700 font-semibold">
                        📊 Unique choice
                      </span>
                    )}
                    {suggestion.trend2025 && (
                      <span className="text-purple-700">
                        • {suggestion.trend2025 === "Rising" ? "↗️" : suggestion.trend2025 === "Declining" ? "↘️" : "✨"} {suggestion.trend2025}
                      </span>
                    )}
                  </div>
                  {suggestion.regionalNote && (
                    <p className="text-purple-600 text-xs mt-1 italic">{suggestion.regionalNote}</p>
                  )}
                </div>
              )}
              
              <p className="text-black italic mb-4 text-lg">"{suggestion.meaning}"</p>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-blue-600">Why this works for you:</strong> {suggestion.reason || suggestion.reasoning}
                </p>
              </div>
            </div>
          ))}

{/* Names 3-5 with shared overlay */}
          {!hasUnlockedInitial ? (
            <div className="relative">
              {/* The 3 blurred cards */}
              {freeNames.slice(2, 5).map((suggestion, index) => (
                <div key={index + 2} className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                  <h3 className="text-4xl font-bold text-gray-800 mb-3">{suggestion.name}</h3>
                  <div className="filter blur-md">
                    <p className="text-blue-600 mb-2">🔊 Hidden</p>
                    <p className="text-black mb-4">Locked...</p>
                  </div>
                </div>
              ))}
              
              {/* Single overlay covering all 3 */}
             <div className="absolute left-4 right-4 md:left-48 md:right-48 top-28 bottom-16 md:top-24 md:bottom-12 bg-gradient-to-br from-blue-500/60 md:from-blue-500/95 to-cyan-500/60 md:to-cyan-500/95 rounded-2xl flex items-center justify-center p-4 md:p-6 shadow-2xl">
  <div className="text-center text-white">
<div className="text-4xl md:text-6xl mb-2 md:mb-4">🔒</div>
<h3 className="text-xl md:text-3xl font-bold mb-3 md:mb-5">3 More Names Locked</h3>
<p className="text-white text-sm md:text-lg font-bold mb-3 md:mb-5 max-w-md px-2">Unlock to see complete meanings, popularity rankings, and personalized insights</p>
    <button
      onClick={handleGenerateMore}
      className="bg-white md:bg-white text-blue-600 border-2 border-white font-bold py-3 md:py-5 px-6 md:px-10 rounded-xl hover:bg-blue-50 transition-all text-lg md:text-2xl shadow-xl flex items-center justify-center gap-2 md:gap-3 mx-auto"
    >
                    <Sparkles size={28} />
                    Unlock All 3 for $0.99
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {freeNames.slice(2, 5).map((suggestion, index) => (
                <div key={index + 2} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => shareName(suggestion)}
                      className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                      title="Share this name"
                    >
                      <Share2 className="text-blue-500" size={24} />
                    </button>
                    <button
                      onClick={() => saveNameAsImage(suggestion, index + 2)}
                      className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                      title="Save as image"
                    >
                      <Download className="text-blue-500" size={24} />
                    </button>
                    <button
                      onClick={() => toggleFavorite(suggestion)}
                      className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
                      title={isFavorited(suggestion) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star 
                        className={isFavorited(suggestion) ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} 
                        size={24} 
                      />
                    </button>
                  </div>
                  
                  <h3 className="text-4xl font-bold text-gray-800 mb-3">{suggestion.name}</h3>
                  <p className="text-blue-600 font-semibold mb-2 text-lg">🔊 {suggestion.pronunciation}</p>
                  
                  {(suggestion.rank2024 || suggestion.trend2025) && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        {suggestion.rank2024 && suggestion.rank2024 !== "Not ranked" && (
                          <span className="text-purple-700 font-semibold">
                            📊 2024 Rank: {suggestion.rank2024}
                          </span>
                        )}
                        {suggestion.rank2024 === "Not ranked" && (
                          <span className="text-purple-700 font-semibold">
                            📊 Unique choice
                          </span>
                        )}
                        {suggestion.trend2025 && (
                          <span className="text-purple-700">
                            • {suggestion.trend2025 === "Rising" ? "↗️" : suggestion.trend2025 === "Declining" ? "↘️" : "✨"} {suggestion.trend2025}
                          </span>
                        )}
                      </div>
                      {suggestion.regionalNote && (
                        <p className="text-purple-600 text-xs mt-1 italic">{suggestion.regionalNote}</p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-black italic mb-4 text-lg">"{suggestion.meaning}"</p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-blue-600">Why this works for you:</strong> {suggestion.reason || suggestion.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {premiumNames.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Additional Names</h3>
            <div className="grid gap-6 md:grid-cols-1">
              {premiumNames.map((suggestion, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow relative">
<div className="absolute top-4 right-4 flex gap-2">
  <button
    onClick={() => shareName(suggestion)}
    className="p-2 hover:bg-blue-50 rounded-full transition-colors"
    title="Share this name"
  >
    <Share2 className="text-blue-500" size={24} />
  </button>
  <button
    onClick={() => saveNameAsImage(suggestion, index)}
    className="p-2 hover:bg-blue-50 rounded-full transition-colors"
    title="Save as image"
  >
    <Download className="text-blue-500" size={24} />
  </button>
  {hasUnlockedOnce && (
    <button
      onClick={() => toggleFavorite(suggestion)}
      className="p-2 hover:bg-blue-50 rounded-full transition-colors"
      title={isFavorited(suggestion) ? "Remove from favorites" : "Add to favorites"}
    >
      <Star 
        className={isFavorited(suggestion) ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} 
        size={24} 
      />
    </button>
  )}
</div>
                  
                  <h3 className="text-4xl font-bold text-gray-800 mb-3">{suggestion.name}</h3>
                  <p className="text-blue-600 font-semibold mb-2 text-lg">🔊 {suggestion.pronunciation}</p>
                  {(suggestion.rank2024 || suggestion.trend2025) && (
  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
    <div className="flex items-center gap-2 text-sm">
      {suggestion.rank2024 && suggestion.rank2024 !== "Not ranked" && (
        <span className="text-purple-700 font-semibold">
          📊 2024 Rank: #{suggestion.rank2024}
        </span>
      )}
      {suggestion.rank2024 === "Not ranked" && (
        <span className="text-purple-700 font-semibold">
          📊 Unique choice
        </span>
      )}
      {suggestion.trend2025 && (
        <span className="text-purple-700">
          • {suggestion.trend2025 === "Rising" ? "↗️" : suggestion.trend2025 === "Declining" ? "↘️" : "✨"} {suggestion.trend2025}
        </span>
      )}
    </div>
    {suggestion.regionalNote && (
      <p className="text-purple-600 text-xs mt-1 italic">{suggestion.regionalNote}</p>
    )}
  </div>
)}
                  <p className="text-black italic mb-4 text-lg">"{suggestion.meaning}"</p>
                  
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
          {!hasUnlockedInitial && (
            <button
              onClick={handleGenerateMore}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              Unlock Additional Names - $0.99
            </button>
          )}

          {hasUnlockedInitial && (
            <button
              onClick={handleGenerateEightMore}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              Get 5 More Names - $1.99
            </button>
          )}

<button
            onClick={reset}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 rounded-lg hover:bg-gray-50 transition-all"
          >
            Start Over
          </button>
{hasUnlockedInitial && favorites.length > 0 && (
            <button
              onClick={() => setShowFavorites(true)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Star size={20} className="fill-white" />
              View My Favorites ({favorites.length})
            </button>
          )}

        </div>
        
        <div className="text-center mt-8 space-x-4">
          <a href="/terms" className="text-blue-600 hover:text-blue-700 text-sm">Terms of Service</a>
          <span className="text-gray-400">•</span>
          <a href="/privacy" className="text-blue-600 hover:text-blue-700 text-sm">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}

// FAVORITES SCREEN
if (showFavorites) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-200 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Baby className="text-blue-600" size={48} />
            <h1 className="text-5xl font-bold text-gray-800">Boop</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">⭐ My Favorite Names</h2>
          <p className="text-black">Your saved baby names ({favorites.length})</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Star className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl text-black">No favorites yet!</p>
            <p className="text-black mt-2">Tap the star icon on any name to save it here.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 mb-8">
            {favorites.map((suggestion, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow relative">
                <button
                  onClick={() => toggleFavorite(suggestion)}
                  className="absolute top-4 right-4 p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove from favorites"
                >
                  <Star className="text-yellow-500 fill-yellow-500" size={24} />
                </button>
                
                <h3 className="text-4xl font-bold text-gray-800 mb-3">{suggestion.name}</h3>
                <p className="text-blue-600 font-semibold mb-2 text-lg">🔊 {suggestion.pronunciation}</p>
                
                {(suggestion.rank2024 || suggestion.trend2025) && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      {suggestion.rank2024 && suggestion.rank2024 !== "Not ranked" && (
                        <span className="text-purple-700 font-semibold">
                          📊 2024 Rank: {suggestion.rank2024}
                        </span>
                      )}
                      {suggestion.rank2024 === "Not ranked" && (
                        <span className="text-purple-700 font-semibold">
                          📊 Unique choice
                        </span>
                      )}
                      {suggestion.trend2025 && (
                        <span className="text-purple-700">
                          • {suggestion.trend2025 === "Rising" ? "↗️" : suggestion.trend2025 === "Declining" ? "↘️" : "✨"} {suggestion.trend2025}
                        </span>
                      )}
                    </div>
                    {suggestion.regionalNote && (
                      <p className="text-purple-600 text-xs mt-1 italic">{suggestion.regionalNote}</p>
                    )}
                  </div>
                )}
                
                <p className="text-black italic mb-4 text-lg">"{suggestion.meaning}"</p>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed">
                    <strong className="text-blue-600">Why this works for you:</strong> {suggestion.reason || suggestion.reasoning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowFavorites(false)}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all"
        >
          Back to Results
        </button>

        <div className="text-center mt-8 space-x-4">
          <a href="/terms" className="text-blue-600 hover:text-blue-700 text-sm">Terms of Service</a>
          <span className="text-gray-400">•</span>
          <a href="/privacy" className="text-blue-600 hover:text-blue-700 text-sm">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
}