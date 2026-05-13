import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType, auth, signInWithGoogle } from '../lib/firebase';
import { Product } from '../types';
import { Plus, Trash, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';

export const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'celular' as const,
    stock: '10',
    imageUrl: '',
    imageUrls: [] as string[]
  });

  const fetchProducts = () => {
    setLoading(true);
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(list);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    const unsubscribeProducts = fetchProducts();
    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (file.size > 500000) {
          alert(`Imagem ${file.name} muito grande! Máximo 500KB.`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setFormData(prev => ({
            ...prev,
            imageUrl: prev.imageUrl || result, // Use first image as main
            imageUrls: [...prev.imageUrls, result]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newUrls = prev.imageUrls.filter((_, i) => i !== index);
      return {
        ...prev,
        imageUrls: newUrls,
        imageUrl: index === 0 ? (newUrls[0] || '') : prev.imageUrl
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('⚠️ Você precisa entrar com sua conta Google primeiro.');
      return;
    }

    if (!formData.name || !formData.price || !formData.imageUrl) {
      alert('⚠️ Por favor, preencha o Nome, Preço e selecione uma Imagem.');
      return;
    }

    setSaving(true);
    try {
      const sanitizedPrice = formData.price.toString().replace(',', '.');
      const priceValue = parseFloat(sanitizedPrice);
      const stockValue = parseInt(formData.stock) || 0;

      if (isNaN(priceValue)) {
        throw new Error('Preço inválido. Use números (ex: 129.90)');
      }

      const docRef = await addDoc(collection(db, 'products'), {
        name: formData.name,
        description: formData.description,
        price: priceValue,
        category: formData.category,
        stock: stockValue,
        imageUrl: formData.imageUrl,
        imageUrls: formData.imageUrls,
        createdAt: serverTimestamp(),
        authorId: user.uid,
        authorEmail: user.email
      });

      setSuccess(true);
      setFormData({ name: '', description: '', price: '', category: 'celular', stock: '10', imageUrl: '', imageUrls: [] });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteId(productId);
  };

  const cancelDelete = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setConfirmDeleteId(null);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      alert('ID do produto não encontrado.');
      return;
    }

    try {
      setSaving(true);
      await deleteDoc(doc(db, 'products', productId));
      console.log('Product deleted successfully:', productId);
      setConfirmDeleteId(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert('Erro ao excluir produto: ' + (error.message || 'Erro de permissão'));
    } finally {
      setSaving(false);
    }
  };

  const seedData = async () => {
    if (!user) {
      alert('Faça login primeiro para gerar dados de exemplo.');
      return;
    }

      const demoItems = [
        { name: 'Capa iPhone 15 Pro Carbon', description: 'Proteção premium com fibra de carbono real.', price: 129.90, category: 'celular', stock: 15, imageUrl: 'https://picsum.photos/seed/iphone/500/500' },
        { name: 'Fone Bluetooth Noise Cancelling', description: 'Cancelamento de ruído ativo e 40h de bateria.', price: 899.00, category: 'som', stock: 5, imageUrl: 'https://picsum.photos/seed/headphone/500/500' },
        { name: 'Caixa de Som Portátil 20W', description: 'Som potente e resistência à água IPX7.', price: 349.90, category: 'som', stock: 0, imageUrl: 'https://picsum.photos/seed/portable/500/500' },
        { name: 'Carregador MagSafe 15W', description: 'Carregamento rápido e magnético sem fio.', price: 199.00, category: 'celular', stock: 20, imageUrl: 'https://picsum.photos/seed/magsafe/500/500' }
      ];
    
    setSaving(true);
    try {
      for (const item of demoItems) {
        await addDoc(collection(db, 'products'), { 
          ...item, 
          createdAt: serverTimestamp(),
          authorId: user.uid,
          authorEmail: user.email
        });
      }
      alert('Dados de exemplo gerados com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Form Column */}
        <div className="w-full md:w-1/3 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Painel de Cadastro</h1>
            <p className="text-gray-500 font-light text-sm mb-6">Adicione novos produtos ao catálogo da loja.</p>
            
            {!user ? (
              <button
                onClick={signInWithGoogle}
                className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
              >
                <img src="https://www.gstatic.com/firebase/anonymous-app.png" className="w-5 h-5 grayscale opacity-50" />
                Entrar com Google para cadastrar
              </button>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl">
                <img src={user.photoURL || ''} className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-blue-900 truncate">{user.displayName}</p>
                  <button onClick={() => auth.signOut()} className="text-[10px] uppercase font-bold text-blue-600 hover:underline">Sair</button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nome do Produto</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="Ex: Capa de Silicone iPhone"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all h-24"
                  placeholder="Detalhes técnicos..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Preço (R$)</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Estoque</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="Qtd"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Categoria</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all"
                >
                    <option value="celular">Celular</option>
                    <option value="som">Áudio / Som</option>
                    <option value="informatica">Informática</option>
                    <option value="eletronicos">Eletrônicos</option>
                    <option value="utilidades">Utilidades</option>
                    <option value="diversos">Diversos</option>
                    <option value="brecho">Brechó</option>
                  </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Imagens do Produto (Máx 500KB cada)</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="relative group aspect-square bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[8px] font-bold uppercase text-center py-1">Principal</div>
                        )}
                      </div>
                    ))}
                    <div className="relative aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors flex flex-col items-center justify-center space-y-1">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-[10px] text-gray-500 font-bold uppercase text-center px-2">Adicionar Fotos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              disabled={saving || !user}
              type="submit"
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {!user ? 'Faça login primeiro' : saving ? <Loader2 className="animate-spin w-5 h-5" /> : 'Cadastrar Produto'}
            </button>
            
            {success && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center text-green-600 py-2 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" /> Produto adicionado!
              </motion.div>
            )}
          </form>

          <div className="pt-8 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Ações Rápidas</h3>
            <button
              onClick={seedData}
              disabled={saving}
              className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all text-sm mb-4"
            >
              Gerar Produtos de Exemplo
            </button>
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl text-xs text-yellow-800 leading-relaxed">
              <AlertCircle className="w-4 h-4 mb-2" />
              Certifique-se de configurar as permissões no Firestore Console para permitir escritas se o login não estiver implementado como "admin".
            </div>
          </div>
        </div>

        {/* List Column */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-gray-900">Catálogo Atual</h2>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">{products.length} itens</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(product => (
                <div key={product.id} className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-500 text-xs">{formatCurrency(product.price)} • {product.category}</p>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase",
                        (product.stock || 0) > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        Estoque: {product.stock || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {confirmDeleteId === product.id ? (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                        <button
                          type="button"
                          onClick={(e) => handleConfirmDelete(e, product.id!)}
                          disabled={saving}
                          className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-1 shadow-md"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          <span className="text-[10px] font-bold uppercase pr-1">Confirmar</span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelDelete}
                          disabled={saving}
                          className="p-2 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, product.id!)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-100 sm:opacity-40 group-hover:opacity-100 relative z-30"
                        title="Excluir Produto"
                      >
                        <Trash className="w-5 h-5 pointer-events-none" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
