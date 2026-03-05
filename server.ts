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
    categoria TEXT NOT NULL, -- 'TELA','BATERIA','CONECTOR','DOCK','TAMPA','CARCACA'
    tecnologia TEXT, -- 'INCELL','OLED',NULL
    possui_aro INTEGER DEFAULT 0,
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

  CREATE TABLE IF NOT EXISTS binds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS itens_bind (
    bind_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    FOREIGN KEY (bind_id) REFERENCES binds(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  );

  CREATE INDEX IF NOT EXISTS idx_modelo_nome ON modelos(nome);
  CREATE INDEX IF NOT EXISTS idx_prod_cat ON produtos(categoria);
`);

async function seedDatabase() {
  const count = db.prepare("SELECT COUNT(*) as count FROM marcas").get() as { count: number };
  if (count.count > 0) return;

  console.log("Starting massive automated seeding...");

  const marcasData = ["Apple", "Samsung", "Motorola", "LG", "Xiaomi", "Redmi", "Realme"];
  const insertMarca = db.prepare("INSERT INTO marcas (nome) VALUES (?)");
  const marcaIds: Record<string, number> = {};
  
  marcasData.forEach(m => {
    const res = insertMarca.run(m);
    marcaIds[m] = res.lastInsertRowid as number;
  });

  const modelosData: { marca: string, nome: string, oled: boolean, glass: boolean }[] = [];

  // Apple: 6 to 15
  for (let i = 6; i <= 15; i++) {
    const variants = i >= 12 ? ["", " Mini", " Pro", " Pro Max"] : (i >= 11 ? ["", " Pro", " Pro Max"] : ["", " Plus"]);
    if (i === 10) { // iPhone X
       modelosData.push({ marca: "Apple", nome: "iPhone X", oled: true, glass: true });
       modelosData.push({ marca: "Apple", nome: "iPhone XR", oled: false, glass: true });
       modelosData.push({ marca: "Apple", nome: "iPhone XS", oled: true, glass: true });
       modelosData.push({ marca: "Apple", nome: "iPhone XS Max", oled: true, glass: true });
       continue;
    }
    variants.forEach(v => {
      modelosData.push({ 
        marca: "Apple", 
        nome: `iPhone ${i}${v}`, 
        oled: i >= 12 || (i === 11 && v.includes("Pro")), 
        glass: i >= 8 
      });
    });
  }

  // Samsung: A, S, M
  ["A", "S", "M"].forEach(line => {
    for (let i = 1; i <= 70; i++) {
      if (i % 10 === 0 || i < 20) {
        modelosData.push({ 
          marca: "Samsung", 
          nome: `Galaxy ${line}${i.toString().padStart(2, '0')}`, 
          oled: line === "S" || i > 30, 
          glass: line === "S" 
        });
      }
    }
  });

  // Motorola: G, Edge, E
  for (let i = 1; i <= 100; i += 10) {
    modelosData.push({ marca: "Motorola", nome: `Moto G${i}`, oled: i > 50, glass: false });
    modelosData.push({ marca: "Motorola", nome: `Moto Edge ${i}`, oled: true, glass: true });
    modelosData.push({ marca: "Motorola", nome: `Moto E${i}`, oled: false, glass: false });
  }

  // Xiaomi / Redmi / Realme
  ["Xiaomi Mi", "Redmi Note", "Realme"].forEach(prefix => {
    const marca = prefix.split(" ")[0];
    for (let i = 1; i <= 13; i++) {
      modelosData.push({ 
        marca: marca, 
        nome: `${prefix} ${i}`, 
        oled: i > 9, 
        glass: i > 10 
      });
    }
  });

  const insertModelo = db.prepare("INSERT INTO modelos (marca_id, nome, possui_oled, possui_incell, tampa_vidro) VALUES (?, ?, ?, ?, ?)");
  const insertProduto = db.prepare("INSERT INTO produtos (modelo_id, categoria, tecnologia, possui_aro) VALUES (?, ?, ?, ?)");
  const insertEstoque = db.prepare("INSERT INTO estoque (produto_id, quantidade, custo, preco_sugerido, fornecedor) VALUES (?, ?, ?, ?, ?)");

  db.transaction(() => {
    modelosData.forEach(m => {
      const marcaId = marcaIds[m.marca];
      const modRes = insertModelo.run(marcaId, m.nome, m.oled ? 1 : 0, 1, m.glass ? 1 : 0);
      const modeloId = modRes.lastInsertRowid as number;

      // Telas Incell
      const p1 = insertProduto.run(modeloId, 'TELA', 'INCELL', 1);
      insertEstoque.run(p1.lastInsertRowid, 10, 50, 150, "Fornecedor A");
      const p2 = insertProduto.run(modeloId, 'TELA', 'INCELL', 0);
      insertEstoque.run(p2.lastInsertRowid, 15, 40, 120, "Fornecedor B");

      // Telas OLED
      if (m.oled) {
        const p3 = insertProduto.run(modeloId, 'TELA', 'OLED', 1);
        insertEstoque.run(p3.lastInsertRowid, 5, 150, 450, "Fornecedor Premium");
        const p4 = insertProduto.run(modeloId, 'TELA', 'OLED', 0);
        insertEstoque.run(p4.lastInsertRowid, 8, 130, 400, "Fornecedor Premium");
      }

      // Bateria
      const pb = insertProduto.run(modeloId, 'BATERIA', null, 0);
      insertEstoque.run(pb.lastInsertRowid, 20, 30, 90, "Global Parts");

      // Conector / Dock
      if (m.marca === "Apple") {
        const pd = insertProduto.run(modeloId, 'DOCK', null, 0);
        insertEstoque.run(pd.lastInsertRowid, 12, 25, 80, "Apple Parts");
        const pc = insertProduto.run(modeloId, 'CARCACA', null, 0);
        insertEstoque.run(pc.lastInsertRowid, 3, 100, 300, "Apple Parts");
      } else {
        const pc = insertProduto.run(modeloId, 'CONECTOR', null, 0);
        insertEstoque.run(pc.lastInsertRowid, 50, 5, 45, "Generic Parts");
      }

      // Tampa
      if (m.glass) {
        const pt = insertProduto.run(modeloId, 'TAMPA', null, 0);
        insertEstoque.run(pt.lastInsertRowid, 10, 20, 75, "Glass Tech");
      }
    });
  })();

  console.log(`Seeding complete. Generated ${modelosData.length} models and thousands of products.`);
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
        e.quantidade as estoque,
        e.preco_sugerido as preco,
        (m.nome || ' ' || mod.nome || ' ' || p.categoria || ' ' || IFNULL(p.tecnologia, '')) as nome_completo
      FROM produtos p
      JOIN modelos mod ON p.modelo_id = mod.id
      JOIN marcas m ON mod.marca_id = m.id
      LEFT JOIN estoque e ON p.id = e.produto_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (q) {
      sql += " AND (mod.nome LIKE ? OR m.nome LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }
    if (marca && marca !== 'Todas') {
      sql += " AND m.nome = ?";
      params.push(marca);
    }
    if (categoria) {
      sql += " AND p.categoria = ?";
      params.push(categoria);
    }

    sql += " ORDER BY p.categoria DESC, mod.nome ASC LIMIT 100";

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
