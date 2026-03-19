import React, { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react';
import { Search, ShoppingCart, Trash2, Phone, ShieldCheck, Smartphone, Info, X, Check, ArrowRight, Menu, ClipboardList, Battery, Layers, Filter, Wrench, Clock, Share2, Instagram, MessageSquare, Thermometer, Droplets, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUTOS_ESTATICOS, Produto } from './data/produtos';

interface Bind {
  id: string;
  nome: string;
  categorias: string[];
}

const BINDS: Bind[] = [
  { id: 'b1', nome: 'Telas', categorias: ['TELA'] },
  { id: 'b2', nome: 'Baterias', categorias: ['BATERIA'] },
  { id: 'b3', nome: 'Conectores', categorias: ['CONECTOR'] },
  { id: 'b4', nome: 'Dock de Carga', categorias: ['DOCK'] },
  { id: 'b5', nome: 'Tampas', categorias: ['TAMPA'] },
  { id: 'b6', nome: 'Carcaças', categorias: ['CARCACA'] },
];

interface CartItem extends Produto {
  quantity: number;
  aro?: 'Com aro' | 'Sem aro';
}

interface CustomerData {
  nome: string;
  cpf: string;
  endereco: string;
  cep: string;
  telefone: string;
  modelo_aparelho: string;
}

const MARCAS = ['Todas', 'Apple', 'Samsung', 'Motorola', 'LG', 'Xiaomi', 'Redmi', 'Realme'];

const CARE_TIPS = [
  {
    title: "Evite Calor Excessivo",
    description: "Não deixe seu celular no sol ou dentro do carro em dias quentes. O calor pode danificar a bateria permanentemente.",
    icon: <Thermometer className="w-6 h-6 text-blue-600" />
  },
  {
    title: "Use Carregadores Originais",
    description: "Carregadores de baixa qualidade podem causar curtos-circuitos e viciar a bateria do seu aparelho.",
    icon: <Battery className="w-6 h-6 text-blue-600" />
  },
  {
    title: "Proteção de Tela",
    description: "Sempre use película de vidro ou cerâmica. Uma queda simples pode custar caro se a tela não estiver protegida.",
    icon: <Smartphone className="w-6 h-6 text-blue-600" />
  },
  {
    title: "Limpeza Correta",
    description: "Use apenas um pano de microfibra levemente úmido. Nunca borrife líquidos diretamente na tela ou entradas.",
    icon: <Droplets className="w-6 h-6 text-blue-600" />
  }
];

export default function App() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [selectedMarca, setSelectedMarca] = useState('Todas');
  const [selectedModelo, setSelectedModelo] = useState('');
  const deferredModelo = useDeferredValue(selectedModelo);
  const [selectedBindId, setSelectedBindId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'produtos' | 'guia'>('produtos');
  const [displayLimit, setDisplayLimit] = useState(24);
  
  // Client-side filtering logic
  const filteredProdutos = useMemo(() => {
    try {
      if (!Array.isArray(PRODUTOS_ESTATICOS)) return [];
      
      const selectedBind = selectedBindId ? BINDS.find(b => b.id === selectedBindId) : null;
      const searchTerm = (deferredSearch || '').toLowerCase().trim();
      const modeloTerm = (deferredModelo || '').toLowerCase().trim();
      
      return PRODUTOS_ESTATICOS.filter(p => {
        if (!p) return false;

        // Safety check to ensure product properties exist
        const nomeCompleto = (p.nome_completo || '').toLowerCase();
        const modeloBase = (p.modelo_base || '').toLowerCase();
        const marca = (p.marca || '').toLowerCase();

        const matchesSearch = !searchTerm || 
          nomeCompleto.includes(searchTerm) ||
          modeloBase.includes(searchTerm) ||
          marca.includes(searchTerm);
        
        const matchesModelo = !modeloTerm || modeloBase.includes(modeloTerm);
        
        const matchesMarca = selectedMarca === 'Todas' || p.marca === selectedMarca;
        
        const matchesCategoria = !selectedBind || (p.categoria && selectedBind.categorias.includes(p.categoria));
        
        return matchesSearch && matchesModelo && matchesMarca && matchesCategoria;
      });
    } catch (error) {
      console.error("Erro ao filtrar produtos:", error);
      return [];
    }
  }, [deferredSearch, deferredModelo, selectedMarca, selectedBindId]);

  // Reset display limit when filters change
  useEffect(() => {
    setDisplayLimit(24);
  }, [deferredSearch, deferredModelo, selectedMarca, selectedBindId]);

  const produtos = useMemo(() => {
    return filteredProdutos.slice(0, displayLimit);
  }, [filteredProdutos, displayLimit]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<'camamu' | 'BG'>('camamu');
  const [customer, setCustomer] = useState<CustomerData>({
    nome: '',
    cpf: '',
    endereco: '',
    cep: '',
    telefone: '',
    modelo_aparelho: ''
  });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  const addToCart = (produto: Produto, aro?: 'Com aro' | 'Sem aro') => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === produto.id && item.aro === aro
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      
      return [...prev, { ...produto, quantity: 1, aro }];
    });
  };

  const removeFromCart = (id: number, aro?: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.aro === aro)));
  };

  const handleFinalize = () => {
    if (!customer.nome || !customer.cpf || !customer.endereco || !customer.cep || !customer.telefone || !customer.modelo_aparelho) {
      alert('Por favor, preencha todos os campos do cadastro, incluindo o modelo do seu celular.');
      return;
    }

    const formatList = (items: CartItem[]) => items.map(item => {
      const details = item.aro ? ` (${item.aro})` : '';
      const tech = item.tecnologia ? ` [${item.tecnologia}]` : '';
      return `- ${item.nome_completo}${tech}${details} (x${item.quantity})`;
    }).join('\n');

    const message = `Olá, tudo bem?
Gostaria de solicitar orçamento para os seguintes serviços/produtos:

Modelo do aparelho: ${customer.modelo_aparelho}

Itens escolhidos:
${formatList(cart)}

Dados do cliente:
Nome: ${customer.nome}
CPF: ${customer.cpf}
Endereço: ${customer.endereco}
CEP: ${customer.cep}
Telefone: ${customer.telefone}

Aguardo retorno.`;

    const encodedMessage = encodeURIComponent(message);
    const baseUrl = selectedStore === 'camamu' 
      ? 'https://wa.me/5573991162549' 
      : 'https://wa.me/message/E3XSXARPSLK4G1';
    
    // For wa.me/message links, we use &text if there's already a query, but usually they are clean
    const separator = baseUrl.includes('?') ? '&' : '?';
    window.open(`${baseUrl}${separator}text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-950 p-2 rounded-xl shadow-lg shadow-blue-950/10">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter text-blue-950 uppercase leading-none">Oficina do Celular</h1>
              <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Premium Service & Parts</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => setActiveTab('produtos')} className={`text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'produtos' ? 'text-blue-950 border-b-2 border-blue-950 pb-0.5' : 'text-slate-400 hover:text-blue-950'}`}>Produtos</button>
              <button onClick={() => setActiveTab('guia')} className={`text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'guia' ? 'text-blue-950 border-b-2 border-blue-950 pb-0.5' : 'text-slate-400 hover:text-blue-950'}`}>Guia Técnico</button>
            </nav>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl transition-all flex items-center gap-3 shadow-lg shadow-blue-950/20 group"
            >
              <ClipboardList className="w-4 h-4" />
              <div className="text-left hidden sm:block">
                <p className="text-xs uppercase font-black text-blue-300 leading-none mb-0.5">Meu Pedido</p>
                <p className="text-sm font-black leading-none">Orçamento</p>
              </div>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-blue-950 text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-blue-950 shadow-lg">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white pt-8 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/40 blur-[100px] rounded-full -mr-48 -mt-48" />
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-950 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3 h-3 text-blue-400" /> Especialistas Apple & Samsung
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-blue-950 uppercase leading-[0.9]">
              Peças <br />
              <span className="text-blue-600">Originais</span>
            </h2>
            <p className="text-slate-500 text-base md:text-lg max-w-md font-medium leading-relaxed">
              Catálogo profissional de componentes com garantia técnica de 6 meses. Solicite seu orçamento online em segundos.
            </p>
            
            <div className="flex flex-row gap-3 pt-2">
              <button 
                onClick={() => {
                  const el = document.getElementById('catalogo');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 sm:flex-none px-6 py-3 bg-blue-950 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-900 transition-all shadow-lg shadow-blue-950/20 flex items-center justify-center gap-2 group"
              >
                Catálogo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setActiveTab('guia')}
                className="flex-1 sm:flex-none px-6 py-3 bg-white text-blue-950 border-2 border-blue-950 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                Guia <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative hidden md:block"
          >
            <div className="relative bg-slate-50 rounded-[2.5rem] p-6 aspect-square flex items-center justify-center overflow-hidden border border-slate-100">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
              <Smartphone className="w-32 h-32 text-blue-950/5 absolute -bottom-6 -right-6 rotate-12" />
              <div className="relative z-10 space-y-4 w-full">
                <div className="bg-white p-4 rounded-2xl shadow-lg shadow-blue-950/5 border border-slate-50 flex items-center gap-3 translate-x-3">
                  <div className="bg-blue-950 p-2 rounded-lg text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-0.5">Garantia</p>
                    <p className="text-base font-black text-blue-950 uppercase tracking-tight">6 Meses</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg shadow-blue-950/5 border border-slate-50 flex items-center gap-3 -translate-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-0.5">Entrega</p>
                    <p className="text-base font-black text-blue-950 uppercase tracking-tight">Rápida Camamu/Barra Grande</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg shadow-blue-950/5 border border-slate-50 flex items-center gap-3 translate-x-6">
                  <div className="bg-blue-950 p-2 rounded-lg text-white">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-0.5">Qualidade</p>
                    <p className="text-base font-black text-blue-950 uppercase tracking-tight">Peças Premium</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 -mt-6 relative z-20 pb-16" id="catalogo">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Sidebar / Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-[1.5rem] p-4 shadow-xl shadow-blue-950/5 border border-slate-100 sticky top-20">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="bg-blue-950 p-2 rounded-lg text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-blue-950 uppercase tracking-tighter">Garantia</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-0.5">Prazo Oficial</p>
                  <p className="text-blue-950 font-black text-lg uppercase tracking-tight">6 Meses</p>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <p className="text-blue-950 text-xs font-black uppercase tracking-[0.2em]">Atendimento</p>
                  </div>
                  <div className="space-y-1 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    <p>Seg a Sex: 08:00 às 18:00</p>
                    <p className="text-blue-600">Sábado: 08:00 às 14:00</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-blue-950 text-xs font-black uppercase tracking-[0.2em] mb-2">Termos:</p>
                  <ul className="space-y-2">
                    {[
                      'Quebras',
                      'Mau uso',
                      'Molhado',
                      'Selo'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <X className="w-2.5 h-2.5 text-slate-300" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => setShowInfoModal(true)}
                  className="w-full mt-2 py-2.5 bg-slate-50 text-blue-950 rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center justify-center gap-2 border border-slate-100"
                >
                  <Info className="w-3 h-3 text-blue-600" /> Info
                </button>

                <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="flex flex-col gap-2">
                    <a 
                      href="https://wa.me/5573991162549"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-2.5 bg-blue-950 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg shadow-blue-950/10"
                    >
                      <Phone className="w-2.5 h-2.5" /> Camamu
                    </a>
                    <a 
                      href="https://wa.me/message/E3XSXARPSLK4G1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-2.5 bg-white text-blue-950 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all border-2 border-blue-950"
                    >
                      <Phone className="w-2.5 h-2.5" /> Barra Grande
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="md:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="flex gap-3 border-b border-slate-100 pb-3">
              <button 
                onClick={() => setActiveTab('produtos')}
                className={`px-6 py-2.5 rounded-lg text-sm font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === 'produtos' 
                  ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/20' 
                  : 'text-slate-400 hover:text-blue-950 hover:bg-slate-50'
                }`}
              >
                Catálogo
              </button>
              <button 
                onClick={() => setActiveTab('guia')}
                className={`px-6 py-2.5 rounded-lg text-sm font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === 'guia' 
                  ? 'bg-blue-950 text-white shadow-lg shadow-blue-950/20' 
                  : 'text-slate-400 hover:text-blue-950 hover:bg-slate-50'
                }`}
              >
                Guia
              </button>
            </div>

            {activeTab === 'produtos' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Filters Section */}
                <div className="bg-white rounded-[1.5rem] p-6 shadow-xl shadow-blue-950/5 border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar produto..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                      />
                    </div>

                    {/* Brand Filter */}
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={selectedMarca}
                        onChange={(e) => setSelectedMarca(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 appearance-none text-sm"
                      >
                        {MARCAS.map(marca => (
                          <option key={marca} value={marca}>{marca}</option>
                        ))}
                      </select>
                    </div>

                    {/* Phone Model Filter */}
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Modelo do aparelho (ex: iPhone 13)"
                        value={selectedModelo}
                        onChange={(e) => setSelectedModelo(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Binds Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
                        <Layers className="w-3 h-3 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-black text-blue-950 uppercase tracking-tighter">Categorias</h3>
                    </div>
                    {selectedBindId && (
                      <button 
                        onClick={() => setSelectedBindId(null)}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                      >
                        Ver Tudo
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {BINDS.map((bind) => (
                      <button
                        key={bind.id}
                        onClick={() => setSelectedBindId(bind.id)}
                        className={`p-2.5 rounded-xl text-center transition-all group relative overflow-hidden border-2 ${
                          selectedBindId === bind.id 
                            ? 'bg-blue-950 border-blue-950 text-white shadow-lg scale-[1.02]' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-950 hover:text-blue-950'
                        }`}
                      >
                        <p className="text-[9px] font-black uppercase tracking-[0.1em] mb-0.5 opacity-50">Peças</p>
                        <h4 className="text-[11px] font-black leading-tight uppercase tracking-tight">{bind.nome}</h4>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
                      <Filter className="w-3 h-3 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-black text-blue-950 uppercase tracking-tighter">
                      {selectedMarca !== 'Todas' ? `${selectedMarca}` : 'Catálogo Geral'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {filteredProdutos.length} Itens
                  </span>
                </div>

                {filteredProdutos.length === 0 ? (
                  <div className="py-16 text-center space-y-4 bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-slate-200">
                    <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <Search className="w-5 h-5 text-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-blue-950 font-black uppercase tracking-widest text-xs">Nenhum item encontrado</p>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tente outros filtros</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {produtos.map((p) => (
                      <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white border border-slate-100 rounded-[1.25rem] p-3.5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
                          {p.categoria === 'TELA' ? <Layers className="w-12 h-12" /> : 
                           p.categoria === 'BATERIA' ? <Battery className="w-12 h-12" /> : 
                           <Smartphone className="w-12 h-12" />}
                        </div>

                        <div className="flex justify-between items-start mb-3">
                          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em] ${
                            p.marca === 'Apple' ? 'bg-blue-950 text-white' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {p.marca}
                          </div>
                          {p.nivel_dificuldade && (
                            <div className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest ${
                              p.nivel_dificuldade === 'Alto' ? 'text-red-500' :
                              p.nivel_dificuldade === 'Médio' ? 'text-amber-500' :
                              'text-blue-600'
                            }`}>
                              <div className={`w-1 h-1 rounded-full ${
                                p.nivel_dificuldade === 'Alto' ? 'bg-red-500' :
                                p.nivel_dificuldade === 'Médio' ? 'bg-amber-500' :
                                'bg-blue-600'
                              }`} />
                              {p.nivel_dificuldade}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <h4 className="font-black text-sm text-blue-950 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.nome_completo}</h4>
                          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{p.modelo_base}</p>

                          {p.exige_remocao_tela === 1 && (
                            <div className="mt-2 flex items-start gap-1 text-red-500 bg-red-50 p-1 rounded-md border border-red-100">
                              <Info className="w-2.5 h-2.5 shrink-0" />
                              <p className="text-[8px] font-black leading-tight uppercase tracking-tight">
                                Requer abertura frontal
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Cotação</p>
                            <p className="text-[10px] font-black text-blue-950 uppercase tracking-tight">Sob Consulta</p>
                          </div>
                          <button 
                            onClick={() => addToCart(p)}
                            className="bg-blue-950 text-white p-2 rounded-lg hover:bg-blue-600 transition-all active:scale-90 shadow-md shadow-blue-950/10"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {filteredProdutos.length > displayLimit && (
                  <div className="flex justify-center pt-8">
                    <button 
                      onClick={() => setDisplayLimit(prev => prev + 24)}
                      className="bg-blue-950 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-950/20 hover:bg-blue-900 transition-all flex items-center gap-3"
                    >
                      Carregar Mais <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'guia' && (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Care Tips Section */}
                <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl shadow-blue-950/5 border border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Lightbulb className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-blue-950 uppercase tracking-tighter">Dicas de Cuidados</h3>
                      <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.2em]">Aumente a vida útil do seu celular</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {CARE_TIPS.map((tip, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ y: -3 }}
                        className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex gap-6"
                      >
                        <div className="shrink-0 mt-1">{tip.icon}</div>
                        <div>
                          <h4 className="font-black text-blue-950 mb-2 uppercase tracking-tight text-lg">{tip.title}</h4>
                          <p className="text-slate-500 text-sm leading-relaxed font-medium">{tip.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl shadow-blue-950/5 border border-slate-100"
                >
                  <div className="space-y-12">
                    <div>
                      <h3 className="text-3xl font-black text-blue-950 mb-8 flex items-center gap-3 uppercase tracking-tighter">
                        <Smartphone className="w-6 h-6 text-blue-600" /> Tecnologias de Display
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-blue-950 rounded-[1.5rem] text-white">
                          <div className="flex items-center gap-3 text-blue-300 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/20" /> Tela OLED
                          </div>
                          <p className="text-blue-50/80 text-sm leading-relaxed font-medium">
                            A tecnologia OLED (Organic Light-Emitting Diode) oferece a melhor qualidade de imagem. Cada pixel emite sua própria luz, resultando em pretos perfeitos, cores vibrantes e menor consumo de energia. É a tela padrão para modelos Premium.
                          </p>
                        </div>
                        <div className="p-8 bg-blue-50 rounded-[1.5rem] border border-blue-100">
                          <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                            <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-600/20" /> Tela INCELL
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            As telas INCELL integram os sensores de toque diretamente no painel LCD. Isso as torna mais finas e leves que as telas LCD tradicionais, oferecendo uma excelente resposta ao toque e cores fiéis com um custo muito mais acessível.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div>
                      <h3 className="text-3xl font-black text-blue-950 mb-8 flex items-center gap-3 uppercase tracking-tighter">
                        <Layers className="w-6 h-6 text-blue-600" /> Tipos de Montagem
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-blue-950 rounded-[1.5rem] text-white">
                          <div className="flex items-center gap-3 text-blue-300 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/20" /> Com Aro (Frame)
                          </div>
                          <p className="text-blue-50/80 text-sm leading-relaxed font-medium">
                            A tela já vem montada na moldura lateral do aparelho. A instalação é muito mais rápida, segura e o acabamento fica idêntico ao original de fábrica, pois não requer colagem manual da tela no chassi.
                          </p>
                        </div>
                        <div className="p-8 bg-blue-50 rounded-[1.5rem] border border-blue-100">
                          <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                            <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-600/20" /> Sem Aro
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            É apenas o painel frontal (vidro + display). Requer que o técnico remova a tela antiga da moldura original e cole a nova. É uma opção mais econômica, porém exige mais tempo e cuidado na mão de obra.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-blue-950/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-3xl font-black text-blue-950 flex items-center gap-2 uppercase tracking-tight">
                    <ClipboardList className="w-6 h-6 text-blue-600" /> Meu Pedido
                  </h3>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Orçamento Pendente</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-slate-300" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-6 text-center">
                    <div className="bg-slate-50 p-10 rounded-[3rem]">
                      <ClipboardList className="w-16 h-16 opacity-10" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-black text-slate-900 uppercase tracking-widest text-base">Sua lista está vazia</p>
                      <p className="text-sm font-medium text-slate-400">Adicione peças para solicitar um orçamento.</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={`${item.id}-${item.aro}-${idx}`} className="flex gap-5 p-6 bg-white rounded-[2rem] relative group border border-slate-200 shadow-sm hover:shadow-md transition-all">
                      <div className={`p-4 rounded-2xl h-fit ${
                        item.categoria === 'TELA' ? 'bg-blue-950 text-white' : 
                        'bg-blue-50 text-blue-950'
                      }`}>
                        {item.categoria === 'TELA' ? <Layers className="w-6 h-6" /> : 
                         item.categoria === 'BATERIA' ? <Battery className="w-6 h-6" /> : 
                         <Wrench className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-blue-950 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight text-base">{item.nome_completo}</h4>
                        {item.aro && <p className="text-[11px] font-black text-blue-600 uppercase mt-1 tracking-widest">{item.aro}</p>}
                        <p className="text-xs text-slate-400 font-bold mt-3 uppercase tracking-widest">Quantidade: {item.quantity}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.aro)}
                        className="text-slate-300 p-2 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-start"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 border-t border-slate-100 bg-white">
                <button 
                  disabled={cart.length === 0}
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-5 bg-blue-950 text-white rounded-2xl font-black text-base uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-blue-950/10"
                >
                  Solicitar Orçamento <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-blue-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-200"
            >
              <div className="p-6 md:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-blue-950 tracking-tight uppercase">Seus Dados</h3>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Preencha para receber o orçamento oficial.</p>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-300" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Selecione a Loja para Orçamento</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setSelectedStore('camamu')}
                        className={`p-4 rounded-[1.5rem] border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${
                          selectedStore === 'camamu' 
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/5' 
                          : 'border-slate-100 text-slate-500 hover:border-blue-200'
                        }`}
                      >
                        <span className="font-black uppercase tracking-tight text-sm">Camamu</span>
                        <span className="text-[9px] font-bold leading-tight opacity-70 uppercase tracking-widest">
                          RUA DJALMA DUTRA, CENTRO<br/>CEP 45445-000
                        </span>
                      </button>
                      <button 
                        onClick={() => setSelectedStore('BG')}
                        className={`p-4 rounded-[1.5rem] border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${
                          selectedStore === 'BG' 
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/5' 
                          : 'border-slate-100 text-slate-500 hover:border-blue-200'
                        }`}
                      >
                        <span className="font-black uppercase tracking-tight text-sm">Barra Grande</span>
                        <span className="text-[9px] font-bold leading-tight opacity-70 uppercase tracking-widest">
                          RUA MARAU<br/>CEP 45520-000
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Modelo do seu Celular (Obrigatório)</label>
                    <input 
                      type="text"
                      value={customer.modelo_aparelho}
                      onChange={(e) => setCustomer({...customer, modelo_aparelho: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 text-base"
                      placeholder="Ex: iPhone 11, Galaxy A12..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                    <input 
                      type="text"
                      value={customer.nome}
                      onChange={(e) => setCustomer({...customer, nome: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 text-base"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">CPF</label>
                    <input 
                      type="text"
                      value={customer.cpf}
                      onChange={(e) => setCustomer({...customer, cpf: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 text-base"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Endereço Completo</label>
                    <input 
                      type="text"
                      value={customer.endereco}
                      onChange={(e) => setCustomer({...customer, endereco: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 text-base"
                      placeholder="Rua, número, bairro..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">CEP</label>
                    <input 
                      type="text"
                      value={customer.cep}
                      onChange={(e) => setCustomer({...customer, cep: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 text-base"
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone</label>
                    <input 
                      type="text"
                      value={customer.telefone}
                      onChange={(e) => setCustomer({...customer, telefone: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 text-base"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="mt-10">
                  <button 
                    onClick={handleFinalize}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-base uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95"
                  >
                    Enviar Orçamento <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoModal(false)}
              className="absolute inset-0 bg-blue-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-black text-blue-950 tracking-tight uppercase">Tipos de Telas</h3>
                  <button onClick={() => setShowInfoModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-300" />
                  </button>
                </div>

                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-blue-950 font-black uppercase tracking-[0.2em] text-[10px]">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-950 shadow-lg shadow-blue-950/20" /> Tela OLED
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Alta fidelidade de cores e brilho. Tecnologia de ponta com pixels auto-iluminados. Qualidade Premium.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px]">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-lg shadow-blue-600/20" /> Tela INCELL
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Excelente custo-benefício. Tecnologia que integra o touch ao LCD. Ideal para reparos econômicos.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-blue-950 font-black uppercase tracking-[0.2em] text-[10px]">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-950 shadow-lg shadow-blue-950/20" /> Com Aro
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Moldura inclusa. Instalação profissional mais rápida e segura. Acabamento de fábrica.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/20" /> Sem Aro
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Apenas o display. Requer reaproveitamento da moldura original. Opção mais barata.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowInfoModal(false)}
                  className="w-full mt-10 py-4 bg-blue-950 text-white rounded-xl font-black text-base hover:bg-blue-600 transition-all uppercase tracking-widest"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-950 p-2 rounded-xl">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-blue-950 uppercase tracking-tighter text-xl">Oficina do Celular</span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                Referência em assistência técnica e peças premium para dispositivos móveis. Qualidade e confiança em cada reparo.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-blue-950 uppercase tracking-[0.2em] text-[10px]">Unidades Oficiais</h4>
              <div className="space-y-4">
                <div>
                  <p className="font-black text-blue-600 text-[10px] uppercase mb-1 tracking-widest">Camamu</p>
                  <p className="text-slate-500 text-[11px] font-bold leading-relaxed uppercase tracking-tight">
                    RUA DJALMA DUTRA, CENTRO<br/>CEP 45445-000 - CAMAMU-BA
                  </p>
                </div>
                <div>
                  <p className="font-black text-blue-600 text-[10px] uppercase mb-1 tracking-widest">Barra Grande</p>
                  <p className="text-slate-500 text-[11px] font-bold leading-relaxed uppercase tracking-tight">
                    RUA MARAU - CEP 45520-000<br/>MARAÚ - BA
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-blue-950 uppercase tracking-[0.2em] text-[10px]">Compartilhar</h4>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const url = window.location.href;
                    const text = "Confira o catálogo da Oficina do Celular! Peças e orçamentos online:";
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
                  }}
                  className="bg-blue-950 text-white p-3 rounded-xl shadow-lg shadow-blue-950/10 hover:bg-blue-900 transition-all flex items-center justify-center"
                  title="WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copiado!');
                  }}
                  className="bg-slate-50 text-blue-950 p-3 rounded-xl shadow-lg shadow-blue-950/5 hover:bg-slate-100 transition-all flex items-center justify-center border border-slate-100"
                  title="Copiar Link"
                >
                  <ClipboardList className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-blue-950 uppercase tracking-[0.2em] text-[10px]">Social</h4>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/oficinadocelular073?igsh=MWhscmNlbGlpMGplbQ==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-blue-950 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-50 flex flex-col items-center gap-4">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] text-center">
              © 2024 Oficina do Celular. Todos os direitos reservados.
            </p>
            <div className="flex flex-col items-center gap-1">
              <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                Desenvolvido por Victor Santos Bomfim
              </p>
              <p className="text-slate-200 text-[9px] font-bold uppercase tracking-widest">
                Contato: 73 98108-6087
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
