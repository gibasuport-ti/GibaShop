import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addItem } = useCart();
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [updatingStock, setUpdatingStock] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(String(product.price));
  const priceInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isEditingPrice && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [isEditingPrice]);

  const isAdmin = user?.email === 'gibasuporte@gmail.com';
  const images = (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls : [product.imageUrl];

  const handlePriceUpdate = async () => {
    const newPrice = parseFloat(tempPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      setTempPrice(String(product.price));
      setIsEditingPrice(false);
      return;
    }

    if (newPrice === product.price) {
      setIsEditingPrice(false);
      return;
    }

    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, { price: newPrice });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${product.id}`);
    } finally {
      setIsEditingPrice(false);
    }
  };

  const handleStockUpdate = async (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (updatingStock) return;

    setUpdatingStock(true);
    try {
      const newStock = Math.max(0, (product.stock || 0) + delta);
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, { stock: newStock });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${product.id}`);
    } finally {
      setUpdatingStock(false);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={images[currentIdx] || 'https://images.unsplash.com/photo-1546868889-4e0d66acaf32?q=80&w=500&auto=format&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1546868889-4e0d66acaf32?q=80&w=500&auto=format&fit=crop';
          }}
        />
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",
            product.category === 'celular' ? "bg-blue-500" : 
            product.category === 'som' ? "bg-purple-500" :
            product.category === 'informatica' ? "bg-teal-500" :
            product.category === 'eletronicos' ? "bg-amber-500" :
            product.category === 'utilidades' ? "bg-green-500" : "bg-gray-500"
          )}>
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            {(product.stock ?? 0) <= 0 ? (
              <span className="bg-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                Indisponível
              </span>
            ) : (
              <span className="bg-green-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Estoque: {product.stock}
              </span>
            )}
            
            {isAdmin && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
                <button
                  onClick={(e) => handleStockUpdate(e, -1)}
                  disabled={updatingStock}
                  className="w-7 h-7 flex items-center justify-center bg-white shadow-lg text-red-600 rounded-full hover:bg-red-50 active:scale-95 transition-all border border-red-100"
                  title="Diminuir estoque"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleStockUpdate(e, 1)}
                  disabled={updatingStock}
                  className="w-7 h-7 flex items-center justify-center bg-white shadow-lg text-green-600 rounded-full hover:bg-green-50 active:scale-95 transition-all border border-green-100"
                  title="Aumentar estoque"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {updatingStock && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-1" />
                )}
              </div>
            )}
          </div>
          
          {isAdmin && (
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {isEditingPrice ? (
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-xl border border-blue-100">
                  <span className="text-xs font-bold text-gray-400 ml-1">R$</span>
                  <input
                    ref={priceInputRef}
                    type="number"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                    onBlur={handlePriceUpdate}
                    onKeyDown={(e) => e.key === 'Enter' && handlePriceUpdate()}
                    className="w-20 bg-transparent text-sm font-bold text-gray-900 focus:outline-none p-0"
                    step="0.01"
                  />
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditingPrice(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1 transition-all active:scale-95"
                >
                  <span>Alterar Preço</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {images.length > 1 && (product.stock ?? 1) > 0 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-gray-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-20 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-gray-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-20 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
              {currentIdx + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      <div className="p-5">
        <Link to={`/produto/${product.id}`} className="block">
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        <p className="mt-1 text-gray-500 text-xs line-clamp-2 min-h-[32px]">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className={cn(
              "font-bold text-lg cursor-pointer hover:text-blue-600 transition-colors",
              (product.stock ?? 1) <= 0 ? "text-gray-300" : "text-gray-900"
            )}
            onClick={() => isAdmin && setIsEditingPrice(true)}
            >
              {formatCurrency(product.price)}
            </span>
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={(product.stock ?? 1) <= 0}
            className={cn(
              "p-2.5 rounded-xl transition-colors shadow-lg active:scale-95",
              (product.stock ?? 1) <= 0 
                ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                : "bg-gray-900 text-white hover:bg-blue-600"
            )}
          >
            {(product.stock ?? 1) <= 0 ? (
              <X className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
