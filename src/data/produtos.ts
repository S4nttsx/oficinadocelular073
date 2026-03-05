
export interface Produto {
  id: number;
  nome_completo: string;
  modelo_base: string;
  marca: string;
  categoria: 'TELA' | 'BATERIA' | 'DOCK' | 'SERVICO' | 'TAMPA' | 'CARCACA';
  tipo_tela: string | null;
  exige_remocao_tela?: number;
  dificuldade?: string;
}

const marcasData: Record<string, { modelo: string; tech: string[] }[]> = {
  "Apple": [
    { modelo: "iPhone 6", tech: ["Incell"] },
    { modelo: "iPhone 6 Plus", tech: ["Incell"] },
    { modelo: "iPhone 7", tech: ["Incell"] },
    { modelo: "iPhone 7 Plus", tech: ["Incell"] },
    { modelo: "iPhone 8", tech: ["Incell"] },
    { modelo: "iPhone 8 Plus", tech: ["Incell"] },
    { modelo: "iPhone X", tech: ["OLED"] },
    { modelo: "iPhone XR", tech: ["Incell"] },
    { modelo: "iPhone XS", tech: ["OLED"] },
    { modelo: "iPhone XS Max", tech: ["OLED"] },
    { modelo: "iPhone 11", tech: ["Incell"] },
    { modelo: "iPhone 11 Pro", tech: ["OLED"] },
    { modelo: "iPhone 11 Pro Max", tech: ["OLED"] },
    { modelo: "iPhone 12", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 12 Mini", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 12 Pro", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 12 Pro Max", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 13", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 13 Mini", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 13 Pro", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 13 Pro Max", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 14", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 14 Plus", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 14 Pro", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 14 Pro Max", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 15", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 15 Plus", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 15 Pro", tech: ["Incell", "OLED"] },
    { modelo: "iPhone 15 Pro Max", tech: ["Incell", "OLED"] }
  ],
  "Samsung": [
    { modelo: "Galaxy A01", tech: ["Incell"] },
    { modelo: "Galaxy A01 Core", tech: ["Incell"] },
    { modelo: "Galaxy A02", tech: ["Incell"] },
    { modelo: "Galaxy A03", tech: ["Incell"] },
    { modelo: "Galaxy A10", tech: ["Incell"] },
    { modelo: "Galaxy A11", tech: ["Incell"] },
    { modelo: "Galaxy A12", tech: ["Incell"] },
    { modelo: "Galaxy A13", tech: ["Incell"] },
    { modelo: "Galaxy A14", tech: ["Incell"] },
    { modelo: "Galaxy A15", tech: ["OLED"] },
    { modelo: "Galaxy A20", tech: ["OLED"] },
    { modelo: "Galaxy A21s", tech: ["Incell"] },
    { modelo: "Galaxy A22", tech: ["OLED"] },
    { modelo: "Galaxy A23", tech: ["Incell"] },
    { modelo: "Galaxy A24", tech: ["OLED"] },
    { modelo: "Galaxy A25", tech: ["OLED"] },
    { modelo: "Galaxy A30", tech: ["OLED"] },
    { modelo: "Galaxy A31", tech: ["OLED"] },
    { modelo: "Galaxy A32", tech: ["Incell", "OLED"] },
    { modelo: "Galaxy A33", tech: ["OLED"] },
    { modelo: "Galaxy A34", tech: ["OLED"] },
    { modelo: "Galaxy A35", tech: ["OLED"] },
    { modelo: "Galaxy A50", tech: ["OLED"] },
    { modelo: "Galaxy A51", tech: ["OLED"] },
    { modelo: "Galaxy A52", tech: ["OLED"] },
    { modelo: "Galaxy A53", tech: ["OLED"] },
    { modelo: "Galaxy A54", tech: ["OLED"] },
    { modelo: "Galaxy A55", tech: ["OLED"] },
    { modelo: "Galaxy S10", tech: ["OLED"] },
    { modelo: "Galaxy S20", tech: ["OLED"] },
    { modelo: "Galaxy S21", tech: ["OLED"] },
    { modelo: "Galaxy S22", tech: ["OLED"] },
    { modelo: "Galaxy S23", tech: ["OLED"] },
    { modelo: "Galaxy S24", tech: ["OLED"] }
  ],
  "Motorola": [
    { modelo: "Moto G6", tech: ["Incell"] },
    { modelo: "Moto G7", tech: ["Incell"] },
    { modelo: "Moto G8", tech: ["Incell"] },
    { modelo: "Moto G9", tech: ["Incell"] },
    { modelo: "Moto G10", tech: ["Incell"] },
    { modelo: "Moto G20", tech: ["Incell"] },
    { modelo: "Moto G22", tech: ["Incell"] },
    { modelo: "Moto G30", tech: ["Incell"] },
    { modelo: "Moto G50", tech: ["Incell"] },
    { modelo: "Moto G52", tech: ["OLED"] },
    { modelo: "Moto G53", tech: ["Incell"] },
    { modelo: "Moto G54", tech: ["Incell"] },
    { modelo: "Moto G60", tech: ["Incell"] },
    { modelo: "Moto G73", tech: ["Incell"] },
    { modelo: "Moto G82", tech: ["OLED"] },
    { modelo: "Moto G84", tech: ["OLED"] },
    { modelo: "Moto E13", tech: ["Incell"] },
    { modelo: "Moto E20", tech: ["Incell"] },
    { modelo: "Moto E22", tech: ["Incell"] },
    { modelo: "Moto Edge 30", tech: ["OLED"] },
    { modelo: "Moto Edge 40", tech: ["OLED"] }
  ],
  "LG": [
    { modelo: "K10", tech: ["Incell"] },
    { modelo: "K11", tech: ["Incell"] },
    { modelo: "K12", tech: ["Incell"] },
    { modelo: "K22", tech: ["Incell"] },
    { modelo: "K41s", tech: ["Incell"] },
    { modelo: "K52", tech: ["Incell"] },
    { modelo: "K61", tech: ["Incell"] },
    { modelo: "K62", tech: ["Incell"] }
  ],
  "Xiaomi": [
    { modelo: "Mi 11", tech: ["OLED"] },
    { modelo: "Mi 12", tech: ["OLED"] },
    { modelo: "Mi 13", tech: ["OLED"] },
    { modelo: "Poco X3", tech: ["Incell"] },
    { modelo: "Poco X4 Pro", tech: ["OLED"] },
    { modelo: "Poco X5", tech: ["OLED"] },
    { modelo: "Poco F3", tech: ["OLED"] },
    { modelo: "Poco F4", tech: ["OLED"] },
    { modelo: "Poco F5", tech: ["OLED"] }
  ],
  "Redmi": [
    { modelo: "Redmi Note 8", tech: ["Incell"] },
    { modelo: "Redmi Note 9", tech: ["Incell"] },
    { modelo: "Redmi Note 10", tech: ["Incell", "OLED"] },
    { modelo: "Redmi Note 11", tech: ["Incell", "OLED"] },
    { modelo: "Redmi Note 12", tech: ["Incell", "OLED"] },
    { modelo: "Redmi Note 13", tech: ["Incell", "OLED"] },
    { modelo: "Redmi 9", tech: ["Incell"] },
    { modelo: "Redmi 10", tech: ["Incell"] },
    { modelo: "Redmi 12", tech: ["Incell"] }
  ],
  "Realme": [
    { modelo: "Realme C35", tech: ["Incell"] },
    { modelo: "Realme C55", tech: ["Incell"] },
    { modelo: "Realme 7", tech: ["Incell"] },
    { modelo: "Realme 8", tech: ["OLED"] },
    { modelo: "Realme 9", tech: ["OLED"] },
    { modelo: "Realme 11 Pro", tech: ["OLED"] }
  ]
};

function generateProdutos(): Produto[] {
  const allProdutos: Produto[] = [];
  let idCounter = 1;

  for (const [marca, modelos] of Object.entries(marcasData)) {
    for (const item of modelos) {
      const { modelo, tech } = item;

      // Screens
      for (const t of tech) {
        allProdutos.push({
          id: idCounter++,
          nome_completo: `Tela ${modelo} ${t}`,
          modelo_base: modelo,
          marca: marca,
          categoria: 'TELA',
          tipo_tela: t,
          exige_remocao_tela: 0,
          dificuldade: 'Média'
        });
      }

      // Batteries
      allProdutos.push({
        id: idCounter++,
        nome_completo: `Bateria ${modelo}`,
        modelo_base: modelo,
        marca: marca,
        categoria: 'BATERIA',
        tipo_tela: null,
        exige_remocao_tela: 0,
        dificuldade: 'Média'
      });

      // Docks & Services
      if (marca === "Apple") {
        allProdutos.push({
          id: idCounter++,
          nome_completo: `Dock de carga ${modelo}`,
          modelo_base: modelo,
          marca: marca,
          categoria: 'DOCK',
          tipo_tela: null,
          exige_remocao_tela: 0,
          dificuldade: 'Baixa'
        });
        allProdutos.push({
          id: idCounter++,
          nome_completo: `Troca de Dock de Carga ${modelo}`,
          modelo_base: modelo,
          marca: marca,
          categoria: 'SERVICO',
          tipo_tela: null,
          exige_remocao_tela: 0,
          dificuldade: 'Média'
        });

        const isGlass = modelo.includes("8") || modelo.includes("X") || modelo.includes("11") || modelo.includes("12") || modelo.includes("13") || modelo.includes("14") || modelo.includes("15");
        if (isGlass) {
          allProdutos.push({
            id: idCounter++,
            nome_completo: `Troca de Tampa Traseira (Vidro) ${modelo}`,
            modelo_base: modelo,
            marca: marca,
            categoria: 'TAMPA',
            tipo_tela: null,
            exige_remocao_tela: 0,
            dificuldade: 'Alta'
          });
        }

        allProdutos.push({
          id: idCounter++,
          nome_completo: `Troca de Carcaça ${modelo}`,
          modelo_base: modelo,
          marca: marca,
          categoria: 'CARCACA',
          tipo_tela: null,
          exige_remocao_tela: 0,
          dificuldade: 'Alta'
        });
      } else {
        const isTypeC = !modelo.includes("J4") && !modelo.includes("J5") && !modelo.includes("G6") && !modelo.includes("K10") && !modelo.includes("Redmi 9");
        const serviceName = isTypeC ? "Troca de Conector Tipo-C" : "Troca de Conector Micro USB";
        const needsScreenRemoval = modelo.includes("Galaxy A") || modelo.includes("iPhone");

        allProdutos.push({
          id: idCounter++,
          nome_completo: `${serviceName} ${modelo}`,
          modelo_base: modelo,
          marca: marca,
          categoria: 'SERVICO',
          tipo_tela: null,
          exige_remocao_tela: needsScreenRemoval ? 1 : 0,
          dificuldade: 'Média'
        });
        allProdutos.push({
          id: idCounter++,
          nome_completo: `Troca de Placa de Carga ${modelo}`,
          modelo_base: modelo,
          marca: marca,
          categoria: 'SERVICO',
          tipo_tela: null,
          exige_remocao_tela: needsScreenRemoval ? 1 : 0,
          dificuldade: 'Média'
        });

        allProdutos.push({
          id: idCounter++,
          nome_completo: `Troca de Tampa Traseira ${modelo}`,
          modelo_base: modelo,
          marca: marca,
          categoria: 'TAMPA',
          tipo_tela: null,
          exige_remocao_tela: 0,
          dificuldade: 'Baixa'
        });
      }
    }
  }
  return allProdutos;
}

export const PRODUTOS_ESTATICOS = generateProdutos();
