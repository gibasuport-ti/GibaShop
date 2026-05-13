import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { ShieldCheck, MessageCircle, Mail, MapPin, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  const sendWhatsAppMessage = (name: string, total: number, items: any[]) => {
    // Definindo o número correto da GIBASHOP fornecido pelo usuário
    const phone = "5511992892455"; 
    const message = encodeURIComponent(
      `⭐ *GIBASHOP - NOVO PEDIDO* ⭐\n\n` +
      `👤 *Cliente:* ${name}\n` +
      `📞 *Contato:* ${formData.phone}\n\n` +
      `🛒 *Itens:* \n` +
      items.map(i => `• ${i.quantity}x ${i.name}`).join('\n') +
      `\n\n💰 *Total:* ${formatCurrency(total)}\n\n` +
      `📍 *Entrega:* \n` +
      `${formData.address}, ${formData.city} - ${formData.zip}\n\n` +
      `Aguardando confirmação de pagamento.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Usamos uma transação para garantir que o estoque seja atualizado E o pedido criado atomicamente
      await runTransaction(db, async (transaction) => {
        // 1. Verificar estoque de todos os itens
        const productData = [];
        for (const item of items) {
          const productRef = doc(db, 'products', item.id);
          const snap = await transaction.get(productRef);
          
          if (!snap.exists()) {
            throw new Error(`Produto ${item.name} não encontrado.`);
          }

          const currentStock = snap.data().stock || 0;
          if (currentStock < item.quantity) {
            throw new Error(`Estoque insuficiente para ${item.name}. (Disponível: ${currentStock})`);
          }
          
          productData.push({ ref: productRef, newStock: currentStock - item.quantity });
        }

        // 2. Atualizar estoques
        for (const p of productData) {
          transaction.update(p.ref, { stock: p.newStock });
        }

        // 3. Criar o pedido (Gerando ID manualmente para a transação ou usando setDoc)
        const orderRef = doc(collection(db, 'orders'));
        transaction.set(orderRef, {
          ...formData,
          items,
          total,
          status: 'pending',
          createdAt: serverTimestamp()
        });

        // Retornamos o ID do pedido para o estado
        return orderRef.id;
      }).then((newOrderId) => {
        setOrderId(newOrderId);
        sendWhatsAppMessage(formData.name, total, items);
        clearCart();
      });
    } catch (error: any) {
      console.error('Error in checkout:', error);
      alert('Erro no Checkout: ' + (error.message || 'Erro ao processar pedido.'));
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8 max-w-xl mx-auto">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Pedido Realizado!</h1>
          <p className="text-gray-500 font-light leading-relaxed">
            Parabéns, seu pedido <span className="font-bold text-gray-900">#{orderId.slice(-6).toUpperCase()}</span> foi processado. 
            Você foi redirecionado para o WhatsApp para confirmar os detalhes do pagamento e entrega.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-xl">Voltar para Início</Link>
            <a href="mailto:contato@gibashop.com.br" className="px-10 py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm">Suporte via Email</a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4 mb-12">
        <Link to="/carrinho" className="p-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Finalizar Compra</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <form onSubmit={handleCheckout} className="space-y-12">
          <section className="space-y-8">
            <div className="flex items-center space-x-3 text-blue-600">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-xl font-black uppercase tracking-widest">Informações Pessoais</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                required
                placeholder="Nome Completo"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-white rounded-2xl border border-gray-100 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
              <input
                required
                type="email"
                placeholder="Seu melhor Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-6 py-4 bg-white rounded-2xl border border-gray-100 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
              <input
                required
                type="tel"
                placeholder="WhatsApp (com DDD)"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-6 py-4 bg-white rounded-2xl border border-gray-100 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center space-x-3 text-gray-900">
              <MapPin className="w-6 h-6" />
              <h2 className="text-xl font-black uppercase tracking-widest">Endereço de Entrega</h2>
            </div>
            <div className="space-y-6">
              <input
                required
                placeholder="Endereço Completo (Rua, Número, Apto)"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-6 py-4 bg-white rounded-2xl border border-gray-100 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
              <div className="grid grid-cols-2 gap-6">
                <input
                  required
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-6 py-4 bg-white rounded-2xl border border-gray-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
                <input
                  required
                  placeholder="CEP"
                  value={formData.zip}
                  onChange={e => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full px-6 py-4 bg-white rounded-2xl border border-gray-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </section>

          <button
            disabled={loading}
            className="w-full py-6 bg-green-600 text-white rounded-3xl font-black text-xl flex items-center justify-center group hover:bg-green-700 transition-all shadow-2xl shadow-green-600/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-8 h-8" /> : (
              <>
                <MessageCircle className="w-7 h-7 mr-3 fill-white/20" />
                Finalizar via WhatsApp
              </>
            )}
          </button>
        </form>

        {/* Order Summary */}
        <div className="space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
            <h3 className="text-2xl font-black mb-8 tracking-tight">Seu Pedido</h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-gray-500 text-sm">{item.quantity}x {formatCurrency(item.price)}</p>
                  </div>
                  <div className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-gray-100 space-y-4">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium font-bold">
                <span>Entrega</span>
                <span className="text-green-600 uppercase tracking-widest text-xs">Grátis</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="text-xl font-bold text-gray-900">Total a Pagar</span>
                <span className="text-4xl font-black text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-blue-50 rounded-[32px] border border-blue-100 flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-bold text-blue-900 uppercase tracking-widest text-xs">Compra 100% Segura</h4>
              <p className="text-blue-700 text-sm font-light leading-relaxed">
                Seus dados estão protegidos por criptografia de ponta. Após finalizar, nossa equipe entrará em contato para agilizar sua entrega.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
