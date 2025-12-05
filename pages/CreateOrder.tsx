
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { generateBiography } from '../services/geminiService';
import { OrderFormData } from '../types';
import { Loader2, Wand2, MapPin, Wallet, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { products } from './Shop';

const CreateOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, addProfile, updateBalance } = useAuth();
  
  // Initialize selection from URL or default to first product
  const initialProductId = searchParams.get('product') || products[0].id;
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const [formData, setFormData] = useState<OrderFormData>({
    productId: selectedProductId,
    firstName: '',
    lastName: '',
    birthDate: '',
    deathDate: '',
    bioKeywords: '',
    bio: '',
    quote: '',
  });

  // Update formData when product changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, productId: selectedProductId }));
  }, [selectedProductId]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleManualLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    setFormData(prev => {
        const currentLat = prev.location?.lat || 0;
        const currentLng = prev.location?.lng || 0;

        return {
            ...prev,
            location: {
                lat: name === 'lat' ? numValue : currentLat,
                lng: name === 'lng' ? numValue : currentLng
            }
        };
    });
  };

  const handleGenerateBio = async () => {
    if (!formData.firstName || !formData.bioKeywords) {
      alert("Proszę podać imię i słowa kluczowe, aby wygenerować biografię.");
      return;
    }

    setIsGenerating(true);
    const bio = await generateBiography(
      `${formData.firstName} ${formData.lastName}`,
      formData.bioKeywords
    );
    setFormData(prev => ({ ...prev, bio }));
    setIsGenerating(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }));
        setLocating(false);
      },
      (error) => {
        console.error(error);
        alert("Nie udało się pobrać lokalizacji. Sprawdź uprawnienia.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Musisz być zalogowany, aby złożyć zamówienie.");
      navigate('/login');
      return;
    }

    const price = selectedProduct.price;

    if (user.walletBalance < price) {
        alert(`Niewystarczające środki w portfelu. Koszt: ${price} zł, Posiadasz: ${user.walletBalance.toFixed(2)} zł.`);
        return;
    }

    if (window.confirm(`Potwierdzasz zakup tabliczki "${selectedProduct.name}" za kwotę ${price} zł? Środki zostaną pobrane z Twojego portfela.`)) {
        updateBalance(-price);
        
        // Mock creating a profile
        addProfile({
            id: Date.now().toString(),
            userId: user.id,
            ...formData,
            mainPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=988&auto=format&fit=crop', // Default for now
            galleryUrls: [],
            candles: [],
            location: formData.location,
            familyTree: [] // Empty tree for new profiles
        });

        alert("Zamówienie opłacone pomyślnie! Profil został utworzony.");
        navigate('/dashboard');
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-stone-900 px-6 py-8 text-center">
            <h2 className="text-3xl font-serif font-bold text-white">Stwórz Profil Pamięci</h2>
            <p className="text-stone-400 mt-2">Wybierz tabliczkę i wypełnij dane osoby zmarłej</p>
            {user && (
              <div className="mt-4 inline-flex items-center bg-stone-800 px-4 py-1 rounded-full border border-stone-700">
                <Wallet className="h-4 w-4 text-emerald-500 mr-2" />
                <span className="text-emerald-500 font-medium text-sm">Portfel: {user.walletBalance.toFixed(2)} zł</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-10">
            
            {/* Product Selection */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-stone-900 border-b border-stone-200 pb-2 mb-6">
                 1. Wybierz Rodzaj Tabliczki
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => {
                  const isSelected = product.id === selectedProductId;
                  return (
                    <div 
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 overflow-hidden flex flex-col ${
                        isSelected 
                          ? 'border-stone-800 shadow-md bg-stone-50 ring-1 ring-stone-800' 
                          : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-stone-800 text-white rounded-full p-1 z-10">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <div className="h-40 overflow-hidden relative">
                         <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                         <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-black/0' : 'bg-black/10 hover:bg-black/0'}`} />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className={`font-serif font-bold ${isSelected ? 'text-stone-900' : 'text-stone-700'}`}>{product.name}</h4>
                        </div>
                        <p className="text-xs text-stone-500 mb-3">{product.material}</p>
                        <div className="mt-auto pt-3 border-t border-stone-200/50 flex justify-between items-center">
                           <span className={`text-lg font-bold ${isSelected ? 'text-emerald-700' : 'text-stone-600'}`}>{product.price} zł</span>
                           {isSelected && <span className="text-xs font-bold uppercase tracking-wide text-stone-800">Wybrano</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-stone-900 border-b border-stone-200 pb-2 mb-4">
                2. Informacje Podstawowe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700">Imię</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">Nazwisko</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">Data urodzenia</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">Data śmierci</label>
                  <input
                    type="date"
                    name="deathDate"
                    value={formData.deathDate}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 border p-2"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
                 <h3 className="text-lg font-medium leading-6 text-stone-900 border-b border-stone-200 pb-2 mb-6">
                    3. Lokalizacja Miejsca Spoczynku
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      {/* Left: Auto GPS */}
                      <div className="flex flex-col items-center justify-center p-6 bg-stone-50 rounded-lg border-2 border-dashed border-stone-200 h-full min-h-[160px]">
                          <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={locating}
                            className="w-full inline-flex items-center justify-center px-4 py-3 border border-stone-300 shadow-sm text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-100 transition-colors mb-2"
                          >
                             {locating ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <MapPin className="h-5 w-5 text-emerald-600 mr-2" />}
                             Pobierz moją lokalizację (GPS)
                          </button>
                          <p className="text-xs text-stone-500 text-center max-w-[200px]">
                            Stój bezpośrednio przy grobie i kliknij przycisk, aby automatycznie zapisać współrzędne.
                          </p>
                      </div>

                      {/* Right: Manual Input */}
                      <div className="space-y-4">
                          <div className="flex flex-col">
                              <label className="block text-sm font-medium text-stone-700 mb-1">Szerokość geograficzna (Latitude)</label>
                              <input
                                type="number"
                                name="lat"
                                step="any"
                                placeholder="np. 52.2297"
                                value={formData.location?.lat || ''}
                                onChange={handleManualLocationChange}
                                className="block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 border p-2"
                              />
                          </div>
                          <div className="flex flex-col">
                              <label className="block text-sm font-medium text-stone-700 mb-1">Długość geograficzna (Longitude)</label>
                              <input
                                type="number"
                                name="lng"
                                step="any"
                                placeholder="np. 21.0122"
                                value={formData.location?.lng || ''}
                                onChange={handleManualLocationChange}
                                className="block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 border p-2"
                              />
                          </div>
                          <p className="text-xs text-stone-400 text-right">
                             Współrzędne można skopiować np. z Map Google.
                          </p>
                      </div>
                  </div>
            </div>

            {/* Biography with AI */}
            <div>
              <div className="flex justify-between items-end border-b border-stone-200 pb-2 mb-4">
                <h3 className="text-lg font-medium leading-6 text-stone-900">
                  4. Biografia i Wspomnienia
                </h3>
              </div>
              
              <div className="bg-stone-50 p-4 rounded-md mb-4 border border-stone-200">
                <label className="block text-sm font-medium text-stone-800 mb-2 flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-purple-600" />
                  Asystent AI - Pomożemy Ci napisać biografię
                </label>
                <p className="text-xs text-stone-500 mb-3">
                  Wpisz najważniejsze fakty, cechy charakteru, pasje (np. kochał góry, nauczyciel matematyki, 3 wnuków, optymista).
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="bioKeywords"
                    value={formData.bioKeywords}
                    onChange={handleInputChange}
                    placeholder="Słowa kluczowe..."
                    className="flex-grow rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 border p-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBio}
                    disabled={isGenerating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-stone-800 hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : 'Generuj Tekst'}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-1">Pełna Biografia (możesz edytować)</label>
                <textarea
                  name="bio"
                  rows={10}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 border p-2 font-serif text-stone-700 leading-relaxed"
                  placeholder="Tu pojawi się wygenerowany tekst, lub możesz wpisać go ręcznie..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">Cytat pożegnalny (motto)</label>
                <input
                  type="text"
                  name="quote"
                  value={formData.quote}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 border p-2 italic"
                  placeholder="np. Spieszmy się kochać ludzi..."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-8 border-t border-stone-200 flex flex-col items-end">
              <div className="flex items-center gap-2 mb-4">
                 <span className="text-stone-500">Wybrana tabliczka:</span>
                 <span className="font-serif font-bold text-stone-900">{selectedProduct.name}</span>
              </div>
              <p className="text-lg text-stone-500 mb-4">Łączny koszt: <strong className="text-emerald-700 text-2xl">{selectedProduct.price} zł</strong></p>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center py-4 px-12 border border-transparent shadow-md text-lg font-medium rounded-md text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-colors"
              >
                Opłać i Utwórz Profil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
