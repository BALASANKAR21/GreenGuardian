import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
async function ensureDB() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
        await fs.access(DB_PATH);
    }
    catch {
        const initial = { items: [] };
        await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
    }
}
async function readDB() {
    await ensureDB();
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
}
async function writeDB(db) {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}
export const store = {
    items: {
        async getAll() {
            const db = await readDB();
            return [...db.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        },
        async getById(id) {
            const db = await readDB();
            return db.items.find(i => i.id === id);
        },
        async create(input) {
            const now = new Date().toISOString();
            const item = {
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
        async update(id, patch) {
            const db = await readDB();
            const idx = db.items.findIndex(i => i.id === id);
            if (idx === -1)
                return null;
            const updated = {
                ...db.items[idx],
                ...patch,
                updatedAt: new Date().toISOString()
            };
            db.items[idx] = updated;
            await writeDB(db);
            return updated;
        },
        async remove(id) {
            const db = await readDB();
            const before = db.items.length;
            db.items = db.items.filter(i => i.id !== id);
            if (db.items.length === before)
                return false;
            await writeDB(db);
            return true;
        }
    }
};
