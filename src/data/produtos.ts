export interface Produto {
  id: number;
  modelo_id: number;
  nome_completo: string;
  categoria: 'TELA' | 'BATERIA' | 'CONECTOR' | 'DOCK' | 'TAMPA' | 'CARCACA' | 'SERVICO';
  tecnologia: 'INCELL' | 'OLED' | null;
  possui_aro: number;
  nivel_dificuldade: string;
  exige_remocao_tela: number;
  marca: string;
  modelo_base: string;
  estoque: number | null;
}

const marcasData = ["Apple", "Samsung", "Motorola", "LG", "Xiaomi", "Redmi", "Realme"];
const modelosData: { marca: string, nome: string, oled: boolean, glass: boolean }[] = [];

// Apple
[
  "iPhone 6", "iPhone 6 Plus", "iPhone 6s", "iPhone 6s Plus",
  "iPhone 7", "iPhone 7 Plus",
  "iPhone 8", "iPhone 8 Plus",
  "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max"
].forEach(m => {
  const versionPart = m.split(" ")[1];
  const version = parseInt(versionPart);
  
  modelosData.push({ 
    marca: "Apple", 
    nome: m, 
    oled: m === "iPhone X" || m.includes("XS") || m.includes("Pro") || (!isNaN(version) && version >= 12), 
    glass: (!isNaN(version) && version >= 8) || m.includes("X")
  });
});

// Samsung
["Galaxy A01", "Galaxy A10", "Galaxy A20", "Galaxy A30", "Galaxy A32", "Galaxy A50", "Galaxy S20", "Galaxy S21", "Galaxy S22", "Galaxy S23"].forEach(m => {
  modelosData.push({ 
    marca: "Samsung", 
    nome: m, 
    oled: m.includes("S") || (m.includes("A") && parseInt(m.substring(8)) >= 20), 
    glass: m.includes("S")
  });
});

// Motorola
["Moto G6", "Moto G7", "Moto G8", "Moto G9", "Moto G52", "Moto G84", "Moto Edge 30"].forEach(m => {
  modelosData.push({ marca: "Motorola", nome: m, oled: m.includes("Edge") || m.includes("G52") || m.includes("G84"), glass: m.includes("Edge") });
});

// LG
["K10", "K11", "K12", "K22", "K40", "K41S", "K50S", "K51S", "K52", "K61", "K62"].forEach(m => {
  modelosData.push({ marca: "LG", nome: m, oled: false, glass: false });
});

// Xiaomi
["Mi 9", "Mi 10", "Mi 11", "Mi 12", "Mi 13", "Poco X3", "Poco X4", "Poco X5", "Poco F3", "Poco F4"].forEach(m => {
  modelosData.push({ marca: "Xiaomi", nome: m, oled: true, glass: true });
});

// Redmi
["Redmi 9", "Redmi 10", "Redmi 12", "Redmi Note 8", "Redmi Note 9", "Redmi Note 10", "Redmi Note 11", "Redmi Note 12", "Redmi Note 13"].forEach(m => {
  modelosData.push({ marca: "Redmi", nome: m, oled: m.includes("Note 10") || m.includes("Note 11") || m.includes("Note 12") || m.includes("Note 13"), glass: false });
});

// Realme
["Realme 7", "Realme 8", "Realme 9", "Realme 10", "Realme C11", "Realme C35", "Realme C55"].forEach(m => {
  modelosData.push({ marca: "Realme", nome: m, oled: m.includes("Realme 7") || m.includes("Realme 8") || m.includes("Realme 9"), glass: false });
});

const generatedProdutos: Produto[] = [];
let currentId = 1;
let currentModeloId = 1;

modelosData.forEach(m => {
  const modeloId = currentModeloId++;
  
  // 📱 Telas
  if (m.marca === 'Apple') {
    // iPhone screens don't have aro variations in this context
    generatedProdutos.push({
      id: currentId++,
      modelo_id: modeloId,
      nome_completo: `Tela ${m.nome} ${m.oled ? 'OLED' : 'INCELL'}`,
      categoria: 'TELA',
      tecnologia: m.oled ? 'OLED' : 'INCELL',
      possui_aro: 0,
      nivel_dificuldade: 'Médio',
      exige_remocao_tela: 0,
      marca: m.marca,
      modelo_base: m.nome,
      estoque: 10
    });

    // Adiciona opção INCELL para modelos OLED a partir do iPhone 11 Pro
    const versionPart = m.nome.split(" ")[1];
    const version = parseInt(versionPart);
    const isPro = m.nome.includes("Pro");
    
    if (m.oled && ((version === 11 && isPro) || version >= 12)) {
      generatedProdutos.push({
        id: currentId++,
        modelo_id: modeloId,
        nome_completo: `Tela ${m.nome} INCELL (Econômica)`,
        categoria: 'TELA',
        tecnologia: 'INCELL',
        possui_aro: 0,
        nivel_dificuldade: 'Médio',
        exige_remocao_tela: 0,
        marca: m.marca,
        modelo_base: m.nome,
        estoque: 15
      });
    }
  } else {
    // Other brands have aro variations
    if (m.oled) {
      generatedProdutos.push({
        id: currentId++,
        modelo_id: modeloId,
        nome_completo: `Tela ${m.nome} OLED Com Aro`,
        categoria: 'TELA',
        tecnologia: 'OLED',
        possui_aro: 1,
        nivel_dificuldade: 'Médio',
        exige_remocao_tela: 0,
        marca: m.marca,
        modelo_base: m.nome,
        estoque: 5
      });
      generatedProdutos.push({
        id: currentId++,
        modelo_id: modeloId,
        nome_completo: `Tela ${m.nome} OLED Sem Aro`,
        categoria: 'TELA',
        tecnologia: 'OLED',
        possui_aro: 0,
        nivel_dificuldade: 'Médio',
        exige_remocao_tela: 0,
        marca: m.marca,
        modelo_base: m.nome,
        estoque: 8
      });
    }
    
    generatedProdutos.push({
      id: currentId++,
      modelo_id: modeloId,
      nome_completo: `Tela ${m.nome} INCELL Com Aro`,
      categoria: 'TELA',
      tecnologia: 'INCELL',
      possui_aro: 1,
      nivel_dificuldade: 'Médio',
      exige_remocao_tela: 0,
      marca: m.marca,
      modelo_base: m.nome,
      estoque: 10
    });
    generatedProdutos.push({
      id: currentId++,
      modelo_id: modeloId,
      nome_completo: `Tela ${m.nome} INCELL Sem Aro`,
      categoria: 'TELA',
      tecnologia: 'INCELL',
      possui_aro: 0,
      nivel_dificuldade: 'Médio',
      exige_remocao_tela: 0,
      marca: m.marca,
      modelo_base: m.nome,
      estoque: 15
    });
  }

  // 🔋 Baterias
  generatedProdutos.push({
    id: currentId++,
    modelo_id: modeloId,
    nome_completo: `Bateria ${m.nome}`,
    categoria: 'BATERIA',
    tecnologia: null,
    possui_aro: 0,
    nivel_dificuldade: 'Médio',
    exige_remocao_tela: 0,
    marca: m.marca,
    modelo_base: m.nome,
    estoque: 20
  });

  // 🔌 Conectores / Docks
  if (m.marca === "Apple") {
    generatedProdutos.push({
      id: currentId++,
      modelo_id: modeloId,
      nome_completo: `Dock de Carga ${m.nome}`,
      categoria: 'DOCK',
      tecnologia: null,
      possui_aro: 0,
      nivel_dificuldade: 'Baixo',
      exige_remocao_tela: 0,
      marca: m.marca,
      modelo_base: m.nome,
      estoque: 12
    });
    generatedProdutos.push({
      id: currentId++,
      modelo_id: modeloId,
      nome_completo: `Carcaça Completa ${m.nome}`,
      categoria: 'CARCACA',
      tecnologia: null,
      possui_aro: 0,
      nivel_dificuldade: 'Alto',
      exige_remocao_tela: 0,
      marca: m.marca,
      modelo_base: m.nome,
      estoque: 3
    });
  } else {
    const isTypeC = !m.nome.includes("G6") && !m.nome.includes("J4");
    generatedProdutos.push({
      id: currentId++,
      modelo_id: modeloId,
      nome_completo: `Conector de Carga ${isTypeC ? 'Tipo-C' : 'Micro USB'} ${m.nome}`,
      categoria: 'CONECTOR',
      tecnologia: null,
      possui_aro: 0,
      nivel_dificuldade: 'Médio',
      exige_remocao_tela: 0,
      marca: m.marca,
      modelo_base: m.nome,
      estoque: 50
    });
  }

  // 🧱 Tampas
  generatedProdutos.push({
    id: currentId++,
    modelo_id: modeloId,
    nome_completo: `Tampa Traseira ${m.glass ? '(Vidro)' : ''} ${m.nome}`,
    categoria: 'TAMPA',
    tecnologia: null,
    possui_aro: 0,
    nivel_dificuldade: 'Baixo',
    exige_remocao_tela: 0,
    marca: m.marca,
    modelo_base: m.nome,
    estoque: 10
  });

  // 🔧 Serviços
  const needsScreenRemoval = (m.marca === "Samsung" && m.nome.includes('Galaxy A')) || m.marca === 'Apple';
  generatedProdutos.push({
    id: currentId++,
    modelo_id: modeloId,
    nome_completo: `Troca de Conector ${m.nome}`,
    categoria: 'SERVICO',
    tecnologia: null,
    possui_aro: 0,
    nivel_dificuldade: 'Médio',
    exige_remocao_tela: needsScreenRemoval ? 1 : 0,
    marca: m.marca,
    modelo_base: m.nome,
    estoque: null
  });
  generatedProdutos.push({
    id: currentId++,
    modelo_id: modeloId,
    nome_completo: `Limpeza Química em Placa ${m.nome}`,
    categoria: 'SERVICO',
    tecnologia: null,
    possui_aro: 0,
    nivel_dificuldade: 'Alto',
    exige_remocao_tela: 0,
    marca: m.marca,
    modelo_base: m.nome,
    estoque: null
  });
});

export const PRODUTOS_ESTATICOS = generatedProdutos;
