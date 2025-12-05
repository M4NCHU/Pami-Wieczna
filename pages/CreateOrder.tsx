import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateBiography } from '../services/geminiService';
import { OrderFormData } from '../types';
import { Loader2, Wand2 } from 'lucide-react';

const CreateOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product') || 'p1';

  const [formData, setFormData] = useState<OrderFormData>({
    productId,
    firstName: '',
    lastName: '',
    birthDate: '',
    deathDate: '',
    bioKeywords: '',
    bio: '',
    quote: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Dziękujemy za zamówienie! W wersji demonstracyjnej proces kończy się tutaj.");
  };

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-stone-900 px-6 py-8 text-center">
            <h2 className="text-3xl font-serif font-bold text-white">Stwórz Profil Pamięci</h2>
            <p className="text-stone-400 mt-2">Krok 1: Wypełnij dane osoby zmarłej</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-stone-900 border-b border-stone-200 pb-2 mb-4">
                Informacje Podstawowe
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

            {/* Biography with AI */}
            <div>
              <div className="flex justify-between items-end border-b border-stone-200 pb-2 mb-4">
                <h3 className="text-lg font-medium leading-6 text-stone-900">
                  Biografia i Wspomnienia
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
            <div className="pt-5 border-t border-stone-200 flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-gold-600 hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-colors"
              >
                Przejdź do Płatności
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;