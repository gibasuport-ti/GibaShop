import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(4));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1920"
            alt="Variedade de Produtos GIBASHOP"
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-lg shadow-blue-500/20">
              Novidades GIBASHOP
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8 text-slate-900">
              Tecnologia & Estilo em um só lugar.
            </h1>
            <p className="text-xl text-slate-700 mb-10 leading-relaxed font-semibold">
              Do hardware de ponta às peças únicas do nosso novo Brechó. Encontre o equilíbrio perfeito entre inovação e sustentabilidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/catalogo"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all shadow-xl shadow-blue-600/30 lg:text-lg"
              >
                Comprar agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-all lg:text-lg shadow-sm"
              >
                Painel Admin
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/catalogo?cat=celular" className="group relative rounded-[40px] overflow-hidden h-[300px]">
            <img src="https://images.unsplash.com/photo-1510557883984-16489d83211d?auto=format&fit=crop&q=80&w=800" alt="Cases" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
              <span className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-2">Acessórios</span>
              <h2 className="text-2xl font-black text-white mb-2">Celulares</h2>
              <button className="flex items-center text-white text-xs font-bold group-hover:translate-x-2 transition-transform">Explorar <ArrowRight className="ml-2 w-4 h-4" /></button>
            </div>
          </Link>
          <Link to="/catalogo?cat=informatica" className="group relative rounded-[40px] overflow-hidden h-[300px]">
            <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800" alt="Notebooks" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
              <span className="text-teal-400 font-bold uppercase tracking-widest text-[10px] mb-2">Tecnologia</span>
              <h2 className="text-2xl font-black text-white mb-2">Informática</h2>
              <button className="flex items-center text-white text-xs font-bold group-hover:translate-x-2 transition-transform">Explorar <ArrowRight className="ml-2 w-4 h-4" /></button>
            </div>
          </Link>
          <Link to="/catalogo?cat=som" className="group relative rounded-[40px] overflow-hidden h-[300px]">
            <img src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800" alt="Sound" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
              <span className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-2">Áudio</span>
              <h2 className="text-2xl font-black text-white mb-2">Som</h2>
              <button className="flex items-center text-white text-xs font-bold group-hover:translate-x-2 transition-transform">Explorar <ArrowRight className="ml-2 w-4 h-4" /></button>
            </div>
          </Link>
          <Link to="/catalogo?cat=brecho" className="group relative rounded-[40px] overflow-hidden h-[300px]">
            <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800" alt="Brechó" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
              <span className="text-orange-400 font-bold uppercase tracking-widest text-[10px] mb-2">Oportunidades</span>
              <h2 className="text-2xl font-black text-white mb-2">Brechó</h2>
              <button className="flex items-center text-white text-xs font-bold group-hover:translate-x-2 transition-transform">Explorar <ArrowRight className="ml-2 w-4 h-4" /></button>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Os Mais Vendidos</h2>
            <p className="text-gray-500 font-light">Produtos que nossos clientes recomendam de olhos fechados.</p>
          </div>
          <Link to="/catalogo" className="hidden md:flex items-center text-blue-600 font-bold hover:translate-x-1 transition-transform">
            Ver catálogo completo <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-[400px]" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-300">
            <h3 className="text-xl font-bold text-gray-500 mb-4">Nenhum produto cadastrado ainda.</h3>
            <Link to="/admin" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold transition-transform hover:scale-105 inline-block">Cadastrar Produtos Agora</Link>
          </div>
        )}
      </section>
    </div>
  );
};
