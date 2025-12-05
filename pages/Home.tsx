import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Smartphone, Cloud, ShieldCheck, ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative bg-stone-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1445423877983-2053075c3e06?q=80&w=2074&auto=format&fit=crop"
            alt="Spokojny las we mgle"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
            Ocal wspomnienia od zapomnienia
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-stone-300 mx-auto">
            Eleganckie tabliczki z kodem QR na pomnik, które przenoszą do cyfrowej księgi życia Twoich bliskich.
            Zdjęcia, biografie i wspomnienia dostępne za jednym zeskanowaniem.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              to="/create"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-stone-900 bg-stone-100 hover:bg-white transition-colors shadow-lg"
            >
              Stwórz Profil
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center px-8 py-3 border border-stone-500 text-base font-medium rounded-md text-stone-100 hover:bg-stone-800 transition-colors"
            >
              Zobacz Tabliczki
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-stone-500 tracking-wide uppercase">Proces</h2>
            <p className="mt-2 text-3xl leading-8 font-serif font-bold tracking-tight text-stone-900 sm:text-4xl">
              Jak to działa?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-stone-100 text-stone-600 mb-6">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-stone-900 mb-2">1. Zamów i Skonfiguruj</h3>
              <p className="text-stone-500">
                Wybierz tabliczkę i wypełnij profil osoby zmarłej. Nasza sztuczna inteligencja pomoże Ci napisać piękną biografię.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-stone-100 text-stone-600 mb-6">
                <QrCode className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-stone-900 mb-2">2. Otrzymaj Tabliczkę</h3>
              <p className="text-stone-500">
                Wysyłamy do Ciebie elegancką, odporną na warunki atmosferyczne tabliczkę z unikalnym kodem QR.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-stone-100 text-stone-600 mb-6">
                <Cloud className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-stone-900 mb-2">3. Pamięć Wieczna</h3>
              <p className="text-stone-500">
                Umieść tabliczkę na pomniku. Rodzina i przyjaciele mogą skanować kod, by wspominać, oglądać zdjęcia i zapalać wirtualne znicze.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Section */}
      <div className="bg-stone-50 py-24 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1595856999203-d2328156ee18?q=80&w=2070&auto=format&fit=crop" 
              alt="Marmurowa tekstura" 
              className="rounded-lg shadow-xl shadow-stone-300"
            />
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-6">
              Jakość, która przetrwa pokolenia
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <ShieldCheck className="h-6 w-6 text-stone-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-stone-900">Odporność na warunki pogodowe</h4>
                  <p className="text-stone-600">Nasze tabliczki wykonane są z anodowanego aluminium lub wysokiej jakości pleksi, odpornego na deszcz, mróz i słońce.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Cloud className="h-6 w-6 text-stone-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-stone-900">Hosting na zawsze</h4>
                  <p className="text-stone-600">Gwarantujemy utrzymanie cyfrowego profilu bez dodatkowych opłat abonamentowych przez minimum 20 lat.</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link to="/profile/demo" className="text-stone-800 font-semibold hover:text-stone-600 flex items-center gap-2">
                Zobacz przykładowy profil <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;