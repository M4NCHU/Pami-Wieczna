import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

const products: Product[] = [
  {
    id: 'p1',
    name: 'Klasyczna Czerń',
    price: 149,
    description: 'Anodowane aluminium w kolorze głębokiej czerni. Grawer laserowy w kolorze srebrnym.',
    material: 'Aluminium',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmbZs1Yu8pfLzCM7KznBLv00IDA6HeivCFnw&s'
  },
  {
    id: 'p2',
    name: 'Złoty Mosiądz',
    price: 199,
    description: 'Szczotkowany laminat grawerski imitujący mosiądz. Elegancki i dostojny.',
    material: 'Laminat Premium',
    image: 'https://images.unsplash.com/photo-1507643179173-39db4f92d840?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'p3',
    name: 'Transparentna Nowoczesność',
    price: 129,
    description: 'Wytrzymałe szkło akrylowe. Minimalistyczny design pasujący do nowoczesnych nagrobków.',
    material: 'Akryl',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop'
  }
];

const Shop: React.FC = () => {
  return (
    <div className="bg-stone-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">Wybierz Tabliczkę</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Każda tabliczka jest wyposażona w unikalny kod QR oraz taśmę montażową o wysokiej wytrzymałości.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-stone-100 flex flex-col">
              <div className="h-64 overflow-hidden relative group">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-serif font-semibold text-stone-900">{product.name}</h3>
                <p className="text-sm text-stone-500 mt-1 mb-4">{product.material}</p>
                <p className="text-stone-600 text-sm mb-6 flex-grow">{product.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold text-stone-900">{product.price} zł</span>
                  <Link 
                    to={`/create?product=${product.id}`}
                    className="inline-flex items-center px-4 py-2 bg-stone-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-stone-700 active:bg-stone-900 focus:outline-none focus:border-stone-900 focus:ring ring-stone-300 disabled:opacity-25 transition ease-in-out duration-150"
                  >
                    Wybierz
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;