import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("estoque.db");

// Check if we need to migrate (drop and recreate if columns are missing)
const tableInfo = db.prepare("PRAGMA table_info(produtos)").all() as any[];
const hasNivelDificuldade = tableInfo.some(col => col.name === 'nivel_dificuldade');
const hasNome = tableInfo.some(col => col.name === 'nome');

if (tableInfo.length > 0 && (!hasNivelDificuldade || !hasNome)) {
  console.log("Old schema detected. Dropping tables to recreate with new structure.");
  db.exec("DROP TABLE IF EXISTS estoque");
  db.exec("DROP TABLE IF EXISTS produtos");
  db.exec("DROP TABLE IF EXISTS modelos");
  db.exec("DROP TABLE IF EXISTS marcas");
}

// Database Setup
db.exec(`
  CREATE TABLE IF NOT EXISTS marcas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS modelos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marca_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    possui_oled INTEGER DEFAULT 0,
    possui_incell INTEGER DEFAULT 1,
    tampa_vidro INTEGER DEFAULT 0,
    FOREIGN KEY (marca_id) REFERENCES marcas(id)
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL, -- 'TELA','BATERIA','CONECTOR','DOCK','TAMPA','CARCACA','SERVICO'
    tecnologia TEXT, -- 'INCELL','OLED',NULL
    possui_aro INTEGER DEFAULT 0,
    nivel_dificuldade TEXT DEFAULT 'Médio', -- 'Baixo', 'Médio', 'Alto'
    exige_remocao_tela INTEGER DEFAULT 0,
    FOREIGN KEY (modelo_id) REFERENCES modelos(id)
  );

  CREATE TABLE IF NOT EXISTS estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER DEFAULT 0,
    custo REAL DEFAULT 0,
    preco_sugerido REAL DEFAULT 0,
    fornecedor TEXT,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  );

  CREATE TABLE IF NOT EXISTS movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    tipo TEXT NOT NULL, -- 'ENTRADA','SAIDA'
    quantidade INTEGER NOT NULL,
    data_mov DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  );

  CREATE INDEX IF NOT EXISTS idx_modelo_nome ON modelos(nome);
  CREATE INDEX IF NOT EXISTS idx_prod_cat ON produtos(categoria);
`);

async function seedDatabase() {
  const count = db.prepare("SELECT COUNT(*) as count FROM marcas").get() as { count: number };
  if (count.count > 0) return;

  console.log("Starting professional distributor seeding...");

  const marcasData = ["Apple", "Samsung", "Motorola", "LG", "Xiaomi", "Redmi", "Realme"];
  const insertMarca = db.prepare("INSERT INTO marcas (nome) VALUES (?)");
  const marcaIds: Record<string, number> = {};
  
  marcasData.forEach(m => {
    const res = insertMarca.run(m);
    marcaIds[m] = res.lastInsertRowid as number;
  });

  const modelosData: { marca: string, nome: string, oled: boolean, glass: boolean }[] = [];

  // Apple
  ["iPhone 6", "iPhone 7", "iPhone 8", "iPhone X", "iPhone XR", "iPhone XS", "iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15"].forEach(m => {
    modelosData.push({ 
      marca: "Apple", 
      nome: m, 
      oled: m.includes("X") || parseInt(m.split(" ")[1]) >= 12, 
      glass: parseInt(m.split(" ")[1]) >= 8 || m.includes("X")
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

  const insertModelo = db.prepare("INSERT INTO modelos (marca_id, nome, possui_oled, possui_incell, tampa_vidro) VALUES (?, ?, ?, ?, ?)");
  const insertProduto = db.prepare("INSERT INTO produtos (modelo_id, nome, categoria, tecnologia, possui_aro, nivel_dificuldade, exige_remocao_tela) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertEstoque = db.prepare("INSERT INTO estoque (produto_id, quantidade, custo, preco_sugerido, fornecedor) VALUES (?, ?, ?, ?, ?)");

  db.transaction(() => {
    modelosData.forEach(m => {
      const marcaId = marcaIds[m.marca];
      const modRes = insertModelo.run(marcaId, m.nome, m.oled ? 1 : 0, 1, m.glass ? 1 : 0);
      const modeloId = modRes.lastInsertRowid as number;

      // 📱 Telas
      if (m.oled) {
        const p1 = insertProduto.run(modeloId, `Tela ${m.nome} OLED Com Aro`, 'TELA', 'OLED', 1, 'Médio', 0);
        insertEstoque.run(p1.lastInsertRowid, 5, 150, 450, "Premium Parts");
        const p2 = insertProduto.run(modeloId, `Tela ${m.nome} OLED Sem Aro`, 'TELA', 'OLED', 0, 'Médio', 0);
        insertEstoque.run(p2.lastInsertRowid, 8, 130, 400, "Premium Parts");
      }
      const p3 = insertProduto.run(modeloId, `Tela ${m.nome} INCELL Com Aro`, 'TELA', 'INCELL', 1, 'Médio', 0);
      insertEstoque.run(p3.lastInsertRowid, 10, 50, 150, "Standard Parts");
      const p4 = insertProduto.run(modeloId, `Tela ${m.nome} INCELL Sem Aro`, 'TELA', 'INCELL', 0, 'Médio', 0);
      insertEstoque.run(p4.lastInsertRowid, 15, 40, 120, "Standard Parts");

      // 🔋 Baterias
      const pb = insertProduto.run(modeloId, `Bateria ${m.nome}`, 'BATERIA', null, 0, 'Médio', 0);
      insertEstoque.run(pb.lastInsertRowid, 20, 30, 90, "Global Battery");

      // 🔌 Conectores / Docks
      if (m.marca === "Apple") {
        const pd = insertProduto.run(modeloId, `Dock de Carga ${m.nome}`, 'DOCK', null, 0, 'Baixo', 0);
        insertEstoque.run(pd.lastInsertRowid, 12, 25, 80, "Apple Original");
        const pc = insertProduto.run(modeloId, `Carcaça Completa ${m.nome}`, 'CARCACA', null, 0, 'Alto', 0);
        insertEstoque.run(pc.lastInsertRowid, 3, 100, 300, "Apple Original");
      } else {
        const isTypeC = !m.nome.includes("G6") && !m.nome.includes("J4");
        const pc = insertProduto.run(modeloId, `Conector de Carga ${isTypeC ? 'Tipo-C' : 'Micro USB'} ${m.nome}`, 'CONECTOR', null, 0, 'Médio', 0);
        insertEstoque.run(pc.lastInsertRowid, 50, 5, 45, "Generic Connectors");
      }

      // 🧱 Tampas
      const pt = insertProduto.run(modeloId, `Tampa Traseira ${m.glass ? '(Vidro)' : ''} ${m.nome}`, 'TAMPA', null, 0, 'Baixo', 0);
      insertEstoque.run(pt.lastInsertRowid, 10, 10, 60, "Cover Tech");

      // 🔧 Serviços
      const needsScreenRemoval = (m.marca === "Samsung" && m.nome.includes('Galaxy A')) || m.marca === 'Apple';
      insertProduto.run(modeloId, `Troca de Conector ${m.nome}`, 'SERVICO', null, 0, 'Médio', needsScreenRemoval ? 1 : 0);
      insertProduto.run(modeloId, `Limpeza Química em Placa ${m.nome}`, 'SERVICO', null, 0, 'Alto', 0);
    });
  })();

  console.log(`Seeding complete. Generated ${modelosData.length} models.`);
}

async function startServer() {
  await seedDatabase();
  const app = express();
  app.use(express.json());

  app.get("/api/produtos", (req, res) => {
    const { q, marca, categoria } = req.query;
    let sql = `
      SELECT 
        p.id, 
        m.nome as marca, 
        mod.nome as modelo_base, 
        p.categoria, 
        p.tecnologia as tipo_tela, 
        p.possui_aro,
        p.nivel_dificuldade,
        p.exige_remocao_tela,
        e.quantidade as estoque,
        e.preco_sugerido as preco,
        p.nome as nome_completo
      FROM produtos p
      JOIN modelos mod ON p.modelo_id = mod.id
      JOIN marcas m ON mod.marca_id = m.id
      LEFT JOIN estoque e ON p.id = e.produto_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (q) {
      sql += " AND (p.nome LIKE ? OR mod.nome LIKE ? OR m.nome LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (marca && marca !== 'Todas') {
      sql += " AND m.nome = ?";
      params.push(marca);
    }
    if (categoria) {
      sql += " AND p.categoria = ?";
      params.push(categoria);
    }

    sql += " ORDER BY p.categoria DESC, mod.nome ASC";

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
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
