import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("estoque.db");

// Check if we need to migrate (drop and recreate if 'categoria' is missing)
const tableInfo = db.prepare("PRAGMA table_info(produtos)").all() as any[];
const hasCategoria = tableInfo.some(col => col.name === 'categoria');

if (tableInfo.length > 0 && !hasCategoria) {
  console.log("Old schema detected. Dropping table to recreate with 'categoria' column.");
  db.exec("DROP TABLE produtos");
}

// Initialize database with category and brand
db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT NOT NULL,
    modelo_base TEXT NOT NULL,
    marca TEXT NOT NULL,
    categoria TEXT NOT NULL, -- 'TELA', 'BATERIA', 'DOCK', 'SERVICO', 'TAMPA', 'CARCACA'
    tipo_tela TEXT, -- 'Incell', 'OLED', or NULL
    exige_remocao_tela INTEGER DEFAULT 0, -- 0 for No, 1 for Yes
    dificuldade TEXT DEFAULT 'Média' -- 'Baixa', 'Média', 'Alta'
  );
  CREATE INDEX IF NOT EXISTS idx_nome ON produtos(nome_completo);
  CREATE INDEX IF NOT EXISTS idx_modelo ON produtos(modelo_base);
  CREATE INDEX IF NOT EXISTS idx_marca ON produtos(marca);
  CREATE INDEX IF NOT EXISTS idx_categoria ON produtos(categoria);
`);

async function seedDatabase() {
  const count = db.prepare("SELECT COUNT(*) as count FROM produtos").get() as { count: number };
  if (count.count > 0) return;

  const marcas = {
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

  const insert = db.prepare("INSERT INTO produtos (nome_completo, modelo_base, marca, categoria, tipo_tela, exige_remocao_tela, dificuldade) VALUES (?, ?, ?, ?, ?, ?, ?)");

  db.transaction(() => {
    for (const [marca, modelos] of Object.entries(marcas)) {
      for (const item of modelos) {
        const { modelo, tech } = item;
        
        // Screens
        for (const t of tech) {
          insert.run(`Tela ${modelo} ${t}`, modelo, marca, 'TELA', t, 0, 'Média');
        }
        
        // Batteries
        insert.run(`Bateria ${modelo}`, modelo, marca, 'BATERIA', null, 0, 'Média');

        // Docks & Services
        if (marca === "Apple") {
          insert.run(`Dock de carga ${modelo}`, modelo, marca, 'DOCK', null, 0, 'Baixa');
          insert.run(`Troca de Dock de Carga ${modelo}`, modelo, marca, 'SERVICO', null, 0, 'Média');
          
          // Tampa Traseira iPhone (Vidro) - iPhone 8 onwards
          const isGlass = modelo.includes("8") || modelo.includes("X") || modelo.includes("11") || modelo.includes("12") || modelo.includes("13") || modelo.includes("14") || modelo.includes("15");
          if (isGlass) {
            insert.run(`Troca de Tampa Traseira (Vidro) ${modelo}`, modelo, marca, 'TAMPA', null, 0, 'Alta');
          }
          
          // Carcaça
          insert.run(`Troca de Carcaça ${modelo}`, modelo, marca, 'CARCACA', null, 0, 'Alta');
        } else {
          // Android Services
          const isTypeC = !modelo.includes("J4") && !modelo.includes("J5") && !modelo.includes("G6") && !modelo.includes("K10") && !modelo.includes("Redmi 9");
          const serviceName = isTypeC ? "Troca de Conector Tipo-C" : "Troca de Conector Micro USB";
          const needsScreenRemoval = modelo.includes("Galaxy A") || modelo.includes("iPhone");
          
          insert.run(`${serviceName} ${modelo}`, modelo, marca, 'SERVICO', null, needsScreenRemoval ? 1 : 0, 'Média');
          insert.run(`Troca de Placa de Carga ${modelo}`, modelo, marca, 'SERVICO', null, needsScreenRemoval ? 1 : 0, 'Média');
          
          // Tampa Traseira Android
          insert.run(`Troca de Tampa Traseira ${modelo}`, modelo, marca, 'TAMPA', null, 0, 'Baixa');
        }
      }
    }
  })();
  console.log("Database seeded with realistic Telas, Baterias and Docks.");
}

async function startServer() {
  await seedDatabase();
  const app = express();
  app.use(express.json());

  app.get("/api/produtos", (req, res) => {
    const q = req.query.q as string;
    const marca = req.query.marca as string;
    
    let query = "SELECT * FROM produtos WHERE 1=1";
    const params: any[] = [];

    if (marca && marca !== 'Todas') {
      query += " AND marca = ?";
      params.push(marca);
    }

    if (q && q.length >= 2) {
      query += " AND (nome_completo LIKE ? OR modelo_base LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }

    query += " ORDER BY categoria DESC, modelo_base ASC, tipo_tela DESC LIMIT 100";
    
    const results = db.prepare(query).all(...params);
    res.json(results);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }
  app.listen(3000, "0.0.0.0", () => console.log("Server running on port 3000"));
}
startServer();
