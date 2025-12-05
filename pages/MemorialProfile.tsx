import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MemorialProfile as ProfileType, Candle } from '../types';
import { Flame, MapPin, GitGraph, Quote, Volume2, Square, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FamilyTree from '../components/FamilyTree';

const MemorialProfile: React.FC = () => {
  const { id } = useParams();
  const { profiles, user, updateBalance } = useAuth();
  
  const foundProfile = profiles.find(p => p.id === id);
  const [profile, setProfile] = useState<ProfileType | null>(null);

  const [candles, setCandles] = useState<Candle[]>([]);
  const [newCandleName, setNewCandleName] = useState('');
  const [newCandleMessage, setNewCandleMessage] = useState('');
  const [showCandleForm, setShowCandleForm] = useState(false);

  const [isPlaying, setIsPlaying] = useState<'quote' | 'bio' | null>(null);

  // TTS references
  const voiceLoadedRef = useRef(false);
  const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Load profile
  useEffect(() => {
    if (foundProfile) {
      setProfile(foundProfile);
      setCandles(foundProfile.candles);
    }
  }, [foundProfile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // --- Load Polish Female TTS Voice ---
  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) return;

      voiceLoadedRef.current = true;

      const polish = voices.filter(v => v.lang.toLowerCase().includes("pl"));

      const preferred = [
        "Zosia",
        "Paulina",
        "Maja",
        "Agata",
        "Ewa",
        "Zuzanna",
        "Google polski",
        "Microsoft Paulina",
        "Microsoft Zofia"
      ];

      let female =
        polish.find(v =>
          preferred.some(p => v.name.toLowerCase().includes(p.toLowerCase()))
        );

      if (!female) {
        female = polish.find(v => /a$/i.test(v.name));
      }

      if (!female && polish.length > 0) {
        female = polish[0];
      }

      femaleVoiceRef.current = female;
    };

    // First attempt
    loadVoices();

    // Chrome usually fires this later
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  // --- Browser Native TTS Logic ---
  const handleSpeech = (type: 'quote' | 'bio', text: string) => {
    const synth = window.speechSynthesis;

    if (isPlaying === type) {
      synth.cancel();
      setIsPlaying(null);
      return;
    }

    synth.cancel();
    if (!text) return;

    // Retry if voices not loaded yet
    if (!voiceLoadedRef.current) {
      setTimeout(() => handleSpeech(type, text), 150);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    if (femaleVoiceRef.current) {
      utterance.voice = femaleVoiceRef.current;
      utterance.lang = femaleVoiceRef.current.lang;
    } else {
      utterance.lang = "pl-PL";
    }

    utterance.pitch = 1.1;
    utterance.rate = 0.92;

    utterance.onstart = () => setIsPlaying(type);
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);

    synth.speak(utterance);
  };

  const handleLightCandle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandleName.trim()) return;

    const CANDLE_COST = 2.00;
    
    if (user) {
      if (user.walletBalance < CANDLE_COST) {
        alert(`Niewystarczające środki. Koszt: ${CANDLE_COST} zł, Posiadasz: ${user.walletBalance.toFixed(2)} zł.`);
        return;
      }
      if (window.confirm(`Zapalenie znicza kosztuje ${CANDLE_COST.toFixed(2)} zł. Pobrać z portfela?`)) {
        updateBalance(-CANDLE_COST);
      } else {
        return;
      }
    } else {
      if (!window.confirm("Jako gość możesz zapalić jeden darmowy znicz. Kontynuować?")) return;
    }

    const newCandle: Candle = {
      id: Date.now().toString(),
      name: newCandleName,
      message: newCandleMessage,
      date: new Date().toISOString().split('T')[0]
    };

    setCandles([newCandle, ...candles]);
    setNewCandleName('');
    setNewCandleMessage('');
    setShowCandleForm(false);
  };

  const getGoogleMapsLink = () => {
    if (!profile?.location) return '#';
    return `https://www.google.com/maps/search/?api=1&query=${profile.location.lat},${profile.location.lng}`;
  };

  if (!profile) {
    return <div className="p-12 text-center">Ładowanie profilu...</div>;
  }

  return (
    <div className="bg-stone-100 min-h-screen pb-20">
      {/* HEADER IMAGE */}
      <div className="relative h-96 w-full bg-stone-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1464699908537-0954e50791ee?q=80&w=2071&auto=format&fit=crop" 
          alt="Tło" 
          className="w-full h-full object-cover opacity-40 blur-sm scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-100 via-transparent to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative">
        <div className="bg-white rounded-lg shadow-xl mb-12 relative">

          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-48 h-48 rounded-full border-4 border-white shadow-lg bg-stone-200 z-10">
            <img 
              src={profile.mainPhotoUrl} 
              alt={`${profile.firstName} ${profile.lastName}`} 
              className="absolute inset-0 w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="flex flex-col items-center pt-28 pb-12 px-8 text-center">
            
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">
              {profile.firstName} {profile.lastName}
            </h1>

            <div className="flex items-center gap-4 text-stone-500 font-medium mb-12">
              <span>ur. {profile.birthDate}</span>
              <span>&bull;</span>
              <span>zm. {profile.deathDate}</span>
            </div>
            
            {/* BIO + QUOTE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mt-4 text-left">
              
              {/* QUOTE + BIO */}
              <div className="relative bg-stone-50 p-8 rounded-sm shadow-sm border border-stone-200">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-yellow-100/50 rotate-1 shadow-sm border-l border-r border-white/50 backdrop-blur-sm z-10"></div>
                
                {profile.quote && (
                  <blockquote className="relative mb-8 pt-4">
                    <Quote className="absolute -top-2 -left-2 h-8 w-8 text-stone-200 transform -scale-x-100" />
                    <button 
                      onClick={() => handleSpeech('quote', profile.quote)}
                      className={`absolute -top-2 right-0 p-2 rounded-full transition-colors ${isPlaying === 'quote' ? 'bg-orange-100 text-orange-600' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'}`}
                    >
                      {isPlaying === 'quote' ? <Square className="h-5 w-5 fill-current" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <p className="text-xl font-serif italic text-stone-700 text-center leading-relaxed">
                      "{profile.quote}"
                    </p>
                  </blockquote>
                )}
                
                <div className="flex items-center justify-center border-b border-stone-200 pb-2 mb-6 relative">
                  <h3 className="font-serif text-2xl text-stone-800">Życiorys</h3>
                  <button 
                    onClick={() => handleSpeech('bio', profile.bio)}
                    className={`absolute right-0 p-2 rounded-full transition-colors ${isPlaying === 'bio' ? 'bg-orange-100 text-orange-600' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'}`}
                  >
                    {isPlaying === 'bio' ? <Square className="h-5 w-5 fill-current" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                </div>

                <div className="prose prose-stone">
                  <p className="whitespace-pre-line text-justify font-serif text-stone-600 leading-loose">
                    {profile.bio}
                  </p>
                </div>
              </div>

              {/* HEADSTONE */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative group max-w-md w-full">
                  <div className="absolute inset-0 bg-stone-800 rounded-lg transform rotate-3 translate-y-2 opacity-10 transition-transform group-hover:rotate-2"></div>

                  <div className="relative bg-white p-3 rounded-lg shadow-xl transform -rotate-1 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-[1.01]">
                    <div className="overflow-hidden rounded border border-stone-100 bg-stone-200 aspect-[3/4] md:aspect-square relative">
                      {profile.headstoneUrl ? (
                        <img 
                          src={profile.headstoneUrl} 
                          alt="Nagrobek" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
                          <MapPin className="h-12 w-12 mb-2 opacity-50" />
                          <span className="text-sm font-medium">Brak zdjęcia nagrobka</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                </div>
                <p className="text-stone-500 mt-6 font-serif italic flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Widok miejsca spoczynku
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* NEW LOCATION SECTION */}
        {profile.location && (
          <div className="mb-12 bg-white rounded-lg shadow-lg overflow-hidden border border-stone-100">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: Map Embed */}
              <div className="h-80 md:h-auto w-full bg-stone-200 relative">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${profile.location.lat},${profile.location.lng}&z=15&output=embed`}
                  title="Mapa cmentarza"
                  className="absolute inset-0"
                ></iframe>
              </div>

              {/* Right: Coordinates & Action */}
              <div className="p-8 md:p-12 flex flex-col justify-center bg-stone-50">
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-3">
                   <div className="bg-emerald-100 p-2 rounded-full">
                     <Navigation className="h-6 w-6 text-emerald-600" />
                   </div>
                   Lokalizacja Grobu
                </h3>
                
                <p className="text-stone-500 mb-8 leading-relaxed">
                  Poniżej znajdują się dokładne współrzędne GPS miejsca spoczynku. Kliknij przycisk, aby uruchomić nawigację w swoim telefonie.
                </p>

                <div className="space-y-4 mb-8 bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                    <span className="text-stone-500 text-sm uppercase tracking-wide">Szerokość (Lat)</span>
                    <span className="font-mono font-bold text-stone-800 text-lg">{profile.location.lat}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 text-sm uppercase tracking-wide">Długość (Lng)</span>
                    <span className="font-mono font-bold text-stone-800 text-lg">{profile.location.lng}</span>
                  </div>
                </div>

                <a 
                  href={getGoogleMapsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-6 py-4 bg-emerald-700 text-white rounded-md text-lg font-medium hover:bg-emerald-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                >
                  <Navigation className="h-5 w-5 mr-2" />
                  Nawiguj do grobu
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TREE */}
        <div className="mb-12 bg-white rounded-lg shadow-lg p-4 sm:p-8">
          <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6 text-center flex justify-center items-center gap-2">
            <GitGraph className="h-6 w-6" /> Drzewo Genealogiczne
          </h3>
          <p className="text-center text-stone-500 text-sm mb-6">
            Użyj myszki, aby przesuwać i przybliżać drzewo.
          </p>
          
          <FamilyTree profile={profile} />
        </div>

        {/* GALLERY */}
        <div className="mb-12">
          <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6 text-center">
            Galeria Wspomnień
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.galleryUrls.length > 0 ? profile.galleryUrls.map((url, idx) => (
              <div key={idx} className="aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-90 transition">
                <img src={url} alt={`Wspomnienie ${idx}`} className="w-full h-full object-cover" />
              </div>
            )) : (
              <p className="col-span-4 text-center text-stone-400 italic">
                Brak zdjęć w galerii
              </p>
            )}
          </div>
        </div>

        {/* CANDLES */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-4">
            <h3 className="text-2xl font-serif font-bold flex items-center gap-2">
              <Flame className="text-orange-400" /> Pamięć i Światło ({candles.length})
            </h3>
            <button 
              onClick={() => setShowCandleForm(!showCandleForm)}
              className="px-4 py-2 bg-stone-800 text-white text-sm rounded-md hover:bg-stone-700 transition"
            >
              Zapal znicz (2.00 zł)
            </button>
          </div>

          {showCandleForm && (
            <form onSubmit={handleLightCandle} className="mb-10 bg-stone-50 p-6 rounded-md border border-stone-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-1">Twoje imię</label>
                <input 
                  type="text" 
                  required
                  value={newCandleName}
                  onChange={(e) => setNewCandleName(e.target.value)}
                  className="w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 p-2 border"
                  placeholder="Kto zapala znicz?"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-1">Wiadomość (opcjonalnie)</label>
                <textarea 
                  rows={3}
                  value={newCandleMessage}
                  onChange={(e) => setNewCandleMessage(e.target.value)}
                  className="w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 p-2 border"
                  placeholder="Zostaw słowo pamięci..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowCandleForm(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800"
                >
                  Anuluj
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Zapal znicz
                </button>
              </div>
            </form>
          )}

          <div className="space-y-6">
            {candles.map((candle) => (
              <div key={candle.id} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-400/70" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-stone-900">{candle.name}</span>
                    <span className="text-xs text-stone-400">{candle.date}</span>
                  </div>
                  {candle.message && (
                    <p className="text-stone-600 mt-1 italic">"{candle.message}"</p>
                  )}
                  <p className="text-xs text-orange-600/80 mt-1 font-medium">Zapalił(a) świeczkę pamięci</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemorialProfile;