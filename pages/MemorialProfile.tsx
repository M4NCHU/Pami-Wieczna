
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MemorialProfile as ProfileType, Candle } from '../types';
import { Flame, MapPin, GitGraph } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FamilyTree from '../components/FamilyTree';

const MemorialProfile: React.FC = () => {
  const { id } = useParams();
  const { profiles, user, updateBalance } = useAuth();
  
  // Find profile from context or fallback to null
  const foundProfile = profiles.find(p => p.id === id);
  const [profile, setProfile] = useState<ProfileType | null>(null);

  const [candles, setCandles] = useState<Candle[]>([]);
  const [newCandleName, setNewCandleName] = useState('');
  const [newCandleMessage, setNewCandleMessage] = useState('');
  const [showCandleForm, setShowCandleForm] = useState(false);

  useEffect(() => {
    if (foundProfile) {
        setProfile(foundProfile);
        setCandles(foundProfile.candles);
    }
  }, [foundProfile]);

  if (!profile) {
      return <div className="p-12 text-center">Ładowanie profilu lub profil nie istnieje...</div>;
  }

  const handleLightCandle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandleName.trim()) return;

    const CANDLE_COST = 2.00; // 2 PLN
    
    // Check wallet if logged in
    if (user) {
        if (user.walletBalance < CANDLE_COST) {
            alert(`Niewystarczające środki. Koszt: ${CANDLE_COST} zł, Posiadasz: ${user.walletBalance.toFixed(2)} zł.`);
            return;
        }
        if (window.confirm(`Zapalenie wirtualnego znicza kosztuje ${CANDLE_COST.toFixed(2)} zł. Pobrać z portfela?`)) {
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
      if (!profile.location) return '#';
      return `https://www.google.com/maps/search/?api=1&query=${profile.location.lat},${profile.location.lng}`;
  };

  return (
    <div className="bg-stone-100 min-h-screen pb-20">
      {/* Header Image with Gradient */}
      <div className="relative h-96 w-full bg-stone-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1464699908537-0954e50791ee?q=80&w=2071&auto=format&fit=crop" 
          alt="Tło" 
          className="w-full h-full object-cover opacity-40 blur-sm scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-100 via-transparent to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative">
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-12">
          <div className="flex flex-col items-center pt-12 pb-8 px-8 text-center">
            {/* Portrait */}
            <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg overflow-hidden mb-6 -mt-32 bg-stone-200 relative z-10">
              <img 
                src={profile.mainPhotoUrl} 
                alt={`${profile.firstName} ${profile.lastName}`} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex items-center gap-4 text-stone-500 font-medium mb-6">
              <span>ur. {profile.birthDate}</span>
              <span>&bull;</span>
              <span>zm. {profile.deathDate}</span>
            </div>
            
            {profile.location && (
                <a 
                    href={getGoogleMapsLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-6 inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-colors border border-green-200"
                >
                    <MapPin className="h-4 w-4 mr-2" />
                    Nawiguj do grobu
                </a>
            )}

            <div className="w-16 h-1 bg-stone-300 mb-8" />

            {profile.quote && (
              <blockquote className="text-xl font-serif italic text-stone-600 max-w-2xl mb-10">
                "{profile.quote}"
              </blockquote>
            )}

            <div className="prose prose-stone text-left w-full max-w-2xl">
               <h3 className="text-center font-serif text-2xl mb-6">Życiorys</h3>
               <p className="whitespace-pre-line leading-relaxed text-stone-700">
                 {profile.bio}
               </p>
            </div>
          </div>
        </div>

        {/* Genealogical Tree Section - NEW INTERACTIVE COMPONENT */}
        <div className="mb-12 bg-white rounded-lg shadow-lg p-4 sm:p-8">
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6 text-center flex justify-center items-center gap-2">
                <GitGraph className="h-6 w-6 text-stone-600" /> Drzewo Genealogiczne
            </h3>
            <p className="text-center text-stone-500 text-sm mb-6">
               Użyj myszki, aby przesuwać i przybliżać drzewo. Kliknij "Dodaj", aby uzupełnić historię rodziny.
            </p>
            
            <FamilyTree profile={profile} />
        </div>

        {/* Gallery */}
        <div className="mb-12">
          <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6 text-center">Galeria Wspomnień</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.galleryUrls.length > 0 ? profile.galleryUrls.map((url, idx) => (
              <div key={idx} className="aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-90 transition">
                <img src={url} alt={`Wspomnienie ${idx}`} className="w-full h-full object-cover" />
              </div>
            )) : <p className="col-span-4 text-center text-stone-400 italic">Brak zdjęć w galerii</p>}
          </div>
        </div>

        {/* Candles Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-4">
            <h3 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Flame className="text-orange-400 fill-orange-400" /> Pamięć i Światło ({candles.length})
            </h3>
            <button 
              onClick={() => setShowCandleForm(!showCandleForm)}
              className="px-4 py-2 bg-stone-800 text-white text-sm rounded-md hover:bg-stone-700 transition"
            >
              Zapal znicz (2.00 zł)
            </button>
          </div>

          {showCandleForm && (
            <form onSubmit={handleLightCandle} className="mb-10 bg-stone-50 p-6 rounded-md border border-stone-200 animate-fade-in-down">
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
