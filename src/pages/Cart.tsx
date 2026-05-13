import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

export const Cart = () => {
  const { items, total, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Seu carrinho está vazio</h1>
        <p className="text-gray-500 font-light mb-12 max-w-md mx-auto">
          Parece que você ainda não adicionou nenhum acessório. Comece a explorar nosso catálogo agora!
        </p>
        <Link
          to="/catalogo"
          className="inline-flex items-center justify-center px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
        >
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4 mb-12">
        <Link to="/catalogo" className="p-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Meu Carrinho</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <motion.div
              layout
              key={item.id}
              className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-8 group"
            >
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-xl text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-1">{item.description}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Subtotal</p>
                <p className="text-2xl font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 text-white rounded-[40px] p-10 sticky top-24 overflow-hidden border border-gray-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full -mr-16 -mt-16" />
            
            <h2 className="text-2xl font-black mb-10 tracking-tight flex items-center">Resumo do Pedido</h2>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-gray-400 text-lg">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-lg">
                <span>Entrega</span>
                <span className="text-green-400 font-bold uppercase tracking-widest text-sm">Grátis</span>
              </div>
              <div className="pt-6 border-t border-gray-800 flex justify-between items-end">
                <span className="text-lg font-bold">Total</span>
                <span className="text-4xl font-black text-white">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-6 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center group hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20"
            >
              Finalizar Pedido
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
