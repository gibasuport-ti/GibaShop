import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, PackageOpen } from 'lucide-react';
import { motion } from 'motion/react';

export const Catalog = () => {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam || 'all');

  useEffect(() => {
    setSelectedCategory(catParam || 'all');
  }, [catParam]);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(list);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="max-w-lg">
          <h1 className="text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">Catálogo</h1>
          <p className="text-gray-500 font-light leading-relaxed">
            Navegue por nossa seleção completa de acessórios. Use os filtros para encontrar exatamente o que você precisa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Buscar acessórios..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl w-full sm:w-80 shadow-sm focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto max-w-full">
            {['all', 'celular', 'som', 'informatica', 'eletronicos', 'utilidades', 'diversos', 'brecho'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-3 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {cat === 'all' ? 'Ver Tudo' : 
                 cat === 'som' ? 'Áudio/Som' : 
                 cat === 'informatica' ? 'Informática' :
                 cat === 'eletronicos' ? 'Eletrônicos' :
                 cat === 'utilidades' ? 'Utilidades' :
                 cat === 'diversos' ? 'Diversos' :
                 cat === 'brecho' ? 'Brechó' :
                 cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-[32px] h-[420px]" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-gray-200">
          <PackageOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-900 mb-2">Ops! Nada por aqui.</h3>
          <p className="text-gray-500 font-light">Não encontramos produtos com os critérios selecionados.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            className="mt-8 text-blue-600 font-bold hover:underline"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
};
