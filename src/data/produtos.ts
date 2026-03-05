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
["iPhone 6", "iPhone 7", "iPhone 8", "iPhone X", "iPhone XR", "iPhone XS", "iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15"].forEach(m => {
  modelosData.push({ 
    marca: "Apple", 
    nome: m, 
    oled: m.includes("X") || (m.includes("iPhone") && parseInt(m.split(" ")[1]) >= 12), 
    glass: (m.includes("iPhone") && parseInt(m.split(" ")[1]) >= 8) || m.includes("X")
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

const generatedProdutos: Produto[] = [];
let currentId = 1;
let currentModeloId = 1;

modelosData.forEach(m => {
  const modeloId = currentModeloId++;
  
  // 📱 Telas
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
