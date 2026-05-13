import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Mail, Menu, X, Smartphone, Speaker } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

export const Navbar = () => {
  const { items } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Celulares', path: '/catalogo?cat=celular' },
    { name: 'Informatica', path: '/catalogo?cat=informatica' },
    { name: 'Eletrônicos', path: '/catalogo?cat=eletronicos' },
    { name: 'Som', path: '/catalogo?cat=som' },
    { name: 'Brechó', path: '/catalogo?cat=brecho' },
    { name: 'Sobre', path: '/sobre' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-black p-1.5 rounded-lg">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">GIBA<span className="text-blue-600">SHOP</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600",
                  location.pathname === link.path ? "text-blue-600" : "text-gray-600"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/carrinho" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {items.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Smartphone className="w-8 h-8" />
              <span className="font-bold text-2xl tracking-tight">GIBASHOP</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sua loja especializada em acessórios premium para celulares e aparelhos de som. Qualidade e tecnologia ao seu alcance.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider text-blue-400">Categorias</h3>
            <ul className="grid grid-cols-1 gap-y-3 gap-x-8 text-gray-400">
              <li><Link to="/catalogo?cat=celular" className="hover:text-white transition-colors">Celulares</Link></li>
              <li><Link to="/catalogo?cat=informatica" className="hover:text-white transition-colors">Informática</Link></li>
              <li><Link to="/catalogo?cat=eletronicos" className="hover:text-white transition-colors">Eletrônicos</Link></li>
              <li><Link to="/catalogo?cat=som" className="hover:text-white transition-colors">Áudio & Som</Link></li>
              <li><Link to="/catalogo?cat=utilidades" className="hover:text-white transition-colors">Utilidades</Link></li>
              <li><Link to="/catalogo?cat=brecho" className="hover:text-white transition-colors">Brechó</Link></li>
              <li><Link to="/catalogo" className="hover:text-white transition-colors">Todos os Produtos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider text-blue-400">Suporte</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/sobre" className="hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6 uppercase tracking-wider text-blue-400">Contato</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <a href="mailto:contato@gibashop.com.br" className="hover:text-white transition-colors">contato@gibashop.com.br</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} GIBASHOP Acessórios. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
