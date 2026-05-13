import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { Plus, Minus, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, Smartphone, Speaker, PackageOpen, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.id ? { id: docSnap.id, ...docSnap.data() } as Product : null;
          if (data) {
            setProduct(data);
            setActiveImage(data.imageUrl);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="text-center py-24"><h2 className="text-2xl font-bold">Produto não encontrado</h2><Link to="/catalogo" className="text-blue-600 underline">Voltar para o catálogo</Link></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4 mb-12">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <span className="text-gray-400 capitalize">{product.category} / <span className="text-gray-900 font-bold">{product.name}</span></span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="aspect-square rounded-[48px] overflow-hidden bg-white border border-gray-100 shadow-xl group">
            <img
              src={activeImage || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {product.imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(url)}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === url ? 'border-blue-600 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`${product.name} ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[2px] rounded-full ring-1 ring-blue-100">
                Lançamento
              </span>
              <span className="text-gray-400 font-bold inline-flex items-center uppercase text-[10px] tracking-widest">
                {product.category === 'celular' ? <Smartphone className="w-3 h-3 mr-1 text-blue-400" /> : product.category === 'som' ? <Speaker className="w-3 h-3 mr-1 text-purple-400" /> : <PackageOpen className="w-3 h-3 mr-1 text-gray-400" />}
                {product.category}
              </span>
              {(product.stock ?? 1) <= 0 ? (
                <span className="px-4 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-[2px] rounded-full ring-1 ring-red-100 flex items-center animate-pulse">
                  <AlertCircle className="w-3 h-3 mr-1" /> Fora de Estoque
                </span>
              ) : (
                <span className="px-4 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-[2px] rounded-full ring-1 ring-green-100">
                  Em Estoque: {product.stock}
                </span>
              )}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">{product.name}</h1>
            <p className="text-xl text-gray-500 font-light leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-gray-400 uppercase tracking-widest font-bold text-xs">Preço Especial</p>
            <div className="flex items-end gap-3 text-gray-900">
              <span className="text-6xl font-black">{formatCurrency(product.price)}</span>
              <span className="text-gray-400 mb-2 font-medium">Ou 10x de {formatCurrency(product.price / 10)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-gray-100">
            {(product.stock ?? 1) > 0 && (
              <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <Minus className="w-6 h-6 text-gray-400" />
                </button>
                <span className="w-16 text-center text-2xl font-black text-gray-900">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <Plus className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            )}
            <button
              onClick={() => {
                if ((product.stock ?? 1) <= 0) return;
                for (let i = 0; i < quantity; i++) addItem(product);
                navigate('/carrinho');
              }}
              disabled={(product.stock ?? 1) <= 0}
              className={`flex-1 rounded-3xl font-black text-xl py-6 flex items-center justify-center group transition-all shadow-2xl active:scale-95 ${
                (product.stock ?? 1) <= 0 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-gray-900 text-white hover:bg-blue-600"
              }`}
            >
              {(product.stock ?? 1) <= 0 ? (
                <>
                  <AlertCircle className="w-6 h-6 mr-3" />
                  Produto Indisponível
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                  Finalizar Pedido
                </>
              )}
            </button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10">
            {[
              { icon: <Truck className="w-6 h-6" />, title: "Frete Grátis", desc: "Entrega em 48h" },
              { icon: <ShieldCheck className="w-6 h-6" />, title: "Segurança", desc: "Compra protegida" },
              { icon: <RotateCcw className="w-6 h-6" />, title: "Devolução", desc: "Grátis em 7 dias" },
            ].map((v, i) => (
              <div key={i} className="space-y-2">
                <div className="text-blue-600 mb-4">{v.icon}</div>
                <h4 className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">{v.title}</h4>
                <p className="text-xs text-gray-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
