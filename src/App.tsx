import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { Search, ShoppingCart, Trash2, Phone, ShieldCheck, Smartphone, Info, X, Check, ArrowRight, Menu, ClipboardList, Battery, Layers, Filter, Wrench, Clock } from 'lucide-react';
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

export default function App() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [selectedMarca, setSelectedMarca] = useState('Todas');
  const [selectedBindId, setSelectedBindId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'produtos' | 'guia'>('produtos');
  const [displayLimit, setDisplayLimit] = useState(24);
  
  // Client-side filtering logic
  const filteredProdutos = useMemo(() => {
    try {
      if (!Array.isArray(PRODUTOS_ESTATICOS)) return [];
      
      const selectedBind = selectedBindId ? BINDS.find(b => b.id === selectedBindId) : null;
      const searchTerm = (deferredSearch || '').toLowerCase().trim();
      
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
        
        const matchesMarca = selectedMarca === 'Todas' || p.marca === selectedMarca;
        
        const matchesCategoria = !selectedBind || (p.categoria && selectedBind.categorias.includes(p.categoria));
        
        return matchesSearch && matchesMarca && matchesCategoria;
      });
    } catch (error) {
      console.error("Erro ao filtrar produtos:", error);
      return [];
    }
  }, [deferredSearch, selectedMarca, selectedBindId]);

  // Reset display limit when filters change
  useEffect(() => {
    setDisplayLimit(24);
  }, [deferredSearch, selectedMarca, selectedBindId]);

  const produtos = useMemo(() => {
    return filteredProdutos.slice(0, displayLimit);
  }, [filteredProdutos, displayLimit]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<'camamu' | 'barra_grande'>('camamu');
  const [customer, setCustomer] = useState<CustomerData>({
    nome: '',
    cpf: '',
    endereco: '',
    cep: '',
    telefone: '',
    modelo_aparelho: ''
  });
  const [showInfoModal, setShowInfoModal] = useState(false);
  
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
      <header className="sticky top-0 z-40 bg-blue-950 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Oficina do Celular</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all flex items-center gap-2 md:gap-3 border border-white/20"
            >
              <ClipboardList className="w-5 h-5 md:w-6 h-6 text-blue-400" />
              <div className="text-left">
                <p className="text-[8px] md:text-[10px] uppercase font-bold text-blue-400 leading-none mb-1">Meu Pedido</p>
                <p className="text-[10px] md:text-sm font-bold leading-none">Orçamento</p>
              </div>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-black w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full border-2 border-blue-950 shadow-lg">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Search Section */}
      <section className="bg-blue-950 text-white pt-12 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/5 blur-[100px] rounded-full -ml-48 -mb-48" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">
              O Maior Catálogo de <br />
              <span className="text-blue-500">Telas e Baterias</span>
            </h2>
            <p className="text-blue-200/80 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Encontre peças para Apple, Samsung, Motorola e LG. <br className="hidden md:block" />
              Qualidade e confiança com entrega rápida.
            </p>
          </motion.div>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Pesquise por modelo (ex: iPhone 13, Galaxy S23...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white text-slate-900 shadow-2xl focus:ring-8 focus:ring-blue-500/10 outline-none transition-all text-xl font-medium placeholder:text-slate-300"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {MARCAS.map((marca) => (
                <button
                  key={marca}
                  onClick={() => setSelectedMarca(marca)}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                    selectedMarca === marca 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' 
                    : 'bg-white/5 border-white/10 text-blue-200 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {marca}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar / Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 sticky top-24">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-950 p-3 rounded-2xl text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-blue-950">Garantia</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Prazo</p>
                  <p className="text-slate-700 font-bold">6 Meses de Garantia Técnica</p>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-blue-950 text-[10px] font-black uppercase tracking-widest">Horário</p>
                  </div>
                  <div className="space-y-1 text-xs font-bold text-slate-600">
                    <p>Seg a Sex: 08:00 às 18:00</p>
                    <p className="text-blue-600">Sábado: 08:00 às 14:00</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-3">Não cobrimos:</p>
                  <ul className="space-y-3">
                    {[
                      'Quebras ou trincas',
                      'Danos por mau uso',
                      'Aparelhos molhados',
                      'Selo de garantia rompido'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <X className="w-3 h-3 text-red-400" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => setShowInfoModal(true)}
                  className="w-full mt-4 py-4 bg-slate-50 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Info className="w-4 h-4" /> Tipos de Telas
                </button>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-100 pb-4">
              <button 
                onClick={() => setActiveTab('produtos')}
                className={`px-6 py-3 rounded-2xl text-sm font-black transition-all ${
                  activeTab === 'produtos' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                Produtos
              </button>
              <button 
                onClick={() => setActiveTab('guia')}
                className={`px-6 py-3 rounded-2xl text-sm font-black transition-all ${
                  activeTab === 'guia' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                Guia Técnico
              </button>
            </div>

            {activeTab === 'produtos' ? (
              <>
                {/* Binds Section */}
                <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-blue-500" />
                  <h3 className="text-2xl font-black text-blue-950">Filtros Rápidos</h3>
                </div>
                {selectedBindId && (
                  <button 
                    onClick={() => setSelectedBindId(null)}
                    className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline"
                  >
                    Limpar Filtro
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {BINDS.map((bind) => (
                  <button
                    key={bind.id}
                    onClick={() => setSelectedBindId(bind.id)}
                    className={`p-6 rounded-[2rem] text-left transition-all group relative overflow-hidden ${
                      selectedBindId === bind.id 
                        ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' 
                        : 'bg-blue-900 text-white hover:shadow-2xl hover:-translate-y-1'
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                      <Layers className="w-12 h-12" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Categoria</p>
                    <h4 className="text-sm font-black leading-tight mb-2">{bind.nome}</h4>
                    <div className={`flex items-center gap-2 text-[10px] font-bold w-fit px-3 py-1 rounded-full ${
                      selectedBindId === bind.id ? 'bg-white/20' : 'bg-white/10'
                    }`}>
                      {selectedBindId === bind.id ? 'Selecionado' : 'Visualizar'} <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="text-2xl font-black text-blue-950">
                  {selectedMarca !== 'Todas' ? `${selectedMarca}` : 'Catálogo Geral'}
                </h3>
              </div>
              <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold">
                {filteredProdutos.length} itens encontrados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {produtos.map((p) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group"
                >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${
                        p.categoria === 'TELA' ? 'bg-blue-50 text-blue-600' : 
                        p.categoria === 'BATERIA' ? 'bg-amber-50 text-amber-600' : 
                        p.categoria === 'CONECTOR' || p.categoria === 'DOCK' ? 'bg-emerald-50 text-emerald-600' :
                        p.categoria === 'TAMPA' ? 'bg-rose-50 text-rose-600' :
                        p.categoria === 'CARCACA' ? 'bg-slate-50 text-slate-600' :
                        'bg-blue-50 text-blue-900'
                      }`}>
                        {p.categoria === 'TELA' ? <Layers className="w-6 h-6" /> : 
                         p.categoria === 'BATERIA' ? <Battery className="w-6 h-6" /> : 
                         p.categoria === 'CONECTOR' || p.categoria === 'DOCK' ? <Wrench className="w-6 h-6" /> :
                         p.categoria === 'TAMPA' ? <ShieldCheck className="w-6 h-6" /> :
                         p.categoria === 'CARCACA' ? <Smartphone className="w-6 h-6" /> :
                         <Wrench className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-blue-400 transition-colors">
                          {p.marca}
                        </span>
                        {p.nivel_dificuldade && (
                          <span className={`text-[8px] font-black uppercase mt-1 px-2 py-0.5 rounded-full ${
                            p.nivel_dificuldade === 'Alto' ? 'bg-red-100 text-red-600' :
                            p.nivel_dificuldade === 'Médio' ? 'bg-amber-100 text-amber-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            Dificuldade: {p.nivel_dificuldade}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-black text-lg text-blue-950 mb-1 leading-tight">{p.nome_completo}</h4>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter mb-4">{p.modelo_base}</p>

                      {p.exige_remocao_tela === 1 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                          <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] font-bold text-red-600 leading-tight">
                            ⚠ Para este modelo é necessário remover a tela para realizar o serviço.
                          </p>
                        </div>
                      )}
                      
                      {p.categoria === 'TELA' && p.tecnologia && (
                        <div className="flex gap-2 mb-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${p.tecnologia === 'OLED' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {p.tecnologia}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Orçamento</p>
                        <p className="text-sm font-black text-blue-900 italic">Sob Consulta</p>
                      </div>
                      <button 
                        onClick={() => addToCart(p)}
                        className="bg-blue-950 text-white p-4 rounded-2xl hover:bg-blue-600 transition-all active:scale-90 shadow-lg shadow-blue-950/10"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>

            {filteredProdutos.length > displayLimit && (
              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setDisplayLimit(prev => prev + 24)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  Carregar mais produtos <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {filteredProdutos.length === 0 && (
              <div className="py-24 text-center space-y-4">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold">Nenhum item encontrado para sua busca.</p>
              </div>
            )}
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-xl border border-slate-100"
              >
                <div className="space-y-12">
                  <div>
                    <h3 className="text-2xl font-black text-blue-950 mb-6 flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-blue-600" /> Tecnologias de Display
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 bg-purple-50 rounded-3xl border border-purple-100">
                        <div className="flex items-center gap-3 text-purple-600 font-black uppercase tracking-widest text-xs mb-4">
                          <div className="w-3 h-3 rounded-full bg-purple-600 shadow-lg shadow-purple-600/20" /> Tela OLED
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                          A tecnologia OLED (Organic Light-Emitting Diode) oferece a melhor qualidade de imagem. Cada pixel emite sua própria luz, resultando em pretos perfeitos, cores vibrantes e menor consumo de energia. É a tela padrão para modelos Premium.
                        </p>
                      </div>
                      <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100">
                        <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-widest text-xs mb-4">
                          <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-600/20" /> Tela INCELL
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                          As telas INCELL integram os sensores de toque diretamente no painel LCD. Isso as torna mais finas e leves que as telas LCD tradicionais, oferecendo uma excelente resposta ao toque e cores fiéis com um custo muito mais acessível.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div>
                    <h3 className="text-2xl font-black text-blue-950 mb-6 flex items-center gap-3">
                      <Layers className="w-6 h-6 text-blue-600" /> Tipos de Montagem
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-xs mb-4">
                          <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-lg shadow-emerald-600/20" /> Com Aro (Frame)
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                          A tela já vem montada na moldura lateral do aparelho. A instalação é muito mais rápida, segura e o acabamento fica idêntico ao original de fábrica, pois não requer colagem manual da tela no chassi.
                        </p>
                      </div>
                      <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100">
                        <div className="flex items-center gap-3 text-amber-600 font-black uppercase tracking-widest text-xs mb-4">
                          <div className="w-3 h-3 rounded-full bg-amber-600 shadow-lg shadow-amber-600/20" /> Sem Aro
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                          É apenas o painel frontal (vidro + display). Requer que o técnico remova a tela antiga da moldura original e cole a nova. É uma opção mais econômica, porém exige mais tempo e cuidado na mão de obra.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
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
              <div className="p-8 border-b flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-2xl font-black text-blue-950 flex items-center gap-2">
                    <ClipboardList className="w-6 h-6 text-blue-600" /> Meu Pedido
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Orçamento Pendente</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 text-center">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem]">
                      <ClipboardList className="w-16 h-16 opacity-20" />
                    </div>
                    <p className="font-bold">Sua lista está vazia.<br/><span className="text-sm font-normal">Adicione peças para orçar.</span></p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={`${item.id}-${item.aro}-${idx}`} className="flex gap-5 p-6 bg-slate-50 rounded-3xl relative group border border-slate-100">
                      <div className={`p-3 rounded-2xl h-fit ${
                        item.categoria === 'TELA' ? 'bg-blue-100 text-blue-600' : 
                        item.categoria === 'BATERIA' ? 'bg-amber-100 text-amber-600' : 
                        item.categoria === 'CONECTOR' || item.categoria === 'DOCK' ? 'bg-emerald-100 text-emerald-600' :
                        item.categoria === 'TAMPA' ? 'bg-rose-100 text-rose-600' :
                        item.categoria === 'CARCACA' ? 'bg-slate-100 text-slate-600' :
                        'bg-blue-100 text-blue-900'
                      }`}>
                        {item.categoria === 'TELA' ? <Layers className="w-5 h-5" /> : 
                         item.categoria === 'BATERIA' ? <Battery className="w-5 h-5" /> : 
                         item.categoria === 'CONECTOR' || item.categoria === 'DOCK' ? <Wrench className="w-5 h-5" /> :
                         item.categoria === 'TAMPA' ? <ShieldCheck className="w-5 h-5" /> :
                         item.categoria === 'CARCACA' ? <Smartphone className="w-5 h-5" /> :
                         <Wrench className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-blue-950 leading-tight">{item.nome_completo}</h4>
                        {item.aro && <p className="text-xs font-black text-blue-600 uppercase mt-1">{item.aro}</p>}
                        <p className="text-xs text-slate-400 font-bold mt-2">Quantidade: {item.quantity}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.aro)}
                        className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors self-start"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 border-t bg-slate-50">
                <button 
                  disabled={cart.length === 0}
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-5 bg-blue-950 text-white rounded-[1.5rem] font-black text-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-blue-950/20"
                >
                  Solicitar Orçamento <ArrowRight className="w-6 h-6" />
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
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-14">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-4xl font-black text-blue-950 tracking-tight">Seus Dados</h3>
                    <p className="text-slate-500 mt-2">Preencha para receber o orçamento oficial.</p>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                    <X className="w-6 h-6 text-slate-300" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Selecione a Loja para Orçamento</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setSelectedStore('camamu')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                          selectedStore === 'camamu' 
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' 
                          : 'border-slate-100 text-slate-500 hover:border-blue-200'
                        }`}
                      >
                        <span className="font-black uppercase tracking-tighter">Camamu</span>
                      </button>
                      <button 
                        onClick={() => setSelectedStore('barra_grande')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                          selectedStore === 'barra_grande' 
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' 
                          : 'border-slate-100 text-slate-500 hover:border-blue-200'
                        }`}
                      >
                        <span className="font-black uppercase tracking-tighter">Barra Grande</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Modelo do seu Celular (Obrigatório)</label>
                    <input 
                      type="text"
                      value={customer.modelo_aparelho}
                      onChange={(e) => setCustomer({...customer, modelo_aparelho: e.target.value})}
                      className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                      placeholder="Ex: iPhone 11, Galaxy A12..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                    <input 
                      type="text"
                      value={customer.nome}
                      onChange={(e) => setCustomer({...customer, nome: e.target.value})}
                      className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CPF</label>
                    <input 
                      type="text"
                      value={customer.cpf}
                      onChange={(e) => setCustomer({...customer, cpf: e.target.value})}
                      className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Endereço Completo</label>
                    <input 
                      type="text"
                      value={customer.endereco}
                      onChange={(e) => setCustomer({...customer, endereco: e.target.value})}
                      className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                      placeholder="Rua, número, bairro..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CEP</label>
                    <input 
                      type="text"
                      value={customer.cep}
                      onChange={(e) => setCustomer({...customer, cep: e.target.value})}
                      className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone</label>
                    <input 
                      type="text"
                      value={customer.telefone}
                      onChange={(e) => setCustomer({...customer, telefone: e.target.value})}
                      className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="mt-14">
                  <button 
                    onClick={handleFinalize}
                    className="w-full py-6 bg-emerald-500 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-4 active:scale-95"
                  >
                    Enviar Pedido de Orçamento <Phone className="w-7 h-7" />
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
              className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-14">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-3xl font-black text-blue-950 tracking-tight">Tipos de Telas</h3>
                  <button onClick={() => setShowInfoModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                    <X className="w-6 h-6 text-slate-300" />
                  </button>
                </div>

                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-purple-600 font-black uppercase tracking-widest text-xs">
                        <div className="w-3 h-3 rounded-full bg-purple-600 shadow-lg shadow-purple-600/20" /> Tela OLED
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Alta fidelidade de cores e brilho. Tecnologia de ponta com pixels auto-iluminados. Qualidade Premium.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-widest text-xs">
                        <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-600/20" /> Tela INCELL
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Excelente custo-benefício. Tecnologia que integra o touch ao LCD. Ideal para reparos econômicos.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-xs">
                        <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-lg shadow-emerald-600/20" /> Com Aro
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Moldura inclusa. Instalação profissional mais rápida e segura. Acabamento de fábrica.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-amber-600 font-black uppercase tracking-widest text-xs">
                        <div className="w-3 h-3 rounded-full bg-amber-600 shadow-lg shadow-amber-600/20" /> Sem Aro
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Apenas o display. Requer reaproveitamento da moldura original. Opção mais barata.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowInfoModal(false)}
                  className="w-full mt-14 py-5 bg-blue-950 text-white rounded-2xl font-black text-lg hover:bg-blue-600 transition-all"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="bg-blue-950 p-2 rounded-xl">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-blue-950 uppercase tracking-tighter text-xl">Oficina do Celular</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2024 Oficina do Celular. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm">Instagram</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
