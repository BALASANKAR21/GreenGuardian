import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Item = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type DB = {
  items: Item[];
};

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    const initial: DB = { items: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readDB(): Promise<DB> {
  await ensureFile();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as DB;
}

async function writeDB(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export const store = {
  items: {
    async getAll(): Promise<Item[]> {
      const db = await readDB();
      // newest first
      return db.items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async getById(id: string): Promise<Item | undefined> {
      const db = await readDB();
      return db.items.find(i => i.id === id);
    },
    async create(input: Pick<Item, "title" | "description">): Promise<Item> {
      const now = new Date().toISOString();
      const item: Item = {
        id: uuid(),
        title: input.title,
        description: input.description,
        createdAt: now,
        updatedAt: now
      };
      const db = await readDB();
      db.items.push(item);
      await writeDB(db);
      return item;
    },
    async update(id: string, patch: Partial<Pick<Item, "title" | "description">>): Promise<Item | null> {
      const db = await readDB();
      const idx = db.items.findIndex(i => i.id === id);
      if (idx === -1) return null;
      const updated: Item = {
        ...db.items[idx],
        ...patch,
        updatedAt: new Date().toISOString()
      };
      db.items[idx] = updated;
      await writeDB(db);
      return updated;
    },
    async remove(id: string): Promise<boolean> {
      const db = await readDB();
      const before = db.items.length;
      db.items = db.items.filter(i => i.id !== id);
      if (db.items.length === before) return false;
      await writeDB(db);
      return true;
    }
  }
};
