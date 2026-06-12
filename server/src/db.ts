import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// DATA_DIR lets the SQLite file live on a persistent disk in production
// (e.g. a mounted volume). Defaults to server/data for local development.
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(__dirname, '../data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'app.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'newcomer',
    city          TEXT    NOT NULL DEFAULT 'Asunción',
    neighborhood  TEXT,
    bio           TEXT,
    verified      INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS establishments (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    name               TEXT    NOT NULL,
    category           TEXT    NOT NULL,
    description        TEXT,
    address            TEXT,
    neighborhood       TEXT,
    city               TEXT    NOT NULL DEFAULT 'Asunción',
    phone              TEXT,
    whatsapp           TEXT,
    owner_user_id      INTEGER REFERENCES users(id),
    created_by_user_id INTEGER REFERENCES users(id),
    created_at         TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS indications (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    establishment_id INTEGER NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating           INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment          TEXT,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (establishment_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category   TEXT,
    body       TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS post_replies (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id          INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    establishment_id INTEGER REFERENCES establishments(id) ON DELETE SET NULL,
    body             TEXT    NOT NULL,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ---- Additive migrations (safe on existing databases) ------------------------
migrate();

function columnExists(table: string, column: string): boolean {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as unknown as Array<{ name: string }>;
  return cols.some((c) => c.name === column);
}

function migrate() {
  if (!columnExists('users', 'verification_status')) {
    db.exec(`ALTER TABLE users ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'unverified'`);
  }
  if (!columnExists('users', 'is_admin')) {
    db.exec(`ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0`);
  }
  if (!columnExists('posts', 'city')) {
    db.exec(`ALTER TABLE posts ADD COLUMN city TEXT NOT NULL DEFAULT 'Asunción'`);
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification_requests (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      doc_type        TEXT    NOT NULL,
      doc_number      TEXT    NOT NULL,
      full_legal_name TEXT    NOT NULL,
      note            TEXT,
      status          TEXT    NOT NULL DEFAULT 'pending',
      review_note     TEXT,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      reviewed_at     TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message     TEXT    NOT NULL,
      target_type TEXT,
      target_id   INTEGER,
      is_read     INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

    CREATE TABLE IF NOT EXISTS messages (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body         TEXT    NOT NULL,
      is_read      INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, recipient_id);
    CREATE INDEX IF NOT EXISTS idx_messages_inbox ON messages(recipient_id, is_read);
  `);
}

/** Insert an in-app notification for a recipient. No-op if recipientId is falsy. */
export function createNotification(
  recipientId: number | null | undefined,
  message: string,
  targetType: string | null = null,
  targetId: number | null = null,
): void {
  if (!recipientId) return;
  db.prepare(
    `INSERT INTO notifications (user_id, message, target_type, target_id) VALUES (?, ?, ?, ?)`,
  ).run(recipientId, message, targetType, targetId);
}

// ---- Seed (only on an empty database) ----------------------------------------
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number };
if (userCount.c === 0) {
  seed();
}

function seed() {
  const hash = bcrypt.hashSync('demo1234', 10);

  const insertUser = db.prepare(
    `INSERT INTO users (name, email, password_hash, role, city, neighborhood, bio, verified)
     VALUES (?, ?, ?, ?, 'Asunción', ?, ?, 1)`,
  );
  const seedUsers: Array<[string, string, string, string, string]> = [
    ['Ana Beatriz', 'ana@demo.com', 'established', 'Villa Morra', 'Brasileira em Assunção há 6 anos. Adoro indicar quem trabalha bem.'],
    ['Rafael Souza', 'rafael@demo.com', 'established', 'Las Mercedes', 'Empreendedor brasileiro, conheço bastante prestador de confiança na cidade.'],
    ['Carla Méndez', 'carla@demo.com', 'business_owner', 'Recoleta', 'Paraguaia, atendo a comunidade brasileira. Falo português.'],
  ];
  const userIds = seedUsers.map(([name, email, role, neighborhood, bio]) =>
    Number(insertUser.run(name, email, hash, role, neighborhood, bio).lastInsertRowid),
  );

  // Seed users are already verified; make the first one (Ana) an admin/reviewer.
  db.exec(`UPDATE users SET verification_status = 'verified' WHERE verified = 1`);
  db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(userIds[0]);

  const insertEst = db.prepare(
    `INSERT INTO establishments (name, category, description, address, neighborhood, phone, whatsapp, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  // Newcomer-essential services across categories, in real Asunción barrios.
  const seedEst: Array<{
    name: string; category: string; description: string; address: string;
    neighborhood: string; phone: string; whatsapp: string; by: number;
  }> = [
    { name: 'Gestoría Fronteira — Migraciones & Cédula', category: 'Documentação & Migração', description: 'Assessoria completa para residência, cédula paraguaia e regularização de brasileiros. Atendimento em português.', address: 'Av. Mariscal López 1234', neighborhood: 'Mariscal López', phone: '+595 21 600 100', whatsapp: '+595 981 100 100', by: userIds[0] },
    { name: 'Contadora Patrícia Benítez', category: 'Contabilidade', description: 'Contabilidade para empresas e autônomos brasileiros (RUC, IVA, IRP). Explica tudo em português.', address: 'Calle Senador Long 880', neighborhood: 'Carmelitas', phone: '+595 21 610 220', whatsapp: '+595 982 220 330', by: userIds[1] },
    { name: 'Imobiliária Lar Guaraní', category: 'Imobiliária & Moradia', description: 'Aluguel e compra de imóveis com contrato seguro. Acostumados a atender recém-chegados do Brasil.', address: 'Av. España 2050', neighborhood: 'Recoleta', phone: '+595 21 624 555', whatsapp: '+595 983 555 010', by: userIds[0] },
    { name: 'Clínica Santa Lúcia', category: 'Saúde', description: 'Clínica geral e pediatria com médicos que falam português. Aceita seguros internacionais.', address: 'Av. San Martín 1500', neighborhood: 'Villa Morra', phone: '+595 21 660 777', whatsapp: '+595 984 777 222', by: userIds[2] },
    { name: 'Colégio Integração BR-PY', category: 'Educação', description: 'Escola bilíngue (português/espanhol) com currículo adaptado para filhos de brasileiros.', address: 'Calle del Maestro 410', neighborhood: 'Las Mercedes', phone: '+595 21 670 333', whatsapp: '+595 985 333 444', by: userIds[1] },
    { name: 'Auto Center do Brasileiro', category: 'Automotivo', description: 'Mecânica geral e regularização de veículos com chapa paraguaia. Orçamento honesto.', address: 'Av. Eusebio Ayala 3200', neighborhood: 'San Pablo', phone: '+595 21 510 909', whatsapp: '+595 986 909 818', by: userIds[1] },
    { name: 'Câmbio Triple Frontera', category: 'Câmbio & Finanças', description: 'Casa de câmbio confiável, cotação justa de real/guarani/dólar. Transferências.', address: 'Calle Palma 450', neighborhood: 'Centro', phone: '+595 21 490 121', whatsapp: '+595 987 121 232', by: userIds[0] },
    { name: 'Restaurante Sabor do Brasil', category: 'Alimentação', description: 'Comida brasileira de verdade — feijoada aos sábados. Ponto de encontro da comunidade.', address: 'Av. Brasília 760', neighborhood: 'Barrio Jara', phone: '+595 21 220 656', whatsapp: '+595 988 656 767', by: userIds[2] },
    { name: 'Advocacia Lima & Asociados', category: 'Serviços Jurídicos', description: 'Direito empresarial, trabalhista e de imigração nos dois países. Primeira consulta orientativa.', address: 'Av. Aviadores del Chaco 2100', neighborhood: 'Villa Morra', phone: '+595 21 611 040', whatsapp: '+595 981 040 050', by: userIds[1] },
    { name: 'Mercado Brasil Importados', category: 'Comércio & Compras', description: 'Produtos brasileiros: alimentos, higiene e marcas que você sente falta. Entrega na cidade.', address: 'Calle Tte. Fariña 920', neighborhood: 'Centro', phone: '+595 21 445 313', whatsapp: '+595 982 313 414', by: userIds[0] },
    { name: 'Despachante Aduaneiro CDE Express', category: 'Documentação & Migração', description: 'Importação/exportação e despacho de mercadorias entre Brasil e Paraguai.', address: 'Ruta 2 Km 8', neighborhood: 'San Lorenzo', phone: '+595 21 580 200', whatsapp: '+595 983 200 311', by: userIds[1] },
    { name: 'Odontologia Sorriso Guaraní', category: 'Saúde', description: 'Dentista com preços acessíveis e atendimento em português. Muito procurado por brasileiros.', address: 'Av. Mcal. López 3400', neighborhood: 'Las Mercedes', phone: '+595 21 662 818', whatsapp: '+595 984 818 929', by: userIds[2] },
  ];

  const insertInd = db.prepare(
    `INSERT INTO indications (establishment_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
  );

  const nameById: Record<number, string> = {};
  userIds.forEach((id, i) => (nameById[id] = seedUsers[i][0]));

  const estIdByName: Record<string, number> = {};
  for (const e of seedEst) {
    const estId = Number(insertEst.run(e.name, e.category, e.description, e.address, e.neighborhood, e.phone, e.whatsapp, e.by).lastInsertRowid);
    estIdByName[e.name] = estId;
    // Two seed indications from members other than the one who added it.
    const reviewers = userIds.filter((id) => id !== e.by);
    insertInd.run(estId, reviewers[0], 5, 'Resolveu meu problema rapidinho e me atenderam super bem em português. Recomendo!');
    createNotification(e.by, `${nameById[reviewers[0]]} indicou seu estabelecimento "${e.name}".`, 'establishment', estId);
    if (reviewers[1]) {
      insertInd.run(estId, reviewers[1], 4, 'Atendimento de confiança, preço justo. Indiquei para vários amigos.');
      createNotification(e.by, `${nameById[reviewers[1]]} indicou seu estabelecimento "${e.name}".`, 'establishment', estId);
    }
  }

  // Community feed: questions, and answers that point back to the directory.
  const insertPost = db.prepare(`INSERT INTO posts (user_id, category, body) VALUES (?, ?, ?)`);
  const insertReply = db.prepare(
    `INSERT INTO post_replies (post_id, user_id, establishment_id, body) VALUES (?, ?, ?, ?)`,
  );
  const seedFeed: Array<{
    by: number; category: string; body: string;
    replies: Array<{ by: number; est?: string; body: string }>;
  }> = [
    {
      by: userIds[0], category: 'Contabilidade',
      body: 'Acabei de abrir minha empresa aqui e preciso de um contador que entenda de RUC e fale português. Alguém indica?',
      replies: [
        { by: userIds[1], est: 'Contadora Patrícia Benítez', body: 'A Patrícia é excelente, resolveu tudo pra mim. Explica cada imposto com paciência.' },
        { by: userIds[2], body: 'Confirmo, trabalho com ela também. Pode confiar.' },
      ],
    },
    {
      by: userIds[1], category: 'Educação',
      body: 'Estou me mudando com as crianças em janeiro. Alguma escola bilíngue boa para filhos de brasileiros?',
      replies: [
        { by: userIds[2], est: 'Colégio Integração BR-PY', body: 'Meus filhos estudam lá, a adaptação foi tranquila por causa do currículo em português.' },
      ],
    },
    {
      by: userIds[2], category: 'Câmbio & Finanças',
      body: 'Onde vocês têm feito câmbio de real para guarani com a melhor cotação ultimamente?',
      replies: [
        { by: userIds[0], est: 'Câmbio Triple Frontera', body: 'Sempre faço lá no Centro, cotação justa e atendimento rápido.' },
      ],
    },
    {
      by: userIds[0], category: 'Geral',
      body: 'Dica para quem está chegando: juntem todos os documentos (RG, antecedentes) ainda no Brasil e já tragam apostilados. Economiza semanas aqui!',
      replies: [],
    },
  ];

  for (const p of seedFeed) {
    const postId = Number(insertPost.run(p.by, p.category, p.body).lastInsertRowid);
    for (const r of p.replies) {
      insertReply.run(postId, r.by, r.est ? estIdByName[r.est] ?? null : null, r.body);
      if (r.by !== p.by) {
        createNotification(p.by, `${nameById[r.by]} respondeu sua pergunta na comunidade.`, 'post', postId);
      }
    }
  }

  // A sample direct-message thread so the inbox isn't empty.
  const insertMsg = db.prepare(
    `INSERT INTO messages (sender_id, recipient_id, body, is_read) VALUES (?, ?, ?, ?)`,
  );
  const [ana, rafael, carla] = userIds;
  insertMsg.run(rafael, ana, 'Oi Ana! Vi que você indicou a contadora Patrícia. Ela atende MEI também?', 1);
  insertMsg.run(ana, rafael, 'Oi Rafael! Atende sim, foi ela que abriu o meu. Posso te passar o contato dela.', 1);
  insertMsg.run(rafael, ana, 'Perfeito, muito obrigado! 🙏', 0);
  insertMsg.run(carla, ana, 'Ana, bem-vinda à rede! Qualquer coisa que precisar aqui em Asunción, é só chamar.', 0);

  console.log(
    `[seed] Banco populado: ${seedUsers.length} usuários, ${seedEst.length} estabelecimentos, ${seedFeed.length} posts (Asunción).`,
  );
}
